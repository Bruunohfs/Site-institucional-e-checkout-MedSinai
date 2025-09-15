// supabase/functions/get-partner-status/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts'; // Reutilizando nosso cors.ts!

Deno.serve(async (req ) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Pega o ID do parceiro da URL (ex: .../get-partner-status?id=...)
    const url = new URL(req.url);
    const partnerId = url.searchParams.get('id');

    if (!partnerId) {
      throw new Error('O ID do parceiro é obrigatório.');
    }

    // Cria um cliente admin para ler os metadados do usuário
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Busca o usuário pelo ID
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(partnerId);

    // Se o usuário não for encontrado, consideramos inválido
    if (error || !user) {
      return new Response(JSON.stringify({ status: 'invalido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Verifica o status nos metadados. Se não existir, considera 'ativo' por padrão.
    const partnerStatus = user.user_metadata?.status ?? 'ativo';

    return new Response(JSON.stringify({ status: partnerStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
