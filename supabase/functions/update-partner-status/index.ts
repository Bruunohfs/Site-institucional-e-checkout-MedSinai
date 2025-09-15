// supabase/functions/update-partner-status/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req ) => {
  // Lida com a requisição preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { partnerId, status } = await req.json();

    if (!partnerId || !status) {
      throw new Error('ID do parceiro e novo status são obrigatórios.');
    }
    if (status !== 'ativo' && status !== 'inativo') {
      throw new Error("Status inválido. Use 'ativo' ou 'inativo'.");
    }

    const { data: { user: currentUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(partnerId);
    if (fetchError) throw fetchError;

    const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(
      partnerId,
      {
        user_metadata: {
          ...currentUser.user_metadata,
          status: status
        }
      }
    );

    if (error) throw error;

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // --- MUDANÇA IMPORTANTE AQUI ---
    // Agora, mesmo em caso de erro, retornamos os cabeçalhos CORS.
    // Isso permite que o navegador leia a mensagem de erro.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
