// api/gerar-boleto.js - VERSÃO CORRIGIDA

import axios from 'axios';

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

    // Chamada 1: Buscar cliente
    const { data: searchResult } = await axios.get(
      `https://api.asaas.com/v3/customers?cpfCnpj=${cliente.cpf}`,
      { headers: { Authorization: `Bearer ${ASAAS_API_KEY}` } }
    );

    if (searchResult.data && searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
    } else {
      const customerData = {
        name: cliente.nomeCompleto,
        cpfCnpj: cliente.cpf,
        email: cliente.email,
        mobilePhone: cliente.telefone,
      };
      // Chamada 2: Criar cliente
      const { data: newCustomer } = await axios.post(
        'https://api.asaas.com/v3/customers',
        customerData,
        { headers: { Authorization: `Bearer ${ASAAS_API_KEY}` } }
      );
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

    // Chamada 3: Criar cobrança
    const { data: paymentResponse } = await axios.post(
      'https://api.asaas.com/v3/payments',
      dadosCobranca,
      { headers: { Authorization: `Bearer ${ASAAS_API_KEY}` } }
    );

    res.status(200).json({
      success: true,
      boletoUrl: paymentResponse.bankSlipUrl,
      cobrancaId: paymentResponse.id
    });

  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("Erro detalhado ao gerar boleto no Asaas:", errorMessage);
    res.status(500).json({ success: false, error: 'Falha ao gerar cobrança.', details: errorMessage });
  }
}
