// src/pages/parceiros/OportunidadesPage.jsx - ATUALIZADO COM DESIGN PROFISSIONAL

import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';
// ==> ATUALIZAÇÃO 1: Importando os ícones da Lucide <==
import { Target, Hourglass, ArrowDownUp } from 'lucide-react';

// --- Constantes e Funções Auxiliares ---
const TAXA_COMISSAO = 0.4;
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatSimpleDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };

// ==> ATUALIZAÇÃO 2: Componente KpiCard com novo design <==
const KpiCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm flex items-center gap-4">
    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass} bg-opacity-10`}>
      {icon}
    </div>
    <div className="flex-1 overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">{value}</p>
    </div>
  </div>
);

// ==> ATUALIZAÇÃO 3: Componente FilterButton com novo design <==
const FilterButton = ({ label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500
      ${isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
      }`}
  >
    {label}
  </button>
);

// ==> ATUALIZAÇÃO 4: Componente SortableHeader com ícone melhor <==
const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === sortKey;
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">
        {children}
        {isSorted ? (
          <ArrowDownUp size={14} className={`transform transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
        ) : (
          <ArrowDownUp size={14} className="text-gray-400" />
        )}
      </div>
    </th>
  );
};

// Lógica de Status (sem alterações)
const STATUS_STYLES = { 'Pendente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', 'Atrasado': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300', 'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', 'Com Problema': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', 'Default': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
const STATUS_TRANSLATIONS = { 'PENDING': 'Pendente', 'OVERDUE': 'Atrasado', 'AWAITING_RISK_ANALYSIS': 'Pendente', 'REFUNDED': 'Cancelado', 'CHARGEBACK': 'Com Problema', 'CANCELLED': 'Cancelado' };
const getStatusInfo = (status) => { const translated = STATUS_TRANSLATIONS[status] || 'Outro'; return { translated, style: STATUS_STYLES[translated] || STATUS_STYLES.Default }; };

export default function OportunidadesPage() {
  const { user } = useOutletContext(); 
  const { loading, error, vendas } = usePartnerData(user?.id);

  // Lógica de estado e filtros (sem alterações)
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITENS_POR_PAGINA = 20;

  const oportunidades = useMemo(() => { return vendas.filter(venda => venda.status_pagamento !== 'CONFIRMED' && venda.status_pagamento !== 'RECEIVED'); }, [vendas]);
  const kpis = useMemo(() => { return oportunidades.reduce((acc, venda) => { acc.comissaoTotal += venda.valor * TAXA_COMISSAO; return acc; }, { comissaoTotal: 0 }); }, [oportunidades]);
  const requestSort = (key) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; setSortConfig({ key, direction }); setCurrentPage(1); };

  const oportunidadesProcessadas = useMemo(() => {
    return [...oportunidades]
      .filter(venda => {
        if (filtroStatus === 'todos') return true;
        const statusInfo = getStatusInfo(venda.status_pagamento);
        return statusInfo.translated.toLowerCase().replace(' ', '-') === filtroStatus;
      })
      .sort((a, b) => { 
        const valA = a[sortConfig.key]; const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return 1; if (valB === null || valB === undefined) return -1;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; 
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; 
        return 0; 
      });
  }, [oportunidades, filtroStatus, sortConfig]);

  const oportunidadesPaginadas = useMemo(() => { const firstPageIndex = (currentPage - 1) * ITENS_POR_PAGINA; return oportunidadesProcessadas.slice(firstPageIndex, firstPageIndex + ITENS_POR_PAGINA); }, [oportunidadesProcessadas, currentPage]);
  const totalPages = Math.ceil(oportunidadesProcessadas.length / ITENS_POR_PAGINA);

  if (loading) return <div className="p-8"><p className="text-gray-700 dark:text-gray-300">Carregando suas oportunidades...</p></div>;
  if (error) return <div className="p-8"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <title>Oportunidades | Portal do Parceiro MedSinai</title>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Oportunidades</h1>
      
      {/* ==> ATUALIZAÇÃO 5: KPIs com novo design e ícones <== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard title="Total de Oportunidades" value={oportunidadesProcessadas.length} icon={<Target size={24} />} colorClass="text-blue-500" />
        <KpiCard title="Comissão 'Congelada'" value={formatCurrency(kpis.comissaoTotal)} icon={<Hourglass size={24} />} colorClass="text-yellow-500" />
      </div>

      {/* ==> ATUALIZAÇÃO 6: Card principal com novo estilo e borda reforçada <== */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Leads para Remarketing</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Clientes que tentaram comprar mas não concluíram o pagamento. Entre em contato para recuperar a venda!</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <FilterButton label="Todos" onClick={() => setFiltroStatus('todos')} isActive={filtroStatus === 'todos'} />
            <FilterButton label="Pendentes" onClick={() => setFiltroStatus('pendente')} isActive={filtroStatus === 'pendente'} />
            <FilterButton label="Atrasados" onClick={() => setFiltroStatus('atrasado')} isActive={filtroStatus === 'atrasado'} />
            <FilterButton label="Cancelados" onClick={() => setFiltroStatus('cancelado')} isActive={filtroStatus === 'cancelado'} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 hidden md:table">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <SortableHeader sortKey="created_at" sortConfig={sortConfig} requestSort={requestSort}>Data</SortableHeader>
                <SortableHeader sortKey="nome_cliente" sortConfig={sortConfig} requestSort={requestSort}>Cliente</SortableHeader>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contato</th>
                <SortableHeader sortKey="nome_plano" sortConfig={sortConfig} requestSort={requestSort}>Plano Desejado</SortableHeader>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Comissão</th>
                <SortableHeader sortKey="data_vencimento" sortConfig={sortConfig} requestSort={requestSort}>Vencimento</SortableHeader>
                <SortableHeader sortKey="status_pagamento" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
              {oportunidadesPaginadas.length > 0 ? ( 
                oportunidadesPaginadas.map((venda) => {
                  const statusInfo = getStatusInfo(venda.status_pagamento);
                  return (
                    <tr key={venda.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{formatSimpleDate(venda.created_at)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{venda.nome_cliente}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{venda.email_cliente || 'Não informado'}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{venda.telefone_cliente || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{venda.nome_plano}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(venda.valor * TAXA_COMISSAO)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatSimpleDate(venda.data_vencimento)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusInfo.style}`}>{statusInfo.translated}</span></td>
                    </tr> 
                  );
                }) 
              ) : ( 
                <tr><td colSpan="7" className="text-center py-16 px-6 text-gray-500">Nenhuma oportunidade encontrada. Parabéns, todas as suas vendas foram pagas!</td></tr> 
              )}
            </tbody>
          </table>

          <div className="divide-y divide-gray-300 dark:divide-gray-700 md:hidden">
            {oportunidadesPaginadas.length > 0 ? (
              oportunidadesPaginadas.map(venda => {
                const statusInfo = getStatusInfo(venda.status_pagamento);
                return (
                  <div key={venda.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{venda.nome_cliente}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{venda.nome_plano}</p>
                      </div>
                       <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusInfo.style}`}>
                        {statusInfo.translated}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Contato:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{venda.email_cliente || venda.telefone_cliente || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Comissão:</span>
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(venda.valor * TAXA_COMISSAO)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Vencimento:</span>
                        <span className="text-gray-700 dark:text-gray-300">{formatSimpleDate(venda.data_vencimento)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 px-6 text-gray-500">Nenhuma oportunidade encontrada.</div>
            )}
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-300 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50">Anterior</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
