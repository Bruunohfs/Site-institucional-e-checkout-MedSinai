// api/gerar-boleto.js - VERSÃO FINAL COM NODE-FETCH

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

  if (!ASAAS_API_KEY) {
    console.error("ERRO CRÍTICO: Chave de API do Asaas (ASAAS_API_KEY) não encontrada.");
    return res.status(500).json({ success: false, error: 'Configuração interna do servidor incompleta.' });
  }

  try {
    const { cliente, plano } = req.body;
    let customerId;

    // Chamada 1: Buscar cliente com fetch
    const searchResponse = await fetch(
      `https://api.asaas.com/v3/customers?cpfCnpj=${cliente.cpf}`,
      {
        method: 'GET',
        headers: { 'access_token': ASAAS_API_KEY }
      }
     );
    const searchResult = await searchResponse.json();

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const customerData = {
        name: cliente.nomeCompleto,
        cpfCnpj: cliente.cpf,
        email: cliente.email,
        mobilePhone: cliente.telefone,
      };
      // Chamada 2: Criar cliente com fetch
      const createCustomerResponse = await fetch(
        'https://api.asaas.com/v3/customers',
        {
          method: 'POST',
          headers: {
            'access_token': ASAAS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerData )
        }
      );
      const newCustomer = await createCustomerResponse.json();
      customerId = newCustomer.id;
    }

    if (!customerId) {
      throw new Error('Não foi possível obter ou criar o cliente no Asaas.');
    }

    const dadosCobranca = {
      customer: customerId,
      billingType: 'BOLETO',
      dueDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: parseFloat(plano.preco.replace(',', '.')),
      description: `Assinatura do Plano: ${plano.nome}`,
      externalReference: `PLANO_${plano.nome.replace(/ /g, '_').toUpperCase()}_${cliente.cpf}`,
    };

    // Chamada 3: Criar cobrança com fetch
    const createPaymentResponse = await fetch(
      'https://api.asaas.com/v3/payments',
      {
        method: 'POST',
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosCobranca )
      }
    );
    const paymentResponse = await createPaymentResponse.json();

    // Tratamento de erro específico do Asaas após a chamada
    if (!createPaymentResponse.ok) {
        console.error("Erro retornado pela API do Asaas:", paymentResponse);
        throw new Error(JSON.stringify(paymentResponse.errors || { message: 'Erro desconhecido do Asaas' }));
    }

    res.status(200).json({
      success: true,
      boletoUrl: paymentResponse.bankSlipUrl,
      cobrancaId: paymentResponse.id
    });

  } catch (error) {
    // O erro agora será mais informativo
    console.error("Erro detalhado no bloco catch:", error.message);
    res.status(500).json({ success: false, error: 'Falha ao gerar cobrança.', details: error.message });
  }
}
