// supabase/functions/gerar-fechamentos/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Definição dos tipos para segurança e autocompletar
interface Venda {
  id_parceiro: string;
  status_pagamento: string;
  created_at: string;
  valor: number;
}

Deno.serve(async (req ) => {
  // Pré-validação para requisições OPTIONS (necessário para CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Criar um cliente Supabase que pode ser usado dentro da função
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Determinar o Mês de Referência (Mês Passado)
    const hoje = new Date();
    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const mesReferencia = new Date(primeiroDiaMesAtual);
    mesReferencia.setMonth(mesReferencia.getMonth() - 1); // Vai para o mês passado

    const primeiroDiaMesPassado = mesReferencia.toISOString().slice(0, 10); // ex: "2025-09-01"
    const ultimoDiaMesPassado = new Date(primeiroDiaMesAtual.getTime() - 1).toISOString(); // Pega o último milissegundo do mês passado

    console.log(`Gerando fechamento para o período de ${primeiroDiaMesPassado} até ${ultimoDiaMesPassado}`);

    // 3. Buscar todas as vendas PAGAS do mês passado
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

    // 4. Calcular a comissão total para cada parceiro
    const TAXA_COMISSAO = 0.4;
    const comissoesPorParceiro = vendas.reduce((acc, venda: Venda) => {
      if (venda.id_parceiro) {
        acc[venda.id_parceiro] = (acc[venda.id_parceiro] || 0) + (venda.valor * TAXA_COMISSAO);
      }
      return acc;
    }, {} as Record<string, number>);

    // 5. Preparar os dados para inserção na tabela 'fechamentos'
    const fechamentosParaInserir = Object.entries(comissoesPorParceiro).map(([idParceiro, comissao]) => ({
      id_parceiro: idParceiro,
      mes_referencia: primeiroDiaMesPassado,
      valor_comissao_bruta: comissao,
      status_pagamento: 'PENDENTE', // Sempre começa como pendente
    }));

    if (fechamentosParaInserir.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum parceiro com comissão a ser gerada.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 6. Inserir os novos fechamentos no banco de dados
    // Usamos 'upsert' para evitar duplicatas. Se já existir um fechamento para aquele parceiro e mês, ele será atualizado.
    const { error: insertError } = await supabaseAdmin
      .from('fechamentos')
      .upsert(fechamentosParaInserir, { onConflict: 'id_parceiro, mes_referencia' });

    if (insertError) throw insertError;

    // 7. Retornar sucesso
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
