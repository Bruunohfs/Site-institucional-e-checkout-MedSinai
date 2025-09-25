// supabase/functions/admin-create-user/index.ts - VERSÃO ULTRA-SIMPLIFICADA
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req ) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Pega o token de autorização diretamente do cabeçalho da requisição.
    const authorization = req.headers.get("Authorization")!;
    if (!authorization) {
      throw new Error("Cabeçalho de autorização ausente.");
    }

    // 2. Cria um cliente Supabase usando a chave anônima.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // 3. Tenta obter o usuário USANDO O TOKEN QUE VEIO NA REQUISIÇÃO.
    const { data: { user } } = await supabase.auth.getUser(authorization.replace("Bearer ", ""));
    if (!user) {
      throw new Error("Token de usuário inválido ou expirado.");
    }

    // 4. Usa a SERVICE_ROLE_KEY para ler o perfil e verificar se é admin.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      throw new Error("Acesso negado. Apenas administradores podem executar esta ação.");
    }

    // 5. Se tudo deu certo, prossegue com a criação do novo usuário.
    const { email, password, user_metadata } = await req.json();
    const { data: authResponse, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata,
    });

    if (createError) throw createError;

    return new Response(JSON.stringify(authResponse), {
      headers: { ...Object.fromEntries(corsHeaders), "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("ERRO NA FUNÇÃO:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...Object.fromEntries(corsHeaders), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
