// src/hooks/useVendasData.js

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

// --- Funções de Mapeamento (sem alteração) ---
const PLAN_MAP = [ { cleanName: 'Plano Família Plus 12x', keywords: ['Família Plus', '12x'] }, { cleanName: 'Plano Família 12x', keywords: ['Família', '12x'] }, { cleanName: 'Plano Individual Plus 12x', keywords: ['Individual Plus', '12x'] }, { cleanName: 'Plano Individual 12x', keywords: ['Individual', '12x'] }, { cleanName: 'Plano Família Plus', keywords: ['Família Plus'] }, { cleanName: 'Plano Família', keywords: ['Família'] }, { cleanName: 'Plano Individual Plus', keywords: ['Individual Plus'] }, { cleanName: 'Plano Individual', keywords: ['Individual'] }, ];
const mapRawNameToClean = (rawName) => { if (!rawName) return 'Não Identificado'; const lowerCaseRawName = rawName.toLowerCase(); for (const plan of PLAN_MAP) { const allKeywordsMatch = plan.keywords.every(keyword => lowerCaseRawName.includes(keyword.toLowerCase())); if (allKeywordsMatch) return plan.cleanName; } return 'Outros'; };

// --- O Custom Hook Corrigido ---
export function useVendasData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todasAsVendas, setTodasAsVendas] = useState([]);
  const [parceiros, setParceiros] = useState({});

  // Busca de dados (sem alteração)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: vendasData, error: vendasError } = await supabase.from('vendas').select('*, id_cobranca_principal, id_pagamento');
        if (vendasError) throw vendasError;
        const { data: parceirosData, error: parceirosError } = await supabase.functions.invoke('list-partners');
        if (parceirosError) throw parceirosError;
        const mapaDeParceiros = {};
        if (parceirosData.users) {
          parceirosData.users.forEach(user => {
            mapaDeParceiros[user.id] = { nome: user.user_metadata?.nome || 'Parceiro Desconhecido', vendas: 0, faturamento: 0 };
          });
        }
        setParceiros(mapaDeParceiros);
        setTodasAsVendas(vendasData || []);
      } catch (err) {
        console.error("Erro ao buscar dados no hook useVendasData:", err);
        setError('Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Processamento de dados com a lógica corrigida
  const dadosProcessados = useMemo(() => {
    if (todasAsVendas.length === 0) {
      return { vendasComNomes: [], kpisMes: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 }, kpisGeral: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 }, rankingParceirosMes: [], resumoPlanosMes: [], ultimasVendas: [], };
    }

    const agora = new Date();
    const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const TAXA_COMISSAO = 0.4;

    const vendasComNomes = todasAsVendas.map(venda => ({ ...venda, nome_parceiro: parceiros[venda.id_parceiro]?.nome || 'Sem Parceiro' }));

    const calcularKpis = (vendasBase, dataInicio) => {
      const kpis = { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 };
      const idsVendasUnicasPagasNoPeriodo = new Set();
      vendasBase.forEach(venda => {
        const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
        const dataPagamento = venda.data_pagamento ? new Date(venda.data_pagamento) : null;
        if (isPaga && dataPagamento && dataPagamento >= dataInicio) {
          kpis.faturamento += venda.valor;
          if (venda.id_parceiro) {
            kpis.comissaoAPagar += venda.valor * TAXA_COMISSAO;
          }
          const vendaId = venda.id_cobranca_principal || venda.id_pagamento;
          if (vendaId) {
            idsVendasUnicasPagasNoPeriodo.add(vendaId);
          }
        }
      });
      kpis.vendasConfirmadas = idsVendasUnicasPagasNoPeriodo.size;
      return kpis;
    };

    const kpisMes = calcularKpis(vendasComNomes, primeiroDiaMes);
    const kpisGeral = calcularKpis(vendasComNomes, new Date(0));

    // ===================================================================
    // =================== CORREÇÃO FINAL DO RANKING =====================
    // ===================================================================
    const resumoPlanos = {};
    const rankingParceiros = JSON.parse(JSON.stringify(parceiros));
    const idsVendasUnicasRanking = new Set();

    // O loop agora itera sobre TODAS as vendas, não apenas as do mês
    vendasComNomes.forEach(venda => {
        const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
        const dataPagamento = venda.data_pagamento ? new Date(venda.data_pagamento) : null;

        // Filtro pela data de pagamento DENTRO do loop
        if (isPaga && dataPagamento && dataPagamento >= primeiroDiaMes) {
            // 1. Soma o faturamento do parceiro para CADA parcela paga no mês
            if (venda.id_parceiro && rankingParceiros[venda.id_parceiro]) {
                rankingParceiros[venda.id_parceiro].faturamento += venda.valor;
            }

            // 2. Conta a venda única e o plano apenas uma vez
            const vendaId = venda.id_cobranca_principal || venda.id_pagamento;
            if (vendaId && !idsVendasUnicasRanking.has(vendaId)) {
                if (venda.id_parceiro && rankingParceiros[venda.id_parceiro]) {
                    rankingParceiros[venda.id_parceiro].vendas += 1;
                }
                const nomePlano = mapRawNameToClean(venda.nome_plano);
                resumoPlanos[nomePlano] = (resumoPlanos[nomePlano] || 0) + 1;
                
                idsVendasUnicasRanking.add(vendaId);
            }
        }
    });

    const rankingFinal = Object.values(rankingParceiros).filter(p => p.vendas > 0 || p.faturamento > 0).sort((a, b) => b.faturamento - a.faturamento);
    const planosFinal = Object.entries(resumoPlanos).map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => b.quantidade - a.quantidade);
    const ultimasVendas = vendasComNomes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

    return { vendasComNomes, kpisMes, kpisGeral, rankingParceirosMes: rankingFinal, resumoPlanosMes: planosFinal, ultimasVendas };
  }, [todasAsVendas, parceiros]);

  return { loading, error, ...dadosProcessados };
}
