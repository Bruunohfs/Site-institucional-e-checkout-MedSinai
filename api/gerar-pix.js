
export default async function handler(req, res) {
  // 1. Validação inicial (igual ao boleto)
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

    // 2. Lógica para buscar ou criar o cliente (exatamente a mesma do boleto)
    const searchResponse = await fetch(
      `https://api.asaas.com/v3/customers?cpfCnpj=${cliente.cpf}`,
      { method: 'GET', headers: { 'access_token': ASAAS_API_KEY } }
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
      const createCustomerResponse = await fetch(
        'https://api.asaas.com/v3/customers',
        {
          method: 'POST',
          headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData )
        }
      );
      const newCustomer = await createCustomerResponse.json();
      customerId = newCustomer.id;
    }

    if (!customerId) {
      throw new Error('Não foi possível obter ou criar o cliente no Asaas.');
    }

    // 3. A ÚNICA MUDANÇA REAL: Criar a cobrança com billingType: 'PIX'
    const dadosCobranca = {
      customer: customerId,
      billingType: 'PIX', // AQUI ESTÁ A MÁGICA!
      dueDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Pix geralmente tem validade curta
      value: parseFloat(plano.preco.replace(',', '.')),
      description: `Assinatura do Plano (via Pix): ${plano.nome}`,
      externalReference: `PIX_${plano.nome.replace(/ /g, '_').toUpperCase()}_${cliente.cpf}`,
    };

    const createPaymentResponse = await fetch(
      'https://api.asaas.com/v3/payments',
      {
        method: 'POST',
        headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCobranca )
      }
    );
    const paymentResponse = await createPaymentResponse.json();

    if (!createPaymentResponse.ok) {
      console.error("Erro retornado pela API do Asaas (PIX):", paymentResponse);
      throw new Error(JSON.stringify(paymentResponse.errors || { message: 'Erro desconhecido do Asaas' }));
    }

    // 4. Buscar os dados do QR Code gerado
    const qrCodeResponse = await fetch(
      `https://api.asaas.com/v3/payments/${paymentResponse.id}/pixQrCode`,
      { method: 'GET', headers: { 'access_token': ASAAS_API_KEY } }
     );
    const qrCodeData = await qrCodeResponse.json();

    // 5. Enviar a resposta para o front-end
    res.status(200).json({
      success: true,
      payload: qrCodeData.payload, // O "Copia e Cola"
      encodedImage: qrCodeData.encodedImage, // A imagem do QR Code em base64
      cobrancaId: paymentResponse.id
    });

  } catch (error) {
    console.error("Erro detalhado no bloco catch (PIX):", error.message);
    res.status(500).json({ success: false, error: 'Falha ao gerar cobrança Pix.', details: error.message });
  }
}
