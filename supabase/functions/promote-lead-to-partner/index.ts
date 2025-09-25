// supabase/functions/promote-lead-to-partner/index.ts - VERSÃO SEGURA E OTIMIZADA

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { getCorsHeaders } from '../_shared/cors.ts'

const PADRAO_SENHA_PARCEIRO = 'medsinaiparceiro';

serve(async (req ) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Pega o token de autorização e valida o usuário que está chamando
    const authorization = req.headers.get("Authorization")!;
    if (!authorization) throw new Error("Cabeçalho de autorização ausente.");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: { user: callingUser } } = await supabaseClient.auth.getUser(authorization.replace("Bearer ", ""));
    if (!callingUser) throw new Error("Token de usuário inválido ou expirado.");

    // 2. Usa a SERVICE_ROLE_KEY para verificar se o chamador é um admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callingUser.id)
      .single();

    if (profileError || adminProfile.role !== 'admin') {
      throw new Error("Acesso negado. Apenas administradores podem promover parceiros.");
    }

    // 3. Se for admin, prossegue com a lógica original, agora mais limpa
    const { leadId } = await req.json();
    if (!leadId) throw new Error("ID do lead não fornecido.");

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads_parceiros')
      .select('id, nome, email, telefone, status')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) throw new Error(`Lead com ID ${leadId} não encontrado.`);
    if (lead.status !== 'aprovado') throw new Error(`O lead precisa estar com o status "Aprovado".`);

    // 4. Cria o usuário na auth.users SEM user_metadata desnecessário
    const { data: authResponse, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: PADRAO_SENHA_PARCEIRO,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        throw new Error(`Um usuário com o e-mail ${lead.email} já existe.`);
      }
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }
    
    const newUserId = authResponse.user.id;

    // 5. ATUALIZA o perfil que o trigger já criou, com os dados corretos
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        nome_completo: lead.nome,
        telefone: lead.telefone,
        role: 'parceiro', // <-- Define a role correta
        status: 'ativo'   // <-- Define o status correto
      })
      .eq('id', newUserId);

    if (updateProfileError) {
      console.error(`Usuário ${lead.email} criado, mas falha ao preencher o perfil. Erro: ${updateProfileError.message}`);
    }
    
    // 6. Atualiza o lead original para marcar como 'promovido'
    const { error: updateLeadError } = await supabaseAdmin
      .from('leads_parceiros')
      .update({ 
        status: 'promovido',
        id_usuario_auth: newUserId
      })
      .eq('id', lead.id);

    if (updateLeadError) {
      console.error(`Usuário ${lead.email} criado, mas falha ao atualizar o lead ${lead.id}. Erro: ${updateLeadError.message}`);
    }

    corsHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ message: `Parceiro ${lead.nome} promovido com sucesso!` }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    corsHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 400 }
    );
  }
});
