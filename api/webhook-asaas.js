// /api/webhook-asaas.js - VERSÃO 2: COM INTEGRAÇÃO GOOGLE SHEETS

// ✨ COLE A URL QUE VOCÊ COPIOU DO GOOGLE APPS SCRIPT AQUI ✨
const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzePZJVj-0UP3YIc-0WiPnzRTMD-f5qOXLtOq4KqulebPI90tFjCYdjFXbx3Wwt0OmDcQ/exec';

export default async function handler(req, res ) {
  // Apenas aceite requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;

    // Log para depuração, para ainda podermos ver o que chega
    console.log('=========================================');
    console.log('🎉 WEBHOOK DA ASAAS RECEBIDO! 🎉');
    console.log('Evento:', notification.event);
    console.log('=========================================');

    // 1. Verificamos se a notificação é sobre um pagamento e se tem a referência do parceiro
    if (notification.event && notification.event.startsWith('PAYMENT_') && notification.payment?.externalReference) {
      
      console.log(`Evento de pagamento com parceiro detectado: ${notification.payment.externalReference}. Enviando para o Google Sheets...`);

      // 2. Montamos o pacote de dados que vamos enviar para a planilha
      const dataForSheet = {
        id_pagamento: notification.payment.id,
        id_assinatura: notification.payment.subscription || 'N/A', // Pega o ID da assinatura se existir
        valor: notification.payment.value,
        id_parceiro: notification.payment.externalReference,
        status_pagamento: notification.payment.status,
        email_cliente: 'Não disponível no webhook' // O email do cliente não vem no webhook de pagamento, teríamos que buscar via API se necessário
      };

      // 3. Enviamos os dados para a nossa API do Google Sheets
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataForSheet),
      });

      console.log('Dados enviados para o Google Sheets com sucesso!');
    } else {
      console.log('Evento ignorado (não é de pagamento ou não tem referência de parceiro).');
    }

    // 4. Responda para a Asaas que recebemos a notificação com sucesso
    res.status(200).json({ message: 'Notificação processada.' });

  } catch (error) {
    console.error("Erro ao processar o webhook da Asaas:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}
