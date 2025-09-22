// supabase/functions/promote-lead-to-partner/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { getCorsHeaders } from '../_shared/cors.ts'

// Função para gerar uma senha aleatória e segura
function generateTemporaryPassword(length = 12 ) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0, n = charset.length; i < n; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n))
  }
  // Garante que a senha tenha pelo menos um número e uma letra maiúscula para robustez
  password += Math.floor(Math.random() * 10)
  password += "A"
  return password
}

serve(async (req) => {

const requestOrigin = req.headers.get('origin');
const corsHeaders = getCorsHeaders(requestOrigin);

if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}

  try {
    // 1. Extrai o ID do lead do corpo da requisição
    const { leadId } = await req.json()
    if (!leadId) {
      throw new Error("ID do lead não fornecido.")
    }

    // 2. Cria um cliente Supabase com privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Busca os dados do lead na tabela 'leads_parceiros'
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads_parceiros')
      .select('id, nome, email, telefone, status')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      throw new Error(`Lead com ID ${leadId} não encontrado ou já processado.`)
    }
    
    // Verificação de segurança: não processar se o status não for 'aprovado'
    if (lead.status !== 'aprovado') {
        return new Response(
            JSON.stringify({ error: `O lead precisa estar com o status "Aprovado" para ser promovido.` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    // 4. Gera uma senha temporária
    const temporaryPassword = generateTemporaryPassword()

    // 5. Cria o novo usuário no sistema de autenticação do Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: temporaryPassword,
      email_confirm: true, // Já marca o e-mail como confirmado
      user_metadata: {
        nome: lead.nome,
        telefone: lead.telefone,
        role: 'parceiro', // Define a role do usuário
        status: 'ativo', // Define o status inicial como 'ativo'
        // Podemos adicionar o cupom aqui se quisermos, mas por enquanto vamos manter simples
      }
    })

    if (authError) {
      // Se o erro for "User already registered", damos uma mensagem mais amigável
      if (authError.message.includes("User already registered")) {
          throw new Error(`Um usuário com o e-mail ${lead.email} já existe no sistema.`);
      }
      throw new Error(`Erro ao criar usuário: ${authError.message}`)
    }
    // ===================================================================
    // ==> PASSO 5.5: INSERIR/ATUALIZAR O PERFIL NA TABELA 'profiles' <==
    // ===================================================================
    // O trigger já criou a linha, então usamos 'update' para preenchê-la.
        const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        nome_completo: authUser.user.user_metadata.nome, // <--- MUDANÇA AQUI
        telefone: authUser.user.user_metadata.telefone
      })
      .eq('id', authUser.user.id) // A condição é o ID do usuário que acabamos de criar

    if (profileError) {
      // Se isso falhar, é um problema sério de sincronização.
      // Por enquanto, vamos logar e continuar, mas o usuário pode ficar sem nome/telefone.
      console.error(`Usuário ${lead.email} criado, mas falha ao preencher o perfil. Erro: ${profileError.message}`);
      // Em um cenário de produção, poderíamos tentar deletar o usuário para manter a consistência.
    }
    // ===================================================================
    // ==> FIM DO NOVO PASSO <==
    // ===================================================================
    // 6. Atualiza o lead na tabela 'leads_parceiros' para marcar como promovido
    const { error: updateError } = await supabaseAdmin
      .from('leads_parceiros')
      .update({ 
        status: 'promovido', // Novo status para indicar que a conversão foi feita
        id_usuario_auth: authUser.user.id // Armazena o ID do usuário criado
      })
      .eq('id', lead.id)

    if (updateError) {
      // Se a atualização falhar, é um problema, mas o usuário já foi criado.
      // Em um cenário real, poderíamos tentar deletar o usuário criado ou logar o erro.
      // Por agora, vamos apenas notificar.
      console.error(`Usuário ${lead.email} criado, mas falha ao atualizar o lead ${lead.id}. Erro: ${updateError.message}`);
    }

    // 7. Retorna uma resposta de sucesso
    return new Response(
      JSON.stringify({ message: `Parceiro ${lead.nome} criado com sucesso! O usuário pode agora fazer login.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    // Captura qualquer erro no processo e retorna uma resposta de erro
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
