// supabase/functions/list-partners/index.ts

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

    // ==================================================================
    // ======================= A MUDANÇA SEGURA =========================
    // ==================================================================

    // 1. Busca todos os usuários (SEU CÓDIGO ORIGINAL)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // 2. Busca todos os perfis da nossa tabela 'profiles'
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, nome_completo'); // Só precisamos do ID e do nome
    if (profilesError) throw profilesError;

    // 3. Cria um "mapa" para acesso rápido aos nomes dos perfis
    const profileNames = new Map(profiles.map(p => [p.id, p.nome_completo]));

    // 4. Mescla os dados: para cada usuário, adiciona o nome do perfil
    const mergedUsers = users.map(user => {
      const profileName = profileNames.get(user.id);
      
      // Se o nome do perfil existir, ele sobrescreve o nome antigo.
      // Senão, mantém o que já existia no user_metadata.
      if (profileName) {
        user.user_metadata.nome = profileName;
      }
      
      return user;
    });

    // ==================================================================
    // ======================= FIM DA MUDANÇA ===========================
    // ==================================================================

    // Retorna os usuários "mesclados"
    return new Response(JSON.stringify({ users: mergedUsers }), {
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
