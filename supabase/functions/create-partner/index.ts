import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req ) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Pega os dados do novo parceiro do corpo da requisição
    const { email, password, nome, cupom } = await req.json();
    if (!email || !password || !nome) {
      throw new Error('Email, senha e nome são obrigatórios.');
    }

    // Cria o novo usuário com os dados fornecidos
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Já marca o email como confirmado
      user_metadata: {
        nome: nome,
        cupom: cupom || null, // Garante que o cupom seja nulo se não for fornecido
        role: 'parceiro' // Define o cargo como 'parceiro'
      }
    });

    if (error) throw error;

    return new Response(JSON.stringify({ user }), {
      headers: { ...Object.fromEntries(corsHeaders), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...Object.fromEntries(corsHeaders), 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
