// src/pages/admin/FinanceiroAdminPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Componente de Status (reutilizado)
const STATUS_STYLES = {
  PAGO: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  PAGO_PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  PENDENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
};
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

// Funções de Formatação
const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Adiciona 1 dia para corrigir o fuso horário que pode fazer a data "voltar" um dia
  const date = new Date(dateString);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export default function FinanceiroAdminPage() {
  const [fechamentos, setFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parceiros, setParceiros] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Buscar todos os fechamentos
        const { data: fechamentosData, error: fechamentosError } = await supabase
          .from('fechamentos')
          .select('*')
          .order('mes_referencia', { ascending: false });
        if (fechamentosError) throw fechamentosError;

        // 2. Buscar nomes dos parceiros
        const { data: parceirosData, error: parceirosError } = await supabase.functions.invoke('list-partners');
        if (parceirosError) throw parceirosError;
        
        const mapaDeParceiros = {};
        if (parceirosData.users) {
          parceirosData.users.forEach(user => {
            mapaDeParceiros[user.id] = user.user_metadata?.nome || 'Parceiro Desconhecido';
          });
        }
        setParceiros(mapaDeParceiros);
        setFechamentos(fechamentosData || []);

      } catch (err) {
        console.error("Erro ao buscar dados financeiros:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGerarFechamento = async () => {
    if (!confirm('Tem certeza que deseja gerar o fechamento para o mês anterior? Esta ação calculará as comissões e criará os registros de pagamento pendente.')) {
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-fechamentos');
      if (error) throw error;
      alert(data.message || 'Fechamento gerado com sucesso!');
      // Recarrega os dados para mostrar os novos fechamentos
      window.location.reload();
    } catch (err) {
      console.error('Erro ao gerar fechamento:', err);
      alert('Erro ao gerar fechamento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Carregando dados financeiros...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro - Admin</h1>
        <button
          onClick={handleGerarFechamento}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          Gerar Fechamento do Mês Anterior
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Mês Ref.</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Parceiro</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Comissão Bruta</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Valor Pago</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Data Pag.</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.length > 0 ? fechamentos.map(f => (
                <tr key={f.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(f.mes_referencia)}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{parceiros[f.id_parceiro] || 'Parceiro não encontrado'}</td>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatCurrency(f.valor_comissao_bruta)}</td>
                  <td className="p-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{f.valor_pago ? formatCurrency(f.valor_pago) : '-'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{f.data_pagamento ? new Date(f.data_pagamento).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(f.status_pagamento)}`}>
                      {f.status_pagamento}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">
                    Nenhum fechamento encontrado. Clique no botão acima para gerar o do mês anterior.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
