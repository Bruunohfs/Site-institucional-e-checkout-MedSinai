// /api/webhook-asaas.js - VERSÃO 5 FINAL: LÓGICA DE EVENTOS REFINADA

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
    console.log(`🎉 WEBHOOK RECEBIDO: Evento ${event}`);

    // ✨ LÓGICA REFINADA: Processa apenas eventos de criação ou confirmação de pagamento.
    // Ignora eventos de exclusão, atualização, etc.
    const isRelevantEvent = event === 'PAYMENT_CREATED' || event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED';
    const payment = notification.payment;

    // Só continua se for um evento relevante E se tiver uma referência de parceiro.
    if (isRelevantEvent && payment?.externalReference) {
      
      console.log(`Evento relevante de parceiro detectado: ${payment.externalReference}. Processando...`);

      // Busca os dados do cliente na API da Asaas
      const customerResponse = await fetch(`${ASAAS_API_URL}/customers/${payment.customer}`, {
        headers: { 'access_token': ASAAS_API_KEY }
      });
      const customerData = await customerResponse.json();

      // Monta o pacote de dados completo para a planilha
      const dataForSheet = {
        id_pagamento: payment.id,
        id_assinatura: payment.subscription || 'N/A',
        valor: payment.value,
        id_parceiro: payment.externalReference,
        status_pagamento: payment.status,
        nome_cliente: customerData.name || 'N/A',
        cpf_cliente: customerData.cpfCnpj || 'N/A',
        email_cliente: customerData.email || 'N/A',
        telefone_cliente: customerData.mobilePhone || 'N/A',
        // Extrai o nome do plano do campo 'description'
        nome_plano: payment.description || 'N/A'
      };

      // Envia os dados para o Google Sheets
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataForSheet),
      });

      console.log('Dados completos enviados para o Google Sheets com sucesso!');
    } else {
      console.log('Evento ignorado (não relevante ou sem ref. de parceiro).');
    }

    // Responde para a Asaas que a notificação foi recebida.
    res.status(200).json({ message: 'Notificação processada.' });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}
