// supabase/functions/update-partner-status/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// --- 1. IMPORTA A FUNÇÃO CORRETA DO SEU ARQUIVO CORS ---
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req ) => {
  // --- 2. GERA OS HEADERS DINAMICAMENTE ---
  const requestOrigin = req.headers.get('origin');
  const headers = getCorsHeaders(requestOrigin);

  // Lida com a requisição preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: headers }); // Usa os headers gerados
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

    // --- 3. USA OS HEADERS GERADOS NA RESPOSTA DE SUCESSO ---
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ user }), {
      headers: headers,
      status: 200,
    });

  } catch (error) {
    // --- 4. USA OS HEADERS GERADOS NA RESPOSTA DE ERRO ---
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ error: error.message }), {
      headers: headers,
      status: 400,
    });
  }
});
