import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const ASAAS_API_KEY = process.env.VITE_ASAAS_API_KEY;

  if (!ASAAS_API_KEY) {
    return res.status(500).json({ error: 'Chave de API do Asaas não configurada.' });
  }

  try {
    const { cliente, plano, } = req.body;
    let customerId;

    // --- PASSO 1: Buscar o cliente pelo CPF ---
    const { data: searchResult } = await axios.get(
      `https://api.asaas.com/v3/customers?cpfCnpj=${cliente.cpf}`,
      { headers: { 'access_token': ASAAS_API_KEY } }
     );

    if (searchResult.data && searchResult.data.length > 0) {
      // Se o cliente já existe, pegamos o ID dele
      customerId = searchResult.data[0].id;
    } else {
      // Se o cliente não existe, criamos um novo
      const { data: newCustomer } = await axios.post(
        'https://api.asaas.com/v3/customers',
        {
          name: cliente.nomeCompleto,
          cpfCnpj: cliente.cpf,
          email: cliente.email,
          mobilePhone: cliente.telefone,
        },
        { headers: { 'access_token': ASAAS_API_KEY } }
       );
      customerId = newCustomer.id;
    }

    // Se, por algum motivo, não conseguimos um ID de cliente, paramos aqui.
    if (!customerId) {
      throw new Error('Não foi possível obter ou criar o cliente no Asaas.');
    }

    // --- PASSO 2: Criar a cobrança usando o ID do cliente ---
    const dadosCobranca = {
      customer: customerId, // <--- AGORA USAMOS O ID CORRETO!
      billingType: 'BOLETO',
      dueDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: parseFloat(plano.preco.replace(',', '.')),
      description: `Assinatura do Plano: ${plano.nome}`,
      externalReference: `PLANO_${plano.nome.replace(/ /g, '_').toUpperCase()}_${cliente.cpf}`,
    };

    const { data: paymentResponse } = await axios.post(
      'https://api.asaas.com/v3/payments',
      dadosCobranca,
      { headers: { 'access_token': ASAAS_API_KEY } }
     );

    // --- PASSO 3: Enviar a resposta de sucesso ---
    res.status(200).json({
      success: true,
      boletoUrl: paymentResponse.bankSlipUrl,
      cobrancaId: paymentResponse.id
    });

  } catch (error) {
    console.error("Erro detalhado ao gerar boleto no Asaas:", error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, error: 'Falha ao gerar cobrança.' });
  }
}
