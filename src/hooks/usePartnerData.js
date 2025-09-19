import { useState, useEffect, useMemo, useCallback } from 'react'; // Adicionar useCallback
import { supabase } from '@/lib/supabaseClient.js';

export function usePartnerData(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendas, setVendas] = useState([]); // Renomeado para 'vendas' para clareza

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
          .select('*, id_cobranca_principal, id_pagamento, email_cliente, telefone_cliente')
          .eq('id_parceiro', userId);

        if (vendasError) throw vendasError;
        
        setVendas(data || []);
      } catch (err) {
        console.error("Erro ao buscar dados no hook usePartnerData:", err);
        setError('Não foi possível carregar seus dados de vendas.');
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerData();
  }, [userId]);

  // ===================================================================
  // ==> CORREÇÃO AQUI <==
  // A função agora é criada com useCallback e vive no escopo principal do hook
  // ===================================================================
  const calcularKpisParaPeriodo = useCallback((dataInicio, dataFim) => {
    if (vendas.length === 0) {
      return { comissaoAprovadaPeriodo: 0, comissaoPendentePeriodo: 0, vendasPagasPeriodo: 0 };
    }

    const TAXA_COMISSAO = 0.4;
    let comissaoAprovada = 0;
    let comissaoPendente = 0;
    const idsVendasPagasUnicas = new Set();

    vendas.forEach(venda => {
      const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
      const isPendente = venda.status_pagamento === 'PENDING' || venda.status_pagamento === 'AWAITING_RISK_ANALYSIS' || venda.status_pagamento === 'OVERDUE';
      
      // Lógica para Comissão Aprovada (baseada em competência)
      if (isPaga) {
        const isParcelada12x = venda.nome_plano && venda.nome_plano.includes('12x');
        const dataCompetencia = isParcelada12x ? new Date(venda.data_vencimento) : new Date(venda.data_pagamento);
        
        // Ignora fuso horário na comparação
        const dataCompSemHora = new Date(dataCompetencia.getUTCFullYear(), dataCompetencia.getUTCMonth(), dataCompetencia.getUTCDate());

        if (dataCompSemHora >= dataInicio && dataCompSemHora <= dataFim) {
          comissaoAprovada += venda.valor * TAXA_COMISSAO;
          const vendaUnicaId = venda.id_cobranca_principal || venda.id_pagamento || venda.id;
          if (vendaUnicaId) {
            idsVendasPagasUnicas.add(vendaUnicaId);
          }
        }
      }

      // Lógica para Comissão Pendente (baseada em criação)
      const dataCriacao = new Date(venda.created_at);
      if (isPendente && dataCriacao >= dataInicio && dataCriacao <= dataFim) {
          comissaoPendente += venda.valor * TAXA_COMISSAO;
      }
    });

    return {
      comissaoAprovadaPeriodo: comissaoAprovada,
      comissaoPendentePeriodo: comissaoPendente,
      vendasPagasPeriodo: idsVendasPagasUnicas.size,
    };
  }, [vendas]); // A função será recriada se a lista de 'vendas' mudar

  // O retorno do hook agora está correto e simples
  return { loading, error, vendas, calcularKpisParaPeriodo };
}
