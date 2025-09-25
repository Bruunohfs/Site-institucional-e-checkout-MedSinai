// src/hooks/useVendasData.js - VERSÃO CORRIGIDA E COMPLETA

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
    ultimasVendas: [],
  });

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError('');
      try {
        // CHAMADA 1: Pega os dados da tabela 'vendas'. Continua igual.
        const { data: vendasData, error: vendasError } = await supabase
          .from('vendas')
          .select('*');
        if (vendasError) throw vendasError;

        // ===================================================================
        // ==> INÍCIO DA ÚNICA ALTERAÇÃO NECESSÁRIA <==
        // ===================================================================

        // CHAMADA 2: Substitui a Edge Function por uma chamada direta à tabela 'profiles'.
        const { data: parceirosData, error: parceirosError } = await supabase
          .from('profiles')
          .select('id, nome_completo'); // Pega só o ID e o nome completo.
        
        if (parceirosError) throw parceirosError;

        const mapaDeParceiros = {};
        if (parceirosData) {
          // A lógica aqui muda um pouco para se adaptar à estrutura da tabela 'profiles'.
          parceirosData.forEach((perfil) => {
            mapaDeParceiros[perfil.id] = {
              nome: perfil.nome_completo || 'Parceiro Desconhecido',
            };
          });
        }

        // ===================================================================
        // ==> FIM DA ÚNICA ALTERAÇÃO NECESSÁRIA <==
        // ===================================================================

        // Daqui para baixo, todo o seu código original de processamento de dados
        // permanece exatamente o mesmo, pois a estrutura 'mapaDeParceiros'
        // que ele usa foi recriada com sucesso.

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

        const ultimasVendas = vendasCompletas
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setDadosProcessados({
          vendasComNomes: vendasCompletas,
          kpisMes,
          kpisGeral: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 },
          rankingParceirosMes,
          resumoPlanosMes,
          ultimasVendas,
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
