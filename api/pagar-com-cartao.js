// /api/pagar-com-cartao.js - VERSÃO CORRIGIDA E FINAL

const ASAAS_API_URL = process.env.ASAAS_API_URL;

export default async function handler(req, res) {
  // Log para depuração, mostrando o que o backend recebeu do frontend
  console.log("BACKEND RECEBEU:", JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
  if (!ASAAS_API_KEY || !ASAAS_API_URL) {
    console.error("Asaas API Key ou URL não configurada.");
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
      if (!newCustomerResponse.ok) {
        throw new Error(`Erro ao criar cliente: ${JSON.stringify(newCustomer.errors)}`);
      }
      customerId = newCustomer.id;
    }

    // --- Lógica de Pagamento ---

    if (plano.tipo === 'anual') {
      // --- LÓGICA PARA PLANO ANUAL (PAGAMENTO ÚNICO PARCELADO) ---
      const precoNumerico = parseFloat(plano.preco.replace(',', '.'));
      const payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        installmentCount: 12,
        totalValue: precoNumerico * 12,
        description: `Assinatura do Plano Anual: ${plano.nome} (12x)`,
        externalReference: referenciaParceiro, // ✨ USANDO O CAMPO CORRETO ✨
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/\s/g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf.replace(/\D/g, ''), postalCode: cliente.postalCode, addressNumber: cliente.addressNumber, phone: cliente.telefone.replace(/\D/g, '') },
      };
      
      const response = await fetch(`${ASAAS_API_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.description || 'Falha na transação anual.');
      
      res.status(200).json({ success: true, status: result.status, paymentId: result.id });

    } else {
      // --- LÓGICA PARA PLANO MENSAL (ASSINATURA RECORRENTE) ---
      // 1. Cria a assinatura SEM a referência externa
      const subscriptionPayload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: parseFloat(plano.preco.replace(',', '.')),
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura Mensal do Plano: ${plano.nome}`,
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/\s/g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo: { name: cliente.nomeCompleto, email: cliente.email, cpfCnpj: cliente.cpf.replace(/\D/g, ''), postalCode: cliente.postalCode || '00000-000', addressNumber: cliente.addressNumber || 'S/N', phone: cliente.telefone.replace(/\D/g, '') },
      };
      
      const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });
      const result = await subscriptionResponse.json();
      if (!subscriptionResponse.ok) throw new Error(result.errors?.[0]?.description || 'Falha na criação da assinatura.');

      // ✨ PASSO 2: ATUALIZA a assinatura recém-criada para adicionar a referência ✨
      await fetch(`${ASAAS_API_URL}/subscriptions/${result.id}`, {
          method: 'POST', // O método de update também é POST
          headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
          body: JSON.stringify({ externalReference: referenciaParceiro }) // Usando o campo correto
      });

      res.status(200).json({ success: true, status: result.status, subscriptionId: result.id });
    }

  } catch (error) {
    console.error("Erro detalhado ao processar:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar transação.', details: error.message });
  }
}
