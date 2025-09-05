// /api/gerar-pix.js - VERSÃO CORRIGIDA

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
    const { cliente, plano } = req.body;

    // --- Lógica do Cliente (AGORA CORRETA E COMPLETA) ---
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cliente.cpf}`, { headers: { 'access_token': ASAAS_API_KEY } });
    const searchResult = await searchCustomerResponse.json();
    let customerId;
    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      // ✨ BLOCO RESTAURADO ✨
      const newCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, 
        body: JSON.stringify({ 
          name: cliente.nomeCompleto, 
          cpfCnpj: cliente.cpf, 
          email: cliente.email, 
          mobilePhone: cliente.telefone 
        }) 
      });
      const newCustomer = await newCustomerResponse.json();
      if (!newCustomerResponse.ok) throw new Error(JSON.stringify(newCustomer.errors));
      customerId = newCustomer.id;
    }

    // ... (o resto do código para criar assinatura e pagamento permanece o mesmo) ...
    const subscriptionPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: parseFloat(plano.preco.replace(',', '.')),
      nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura Mensal do Plano: ${plano.nome}`,
    };
    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(subscriptionPayload) });
    const subscriptionResult = await subscriptionResponse.json();
    if (!subscriptionResponse.ok) { throw new Error(subscriptionResult.errors?.[0]?.description || 'Falha ao criar a assinatura.'); }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      dueDate: dueDate.toISOString().split('T')[0],
      value: parseFloat(plano.preco.replace(',', '.')),
      description: `Primeira cobrança do Plano: ${plano.nome}`,
      subscription: subscriptionResult.id,
    };
    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY }, body: JSON.stringify(paymentPayload) });
    const paymentResult = await paymentResponse.json();
    if (!paymentResponse.ok) { throw new Error(paymentResult.errors?.[0]?.description || 'Falha ao gerar a primeira cobrança.'); }

    const qrCodeResponse = await fetch(`${ASAAS_API_URL}/payments/${paymentResult.id}/pixQrCode`, { method: 'GET', headers: { 'access_token': ASAAS_API_KEY } });
    const qrCodeData = await qrCodeResponse.json();
    if (!qrCodeResponse.ok) { throw new Error("Não foi possível gerar o QR Code para o pagamento inicial."); }

    res.status(200).json({ success: true, payload: qrCodeData.payload, encodedImage: qrCodeData.encodedImage, cobrancaId: paymentResult.id });

  } catch (error) {
    console.error("Erro detalhado no fluxo de assinatura de Pix:", error.message);
    res.status(500).json({ success: false, error: 'Falha no processo de assinatura.', details: error.message });
  }
}
