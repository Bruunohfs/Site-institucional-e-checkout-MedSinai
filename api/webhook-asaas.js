// /api/webhook-asaas.js - VERSÃO 8 FINAL: LÓGICA DE REGISTRO E ATUALIZAÇÃO

const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzePZJVj-0UP3YIc-0WiPnzRTMD-f5qOXLtOq4KqulebPI90tFjCYdjFXbx3Wwt0OmDcQ/exec';
const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export default async function handler(req, res ) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;
    const event = notification.event;
    const payment = notification.payment;
    console.log(`🎉 WEBHOOK RECEBIDO: Evento ${event} para pagamento ${payment?.id}`);

    // Só processa se tiver uma referência de parceiro, para não poluir a planilha com vendas diretas não rastreadas
    if (!payment?.externalReference) {
      console.log('Evento ignorado (sem ref. de parceiro).');
      return res.status(200).json({ message: 'Ignorado: Sem referência de parceiro.' });
    }

    // --- LÓGICA DE REGISTRO E ATUALIZAÇÃO ---

    if (event === 'PAYMENT_CREATED') {
      // Sempre que um pagamento é criado, registramos como uma nova linha.
      // Isso captura a intenção de compra (Boleto/PIX gerado, Cartão iniciado).
      console.log(`Registrando novo pagamento PENDING: ${payment.id}`);
      const customerData = await getCustomerData(payment.customer);
      const dataForSheet = formatDataForSheet(payment, customerData);
      
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataForSheet),
      });
      console.log('Nova linha PENDING adicionada ao Google Sheets.');

    } else if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_UPDATED') {
      // Quando o status de um pagamento muda (ex: pago), atualizamos a linha existente.
      console.log(`Atualizando status do pagamento: ${payment.id} para ${payment.status}`);
      
      const updateUrl = new URL(GOOGLE_SHEET_WEB_APP_URL);
      updateUrl.searchParams.append('id_pagamento', payment.id);
      updateUrl.searchParams.append('status_pagamento', payment.status);

      await fetch(updateUrl.toString(), { method: 'GET' });
      console.log('Status atualizado no Google Sheets.');
      
    } else {
      console.log(`Evento ${event} ignorado (não relevante para o fluxo de registro/atualização).`);
    }

    res.status(200).json({ message: 'Notificação processada.' });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}

// --- Funções Auxiliares (sem alteração) ---

async function getCustomerData(customerId) {
  const response = await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  return response.json();
}

function formatDataForSheet(payment, customerData) {
  return {
    id_pagamento: payment.id,
    id_assinatura: payment.subscription || 'N/A',
    valor: payment.value,
    id_parceiro: payment.externalReference,
    status_pagamento: payment.status,
    nome_cliente: customerData.name || 'N/A',
    cpf_cliente: customerData.cpfCnpj || 'N/A',
    email_cliente: customerData.email || 'N/A',
    telefone_cliente: customerData.mobilePhone || 'N/A',
    nome_plano: payment.description || 'N/A'
  };
}
