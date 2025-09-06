// /api/gerar-boleto.js

const ASAAS_API_URL = process.env.ASAAS_API_URL;
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
    const { cliente, plano, referenciaParceiro } = req.body;

    // --- Lógica do Cliente (sem alterações) ---
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

    // --- PASSO 1: CRIAR A ASSINATURA (REMOVEMOS A REFERÊNCIA DAQUI) ---
    const subscriptionPayload = {
      customer: customerId,
      billingType: 'BOLETO',
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: new Date().toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura Mensal do Plano: ${plano.nome}`,
    };
    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });
    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      throw new Error(`Falha ao criar assinatura: ${errorText}`);
    }
    const subscriptionResult = await subscriptionResponse.json();

    // --- PASSO 2: BUSCAR O PRIMEIRO PAGAMENTO ---
    await sleep(2000);
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

    // --- PASSO 3: ATUALIZAR A COBRANÇA COM A REFERÊNCIA (A MUDANÇA PRINCIPAL) ---
    await fetch(`${ASAAS_API_URL}/payments/${firstPayment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify({ externalReference: referenciaParceiro })
    });

    // --- PASSO 4: ATUALIZAR O VENCIMENTO DO BOLETO ---
    const hoje = new Date();
    const dataVencimento = new Date(hoje.setDate(hoje.getDate() + 3));
    await fetch(`${ASAAS_API_URL}/payments/${firstPayment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify({ dueDate: dataVencimento.toISOString().split('T')[0] })
    });

    res.status(200).json({ success: true, boletoUrl: firstPayment.bankSlipUrl, cobrancaId: firstPayment.id });

  } catch (error) {
    console.error("Erro detalhado no fluxo de assinatura de boleto:", error.message);
    res.status(500).json({ success: false, error: 'Falha no processo de assinatura.', details: error.message });
  }
}
