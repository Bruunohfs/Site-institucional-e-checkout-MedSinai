// src/hooks/usePartnerData.js

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

// --- Funções de Mapeamento (Reutilizadas) ---
const PLAN_MAP = [ { cleanName: 'Plano Família Plus 12x', keywords: ['Família Plus', '12x'] }, { cleanName: 'Plano Família 12x', keywords: ['Família', '12x'] }, { cleanName: 'Plano Individual Plus 12x', keywords: ['Individual Plus', '12x'] }, { cleanName: 'Plano Individual 12x', keywords: ['Individual', '12x'] }, { cleanName: 'Plano Família Plus', keywords: ['Família Plus'] }, { cleanName: 'Plano Família', keywords: ['Família'] }, { cleanName: 'Plano Individual Plus', keywords: ['Individual Plus'] }, { cleanName: 'Plano Individual', keywords: ['Individual'] }, ];
const mapRawNameToClean = (rawName) => { if (!rawName) return 'Não Identificado'; const lowerCaseRawName = rawName.toLowerCase(); for (const plan of PLAN_MAP) { const allKeywordsMatch = plan.keywords.every(keyword => lowerCaseRawName.includes(keyword.toLowerCase())); if (allKeywordsMatch) return plan.cleanName; } return 'Outros'; };

// --- O Custom Hook do Parceiro ---
// Ele recebe o ID do usuário logado como argumento
export function usePartnerData(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendasDoParceiro, setVendasDoParceiro] = useState([]);

  // 1. Busca os dados brutos APENAS do parceiro logado
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPartnerData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: vendasError } = await supabase
          .from('vendas')
          .select('*, id_cobranca_principal, id_pagamento')
          .eq('id_parceiro', userId); // A MÁGICA ACONTECE AQUI!

        if (vendasError) throw vendasError;
        
        setVendasDoParceiro(data || []);
      } catch (err) {
        console.error("Erro ao buscar dados no hook usePartnerData:", err);
        setError('Não foi possível carregar seus dados de vendas.');
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerData();
  }, [userId]); // Roda sempre que o userId mudar

  // 2. Processa e calcula os dados derivados
  const dadosProcessados = useMemo(() => {
    if (vendasDoParceiro.length === 0) {
      return {
        vendas: [],
        kpis: { vendasPagasMes: 0, vendasPendentesMes: 0, comissaoAprovadaMes: 0, comissaoPendenteTotal: 0 },
        dadosGraficoLinha: [],
        dadosGraficoBarra: [],
        dadosGraficoPizza: [],
      };
    }

    const agora = new Date();
    const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const TAXA_COMISSAO = 0.4;

    const kpis = { vendasPagasMes: 0, vendasPendentesMes: 0, comissaoAprovadaMes: 0, comissaoPendenteTotal: 0 };
    const idsVendasPagasMes = new Set();
    const idsVendasPendentesMes = new Set();

    vendasDoParceiro.forEach(venda => {
      const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
      const isPendente = venda.status_pagamento === 'PENDING' || venda.status_pagamento === 'AWAITING_RISK_ANALYSIS';
      const dataPagamento = venda.data_pagamento ? new Date(venda.data_pagamento) : null;
      const dataCriacao = new Date(venda.created_at);
      const vendaId = venda.id_cobranca_principal || venda.id_pagamento;

      // Calcula comissão pendente total (sobre todas as parcelas pendentes)
      if (isPendente) {
        kpis.comissaoPendenteTotal += venda.valor * TAXA_COMISSAO;
      }

      // Calcula KPIs do Mês
      if (dataPagamento && dataPagamento >= primeiroDiaMes) {
        if (isPaga) {
          kpis.comissaoAprovadaMes += venda.valor * TAXA_COMISSAO;
          if (vendaId) idsVendasPagasMes.add(vendaId);
        }
      }
      
      if (dataCriacao >= primeiroDiaMes && isPendente) {
          if(vendaId) idsVendasPendentesMes.add(vendaId);
      }
    });

    kpis.vendasPagasMes = idsVendasPagasMes.size;
    kpis.vendasPendentesMes = idsVendasPendentesMes.size;

    // Lógica para os gráficos (usando a contagem única)
    const getVendaUnicaId = (venda) => venda.id_cobranca_principal || venda.id_pagamento;

    const { dadosLinha } = vendasDoParceiro.reduce((acc, venda) => {
      const vendaId = getVendaUnicaId(venda);
      if (vendaId && !acc.idsContados.has(vendaId)) {
        const data = new Date(venda.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        acc.dadosLinha[data] = acc.dadosLinha[data] || { data, vendas: 0 };
        acc.dadosLinha[data].vendas++;
        acc.idsContados.add(vendaId);
      }
      return acc;
    }, { dadosLinha: {}, idsContados: new Set() });

    const { dadosBarra } = vendasDoParceiro.reduce((acc, venda) => {
      const vendaId = getVendaUnicaId(venda);
      if (vendaId && !acc.idsContados.has(vendaId)) {
        const planoMapeado = mapRawNameToClean(venda.nome_plano);
        acc.dadosBarra[planoMapeado] = acc.dadosBarra[planoMapeado] || { plano: planoMapeado, quantidade: 0 };
        acc.dadosBarra[planoMapeado].quantidade++;
        acc.idsContados.add(vendaId);
      }
      return acc;
    }, { dadosBarra: {}, idsContados: new Set() });
    
    const statusMapPizza = { 'CONFIRMED': 'Comissão Aprovada', 'RECEIVED': 'Comissão Aprovada', 'PENDING': 'Comissão Pendente', 'AWAITING_RISK_ANALYSIS': 'Comissão Pendente' };
    const comissoesPorStatus = vendasDoParceiro.reduce((acc, venda) => {
      const status = statusMapPizza[venda.status_pagamento] || venda.status_pagamento || 'Outros';
      acc[status] = (acc[status] || 0) + (venda.valor * TAXA_COMISSAO);
      return acc;
    }, {});

    return {
      vendas: vendasDoParceiro,
      kpis,
      dadosGraficoLinha: Object.values(dadosLinha),
      dadosGraficoBarra: Object.values(dadosBarra),
      dadosGraficoPizza: Object.entries(comissoesPorStatus).map(([name, value]) => ({ name, value })),
    };
  }, [vendasDoParceiro]);

  // 3. Retorna os dados prontos para uso
  return { loading, error, ...dadosProcessados };
}
