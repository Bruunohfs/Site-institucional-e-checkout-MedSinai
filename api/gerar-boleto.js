// /api/gerar-boleto.js - VERSÃO FINAL E SIMPLIFICADA

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
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // Prazo de 2 dias para o primeiro pagamento

    const subscriptionPayload = {
      customer: customerId,
      billingType: 'BOLETO',
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: dueDate.toISOString().split('T')[0],
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

    // ✨--- A MUDANÇA CRÍTICA ---✨
    // Vamos confiar que a resposta da criação JÁ CONTÉM os dados do primeiro pagamento.
    const primeiroPagamento = subscriptionResult.payments?.[0];
    const primeiroBoletoUrl = primeiroPagamento?.bankSlipUrl;

    if (!primeiroBoletoUrl) {
      // Se não veio, o erro é imediato.
      console.error("Resposta da Asaas não continha os dados do primeiro boleto:", subscriptionResult);
      throw new Error("Assinatura criada, mas não foi possível obter a URL do primeiro boleto.");
    }

    res.status(200).json({
      success: true,
      boletoUrl: primeiroBoletoUrl,
      cobrancaId: primeiroPagamento.id
    });

  } catch (error) {
    console.error("Erro detalhado ao gerar assinatura de boleto:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao gerar assinatura.', details: error.message });
  }
}
