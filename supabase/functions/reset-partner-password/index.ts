// supabase/functions/reset-partner-password/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
// Importamos a sua função de CORS que já funciona para as outras
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
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("O ID do usuário é obrigatório.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: PADRAO_SENHA_PARCEIRO }
    );

    if (updateError) {
      throw new Error(`Falha ao resetar a senha: ${updateError.message}`);
    }

    // ===================================================================
    // ==> A CORREÇÃO FINAL ESTÁ AQUI <==
    // Passamos o objeto 'Headers' diretamente, sem o spread '...'
    // E adicionamos o 'Content-Type' a ele.
    // ===================================================================
    corsHeaders.set('Content-Type', 'application/json');

    return new Response(
      JSON.stringify({ message: `Senha do usuário ${updatedUser.user.email} resetada para o padrão com sucesso.` }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    // Fazemos o mesmo para a resposta de erro
    corsHeaders.set('Content-Type', 'application/json');
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 400 }
    );
  }
});
