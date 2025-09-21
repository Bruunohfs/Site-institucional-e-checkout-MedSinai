// src/pages/admin/VisaoGeralVendas.jsx

import React, { useState, useMemo } from 'react';
import { useVendasData } from '@/hooks/useVendasData';

// --- Componentes e Funções Auxiliares (sem alterações) ---
const KpiCard = ({ title, value, icon }) => ( <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm"><div className="text-2xl md:text-3xl text-blue-500 dark:text-blue-400">{icon}</div><div className="flex-1 overflow-hidden"><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3><p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">{value}</p></div></div> );
const FilterButton = ({ label, value, activeFilter, setFilter }) => ( <button onClick={() => setFilter(value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${ activeFilter === value ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-000 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-600' }`}>{label}</button> );
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };
const STATUS_STYLES = { RECEBIDO: 'bg-green-500/20 text-green-700 dark:text-green-300', PREVISTO: 'bg-blue-500/20 text-blue-700 dark:text-blue-300', PENDENTE: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300', ATRASADO: 'bg-orange-500/20 text-orange-700 dark:text-orange-300', PROBLEMA: 'bg-red-500/20 text-red-700 dark:text-red-300', DEFAULT: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300' };
const getStatusBadge = (venda) => { const agora = new Date(); const dataCompetencia = new Date(venda.data_competencia); if (['CANCELLED', 'REFUNDED', 'CHARGEBACK'].includes(venda.status_pagamento)) { return { label: 'Problema', className: STATUS_STYLES.PROBLEMA }; } if (['PENDING', 'AWAITING_RISK_ANALYSIS'].includes(venda.status_pagamento)) { return { label: 'Pendente', className: STATUS_STYLES.PENDENTE }; } if (venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED') { if (dataCompetencia > agora) { return { label: 'Previsto', className: STATUS_STYLES.PREVISTO }; } if (dataCompetencia <= agora) { return { label: 'Recebido', className: STATUS_STYLES.RECEBIDO }; } } if (venda.status_pagamento === 'OVERDUE') { return { label: 'Atrasado', className: STATUS_STYLES.ATRASADO }; } return { label: venda.status_pagamento, className: STATUS_STYLES.DEFAULT }; };
const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => { const isSorted = sortConfig.key === sortKey; const directionIcon = sortConfig.direction === 'asc' ? '▲' : '▼'; return ( <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => requestSort(sortKey)}> <div className="flex items-center gap-2"> {children} {isSorted && <span className="text-xs">{directionIcon}</span>} </div> </th> ); };

export default function VisaoGeralVendas() {
  const { loading, error, vendasComNomes } = useVendasData();
  
  const [filtroPeriodo, setFiltroPeriodo] = useState('month');
  const [mesCustomizado, setMesCustomizado] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITENS_POR_PAGINA = 20;

  const requestSort = (key) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; setSortConfig({ key, direction }); setCurrentPage(1); };

  const dadosFiltrados = useMemo(() => {
    if (!vendasComNomes) return { kpis: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 }, vendas: [] };
    let filtroMesAno = null;
    const agora = new Date();
    if (filtroPeriodo === 'month') { filtroMesAno = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`; } 
    else if (filtroPeriodo === 'custom' && mesCustomizado) { filtroMesAno = mesCustomizado; }
    const vendasNoPeriodo = vendasComNomes.filter(venda => { const dataCompetencia = new Date(venda.data_competencia); if (filtroPeriodo === 'today') { return dataCompetencia.getFullYear() === agora.getFullYear() && dataCompetencia.getMonth() === agora.getMonth() && dataCompetencia.getDate() === agora.getDate(); } if (filtroMesAno) { const mesAnoCompetencia = `${dataCompetencia.getFullYear()}-${String(dataCompetencia.getMonth() + 1).padStart(2, '0')}`; return mesAnoCompetencia === filtroMesAno; } return true; });
    let vendasParaCalculo = [...vendasNoPeriodo];
    if (filtroStatus !== 'todos') { const statusMap = { pagos: ['CONFIRMED', 'RECEIVED'], pendentes: ['PENDING', 'AWAITING_RISK_ANALYSIS'], atrasados: ['OVERDUE'], problemas: ['REFUNDED', 'CHARGEBACK', 'CANCELLED'] }; vendasParaCalculo = vendasParaCalculo.filter(v => statusMap[filtroStatus]?.includes(v.status_pagamento)); }
    const idsVendasUnicas = new Set();
    const kpis = vendasParaCalculo.reduce((acc, venda) => { const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED'; if (isPaga) { acc.faturamento += venda.valor; if (venda.id_parceiro) acc.comissaoAPagar += venda.valor * 0.4; const idUnico = venda.id_cobranca_principal || venda.id; idsVendasUnicas.add(idUnico); } return acc; }, { faturamento: 0, comissaoAPagar: 0 });
    kpis.vendasConfirmadas = idsVendasUnicas.size;
    vendasParaCalculo.sort((a, b) => { const valA = a[sortConfig.key]; const valB = b[sortConfig.key]; if (valA === null || valA === undefined) return 1; if (valB === null || valB === undefined) return -1; if (typeof valA === 'number' && typeof valB === 'number') { return sortConfig.direction === 'asc' ? valA - valB : valB - valA; } if (String(valA) < String(valB)) return sortConfig.direction === 'asc' ? -1 : 1; if (String(valA) > String(valB)) return sortConfig.direction === 'asc' ? 1 : -1; return 0; });
    return { kpis, vendas: vendasParaCalculo };
  }, [vendasComNomes, filtroPeriodo, mesCustomizado, filtroStatus, sortConfig]);

  const vendasPaginadas = useMemo(() => { const firstPageIndex = (currentPage - 1) * ITENS_POR_PAGINA; return dadosFiltrados.vendas.slice(firstPageIndex, firstPageIndex + ITENS_POR_PAGINA); }, [dadosFiltrados.vendas, currentPage]);
  const totalPages = Math.ceil(dadosFiltrados.vendas.length / ITENS_POR_PAGINA);
  const handlePeriodoChange = (periodo) => { setFiltroPeriodo(periodo); setCurrentPage(1); if (periodo !== 'custom') { setMesCustomizado(''); } };
  const handleMesCustomizadoChange = (e) => { setMesCustomizado(e.target.value); setFiltroPeriodo('custom'); setCurrentPage(1); };
  const handleStatusChange = (status) => { setFiltroStatus(status); setCurrentPage(1); };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visão Geral de Vendas</h1>
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton label="Hoje" value="today" activeFilter={filtroPeriodo} setFilter={handlePeriodoChange} />
          <FilterButton label="Mês Atual" value="month" activeFilter={filtroPeriodo} setFilter={handlePeriodoChange} />
          <FilterButton label="Todo o Período" value="all" activeFilter={filtroPeriodo} setFilter={handlePeriodoChange} />
          <input type="month" value={mesCustomizado} onChange={handleMesCustomizadoChange} className={`bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:border-green-500 ${filtroPeriodo === 'custom' ? 'border-green-500 ring-2 ring-green-400' : 'border-gray-300 dark:border-gray-600'}`} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
        <KpiCard title="Faturamento" value={formatCurrency(dadosFiltrados.kpis.faturamento)} icon="💰" />
        <KpiCard title="Comissão a Pagar" value={formatCurrency(dadosFiltrados.kpis.comissaoAPagar)} icon="🏆" />
        <KpiCard title="Nº de Vendas Únicas" value={dadosFiltrados.kpis.vendasConfirmadas.toString()} icon="✅" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-400 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtrar tabela por:</span>
            <FilterButton label="Todos" value="todos" activeFilter={filtroStatus} setFilter={handleStatusChange} />
            <FilterButton label="Pagos" value="pagos" activeFilter={filtroStatus} setFilter={handleStatusChange} />
            <FilterButton label="Pendentes" value="pendentes" activeFilter={filtroStatus} setFilter={handleStatusChange} />
            <FilterButton label="Atrasados" value="atrasados" activeFilter={filtroStatus} setFilter={handleStatusChange} />
            <FilterButton label="Com Problema" value="problemas" activeFilter={filtroStatus} setFilter={handleStatusChange} />
          </div>
        </div>
        
        {loading && <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando vendas...</div>}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}
        
        {!loading && !error && (
          dadosFiltrados.vendas.length > 0 ? (
            <>
              {/* =================================================================== */}
              {/* ==> A MÁGICA DA RESPONSIVIDADE ACONTECE AQUI <== */}
              {/* =================================================================== */}
              <div className="overflow-x-auto">
                {/* Tabela para Desktop */}
                <table className="w-full text-left min-w-[1200px] hidden md:table">
                  <thead className="bg-gray-300 dark:bg-gray-700/50 border-b border-gray-400 dark:border-gray-600">
                    <tr>
                      <SortableHeader sortKey="created_at" sortConfig={sortConfig} requestSort={requestSort}>Contratação</SortableHeader>
                      <SortableHeader sortKey="nome_cliente" sortConfig={sortConfig} requestSort={requestSort}>Cliente</SortableHeader>
                      <SortableHeader sortKey="nome_plano" sortConfig={sortConfig} requestSort={requestSort}>Plano</SortableHeader>
                      <SortableHeader sortKey="valor" sortConfig={sortConfig} requestSort={requestSort}>Valor</SortableHeader>
                      <SortableHeader sortKey="nome_parceiro" sortConfig={sortConfig} requestSort={requestSort}>Parceiro</SortableHeader>
                      <SortableHeader sortKey="data_competencia" sortConfig={sortConfig} requestSort={requestSort}>Competência</SortableHeader>
                      <SortableHeader sortKey="status_pagamento" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {vendasPaginadas.map(venda => {
                      const badge = getStatusBadge(venda);
                      return (
                        <tr key={venda.id} className="border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="p-4 text-gray-700 dark:text-gray-300">{formatDate(venda.created_at)}</td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">{venda.nome_cliente}</td>
                          <td className="p-4 font-medium text-gray-800 dark:text-white">{venda.nome_plano}</td>
                          <td className="p-4 font-semibold text-green-600 dark:text-green-400">{formatCurrency(venda.valor)}</td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">{venda.nome_parceiro}</td>
                          <td className="p-4 font-medium text-gray-800 dark:text-white">{formatDate(venda.data_competencia)}</td>
                          <td className="p-4"> <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${badge.className}`}> {badge.label} </span> </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Lista de Cartões para Mobile */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
                  {vendasPaginadas.map(venda => {
                    const badge = getStatusBadge(venda);
                    return (
                      <div key={venda.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{venda.nome_cliente}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{venda.nome_plano}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div className="text-gray-500 dark:text-gray-400">Valor:</div>
                          <div className="font-semibold text-green-600 dark:text-green-400 text-right">{formatCurrency(venda.valor)}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Competência:</div>
                          <div className="text-gray-700 dark:text-gray-300 text-right">{formatDate(venda.data_competencia)}</div>

                          <div className="text-gray-500 dark:text-gray-400">Parceiro:</div>
                          <div className="text-gray-700 dark:text-gray-300 text-right">{venda.nome_parceiro || 'N/A'}</div>
                          
                          <div className="text-gray-500 dark:text-gray-400">Contratação:</div>
                          <div className="text-gray-700 dark:text-gray-300 text-right">{formatDate(venda.created_at)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {totalPages > 1 && ( <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700"> <span>Página {currentPage} de {totalPages}</span> <div className="flex gap-2"> <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button> <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</button> </div> </div> )}
            </>
          ) : ( <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma venda encontrada para os filtros selecionados.</div> )
        )}
      </div>
    </div>
  );
}
