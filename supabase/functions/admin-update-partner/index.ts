// supabase/functions/admin-update-partner/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
// CORREÇÃO: Importa a FUNÇÃO getCorsHeaders em vez da constante
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req ) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { partnerId, action, updatedData } = await req.json();

    if (!partnerId || !action) {
      throw new Error("ID do parceiro e ação são obrigatórios.");
    }

    switch (action) {
      case "update_data":
        if (!updatedData) throw new Error("Dados para atualização são obrigatórios.");
        
        // =================================================================
        // ==> INÍCIO DA LÓGICA CORRIGIDA <==
        // =================================================================

        // ETAPA 1: Atualizar os dados de autenticação (email e cupom)
        const { data: authUpdateData, error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          partnerId,
          {
            email: updatedData.email,
            user_metadata: {
              // Apenas o cupom permanece aqui
              cupom: updatedData.cupom,
            },
          }
        );

        if (authUpdateError) throw authUpdateError;

        // ETAPA 2: Atualizar os dados de perfil (nome e telefone) na tabela 'profiles'
        const { error: profileUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({
            nome_completo: updatedData.nome, // O nome agora vai para 'nome_completo'
            telefone: updatedData.telefone,   // O telefone agora vai para 'telefone'
          })
          .eq('id', partnerId); // Usando o ID do parceiro para encontrar a linha correta

        if (profileUpdateError) throw profileUpdateError;

        // Retorna o usuário atualizado da primeira operação (compatibilidade)
        return new Response(JSON.stringify({ user: authUpdateData.user }), {
          headers: { ...Object.fromEntries(corsHeaders), "Content-Type": "application/json" },
          status: 200,
        });

        // =================================================================
        // ==> FIM DA LÓGICA CORRIGIDA <==
        // =================================================================

      case "reset_password":
        const { data: userToReset } = await supabaseAdmin.auth.admin.getUserById(partnerId);
        if (!userToReset?.user) throw new Error("Usuário não encontrado para resetar a senha.");

        const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: userToReset.user.email,
        });

        if (linkError) throw linkError;
        
        return new Response(JSON.stringify({ message: "Link de recuperação enviado." }), {
          headers: { ...Object.fromEntries(corsHeaders), "Content-Type": "application/json" },
          status: 200,
        });

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...Object.fromEntries(corsHeaders), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
