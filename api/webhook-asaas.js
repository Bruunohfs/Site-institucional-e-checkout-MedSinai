// /api/webhook-asaas.js - VERSÃO 6 FINAL: LÓGICA ANTI-DUPLICIDADE

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

    // Só processa se tiver uma referência de parceiro
    if (!payment?.externalReference) {
      console.log('Evento ignorado (sem ref. de parceiro).');
      return res.status(200).json({ message: 'Ignorado: Sem referência de parceiro.' });
    }

    // ✨ LÓGICA ANTI-DUPLICIDADE ✨

    if (event === 'PAYMENT_CREATED') {
      // Se for a primeira fatura de uma assinatura, não registre. A venda real foi o pagamento avulso.
      if (payment.subscription) {
        console.log(`Evento ignorado (primeira fatura da assinatura ${payment.subscription}). A venda já foi registrada.`);
        return res.status(200).json({ message: 'Ignorado: Fatura de assinatura.' });
      }

      // Se for um pagamento avulso sendo criado, ADICIONE a linha na planilha.
      console.log(`Registrando novo pagamento: ${payment.id}`);
      const customerData = await getCustomerData(payment.customer);
      const dataForSheet = formatDataForSheet(payment, customerData);
      
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataForSheet),
      });
      console.log('Nova linha adicionada ao Google Sheets.');

    } else if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      // Se for um pagamento sendo confirmado, ATUALIZE a linha existente.
      console.log(`Atualizando status do pagamento: ${payment.id} para ${payment.status}`);
      
      // Monta a URL para a requisição GET do Google Apps Script
      const updateUrl = new URL(GOOGLE_SHEET_WEB_APP_URL);
      updateUrl.searchParams.append('id_pagamento', payment.id);
      updateUrl.searchParams.append('status_pagamento', payment.status);

      await fetch(updateUrl.toString(), { method: 'GET' });
      console.log('Status atualizado no Google Sheets.');
    } else {
      console.log(`Evento ${event} ignorado (não relevante para o fluxo).`);
    }

    res.status(200).json({ message: 'Notificação processada.' });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}

// --- Funções Auxiliares ---

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
