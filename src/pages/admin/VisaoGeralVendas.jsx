// src/pages/admin/VisaoGeralVendas.jsx

import { useState, useMemo } from 'react';
import { useVendasData } from '@/hooks/useVendasData'; // Importando nosso novo hook!

// --- Componentes e Funções Auxiliares ---
const KpiCard = ({ title, value, icon }) => ( <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm"><div className="text-2xl md:text-3xl text-blue-500 dark:text-blue-400">{icon}</div><div className="flex-1 overflow-hidden"><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3><p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap truncate">{value}</p></div></div> );
const FilterButton = ({ label, value, activeFilter, setFilter }) => ( <button onClick={() => setFilter(value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${ activeFilter === value ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600' }`}>{label}</button> );
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatDate = (dateString) => { if (!dateString) return 'N/A'; return new Date(dateString).toLocaleDateString('pt-BR'); };
const STATUS_STYLES = { CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', RECEIVED:  'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400', PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', OVERDUE: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400', REFUNDED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', CHARGEBACK: 'bg-red-200 text-red-900 dark:bg-red-500/30 dark:text-red-300', CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300' };
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

// --- Componente Principal Simplificado ---
export default function VisaoGeralVendas() {
  const { loading, error, vendasComNomes, kpisGeral, kpisMes } = useVendasData();
  
  const [filtroData, setFiltroData] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITENS_POR_PAGINA = 15;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const vendasProcessadas = useMemo(() => {
    let filtradas = [...vendasComNomes];
    const agora = new Date();
    if (filtroData === 'today') {
      const hoje = agora.setHours(0, 0, 0, 0);
      filtradas = filtradas.filter(v => new Date(v.created_at).getTime() >= hoje);
    } else if (filtroData === 'month') {
      const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      filtradas = filtradas.filter(v => new Date(v.created_at) >= primeiroDiaMes);
    }
    filtradas.sort((a, b) => { const valA = a[sortConfig.key]; const valB = b[sortConfig.key]; if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; return 0; });
    return filtradas;
  }, [vendasComNomes, filtroData, sortConfig]);

  const kpisFiltrados = useMemo(() => {
    if (filtroData === 'month') return kpisMes;
    if (filtroData === 'all') return kpisGeral;
    
    const idsVendasUnicasContadas = new Set();
    return vendasProcessadas.reduce((acc, venda) => {
      const isPaga = venda.status_pagamento === 'CONFIRMED' || venda.status_pagamento === 'RECEIVED';
      if (isPaga) {
        acc.faturamento += venda.valor;
        if (venda.id_parceiro) acc.comissaoAPagar += venda.valor * 0.4;
      }
      const vendaId = venda.id_cobranca_principal || venda.id_pagamento;
      if (vendaId && !idsVendasUnicasContadas.has(vendaId)) {
        if (isPaga) acc.vendasConfirmadas += 1;
        idsVendasUnicasContadas.add(vendaId);
      }
      return acc;
    }, { faturamento: 0, comissaoAPagar: 0, vendasConfirmadas: 0 });
  }, [vendasProcessadas, filtroData, kpisMes, kpisGeral]);

  const vendasPaginadas = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITENS_POR_PAGINA;
    const lastPageIndex = firstPageIndex + ITENS_POR_PAGINA;
    return vendasProcessadas.slice(firstPageIndex, lastPageIndex);
  }, [vendasProcessadas, currentPage]);

  const renderContent = () => {
    if (loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando vendas...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (vendasProcessadas.length === 0 && !loading) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma venda encontrada para o período selecionado.</div>;

    const totalPages = Math.ceil(vendasProcessadas.length / ITENS_POR_PAGINA);
    const Th = ({ children, sortKey }) => ( <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-300/50 dark:hover:bg-gray-600" onClick={() => requestSort(sortKey)}>{children} {sortConfig.key === sortKey && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th> );

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-gray-400 dark:bg-gray-700/50 ">
              <tr><Th sortKey="created_at">Data</Th><Th sortKey="nome_cliente">Cliente</Th><Th sortKey="nome_plano">Plano</Th><Th sortKey="valor">Valor</Th><Th sortKey="nome_parceiro">Parceiro</Th><Th sortKey="forma_pagamento">Forma Pag.</Th><Th sortKey="data_vencimento">Vencimento</Th><Th sortKey="data_pagamento">Pagamento</Th><Th sortKey="status_pagamento">Status Pag.</Th></tr>
            </thead>
            <tbody>
              {vendasPaginadas.map(venda => (
                <tr key={venda.id} className="border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(venda.created_at)}</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{venda.nome_cliente}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{venda.nome_plano}</td>
                  <td className="p-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{formatCurrency(venda.valor)}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{venda.nome_parceiro}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 capitalize">{venda.forma_pagamento?.replace('_', ' ')?.toLowerCase() || 'N/A'}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(venda.data_vencimento)}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{venda.data_pagamento ? formatDate(venda.data_pagamento) : 'Pendente'}</td>
                  <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(venda.status_pagamento)}`}>{venda.status_pagamento}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && ( <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700"><span className="text-sm text-gray-500 dark:text-gray-400">Página {currentPage} de {totalPages}</span><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Anterior</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Próxima</button></div></div> )}
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visão Geral de Vendas</h1>
        <div className="flex gap-2">
          <FilterButton label="Hoje" value="today" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Este Mês" value="month" activeFilter={filtroData} setFilter={setFiltroData} />
          <FilterButton label="Todo o Período" value="all" activeFilter={filtroData} setFilter={setFiltroData} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="Faturamento (Vendas Pagas)" value={formatCurrency(kpisFiltrados.faturamento)} icon="💰" />
        <KpiCard title="Comissão a Pagar (Parceiros)" value={formatCurrency(kpisFiltrados.comissaoAPagar)} icon="🏆" />
        <KpiCard title="Nº de Vendas Pagas" value={kpisFiltrados.vendasConfirmadas.toString()} icon="✅" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
}
