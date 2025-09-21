// src/hooks/useVendasData.js

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

// --- Funções Auxiliares (sem alterações) ---
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const mapRawNameToClean = (rawName) => {
  const PLAN_MAP = [
    { cleanName: 'Plano Família Plus 12x', keywords: ['Família Plus', '12x'] },
    { cleanName: 'Plano Família 12x', keywords: ['Família', '12x'] },
    { cleanName: 'Plano Individual Plus 12x', keywords: ['Individual Plus', '12x'] },
    { cleanName: 'Plano Individual 12x', keywords: ['Individual', '12x'] },
    { cleanName: 'Plano Família Plus', keywords: ['Família Plus'] },
    { cleanName: 'Plano Família', keywords: ['Família'] },
    { cleanName: 'Plano Individual Plus', keywords: ['Individual Plus'] },
    { cleanName: 'Plano Individual', keywords: ['Individual'] },
  ];
  if (!rawName) return 'Não Identificado';
  const lowerCaseRawName = rawName.toLowerCase();
  for (const plan of PLAN_MAP) {
    const allKeywordsMatch = plan.keywords.every(keyword =>
      lowerCaseRawName.includes(keyword.toLowerCase())
    );
    if (allKeywordsMatch) return plan.cleanName;
  }
  return 'Outros';
};

export function useVendasData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dadosProcessados, setDadosProcessados] = useState({
    vendasComNomes: [],
    kpisMes: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 },
    kpisGeral: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 },
    rankingParceirosMes: [],
    resumoPlanosMes: [],
    ultimasVendas: [], // <-- Garantir que o estado inicial tenha o array
  });

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: vendasData, error: vendasError } = await supabase
          .from('vendas')
          .select('*');
        if (vendasError) throw vendasError;

        const { data: parceirosData, error: parceirosError } =
          await supabase.functions.invoke('list-partners');
        if (parceirosError) throw parceirosError;

        const mapaDeParceiros = {};
        if (parceirosData.users) {
          parceirosData.users.forEach((user) => {
            mapaDeParceiros[user.id] = {
              nome: user.user_metadata?.nome || 'Parceiro Desconhecido',
            };
          });
        }

        const agora = new Date();

        const vendasCompletas = (vendasData || []).map(venda => ({
          ...venda,
          data_competencia: venda.data_vencimento || venda.data_pagamento || venda.created_at,
          nome_parceiro: mapaDeParceiros[venda.id_parceiro]?.nome || 'Sem Parceiro',
        }));

        const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const TAXA_COMISSAO = 0.4;

        const vendasPagasNoMes = vendasCompletas.filter((v) => {
          const isPaga =
            v.status_pagamento === 'CONFIRMED' ||
            v.status_pagamento === 'RECEIVED';
          const dataCompetencia = new Date(v.data_competencia);
          return (
            isPaga &&
            dataCompetencia >= primeiroDiaMes &&
            dataCompetencia <
              new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
          );
        });

        const kpisMes = vendasPagasNoMes.reduce(
          (acc, v) => {
            acc.faturamento += v.valor;
            if (v.id_parceiro) acc.comissaoAPagar += v.valor * TAXA_COMISSAO;
            return acc;
          },
          { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: vendasPagasNoMes.length }
        );

        const rankingParceirosMes = Object.values(
          vendasPagasNoMes.reduce((acc, v) => {
            if (!v.id_parceiro) return acc;
            if (!acc[v.id_parceiro]) {
              acc[v.id_parceiro] = {
                nome: v.nome_parceiro,
                faturamento: 0,
                vendas: 0,
              };
            }
            acc[v.id_parceiro].faturamento += v.valor;
            acc[v.id_parceiro].vendas += 1;
            return acc;
          }, {})
        ).sort((a, b) => b.faturamento - a.faturamento);

        const resumoPlanosMes = Object.entries(
          vendasPagasNoMes.reduce((acc, v) => {
            const nomePlano = mapRawNameToClean(v.nome_plano);
            acc[nomePlano] = (acc[nomePlano] || 0) + 1;
            return acc;
          }, {})
        )
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade);

        // ===================================================================
        // ==> A CORREÇÃO ESTÁ AQUI: Adicionando a lógica de volta <==
        // ===================================================================
        const ultimasVendas = vendasCompletas
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Ordena pela data de criação
          .slice(0, 5); // Pega as 5 mais recentes

        setDadosProcessados({
          vendasComNomes: vendasCompletas, // Renomeado para clareza
          kpisMes,
          kpisGeral: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 }, // Pode ser removido se não usar
          rankingParceirosMes,
          resumoPlanosMes,
          ultimasVendas, // <-- AQUI! Passando a variável calculada
        });
        
      } catch (err) {
        console.error('Erro ao buscar e processar dados:', err);
        setError('Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  return { loading, error, ...dadosProcessados };
}
