// /api/gerar-pix.js - VERSÃO FINAL COM LÓGICA DE BUSCA

const ASAAS_API_URL = process.env.ASAAS_API_URL;

// Função para esperar um pouco
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
   console.log("BACKEND RECEBEU:", JSON.stringify(req.body, null, 2));
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
  if (!ASAAS_API_KEY || !ASAAS_API_URL) {
    return res.status(500).json({ success: false, error: 'Configuração interna do servidor incompleta.' });
  }

  try {
    const { cliente, plano, ReferenciaParceiro } = req.body;

    // --- Lógica do Cliente ---
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cliente.cpf}`, { headers: { 'access_token': ASAAS_API_KEY } });
    const searchResult = await searchCustomerResponse.json();
    let customerId;
    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const newCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify({ name: cliente.nomeCompleto, cpfCnpj: cliente.cpf, email: cliente.email, mobilePhone: cliente.telefone }) });
      const newCustomer = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) throw new Error(JSON.stringify(newCustomer.errors));
      customerId = newCustomer.id;
    }

    // --- PASSO 1: CRIAR A ASSINATURA ---
    const subscriptionPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: new Date().toISOString().split('T')[0], // Primeira cobrança hoje!
      cycle: 'MONTHLY',
      description: `Assinatura Mensal do Plano: ${plano.nome}`,
      externalReference: ReferenciaParceiro
    };
    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });
    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      throw new Error(`Falha ao criar assinatura: ${errorText}`);
    }
    const subscriptionResult = await subscriptionResponse.json();

    // --- PASSO 2: BUSCAR O PRIMEIRO PAGAMENTO GERADO PELA ASSINATURA ---
    await sleep(2000); // Espera 2 segundos para a Asaas processar

    const paymentsResponse = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionResult.id}/payments`, { headers: { 'access_token': ASAAS_API_KEY } });
    if (!paymentsResponse.ok) {
        const errorText = await paymentsResponse.text();
        throw new Error(`Falha ao buscar pagamentos da assinatura: ${errorText}`);
    }
    const paymentsResult = await paymentsResponse.json();

    if (!paymentsResult.data || paymentsResult.data.length === 0) {
        throw new Error("A Asaas criou a assinatura, mas o primeiro pagamento ainda não foi encontrado.");
    }

    const firstPayment = paymentsResult.data[0];

    // --- PASSO 3: GERAR O QR CODE PARA O PAGAMENTO ENCONTRADO ---
    const qrCodeResponse = await fetch(`${ASAAS_API_URL}/payments/${firstPayment.id}/pixQrCode`, { method: 'GET', headers: { 'access_token': ASAAS_API_KEY } });
    if (!qrCodeResponse.ok) {
      const errorText = await qrCodeResponse.text();
      throw new Error(`Não foi possível gerar o QR Code: ${errorText}`);
    }
    const qrCodeData = await qrCodeResponse.json();

    res.status(200).json({ success: true, payload: qrCodeData.payload, encodedImage: qrCodeData.encodedImage, cobrancaId: firstPayment.id });

  } catch (error) {
    console.error("Erro detalhado no fluxo de assinatura de Pix:", error.message);
    res.status(500).json({ success: false, error: 'Falha no processo de assinatura.', details: error.message });
  }
}
