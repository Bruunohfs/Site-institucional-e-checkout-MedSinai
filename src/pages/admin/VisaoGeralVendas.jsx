// src/pages/admin/VisaoGeralVendas.jsx

import React, { useState, useMemo } from 'react';
import { useVendasData } from '@/hooks/useVendasData';

// --- Componentes e Funções Auxiliares (sem alterações) ---
const KpiCard = ({ title, value, icon }) => ( <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm"><div className="text-2xl md:text-3xl text-blue-500 dark:text-blue-400">{icon}</div><div className="flex-1 overflow-hidden"><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3><p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">{value}</p></div></div> );
const FilterButton = ({ label, value, activeFilter, setFilter }) => ( <button onClick={() => setFilter(value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${ activeFilter === value ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-000 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-600' }`}>{label}</button> );
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };
const STATUS_STYLES = { CONFIRMED: 'bg-green-300 text-green-800 dark:bg-green-500/20 dark:text-green-400', 
  RECEIVED:  'bg-green-300 text-green-800 dark:bg-green-500/20 dark:text-green-400', 
  PENDING: 'bg-yellow-300 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', 
  OVERDUE: 'bg-orange-300 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400', 
  REFUNDED: 'bg-red-300 text-red-800 dark:bg-red-500/20 dark:text-red-400', 
  CHARGEBACK: 'bg-red-300 text-red-900 dark:bg-red-500/30 dark:text-red-300', 
  CANCELLED: 'bg-red-300 text-red-800 dark:bg-red-500/20 dark:text-red-400', 
  DEFAULT: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300' };

const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

export default function VisaoGeralVendas() {
  const { loading, error, vendasComNomes } = useVendasData();
  
  const [filtroPeriodo, setFiltroPeriodo] = useState('month');
  const [mesCustomizado, setMesCustomizado] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITENS_POR_PAGINA = 20;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // ===================================================================
  // ==> LÓGICA UNIFICADA: Filtros de período afetam KPIs E a tabela <==
  // ===================================================================
  const dadosFiltrados = useMemo(() => {
    if (!vendasComNomes) return { kpis: { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 }, vendas: [] };

    const agora = new Date();
    let inicioPeriodo, fimPeriodo;

    if (filtroPeriodo === 'today') {
      inicioPeriodo = new Date(agora.setHours(0, 0, 0, 0));
      fimPeriodo = new Date(agora.setHours(23, 59, 59, 999));
    } else if (filtroPeriodo === 'month') {
      inicioPeriodo = new Date(agora.getFullYear(), agora.getMonth(), 1);
      fimPeriodo = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filtroPeriodo === 'custom' && mesCustomizado) {
      const [ano, mes] = mesCustomizado.split('-').map(Number);
      inicioPeriodo = new Date(ano, mes - 1, 1);
      fimPeriodo = new Date(ano, mes, 0, 23, 59, 59, 999);
    }

    // 1. Filtra TODAS as vendas pelo período selecionado (baseado na data de CRIAÇÃO)
    const vendasNoPeriodo = inicioPeriodo 
      ? vendasComNomes.filter(venda => {
          const dataVenda = new Date(venda.created_at);
          return dataVenda >= inicioPeriodo && dataVenda <= fimPeriodo;
        })
      : [...vendasComNomes]; // Para "Todo o Período"

    // 2. Calcula KPIs a partir das vendas JÁ filtradas pelo período
    const idsVendasUnicas = new Set();
    const kpis = vendasNoPeriodo.reduce((acc, venda) => {
      const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
      if (isPaga) {
        acc.faturamento += venda.valor;
        if (venda.id_parceiro) acc.comissaoAPagar += venda.valor * 0.4;
        
        const vendaUnicaId = venda.id_cobranca_principal || venda.id;
        if (!idsVendasUnicas.has(vendaUnicaId)) {
          acc.vendasConfirmadas += 1;
          idsVendasUnicas.add(vendaUnicaId);
        }
      }
      return acc;
    }, { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 });

    // 3. Filtra a lista (já filtrada por período) pelo STATUS selecionado
    let vendasParaTabela = [...vendasNoPeriodo];
    if (filtroStatus !== 'todos') {
      const statusMap = { pagos: ['CONFIRMED', 'RECEIVED'], pendentes: ['PENDING', 'AWAITING_RISK_ANALYSIS'], atrasados: ['OVERDUE'], problemas: ['REFUNDED', 'CHARGEBACK', 'CANCELLED'] };
      vendasParaTabela = vendasParaTabela.filter(v => statusMap[filtroStatus]?.includes(v.status_pagamento));
    }
    
    // 4. Ordena o resultado final
    vendasParaTabela.sort((a, b) => {
      const valA = a[sortConfig.key]; const valB = b[sortConfig.key];
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return { kpis, vendas: vendasParaTabela };
  }, [vendasComNomes, filtroPeriodo, mesCustomizado, filtroStatus, sortConfig]);

  const vendasPaginadas = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITENS_POR_PAGINA;
    return dadosFiltrados.vendas.slice(firstPageIndex, firstPageIndex + ITENS_POR_PAGINA);
  }, [dadosFiltrados.vendas, currentPage]);

  const totalPages = Math.ceil(dadosFiltrados.vendas.length / ITENS_POR_PAGINA);

  const handlePeriodoChange = (periodo) => {
    setFiltroPeriodo(periodo);
    setCurrentPage(1); // Reseta a página ao mudar o filtro
    if (periodo !== 'custom') {
      setMesCustomizado('');
    }
  };

  const handleMesCustomizadoChange = (e) => {
    setMesCustomizado(e.target.value);
    setFiltroPeriodo('custom');
    setCurrentPage(1); // Reseta a página ao mudar o filtro
  };

  const handleStatusChange = (status) => {
    setFiltroStatus(status);
    setCurrentPage(1); // Reseta a página ao mudar o filtro
  };

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
        <KpiCard title="Faturamento (Vendas Pagas)" value={formatCurrency(dadosFiltrados.kpis.faturamento)} icon="💰" />
        <KpiCard title="Comissão a Pagar (Parceiros)" value={formatCurrency(dadosFiltrados.kpis.comissaoAPagar)} icon="🏆" />
        <KpiCard title="Nº de Vendas ÚNICAS Pagas" value={dadosFiltrados.kpis.vendasConfirmadas.toString()} icon="✅" />
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
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1200px]">
                  <thead className="bg-gray-300 dark:bg-gray-700/50 border-b border-gray-400 dark:border-gray-600">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('created_at')}>Contratação {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('nome_cliente')}>Cliente {sortConfig.key === 'nome_cliente' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('nome_plano')}>Plano {sortConfig.key === 'nome_plano' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('valor')}>Valor</th>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('nome_parceiro')}>Parceiro</th>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('data_pagamento')}>Pagamento</th>
                      <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => requestSort('status_pagamento')}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendasPaginadas.map(venda => (
                      <tr key={venda.id} className="border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-300 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(venda.created_at)}</td>
                        <td className="p-4 text-gray-700 dark:text-gray-300">{venda.nome_cliente}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{venda.nome_plano}</td>
                        <td className="p-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{formatCurrency(venda.valor)}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{venda.nome_parceiro}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(venda.data_pagamento)}</td>
                        <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(venda.status_pagamento)}`}>{venda.status_pagamento}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && ( <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700"><span className="text-sm text-gray-500 dark:text-gray-400">Página {currentPage} de {totalPages}</span><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Anterior</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Próxima</button></div></div> )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma venda encontrada para os filtros selecionados.</div>
          )
        )}
      </div>
    </div>
  );
}
