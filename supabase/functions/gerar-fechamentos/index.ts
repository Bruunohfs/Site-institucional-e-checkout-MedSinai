// supabase/functions/gerar-fechamentos/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Venda {
  id_parceiro: string;
  valor: number;
}

Deno.serve(async (req ) => {
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
    
    const primeiroDiaMesPassado = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1).toISOString();
    const ultimoDiaMesPassado = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    
    // =================================================================
    // ==> CORREÇÃO DEFINITIVA: Duas queries separadas para clareza e precisão <==
    // =================================================================

    // Query 1: Busca vendas NÃO PARCELADAS pagas no mês anterior
    const { data: vendasNaoParceladas, error: error1 } = await supabaseAdmin
      .from('vendas')
      .select('id_parceiro, valor')
      .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
      .not('nome_plano', 'like', '%12x%') // Garante que não é parcelado
      .gte('data_pagamento', primeiroDiaMesPassado)
      .lte('data_pagamento', ultimoDiaMesPassado);

    if (error1) throw new Error(`Erro ao buscar vendas não parceladas: ${error1.message}`);

    // Query 2: Busca vendas PARCELADAS com vencimento no mês anterior
    const { data: vendasParceladas, error: error2 } = await supabaseAdmin
      .from('vendas')
      .select('id_parceiro, valor')
      .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
      .like('nome_plano', '%12x%') // Garante que é parcelado
      .gte('data_vencimento', primeiroDiaMesPassado)
      .lte('data_vencimento', ultimoDiaMesPassado);

    if (error2) throw new Error(`Erro ao buscar vendas parceladas: ${error2.message}`);

    // 3. Junta os resultados das duas queries
    const vendas = [...(vendasNaoParceladas || []), ...(vendasParceladas || [])];

    if (vendas.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma comissão encontrada no mês anterior para gerar fechamentos.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Lógica de Cálculo (sem alterações) ---
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
    console.error('Erro na Edge Function "gerar-fechamentos":', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
