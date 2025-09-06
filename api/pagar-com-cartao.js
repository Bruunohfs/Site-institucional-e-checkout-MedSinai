// /api/pagar-com-cartao.js - VERSÃO CORRIGIDA

const ASAAS_API_URL = process.env.ASAAS_API_URL;

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
    const { plano, cliente, referenciaParceiro } = req.body;

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

    if (plano.tipo === 'anual') {
      // --- LÓGICA PARA PLANO ANUAL (PAGAMENTO PARCELADO) ---
      // Esta parte já estava correta, pois cria um /payment direto.
      const endpoint = `${ASAAS_API_URL}/payments`;
      const precoNumerico = parseFloat(plano.preco.replace(',', '.'));
      const payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        installmentCount: 12,
        totalValue: precoNumerico * 12,
        description: `Assinatura do Plano Anual: ${plano.nome} (12x)`,
        observations: `Venda originada pelo parceiro: ${referenciaParceiro}`,
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf, postalCode: cliente.postalCode, addressNumber: cliente.addressNumber, phone: cliente.telefone.replace(/\D/g, '') },
      };
      
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || result.error || 'Falha na transação.');
      res.status(200).json({ success: true, status: result.status });

    } else {
      // --- LÓGICA PARA PLANO MENSAL (ASSINATURA RECORRENTE) - CORRIGIDA ---
      // 1. Cria a assinatura sem a observação
      const subscriptionPayload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: parseFloat(plano.preco.replace(',', '.')),
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura Mensal do Plano: ${plano.nome}`,
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf, postalCode: cliente.postalCode || '00000-000', addressNumber: cliente.addressNumber || 'S/N', phone: cliente.telefone.replace(/\D/g, '') },
      };
      
      const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });
      const result = await subscriptionResponse.json();
      if (!subscriptionResponse.ok) throw new Error(result.errors?.[0]?.description || result.error || 'Falha na transação.');

      // 2. ATUALIZA a assinatura recém-criada para adicionar a observação
      await fetch(`${ASAAS_API_URL}/subscriptions/${result.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
          body: JSON.stringify({ observations: `Venda originada pelo parceiro: ${referenciaParceiro}` })
      });

      res.status(200).json({ success: true, status: result.status });
    }

  } catch (error) {
    console.error("Erro detalhado ao processar:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar transação.', details: error.message });
  }
}
