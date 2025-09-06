// /api/pagar-com-cartao.js - VERSÃO FINAL COM ASSINATURAS

// 1. LEIA A URL DA API DAS VARIÁVEIS DE AMBIENTE
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
    const { plano, cliente, ReferenciaParceiro } = req.body;

    // --- LÓGICA DO CLIENTE (sem alterações) ---
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cliente.cpf}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const searchResult = await searchCustomerResponse.json();
    let customerId;

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
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

    // --- ✨ A GRANDE MUDANÇA COMEÇA AQUI ✨ ---
    let endpoint;
    let payload;

    if (plano.tipo === 'anual') {
      // --- LÓGICA PARA PLANO ANUAL (PAGAMENTO PARCELADO) ---
      // O endpoint é de pagamentos, como já estava.
      endpoint = `${ASAAS_API_URL}/payments`;
      
      const precoNumerico = parseFloat(plano.preco.replace(',', '.'));
      payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        installmentCount: 12,
        totalValue: precoNumerico * 12,
        description: `Assinatura do Plano Anual: ${plano.nome} (12x)`,
        externalReference: ReferenciaParceiro,
        creditCard: { /* ... dados do cartão ... */ },
        creditCardHolderInfo: { /* ... dados do titular ... */ },
      };
      // Preenchendo os dados que foram omitidos para clareza
      payload.creditCard = {
        holderName: cliente.cardName,
        number: cliente.cardNumber.replace(/ /g, ''),
        expiryMonth: cliente.expiryDate.split('/')[0],
        expiryYear: `20${cliente.expiryDate.split('/')[1]}`,
        ccv: cliente.cvv,
      };
      payload.creditCardHolderInfo = {
        name: cliente.nomeCompleto,
        email: cliente.email,
        cpfCnpj: cliente.cpf,
        postalCode: cliente.postalCode,
        addressNumber: cliente.addressNumber,
        phone: cliente.telefone.replace(/\D/g, ''),
      };

    } else {
      // --- LÓGICA PARA PLANO MENSAL (ASSINATURA RECORRENTE) ---
      // ✨ O endpoint agora é de assinaturas!
      endpoint = `${ASAAS_API_URL}/subscriptions`;

      payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        // O valor da mensalidade
        value: parseFloat(plano.preco.replace(',', '.')),
        // A data da próxima cobrança (geralmente 1 mês a partir de hoje)
        nextDueDate: new Date().toISOString().split('T')[0],
        // O ciclo da cobrança
        cycle: 'MONTHLY',
        description: `Assinatura Mensal do Plano: ${plano.nome}`,
        creditCard: { /* ... dados do cartão ... */ },
        creditCardHolderInfo: { /* ... dados do titular ... */ },
      };
      // Preenchendo os dados que foram omitidos para clareza
      payload.creditCard = {
        holderName: cliente.cardName,
        number: cliente.cardNumber.replace(/ /g, ''),
        expiryMonth: cliente.expiryDate.split('/')[0],
        expiryYear: `20${cliente.expiryDate.split('/')[1]}`,
        ccv: cliente.cvv,
      };
      payload.creditCardHolderInfo = {
        name: cliente.nomeCompleto,
        email: cliente.email,
        cpfCnpj: cliente.cpf,
        // Para assinaturas, o endereço não é obrigatório, mas é bom ter
        postalCode: cliente.postalCode || '00000-000',
        addressNumber: cliente.addressNumber || 'S/N',
        phone: cliente.telefone.replace(/\D/g, ''),
      };
    }

    // --- Enviar a Cobrança ou Assinatura para o Asaas ---
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      // O erro pode vir em `result.errors` ou `result.error`
      const errorMessage = result.errors?.[0]?.description || result.error || 'Falha na transação.';
      throw new Error(errorMessage);
    }

    // A resposta da API de Assinatura é um pouco diferente da de Pagamento.
    // Vamos padronizar nossa resposta para o front-end.
    res.status(200).json({ success: true, status: result.status || 'ACTIVE' });

  } catch (error) {
    console.error("Erro detalhado ao processar:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar transação.', details: error.message });
  }
}
