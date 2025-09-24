// /api/webhook-asaas.js - VERSÃO FINAL COM CORREÇÃO DO id_cliente

import { createClient } from '@supabase/supabase-js';

// ... (seu código de configuração inicial, sem alterações)
const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ASAAS_API_URL || !ASAAS_API_KEY || !supabaseUrl || !supabaseKey) {
  console.error("Webhook Error: Variáveis de ambiente não configuradas.");
  throw new Error("Uma ou mais variáveis de ambiente essenciais não foram configuradas.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // ... (seu handler principal, sem alterações)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  try {
    const notification = req.body;
    const event = notification.event;
    console.log(`🎉 WEBHOOK UNIFICADO: Evento ${event} recebido.`);
    switch (event) {
      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_UPDATED':
        await upsertSubscription(notification.subscription);
        break;
      default:
        if (event.startsWith('PAYMENT_')) {
          await handlePaymentEvent(event, notification.payment);
        }
        break;
    }
    res.status(200).json({ message: 'Notificação processada com sucesso.' });
  } catch (error) {
    console.error("Erro GERAL ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}

// --- FUNÇÕES DE LÓGICA ---

async function upsertSubscription(subscription) {
  // ... (esta função está correta, sem alterações)
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
  
  // A busca pelo customerData continua, pois precisamos do nome, cpf, etc.
  const customerData = await getCustomerData(fullPaymentData.customer);

  // ===================================================================
  // ==> ATUALIZAÇÃO 2: Passar o ID do nosso cliente para a função de formatação <==
  // ===================================================================
  const dadosVenda = formatDataForSupabase(fullPaymentData, customerData, fullPaymentData.subscription, clienteInternoId);

  const { error } = await supabase.from('vendas').upsert(dadosVenda, { onConflict: 'id_pagamento' });
  if (error) throw new Error(`Erro no upsert da venda: ${JSON.stringify(error)}`);
  console.log(`Venda ${payment.id} sincronizada (upsert).`);
}

// --- FUNÇÕES AUXILIARES ---

async function ensureCustomerExists(customerIdAsaas) {
  // ... (esta função está correta, sem alterações)
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

async function getPaymentData(paymentId) { /* ... sem alterações ... */ }
async function getCustomerData(customerId) { /* ... sem alterações ... */ }

// ===================================================================
// ==> ATUALIZAÇÃO 3: A função de formatação agora aceita 'clienteInternoId' <==
// ===================================================================
function formatDataForSupabase(payment, customerData, idAssinaturaAsaas, clienteInternoId) {
  let dataPagamentoFinal = null;
  if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
    dataPagamentoFinal = payment.paymentDate || new Date().toISOString();
  }
  return {
    id_pagamento: payment.id,
    // A LINHA MÁGICA ADICIONADA:
    id_cliente: clienteInternoId, // Preenche o ID do cliente na tabela de vendas
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
    id_asaas: idAssinaturaAsaas || null,
  };
}
