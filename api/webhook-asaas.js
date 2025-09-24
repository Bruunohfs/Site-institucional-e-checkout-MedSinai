// /api/webhook-asaas.js - VERSÃO FINAL E SEGURA (BASEADA NO SEU CÓDIGO ORIGINAL)

import { createClient } from '@supabase/supabase-js';

// As chaves são lidas de forma segura das variáveis de ambiente da Vercel
const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação para garantir que as variáveis foram carregadas
if (!ASAAS_API_URL || !ASAAS_API_KEY || !supabaseUrl || !supabaseKey) {
  console.error("Webhook Error: Variáveis de ambiente não configuradas.");
  throw new Error("Uma ou mais variáveis de ambiente essenciais não foram configuradas.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;
    const event = notification.event;
    console.log(`🎉 WEBHOOK UNIFICADO: Evento ${event} recebido.`);

    // --- ROTEADOR DE EVENTOS ---
    // Mantendo a estrutura original que funciona
    if (notification.subscription) {
        await upsertSubscription(notification.subscription);
    } else if (notification.payment) {
        await handlePaymentEvent(event, notification.payment);
    } else {
        console.warn(`Webhook recebido sem 'payment' ou 'subscription'. Ignorando.`);
    }

    res.status(200).json({ message: 'Notificação processada com sucesso.' });

  } catch (error) {
    console.error("Erro GERAL ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}

// --- FUNÇÕES DE LÓGICA (SEPARADAS PARA ORGANIZAÇÃO) ---

async function upsertSubscription(subscription) {
  // Esta função já estava correta e não precisa de alterações.
  // Apenas garantindo que ela continue como estava.
  const clienteInternoId = await ensureCustomerExists(subscription.customer);
  if (!clienteInternoId) {
    console.warn(`Não foi possível encontrar ou criar o cliente para a assinatura ${subscription.id}. Pulando sincronização.`);
    return;
  }

  const dataStringAsaas = subscription.dateCreated;
  const partesData = dataStringAsaas.split('/');
  const dataFormatoISO = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;

  const { error: subError } = await supabase.from('assinaturas').upsert({
    id_asaas: subscription.id,
    id_cliente: clienteInternoId,
    id_plano: subscription.description,
    status: subscription.status,
    metodo_pagamento: subscription.billingType,
    valor: subscription.value,
    data_criacao: dataFormatoISO,
    ciclo: subscription.cycle,
  }, { onConflict: 'id_asaas' });

  if (subError) throw new Error(`Erro no upsert da assinatura: ${JSON.stringify(subError)}`);
  console.log(`Assinatura ${subscription.id} sincronizada.`);
}

async function handlePaymentEvent(event, payment) {
  console.log(`...processando evento de pagamento para ${payment?.id}`);

  if (event === 'PAYMENT_DELETED') {
    const { error } = await supabase.from('vendas').delete().eq('id_pagamento', payment.id);
    if (error) throw new Error(`Erro ao deletar venda: ${JSON.stringify(error)}`);
    console.log(`Venda ${payment.id} deletada.`);
    return;
  }

  const fullPaymentData = await getPaymentData(payment.id);
  
  // ===================================================================
  // ==> ATUALIZAÇÃO 1: Garantir que o cliente exista e pegar nosso ID interno <==
  // ===================================================================
  const clienteInternoId = await ensureCustomerExists(fullPaymentData.customer);
  if (!clienteInternoId) {
      throw new Error(`Cliente ${fullPaymentData.customer} não encontrado para o pagamento ${fullPaymentData.id}. A venda não pode ser registrada sem um cliente.`);
  }
  
  const customerData = await getCustomerData(fullPaymentData.customer);

  // ===================================================================
  // ==> ATUALIZAÇÃO 2: Passar o ID do nosso cliente para a função de formatação <==
  // ===================================================================
  const dadosVenda = formatDataForSupabase(fullPaymentData, customerData, clienteInternoId);

  const { error } = await supabase.from('vendas').upsert(dadosVenda, { onConflict: 'id_pagamento' });
  if (error) throw new Error(`Erro no upsert da venda: ${JSON.stringify(error)}`);
  console.log(`Venda ${payment.id} sincronizada (upsert).`);
}

// --- FUNÇÕES AUXILIARES ---

async function ensureCustomerExists(customerIdAsaas) {
  // Esta função já estava correta e não precisa de alterações.
  const { data: clienteExistente } = await supabase.from('clientes').select('id').eq('id_asaas', customerIdAsaas).single();
  if (clienteExistente) return clienteExistente.id;
  try {
    console.warn(`Cliente ${customerIdAsaas} não encontrado localmente. Buscando no Asaas para criar...`);
    const customerData = await getCustomerData(customerIdAsaas);
    const dadosCliente = { id_asaas: customerData.id, nome: customerData.name, email: customerData.email, cpf: customerData.cpfCnpj, telefone: customerData.mobilePhone || customerData.phone };
    const { data: novoCliente, error: insertError } = await supabase.from('clientes').insert(dadosCliente).select('id').single();
    if (insertError) throw insertError;
    console.log(`Cliente ${customerData.id} criado dinamicamente no Supabase.`);
    return novoCliente.id;
  } catch (error) {
    console.error(`Falha crítica ao tentar criar o cliente ${customerIdAsaas}:`, error.message);
    return null;
  }
}

async function getPaymentData(paymentId) {
  const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, { headers: { 'access_token': ASAAS_API_KEY } });
  if (!response.ok) throw new Error(`Falha ao buscar dados do pagamento ${paymentId} do Asaas.`);
  return response.json();
}

async function getCustomerData(customerId) {
  const response = await fetch(`${ASAAS_API_URL}/customers/${customerId}`, { headers: { 'access_token': ASAAS_API_KEY } });
  if (!response.ok) throw new Error(`Falha ao buscar dados do cliente ${customerId} do Asaas.`);
  return response.json();
}

// ===================================================================
// ==> ATUALIZAÇÃO 3: A função de formatação agora aceita 'clienteInternoId' <==
// E adiciona tanto o id_cliente quanto o id_asaas (da assinatura)
// ===================================================================
function formatDataForSupabase(payment, customerData, clienteInternoId) {
  let dataPagamentoFinal = null;
  if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
    dataPagamentoFinal = payment.paymentDate || new Date().toISOString();
  }
  return {
    id_pagamento: payment.id,
    id_cliente: clienteInternoId, // <== CORREÇÃO PRINCIPAL
    valor: payment.value,
    id_parceiro: payment.externalReference || null,
    status_pagamento: payment.status,
    nome_cliente: customerData.name,
    cpf_cliente: customerData.cpfCnpj,
    email_cliente: customerData.email,
    telefone_cliente: customerData.mobilePhone,
    nome_plano: payment.description,
    data_vencimento: payment.dueDate,
    forma_pagamento: payment.billingType,
    data_pagamento: dataPagamentoFinal,
    data_evento: new Date().toISOString(),
    id_cobranca_principal: payment.installment || payment.subscription || null,
    id_asaas: payment.subscription || null, // Salva o ID da assinatura ou NULL
  };
}
