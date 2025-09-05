// /api/gerar-boleto.js - COM CAPTURA DE ERRO DETALHADA

const ASAAS_API_URL = process.env.ASAAS_API_URL;

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
      billingType: 'BOLETO',
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura Mensal do Plano: ${plano.nome}`,
    };
    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });
    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      throw new Error(`Falha ao criar assinatura: ${errorText}`);
    }
    const subscriptionResult = await subscriptionResponse.json();

    // --- PASSO 2: CRIAR O PAGAMENTO AVULSO ---
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const paymentPayload = {
      customer: customerId,
      billingType: 'BOLETO',
      dueDate: dueDate.toISOString().split('T')[0],
      value: parseFloat(plano.preco.replace(',', '.')),
      description: `Primeira cobrança do Plano: ${plano.nome}`,
      subscription: subscriptionResult.id,
    };
    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(paymentPayload) });
    
    // ✨✨ A GRANDE MUDANÇA ESTÁ AQUI ✨✨
    if (!paymentResponse.ok) {
      // Se a resposta não for OK, leia o corpo como TEXTO para ver o erro real.
      const errorText = await paymentResponse.text();
      throw new Error(`Falha ao gerar a primeira cobrança: ${errorText}`);
    }
    const paymentResult = await paymentResponse.json();

    res.status(200).json({ success: true, boletoUrl: paymentResult.bankSlipUrl, cobrancaId: paymentResult.id });

  } catch (error) {
    console.error("Erro detalhado no fluxo de assinatura de boleto:", error.message);
    // Agora o 'details' terá a resposta completa da Asaas
    res.status(500).json({ success: false, error: 'Falha no processo de assinatura.', details: error.message });
  }
}
