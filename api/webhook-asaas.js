// /api/webhook-asaas.js - VERSÃO 3 FINAL: BUSCA DADOS DO CLIENTE

const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzePZJVj-0UP3YIc-0WiPnzRTMD-f5qOXLtOq4KqulebPI90tFjCYdjFXbx3Wwt0OmDcQ/exec';
const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export default async function handler(req, res ) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;
    console.log(`🎉 WEBHOOK RECEBIDO: Evento ${notification.event}`);

    // Só processa eventos de pagamento com referência de parceiro
    if (notification.event?.startsWith('PAYMENT_') && notification.payment?.externalReference) {
      
      const payment = notification.payment;
      console.log(`Evento de parceiro detectado: ${payment.externalReference}. Buscando dados do cliente...`);

      // 1. BUSCA OS DADOS DO CLIENTE NA ASAAS USANDO O ID
      const customerResponse = await fetch(`${ASAAS_API_URL}/customers/${payment.customer}`, {
        headers: { 'access_token': ASAAS_API_KEY }
      });
      const customerData = await customerResponse.json();

      // 2. Monta o pacote de dados completo para a planilha
      const dataForSheet = {
        id_pagamento: payment.id,
        id_assinatura: payment.subscription || 'N/A',
        valor: payment.value,
        id_parceiro: payment.externalReference,
        status_pagamento: payment.status,
        // Dados do cliente que buscamos na API
        nome_cliente: customerData.name || 'N/A',
        cpf_cliente: customerData.cpfCnpj || 'N/A',
        email_cliente: customerData.email || 'N/A',
        telefone_cliente: customerData.mobilePhone || 'N/A',
        nascimento_cliente: 'N/A' // A Asaas não armazena data de nascimento no cliente, teríamos que salvar isso no nosso lado.
      };

      // 3. Envia os dados para o Google Sheets
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataForSheet),
      });

      console.log('Dados completos enviados para o Google Sheets com sucesso!');
    } else {
      console.log('Evento ignorado (não é de pagamento relevante ou não tem ref. de parceiro).');
    }

    res.status(200).json({ message: 'Notificação processada.' });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}
