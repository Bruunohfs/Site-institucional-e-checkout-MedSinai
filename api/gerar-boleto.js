// /api/gerar-boleto.js - VERSÃO FINAL COM POLLING

const ASAAS_API_URL = process.env.ASAAS_API_URL;

// Função auxiliar para esperar um pouco
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
  if (!ASAAS_API_KEY || !ASAAS_API_URL) {
    return res.status(500).json({ success: false, error: 'Configuração interna do servidor incompleta.' });
  }

  try {
    const { cliente, plano } = req.body;

    // --- Lógica do Cliente (sem alterações) ---
    // (código para buscar ou criar cliente permanece o mesmo)
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

    // --- LÓGICA DA ASSINATURA ---
    const subscriptionPayload = {
      customer: customerId,
      billingType: 'BOLETO',
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: new Date().toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura Mensal do Plano: ${plano.nome}`,
    };

    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(subscriptionPayload),
    });

    const subscriptionResult = await subscriptionResponse.json();
    if (!subscriptionResponse.ok) {
      const errorMessage = subscriptionResult.errors?.[0]?.description || 'Falha ao criar assinatura.';
      throw new Error(errorMessage);
    }

    // ✨--- INÍCIO DA LÓGICA DE POLLING ---✨
    let primeiroBoletoUrl = null;
    let cobrancaId = null;
    const subscriptionId = subscriptionResult.id;

    // Vamos tentar buscar os dados do pagamento por até 5 segundos.
    for (let i = 0; i < 5; i++) {
      const checkResponse = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
        headers: { 'access_token': ASAAS_API_KEY }
      });
      const checkResult = await checkResponse.json();
      
      if (checkResult.payments && checkResult.payments.length > 0) {
        primeiroBoletoUrl = checkResult.payments[0].bankSlipUrl;
        cobrancaId = checkResult.payments[0].id;
        break; // Encontramos! Saia do loop.
      }
      
      await sleep(1000); // Espere 1 segundo antes de tentar de novo.
    }
    // ✨--- FIM DA LÓGICA DE POLLING ---✨

    if (!primeiroBoletoUrl) {
      throw new Error("Assinatura criada, mas não foi possível obter a URL do primeiro boleto.");
    }

    res.status(200).json({
      success: true,
      boletoUrl: primeiroBoletoUrl,
      cobrancaId: cobrancaId
    });

  } catch (error) {
    console.error("Erro detalhado ao gerar assinatura de boleto:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao gerar assinatura.', details: error.message });
  }
}
