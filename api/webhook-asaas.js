const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzUSOar5rf4Fth10_WP6cxM9xcdir2G0PTycsppB6xDmv7fLKV83mtu9xM1wHAAIpH-pQ/exec';
const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;
    const event = notification.event;
    const payment = notification.payment;
    console.log(`🎉 WEBHOOK RECEBIDO: Evento ${event} para pagamento ${payment?.id}`);

    if (event === 'PAYMENT_DELETED') {
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id_pagamento: payment.id
        }),
      });
      console.log(`Solicitação de deleção enviada para o pagamento ${payment.id}.`);
      return res.status(200).json({ message: 'Solicitação de deleção processada.' });
    }


    if (!payment?.externalReference) {
      console.log('Evento ignorado (sem ref. de parceiro).');
      return res.status(200).json({ message: 'Ignorado: Sem referência de parceiro.' });
    }

    const fullPaymentData = await getPaymentData(payment.id);
    const customerData = await getCustomerData(fullPaymentData.customer);
    const dataForSheet = formatDataForSheet(fullPaymentData, customerData);

    await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataForSheet),
    });
    
    console.log(`Dados do pagamento ${payment.id} enviados para o Google Sheets.`);
    res.status(200).json({ message: 'Notificação processada.' });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}

// --- Funções Auxiliares ---

async function getPaymentData(paymentId) {
  const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  return response.json();
}

async function getCustomerData(customerId) {
  const response = await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  return response.json();
}

function formatDataForSheet(payment, customerData) {
  // ✨ LÓGICA DE DATA DE PAGAMENTO CORRIGIDA ✨
  let dataPagamentoFinal = 'Pendente';
  if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
    // Se a data de pagamento existir no objeto, use-a.
    if (payment.paymentDate) {
      dataPagamentoFinal = payment.paymentDate;
    } else {
      // Senão (caso do cartão de crédito avulso), use a data de hoje.
      dataPagamentoFinal = new Date().toISOString().split('T')[0];
    }
  }

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
    nome_plano: payment.description || 'N/A',
    data_vencimento: payment.dueDate || 'N/A',
    forma_pagamento: payment.billingType || 'N/A',
    data_pagamento: dataPagamentoFinal // Usando a nova variável
  };
}
