import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Mapeamento de ciclos para fator de normalização mensal
const CICLO_PARA_MESES = {
  WEEKLY: 1 / 4.33, // Aproximadamente 4.33 semanas em um mês
  BIWEEKLY: 1 / 2.16, // Aproximadamente 2.16 quinzenas em um mês
  MONTHLY: 1,
  BIMONTHLY: 2,
  QUARTERLY: 3,
  SEMIANNUALLY: 6,
  YEARLY: 12,
};

export function useClientData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientKpis, setClientKpis] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    mrr: 0, // Receita Mensal Recorrente
  });

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError('');

      // Busca todos os clientes com suas respectivas assinaturas
      const { data: clientes, error: fetchError } = await supabase
        .from('clientes')
        .select('id, assinaturas ( status, valor, ciclo )');

      if (fetchError) {
        console.error('Erro ao buscar dados dos clientes:', fetchError);
        setError('Não foi possível carregar as métricas dos clientes.');
        setLoading(false);
        return;
      }

      // --- Início dos Cálculos ---
      const totalClientes = clientes.length;
      let clientesAtivos = 0;
      let mrr = 0;

      clientes.forEach(cliente => {
        // Verifica se o cliente tem pelo menos uma assinatura 'ACTIVE'
        const temAssinaturaAtiva = cliente.assinaturas.some(sub => sub.status === 'ACTIVE');

        if (temAssinaturaAtiva) {
          clientesAtivos++;

          // Calcula o MRR somando o valor de todas as assinaturas ativas do cliente
          cliente.assinaturas.forEach(sub => {
            if (sub.status === 'ACTIVE' && sub.valor > 0) {
              const meses = CICLO_PARA_MESES[sub.ciclo] || 1; // Padrão para mensal se o ciclo for desconhecido
              // A receita da assinatura é o valor dividido pelo número de meses do ciclo
              mrr += sub.valor / meses;
            }
          });
        }
      });

      const clientesInativos = totalClientes - clientesAtivos;

      setClientKpis({
        totalClientes,
        clientesAtivos,
        clientesInativos,
        mrr,
      });

      setLoading(false);
    };

    fetchClientData();
  }, []);

  return { loading, error, clientKpis };
}
