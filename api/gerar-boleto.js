// /api/gerar-boleto.js - VERSÃO FINAL COM ASSINATURAS

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

    // --- Lógica do Cliente (sem alterações) ---
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cliente.cpf}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const searchResult = await searchCustomerResponse.json();
    let customerId;

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      // ... código para criar cliente ...
      const newCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify({
          name: cliente.nomeCompleto,
          cpfCnpj: cliente.cpf,
          email: cliente.email,
          mobilePhone: cliente.telefone,
        }),
      });
      const newCustomer = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) throw new Error(JSON.stringify(newCustomer.errors));
      customerId = newCustomer.id;
    }

    // --- LÓGICA DA ASSINATURA ---
    const payload = {
      customer: customerId,
      billingType: 'BOLETO', // A forma de pagamento da assinatura
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: new Date().toISOString().split('T')[0], // A primeira cobrança é hoje
      cycle: 'MONTHLY',
      description: `Assinatura Mensal do Plano: ${plano.nome}`,
    };

    const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      const errorMessage = result.errors?.[0]?.description || 'Falha ao criar assinatura.';
      throw new Error(errorMessage);
    }

    // A API de assinatura retorna os dados da primeira cobrança.
    // Vamos pegar a URL do boleto dessa primeira cobrança.
    const primeiroBoletoUrl = result.payments?.[0]?.bankSlipUrl;

    if (!primeiroBoletoUrl) {
      throw new Error("Assinatura criada, mas não foi possível obter a URL do primeiro boleto.");
    }

    res.status(200).json({
      success: true,
      boletoUrl: primeiroBoletoUrl, // Retornamos para o front-end
      cobrancaId: result.payments?.[0]?.id
    });

  } catch (error) {
    console.error("Erro detalhado ao gerar assinatura de boleto:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao gerar assinatura.', details: error.message });
  }
}
