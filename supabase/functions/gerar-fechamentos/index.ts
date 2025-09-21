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

    // =================================================================
    // ==> ALTERAÇÃO 1: Ler o mês do corpo da requisição <==
    // =================================================================
    const body = await req.json();
    const mesSelecionado = body?.mes; // Espera o formato 'AAAA-MM'

    if (!mesSelecionado || !/^\d{4}-\d{2}$/.test(mesSelecionado)) {
      throw new Error("Mês para geração do fechamento não foi especificado ou está em formato inválido. Esperado 'AAAA-MM'.");
    }

    // =================================================================
    // ==> ALTERAÇÃO 2: Definir o período com base no mês recebido <==
    // =================================================================
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    // Usar UTC para consistência e evitar problemas de fuso horário
    const primeiroDiaMesSelecionado = new Date(Date.UTC(ano, mes - 1, 1)).toISOString();
    const ultimoDiaMesSelecionado = new Date(Date.UTC(ano, mes, 0, 23, 59, 59, 999)).toISOString();
    const mesReferenciaParaBanco = primeiroDiaMesSelecionado; // Usar o primeiro dia do mês como referência

    // Query 1: Busca vendas NÃO PARCELADAS pagas no mês selecionado
    const { data: vendasNaoParceladas, error: error1 } = await supabaseAdmin
      .from('vendas')
      .select('id_parceiro, valor')
      .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
      .not('nome_plano', 'ilike', '%12x%') // Usar 'ilike' para ser case-insensitive
      .gte('data_pagamento', primeiroDiaMesSelecionado)
      .lte('data_pagamento', ultimoDiaMesSelecionado);

    if (error1) throw new Error(`Erro ao buscar vendas não parceladas: ${error1.message}`);

    // Query 2: Busca vendas PARCELADAS com vencimento no mês selecionado
    const { data: vendasParceladas, error: error2 } = await supabaseAdmin
      .from('vendas')
      .select('id_parceiro, valor')
      .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
      .like('nome_plano', '%12x%')
      .gte('data_vencimento', primeiroDiaMesSelecionado)
      .lte('data_vencimento', ultimoDiaMesSelecionado);

    if (error2) throw new Error(`Erro ao buscar vendas parceladas: ${error2.message}`);

    const vendas = [...(vendasNaoParceladas || []), ...(vendasParceladas || [])];

    if (vendas.length === 0) {
      const nomeMes = new Date(mesSelecionado + '-02T12:00:00Z').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      return new Response(JSON.stringify({ message: `Nenhuma comissão encontrada em ${nomeMes} para gerar fechamentos.` }), {
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
      mes_referencia: mesReferenciaParaBanco, // Usa a referência do mês selecionado
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
