// supabase/functions/promote-lead-to-partner/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
// Importamos a sua função de CORS que já sabemos que funciona
import { getCorsHeaders } from '../_shared/cors.ts'

const PADRAO_SENHA_PARCEIRO = 'medsinaiparceiro';

serve(async (req ) => {
  // Pegamos o objeto 'Headers' gerado pelo seu cors.ts
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // A requisição PREFLIGHT (OPTIONS) é crucial
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    if (!leadId) {
      throw new Error("ID do lead não fornecido.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads_parceiros')
      .select('id, nome, email, telefone, status')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead com ID ${leadId} não encontrado ou já processado.`);
    }
    
    if (lead.status !== 'aprovado') {
      // ===================================================================
      // ==> CORREÇÃO DE CORS NA RESPOSTA DE ERRO DE LÓGICA <==
      // ===================================================================
      corsHeaders.set('Content-Type', 'application/json');
      return new Response(
          JSON.stringify({ error: `O lead precisa estar com o status "Aprovado" para ser promovido.` }),
          { headers: corsHeaders, status: 400 }
      );
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: PADRAO_SENHA_PARCEIRO,
      email_confirm: true,
      user_metadata: {
        nome: lead.nome,
        telefone: lead.telefone,
        role: 'parceiro',
        status: 'ativo',
      }
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
          throw new Error(`Um usuário com o e-mail ${lead.email} já existe no sistema.`);
      }
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        nome_completo: authUser.user.user_metadata.nome,
        telefone: authUser.user.user_metadata.telefone
      })
      .eq('id', authUser.user.id);

    if (profileError) {
      console.error(`Usuário ${lead.email} criado, mas falha ao preencher o perfil. Erro: ${profileError.message}`);
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('leads_parceiros')
      .update({ 
        status: 'promovido',
        id_usuario_auth: authUser.user.id
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error(`Usuário ${lead.email} criado, mas falha ao atualizar o lead ${lead.id}. Erro: ${updateError.message}`);
    }

    // ===================================================================
    // ==> CORREÇÃO DE CORS NA RESPOSTA DE SUCESSO <==
    // ===================================================================
    corsHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ message: `Parceiro ${lead.nome} criado com sucesso! A senha inicial é '${PADRAO_SENHA_PARCEIRO}'.` }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    // ===================================================================
    // ==> CORREÇÃO DE CORS NA RESPOSTA DE ERRO GERAL (CATCH) <==
    // ===================================================================
    corsHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 400 }
    );
  }
});
