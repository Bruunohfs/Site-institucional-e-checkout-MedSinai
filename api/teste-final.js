// /api/teste-final.js - Versão que descobre o ID do cliente

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
    // --- PASSO 1: DESCOBRIR O ID DO CLIENTE PELO CPF ---
    const cpfParaBuscar = '42397392844'; // CPF do cliente "Bruno Henrique"
    const searchCustomerResponse = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cpfParaBuscar}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const searchResult = await searchCustomerResponse.json();

    if (!searchResult.data || searchResult.data.length === 0) {
      throw new Error(`Cliente com CPF ${cpfParaBuscar} não encontrado.`);
    }
    const customerId = searchResult.data[0].id;
    console.log(`ID do cliente encontrado: ${customerId}`); // Vamos ver o ID no log!

    // --- PASSO 2: CRIAR A COBRANÇA DE TESTE ---
    const payload = {
      customer: customerId,
      billingType: 'BOLETO',
      dueDate: new Date().toISOString().split('T')[0],
      value: 5.00, // Valor mínimo para boleto
      description: "Teste de Sanidade da API v2",
      observations: "Se isso aparecer, a API funciona com cobranças avulsas."
    };

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }

    res.status(200).json({ success: true, message: "Cobrança de teste v2 criada. Verifique o painel.", data: result });

  } catch (error) {
    console.error("Erro no teste final v2:", error.message);
    res.status(500).json({ success: false, error: 'Falha no teste v2.', details: error.message });
  }
}
