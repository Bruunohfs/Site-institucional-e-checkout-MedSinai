// supabase/functions/create-partner/index.ts

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

    const { email, password, nome, cupom } = await req.json();
    if (!email || !password || !nome) {
      throw new Error('Email, senha e nome são obrigatórios.');
    }

    // --- ETAPA 1: Criar o usuário (como antes) ---
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'parceiro'
      }
    });

    if (userError) throw userError;
    if (!user) throw new Error('Falha ao criar o objeto do usuário.');

    // --- ETAPA 2: Inserir/Atualizar os dados na tabela 'profiles' ---
    // Usamos 'upsert' para garantir que funcione mesmo que o gatilho já tenha criado a linha.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id, // O ID do usuário recém-criado
        nome_completo: nome,
        cupom: cupom || null
      });

    if (profileError) {
      // Se a inserção no perfil falhar, é uma boa prática tentar deletar o usuário recém-criado
      // para não deixar um usuário "órfão" sem perfil.
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    // Retorna o objeto do usuário original, como o frontend espera
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
