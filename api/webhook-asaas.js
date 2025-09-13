import { createClient } from '@supabase/supabase-js';

const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const supabaseUrl = 'https://qgezhliwujahjhisfqti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZXpobGl3dWphaGpoaXNmcXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwMzEyMiwiZXhwIjoyMDczMzc5MTIyfQ.KPTVGJFnnU2yHo9XebFZyXBPVYKJFVb_DgC47Ges3DI';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res ) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;
    const event = notification.event;
    const payment = notification.payment;
    console.log(`🎉 WEBHOOK SUPABASE: Evento ${event} para pagamento ${payment?.id}`);

    // --- LÓGICA DE DELETE ---
    if (event === 'PAYMENT_DELETED') {
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id_pagamento', payment.id);

      if (error) {
        console.error('Erro ao deletar no Supabase:', error);
        throw error; // Joga o erro para ser pego pelo catch
      }
      console.log(`Pagamento ${payment.id} deletado do Supabase.`);
      return res.status(200).json({ message: 'Deleção processada.' });
    }

    // --- LÓGICA DE INSERT OU UPDATE ---
    
    // Busca os dados completos do pagamento e cliente no Asaas
    const fullPaymentData = await getPaymentData(payment.id);
    const customerData = await getCustomerData(fullPaymentData.customer);
    
    // Formata os dados para o formato da nossa tabela 'vendas'
    const dadosVenda = formatDataForSupabase(fullPaymentData, customerData);

    // Verifica se a venda já existe no nosso banco de dados
    const { data: vendaExistente, error: selectError } = await supabase
      .from('vendas')
      .select('id')
      .eq('id_pagamento', payment.id)
      .maybeSingle(); // Retorna um objeto ou null, sem dar erro se não achar

    if (selectError) {
      console.error('Erro ao verificar venda existente:', selectError);
      throw selectError;
    }

    // Se a venda já existe, ATUALIZA. Senão, INSERE.
    if (vendaExistente) {
      // --- LÓGICA DE UPDATE ---
      const { data, error } = await supabase
        .from('vendas')
        .update(dadosVenda)
        .eq('id_pagamento', payment.id);
      
      if (error) {
        console.error('Erro ao ATUALIZAR no Supabase:', error);
        throw error;
      }
      console.log(`Venda ${payment.id} atualizada no Supabase.`);

    } else {
      // --- LÓGICA DE INSERT ---
      const { data, error } = await supabase
        .from('vendas')
        .insert([dadosVenda]);

      if (error) {
        console.error('Erro ao INSERIR no Supabase:', error);
        throw error;
      }
      console.log(`Venda ${payment.id} inserida no Supabase.`);
    }

    res.status(200).json({ message: 'Notificação processada com Supabase.' });

  } catch (error) {
    console.error("Erro GERAL ao processar o webhook:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}

// --- Funções Auxiliares ---

async function getPaymentData(paymentId) {
  const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  return response.json();
}

async function getCustomerData(customerId) {
  const response = await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  return response.json();
}

function formatDataForSupabase(payment, customerData) {
  let dataPagamentoFinal = null; // No banco, usamos null para "pendente"
  if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
    dataPagamentoFinal = payment.paymentDate || new Date().toISOString();
  }

  return {
    id_pagamento: payment.id,
    // id_assinatura: payment.subscription || null, // Nossa tabela não tem essa coluna, então removemos
    valor: payment.value,
    id_parceiro: payment.externalReference || null, // Usa null se não houver parceiro
    status_pagamento: payment.status,
    nome_cliente: customerData.name,
    cpf_cliente: customerData.cpfCnpj,
    email_cliente: customerData.email,
    telefone_cliente: customerData.mobilePhone,
    nome_plano: payment.description,
    data_vencimento: payment.dueDate,
    forma_pagamento: payment.billingType,
    data_pagamento: dataPagamentoFinal
  };
}
