import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Importa a FUNÇÃO em vez da constante
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req ) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin); // Gera os headers para esta requisição

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    return new Response(JSON.stringify({ users }), {
      // Usa os headers gerados
      headers: { ...Object.fromEntries(corsHeaders), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      // Usa os headers gerados também no erro
      headers: { ...Object.fromEntries(corsHeaders), 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
