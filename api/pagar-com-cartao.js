// api/pagar-com-cartao.js - VERSÃO FINAL E CORRETA

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
  if (!ASAAS_API_KEY) {
    return res.status(500).json({ success: false, error: 'Configuração interna do servidor incompleta.' });
  }

  try {
    const { plano, cliente } = req.body;

    // 1. Encontrar ou Criar o Cliente
    const searchCustomerResponse = await fetch(`https://api.asaas.com/v3/customers?cpfCnpj=${cliente.cpf}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    } );
    const searchResult = await searchCustomerResponse.json();
    let customerId;

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const newCustomerResponse = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify({
          name: cliente.nomeCompleto,
          cpfCnpj: cliente.cpf,
          email: cliente.email,
          mobilePhone: cliente.telefone,
        } ),
      });
      const newCustomer = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) throw new Error(JSON.stringify(newCustomer.errors));
      customerId = newCustomer.id;
    }

    // 2. Montar o Payload de Pagamento Completo
let dadosCobranca;

if (plano.tipo === 'anual') {
  // Lógica para cobrança parcelada
  const precoNumerico = parseFloat(plano.preco.replace(',', '.'));
  dadosCobranca = {
    customer: customerId,
    billingType: 'CREDIT_CARD',
    dueDate: new Date().toISOString().split('T')[0],
    // --- CAMPOS DE PARCELAMENTO ---
    installmentCount: 12,
    totalValue: precoNumerico * 12, // O valor total é o preço da mensalidade x 12
    // -----------------------------
    description: `Assinatura do Plano Anual: ${plano.nome} (12x)`,
    creditCard: {
      holderName: cliente.cardName,
      number: cliente.cardNumber.replace(/ /g, ''),
      expiryMonth: cliente.expiryDate.split('/')[0],
      expiryYear: `20${cliente.expiryDate.split('/')[1]}`,
      ccv: cliente.cvv,
    },
    creditCardHolderInfo: {
      name: cliente.nomeCompleto,
      email: cliente.email,
      cpfCnpj: cliente.cpf,
      postalCode: '00000-000',
      addressNumber: 'S/N',
      phone: cliente.telefone.replace(/\D/g, ''),
    },
  };
} else {
  // Lógica para cobrança única (mensal)
  dadosCobranca = {
    customer: customerId,
    billingType: 'CREDIT_CARD',
    dueDate: new Date().toISOString().split('T')[0],
    // --- CAMPO DE VALOR ÚNICO ---
    value: parseFloat(plano.preco.replace(',', '.')),
    // -----------------------------
    description: `Assinatura do Plano Mensal: ${plano.nome}`,
    creditCard: {
      holderName: cliente.cardName,
      number: cliente.cardNumber.replace(/ /g, ''),
      expiryMonth: cliente.expiryDate.split('/')[0],
      expiryYear: `20${cliente.expiryDate.split('/')[1]}`,
      ccv: cliente.cvv,
    },
    creditCardHolderInfo: {
      name: cliente.nomeCompleto,
      email: cliente.email,
      cpfCnpj: cliente.cpf,
      postalCode: '00000-000',
      addressNumber: 'S/N',
      phone: cliente.telefone.replace(/\D/g, ''),
    },
  };
}

    // 3. Enviar a Cobrança para o Asaas
    const paymentResponse = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(dadosCobranca ),
    });

    const paymentResult = await paymentResponse.json();
    if (!paymentResponse.ok) {
      throw new Error(paymentResult.errors?.[0]?.description || 'Falha na transação.');
    }

    res.status(200).json({ success: true, status: paymentResult.status });

  } catch (error) {
    console.error("Erro detalhado ao pagar com cartão:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar pagamento com cartão.', details: error.message });
  }
}
