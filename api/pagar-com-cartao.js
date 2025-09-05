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
    // O objeto 'cliente' aqui contém TODOS os dados do formulário (pessoais + cartão + endereço)
    const { plano, cliente } = req.body; 

    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cliente.cpf}`, { headers: { 'access_token': ASAAS_API_KEY } });
    const searchResult = await searchCustomerResponse.json();
    let customerId;

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const newCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
        body: JSON.stringify({ name: cliente.nomeCompleto, cpfCnpj: cliente.cpf, email: cliente.email, mobilePhone: cliente.telefone }),
      });
      const newCustomer = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) throw new Error(JSON.stringify(newCustomer.errors));
      customerId = newCustomer.id;
    }

    let dadosCobranca;
    
    // ✨✨ AQUI ESTÁ A CORREÇÃO ✨✨
    // Montamos o objeto de informações do titular do cartão
    const creditCardHolderInfo = {
      name: cliente.nomeCompleto,
      email: cliente.email,
      cpfCnpj: cliente.cpf,
      // Usamos os dados de endereço que vêm diretamente do corpo da requisição ('cliente')
      postalCode: cliente.postalCode, 
      addressNumber: cliente.addressNumber,
      // O campo 'address' não é obrigatório, mas podemos adicionar o logradouro se o tivermos no futuro.
      // O campo 'province' (bairro) também não é obrigatório.
      phone: cliente.telefone.replace(/\D/g, ''),
    };

    if (plano.tipo === 'anual') {
      const precoNumerico = parseFloat(plano.preco.replace(',', '.'));
      dadosCobranca = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        installmentCount: 12,
        totalValue: precoNumerico * 12,
        description: `Assinatura do Plano Anual: ${plano.nome} (12x)`,
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo,
      };
    } else {
      // Para manter a consistência, também enviamos o endereço para planos mensais, se disponível.
      dadosCobranca = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        dueDate: new Date().toISOString().split('T')[0],
        value: parseFloat(plano.preco.replace(',', '.')),
        description: `Assinatura do Plano Mensal: ${plano.nome}`,
        creditCard: { holderName: cliente.cardName, number: cliente.cardNumber.replace(/ /g, ''), expiryMonth: cliente.expiryDate.split('/')[0], expiryYear: `20${cliente.expiryDate.split('/')[1]}`, ccv: cliente.cvv },
        creditCardHolderInfo,
      };
    }

    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(dadosCobranca),
    });

    const paymentResult = await paymentResponse.json();
    if (!paymentResponse.ok) {
      // Pega a primeira mensagem de erro da lista, se existir.
      const errorMessage = paymentResult.errors?.[0]?.description || 'Falha na transação.';
      throw new Error(errorMessage);
    }
    res.status(200).json({ success: true, status: paymentResult.status });

  } catch (error) {
    console.error("Erro detalhado ao pagar com cartão:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao processar pagamento com cartão.', details: error.message });
  }
}
