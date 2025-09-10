// /api/pagar-com-cartao.js - VERSÃO FINAL COM COBRANÇA INSTANTÂNEA

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

    // --- Lógica do Cliente (Busca ou Cria) ---
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cliente.cpf.replace(/\D/g, '')}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const searchResult = await searchCustomerResponse.json();
    let customerId;

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const newCustomerPayload = {
        name: cliente.nomeCompleto,
        cpfCnpj: cliente.cpf.replace(/\D/g, ''),
        email: cliente.email,
        mobilePhone: cliente.telefone.replace(/\D/g, '')
      };
      const newCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify(newCustomerPayload)
      });
      const newCustomer = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) throw new Error(`Erro ao criar cliente: ${JSON.stringify(newCustomer.errors)}`);
      customerId = newCustomer.id;
    }

    // --- Lógica de Pagamento ---

    if (plano.tipo === 'anual') {
      // Planos anuais já são pagamentos únicos parcelados, então a cobrança é instantânea.
      // Esta lógica já está correta.
      const precoNumerico = parseFloat(plano.preco.replace(',', '.'));
      const payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        installmentCount: 12,
        totalValue: precoNumerico * 12,
        description: `Plano: ${plano.nome} (Anual - 12x)`,
        externalReference: referenciaParceiro,
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf.replace(/\D/g, ''), postalCode: cliente.postalCode, addressNumber: cliente.addressNumber, phone: cliente.telefone.replace(/\D/g, '') },
      };
      
      const response = await fetch(`${ASAAS_API_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Falha na transação anual.');
      
      return res.status(200).json({ success: true, status: result.status, paymentId: result.id });

    } else {
      // --- LÓGICA PARA PLANO MENSAL COM COBRANÇA INSTANTÂNEA ---

      // 1. Cobre a primeira mensalidade como um pagamento avulso
      const firstPaymentPayload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        value: parseFloat(plano.preco.replace(',', '.')),
        description: `Primeira parcela - Plano: ${plano.nome}`,
        externalReference: referenciaParceiro, // Rastreia a primeira venda
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf.replace(/\D/g, ''), postalCode: cliente.postalCode || '00000-000', addressNumber: cliente.addressNumber || 'S/N', phone: cliente.telefone.replace(/\D/g, '') },
      };

      const firstPaymentResponse = await fetch(`${ASAAS_API_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(firstPaymentPayload) });
      const firstPaymentResult = await firstPaymentResponse.json();

      if (!firstPaymentResponse.ok || firstPaymentResult.status === 'FAILED') {
        throw new Error(firstPaymentResult.errors?.[0]?.description || 'Falha na cobrança da primeira parcela.');
      }

      // 2. Se a primeira cobrança foi bem-sucedida, crie a assinatura para o futuro
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      const subscriptionPayload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: parseFloat(plano.preco.replace(',', '.')),
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura Mensal do Plano: ${plano.nome}`,
        externalReference: referenciaParceiro, // Rastreia a assinatura também
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf.replace(/\D/g, ''), postalCode: cliente.postalCode || '00000-000', addressNumber: cliente.addressNumber || 'S/N', phone: cliente.telefone.replace(/\D/g, '') },
      };
      
      // Não precisamos esperar a resposta da criação da assinatura, podemos fazer isso em "fogo e esqueça"
      // para dar uma resposta mais rápida ao cliente.
      fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });

      // Retorna o sucesso baseado na primeira cobrança, que é o que importa para o cliente.
      return res.status(200).json({ success: true, status: firstPaymentResult.status, paymentId: firstPaymentResult.id });
    }

  } catch (error) {
    console.error("Erro detalhado ao processar:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar transação.', details: error.message });
  }
}
