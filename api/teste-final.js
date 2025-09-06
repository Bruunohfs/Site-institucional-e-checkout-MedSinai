// /api/teste-final.js

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
    // Usaremos um ID de cliente que já existe para simplificar
    const customerId = 'cus_000005839509'; // Peguei um ID de cliente dos seus prints

    const payload = {
      customer: customerId,
      billingType: 'BOLETO',
      dueDate: new Date().toISOString().split('T')[0],
      value: 1.00, // Um valor simbólico
      description: "Teste de Sanidade da API",
      observations: "Se isso aparecer, o problema é no fluxo de assinaturas."
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

    res.status(200).json({ success: true, message: "Cobrança de teste criada. Verifique o painel.", data: result });

  } catch (error) {
    console.error("Erro no teste final:", error.message);
    res.status(500).json({ success: false, error: 'Falha no teste.', details: error.message });
  }
}
