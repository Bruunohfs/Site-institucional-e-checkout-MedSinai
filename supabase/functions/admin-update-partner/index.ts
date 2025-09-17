import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req ) => {
  // Trata a requisição pre-flight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Cria o cliente admin do Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Pega os dados enviados na requisição
    const { partnerId, action, updatedData } = await req.json();

    if (!partnerId || !action) {
      throw new Error("ID do parceiro e ação são obrigatórios.");
    }

    // Lógica para diferentes ações
    switch (action) {
      // CASO 1: ATUALIZAR DADOS DO PARCEIRO
      case "update_data":
        if (!updatedData) throw new Error("Dados para atualização são obrigatórios.");
        
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          partnerId,
          {
            email: updatedData.email,
            user_metadata: {
              nome: updatedData.nome,
              cupom: updatedData.cupom,
              telefone: updatedData.telefone,
            },
          }
        );

        if (updateError) throw updateError;
        return new Response(JSON.stringify({ user: updatedUser }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      // CASO 2: GERAR LINK DE RESET DE SENHA
      case "reset_password":
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: (await supabaseAdmin.auth.admin.getUserById(partnerId)).data.user.email,
        });

        if (linkError) throw linkError;
        // Por segurança, não retornamos o link, apenas confirmamos que foi enviado.
        // O Supabase envia o e-mail automaticamente se você tiver um template configurado.
        return new Response(JSON.stringify({ message: "Link de recuperação enviado." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
