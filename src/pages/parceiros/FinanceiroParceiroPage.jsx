// src/pages/parceiros/FinanceiroParceiroPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

// Ícones (reutilizados da página de admin)
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const ChatIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>;

// Funções de formatação (reutilizadas )
const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

// Estilos de Status (reutilizados)
const STATUS_STYLES = {
  PAGO_TOTAL: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  PAGO_PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  PENDENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
};
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

export default function FinanceiroParceiroPage() {
  const { user } = useOutletContext(); // Pega o usuário logado do layout
  const [fechamentos, setFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    const fetchFechamentosParceiro = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('fechamentos')
          .select('*')
          .eq('id_parceiro', user.id) // A MÁGICA ACONTECE AQUI: Filtra pelo ID do parceiro logado
          .order('mes_referencia', { ascending: false });

        if (error) throw error;
        setFechamentos(data || []);
      } catch (err) {
        console.error("Erro ao buscar dados financeiros do parceiro:", err);
        setError("Não foi possível carregar seu histórico financeiro.");
      } finally {
        setLoading(false);
      }
    };

    fetchFechamentosParceiro();
  }, [user]); // Roda a busca sempre que o objeto 'user' for definido

  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  if (loading) return <div className="p-8">Carregando seu histórico financeiro...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Meu Financeiro</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Mês de Referência</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Sua Comissão</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Valor Recebido</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.length > 0 ? fechamentos.map(f => (
                <React.Fragment key={f.id}>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(f.mes_referencia)}</td>
                    <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(f.valor_comissao_bruta)}</td>
                    <td className="p-4 font-semibold text-green-600 dark:text-green-400">{f.valor_pago ? formatCurrency(f.valor_pago) : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(f.status_pagamento)}`}>
                        {f.status_pagamento.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {f.url_comprovante && (
                          <a href={f.url_comprovante} target="_blank" rel="noopener noreferrer" title="Ver Comprovante" className="text-blue-500 hover:text-blue-400">
                            <EyeIcon />
                          </a>
                        )}
                        {f.observacoes && (
                          <button onClick={() => toggleRowExpansion(f.id)} title="Ver Observações" className="text-gray-500 hover:text-gray-400">
                            <ChatIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === f.id && (
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan="5" className="p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <strong className="block mb-1">Observações do Admin:</strong>
                          <p className="whitespace-pre-wrap">{f.observacoes}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">Nenhum registro financeiro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
