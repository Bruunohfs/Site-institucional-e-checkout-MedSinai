// DENTRO DE: api/pagar-com-cartao.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

  if (!ASAAS_API_KEY) {
    return res.status(500).json({ success: false, error: 'Configuração interna do servidor incompleta.' });
  }

  try {
    // 1. Recebemos os dados do cliente, do plano E o token do cartão
    const { cliente, plano, creditCardToken } = req.body;

    if (!creditCardToken) {
      throw new Error('Token do cartão de crédito não foi fornecido.');
    }

    // 2. Lógica para buscar ou criar o cliente (a mesma que já conhecemos)
    let customerId;
    const searchResponse = await fetch(`https://api.asaas.com/v3/customers?cpfCnpj=${cliente.cpf}`, {
      method: 'GET',
      headers: { 'access_token': ASAAS_API_KEY }
    } );
    const searchResult = await searchResponse.json();

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const customerData = { name: cliente.nomeCompleto, cpfCnpj: cliente.cpf, email: cliente.email, mobilePhone: cliente.telefone };
      const createCustomerResponse = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData )
      });
      const newCustomer = await createCustomerResponse.json();
      customerId = newCustomer.id;
    }

    if (!customerId) {
      throw new Error('Não foi possível obter ou criar o cliente no Asaas.');
    }

    // 3. A MÁGICA: Criar a cobrança usando o TOKEN do cartão
    const dadosCobranca = {
      customer: customerId,
      billingType: 'CREDIT_CARD', // Mágica 1
      dueDate: new Date().toISOString().split('T')[0],
      value: parseFloat(plano.preco.replace(',', '.')),
      description: `Assinatura do Plano (Cartão): ${plano.nome}`,
      externalReference: `CARD_${plano.nome.replace(/ /g, '_').toUpperCase()}_${cliente.cpf}`,
      creditCardToken: creditCardToken, // Mágica 2: Usamos o token seguro
    };

    const createPaymentResponse = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosCobranca )
    });

    const paymentResult = await createPaymentResponse.json();

    // 4. Tratamento de Sucesso ou Falha
    if (!createPaymentResponse.ok || paymentResult.status === 'PAYMENT_REFUSED') {
      console.error("Pagamento com cartão recusado ou falhou:", paymentResult);
      // A API do Asaas retorna erros dentro de um array 'errors'
      const errorReason = paymentResult.errors?.[0]?.description || 'Pagamento recusado pela operadora.';
      throw new Error(errorReason);
    }

    // 5. Enviar a resposta de SUCESSO para o front-end
    res.status(200).json({
      success: true,
      status: paymentResult.status, // Ex: CONFIRMED, RECEIVED, etc.
      cobrancaId: paymentResult.id
    });

  } catch (error) {
    console.error("Erro detalhado no bloco catch (Cartão):", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar pagamento com cartão.', details: error.message });
  }
}
