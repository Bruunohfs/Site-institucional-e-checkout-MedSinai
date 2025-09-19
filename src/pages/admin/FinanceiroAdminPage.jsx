// src/pages/admin/FinanceiroAdminPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RegistrarPagamentoModal from './RegistrarPagamentoModal';
import { Link } from 'react-router-dom';

// Ícones para a interface
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>;
const DownloadIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

// Funções de Estilo e Formatação
const STATUS_STYLES = {
  PAGO_TOTAL: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  PAGO_PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  PENDENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
};
const getStatusClasses = (status ) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  return correctedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export default function FinanceiroAdminPage() {
  const [fechamentos, setFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFechamento, setSelectedFechamento] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: fechamentosData, error: fechamentosError } = await supabase
        .from('fechamentos')
        .select(`*, profiles (nome_completo, tipo_chave_pix, chave_pix, nome_banco, agencia, conta_corrente)`)
        .order('mes_referencia', { ascending: false });
      if (fechamentosError) throw fechamentosError;
      setFechamentos(fechamentosData || []);
    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGerarFechamento = async () => {
    if (!confirm('Tem certeza que deseja gerar o fechamento para o mês anterior?')) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-fechamentos');
      if (error) throw error;
      alert(data.message || 'Operação concluída!');
      await fetchData();
    } catch (err) {
      console.error('Erro ao gerar fechamento:', err);
      alert('Erro ao gerar fechamento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (fechamento) => { setSelectedFechamento(fechamento); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setSelectedFechamento(null); };
  const handleSaveSuccess = async () => { handleCloseModal(); setLoading(true); await fetchData(); };
  const toggleRowExpansion = (id) => { setExpandedRowId(expandedRowId === id ? null : id); };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro - Admin</h1>
        <button onClick={handleGerarFechamento} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
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
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Detalhes</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.length > 0 ? fechamentos.map(f => (
                <React.Fragment key={f.id}>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(f.mes_referencia)}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{f.profiles?.nome_completo || 'Parceiro não encontrado'}</td>
                    <td className="p-4 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatCurrency(f.valor_comissao_bruta)}</td>
                    <td className="p-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{f.valor_pago ? formatCurrency(f.valor_pago) : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(f.status_pagamento)}`}>
                        {f.status_pagamento.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleRowExpansion(f.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="Ver observações">
                        <ChatIcon />
                      </button>
                    </td>
                    <td className="p-4">
                      {f.status_pagamento !== 'PAGO_TOTAL' ? (
                        <button onClick={() => handleOpenModal(f)} className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                          {f.status_pagamento === 'PENDENTE' ? 'Registrar' : 'Gerenciar'}
                        </button>
                      ) : <span className="text-sm text-gray-500">Quitado</span>}
                    </td>
                  </tr>
                  {expandedRowId === f.id && (
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan="7" className="p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          {f.observacoes && (
                            <div>
                              <strong className="block mb-1">Observações:</strong>
                              <p className="whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-800 rounded">{f.observacoes}</p>
                            </div>
                          )}
                          {f.url_comprovante && (
                            <div>
                              <strong className="block mb-1">Comprovante:</strong>
                              <a href={f.url_comprovante} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                <DownloadIcon /> Baixar Comprovante
                              </a>
                            </div>
                          )}
                          {!f.observacoes && !f.url_comprovante && (
                            <p>Nenhum detalhe adicional.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Nenhum fechamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showModal && selectedFechamento && (
        <RegistrarPagamentoModal fechamento={selectedFechamento} onClose={handleCloseModal} onSave={handleSaveSuccess} />
      )}
    </div>
  );
}
