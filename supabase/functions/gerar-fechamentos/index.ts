// supabase/functions/gerar-fechamentos/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CABEÇALHOS DE CORS DIRETAMENTE AQUI - A SOLUÇÃO FUNCIONAL
// Melhoria: Em vez de '*', vamos usar a origem da requisição dinamicamente,
// mas com uma lista de permissão para segurança.
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.medsinai.com.br'
];

interface Venda {
  id_parceiro: string;
  status_pagamento: string;
  created_at: string;
  valor: number;
}

Deno.serve(async (req: Request ) => {
  const requestOrigin = req.headers.get('Origin');

  // Lógica de CORS diretamente aqui
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    // Se a origem estiver na lista, permita. Senão, não defina o cabeçalho.
    'Access-Control-Allow-Origin': allowedOrigins.includes(requestOrigin!) ? requestOrigin! : ''
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const hoje = new Date();
    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const mesReferencia = new Date(primeiroDiaMesAtual);
    mesReferencia.setMonth(mesReferencia.getMonth() - 1);

    const primeiroDiaMesPassado = mesReferencia.toISOString().slice(0, 10);
    
    const { data: vendas, error: vendasError } = await supabaseAdmin
      .from('vendas')
      .select('id_parceiro, status_pagamento, created_at, valor')
      .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
      .gte('created_at', primeiroDiaMesPassado)
      .lt('created_at', primeiroDiaMesAtual.toISOString());

    if (vendasError) throw vendasError;
    if (!vendas || vendas.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma venda paga encontrada no mês anterior para gerar fechamentos.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const TAXA_COMISSAO = 0.4;
    const comissoesPorParceiro = vendas.reduce((acc, venda: Venda) => {
      if (venda.id_parceiro) {
        acc[venda.id_parceiro] = (acc[venda.id_parceiro] || 0) + (venda.valor * TAXA_COMISSAO);
      }
      return acc;
    }, {} as Record<string, number>);

    const fechamentosParaInserir = Object.entries(comissoesPorParceiro).map(([idParceiro, comissao]) => ({
      id_parceiro: idParceiro,
      mes_referencia: primeiroDiaMesPassado,
      valor_comissao_bruta: comissao,
      status_pagamento: 'PENDENTE',
    }));

    if (fechamentosParaInserir.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum parceiro com comissão a ser gerada.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from('fechamentos')
      .upsert(fechamentosParaInserir, { onConflict: 'id_parceiro, mes_referencia' });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: `Fechamento gerado com sucesso para ${fechamentosParaInserir.length} parceiro(s).` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
