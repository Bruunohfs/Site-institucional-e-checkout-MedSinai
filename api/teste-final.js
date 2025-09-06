// /api/teste-final.js - Versão que CRIA e depois LÊ a cobrança

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
    // --- PASSO 1: DESCOBRIR O ID DO CLIENTE ---
    const cpfParaBuscar = '42397392844';
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cpfParaBuscar}`, { headers: { 'access_token': ASAAS_API_KEY } });
    const searchResult = await searchCustomerResponse.json();
    if (!searchResult.data || searchResult.data.length === 0) { throw new Error(`Cliente com CPF ${cpfParaBuscar} não encontrado.`); }
    const customerId = searchResult.data[0].id;

    // --- PASSO 2: CRIAR A COBRANÇA DE TESTE ---
    const payload = {
      customer: customerId,
      billingType: 'BOLETO',
      dueDate: new Date().toISOString().split('T')[0],
      value: 6.00, // Mudei para 6.00 para ser uma nova cobrança
      description: "Teste de Leitura da API",
      observations: "Leitura via API para confirmar o salvamento."
    };

    const createResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(payload),
    });
    const createResult = await createResponse.json();
    if (!createResponse.ok) { throw new Error(`Erro ao criar: ${JSON.stringify(createResult)}`); }
    
    const newPaymentId = createResult.id;
    console.log(`Cobrança criada com ID: ${newPaymentId}`);

    // --- PASSO 3: LER OS DADOS DA COBRANÇA RECÉM-CRIADA ---
    const readResponse = await fetch(`${ASAAS_API_URL}/payments/${newPaymentId}`, {
      method: 'GET',
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const readResult = await readResponse.json();

    // --- PASSO 4: ENVIAR O RESULTADO DA LEITURA DE VOLTA ---
    res.status(200).json({
      success: true,
      message: "Cobrança criada e lida. Verifique o resultado abaixo.",
      dadosSalvosNaAsaas: readResult // AQUI ESTÁ A PROVA
    });

  } catch (error) {
    console.error("Erro no teste final v3:", error.message);
    res.status(500).json({ success: false, error: 'Falha no teste v3.', details: error.message });
  }
}
