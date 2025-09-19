import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';

// --- Componentes e Funções Auxiliares ---
const TAXA_COMISSAO = 0.4;
const StatCard = ({ title, value, icon }) => ( <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-400 dark:border-gray-600 flex items-center gap-4"><div className="text-3xl">{icon}</div><div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div></div> );
const formatSimpleDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };

const STATUS_STYLES = { 'Pendente': 'bg-yellow-300 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', 'Atrasado': 'bg-red-400 text-red-800 dark:bg-red-500/20 dark:text-red-400', 'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400', 'Com Problema': 'bg-red-200 text-red-900 dark:bg-red-500/30 dark:text-red-300', 'Default': 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300' };
const STATUS_TRANSLATIONS = { 'PENDING': 'Pendente', 'OVERDUE': 'Atrasado', 'AWAITING_RISK_ANALYSIS': 'Pendente', 'REFUNDED': 'Cancelado', 'CHARGEBACK': 'Com Problema', 'CANCELLED': 'Cancelado' };
const getStatusInfo = (status) => { const translated = STATUS_TRANSLATIONS[status] || 'Outro'; return { translated, style: STATUS_STYLES[translated] || STATUS_STYLES.Default }; };

export default function OportunidadesPage() {
  const { user } = useOutletContext(); 
  const { loading, error, vendas } = usePartnerData(user?.id);

  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITENS_POR_PAGINA = 20;

  const oportunidades = useMemo(() => {
    return vendas.filter(venda => 
      venda.status_pagamento !== 'CONFIRMED' && venda.status_pagamento !== 'RECEIVED'
    );
  }, [vendas]);

  const kpis = useMemo(() => {
    return oportunidades.reduce((acc, venda) => {
      acc.comissaoTotal += venda.valor * TAXA_COMISSAO;
      return acc;
    }, { comissaoTotal: 0 });
  }, [oportunidades]);

  const requestSort = (key) => { 
    let direction = 'asc'; 
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; 
    setSortConfig({ key, direction }); 
    setCurrentPage(1);
  };

  const oportunidadesProcessadas = useMemo(() => {
    return [...oportunidades]
      .filter(venda => {
        if (filtroStatus === 'todos') return true;
        const statusTraduzido = getStatusInfo(venda.status_pagamento).translated.toLowerCase().replace(' ', '-');
        return filtroStatus === statusTraduzido;
      })
      .sort((a, b) => { 
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; 
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; 
        return 0; 
      });
  }, [oportunidades, filtroStatus, sortConfig]);

  const oportunidadesPaginadas = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITENS_POR_PAGINA;
    return oportunidadesProcessadas.slice(firstPageIndex, firstPageIndex + ITENS_POR_PAGINA);
  }, [oportunidadesProcessadas, currentPage]);

  const totalPages = Math.ceil(oportunidadesProcessadas.length / ITENS_POR_PAGINA);

  if (loading) return <div className="p-8"><p className="text-gray-700 dark:text-gray-300">Carregando suas oportunidades...</p></div>;
  if (error) return <div className="p-8"><p className="text-red-500">{error}</p></div>;

  const Th = ({ children, sortKey }) => ( <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort(sortKey)}>{children} {sortConfig.key === sortKey && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th> );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Oportunidades</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard title="Total de Oportunidades" value={oportunidadesProcessadas.length} icon="🎯" />
        <StatCard title="Comissão 'Congelada'" value={formatCurrency(kpis.comissaoTotal)} icon="❄️" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Leads para Remarketing</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1 mb-6">Clientes que tentaram comprar mas não concluíram o pagamento. Entre em contato para recuperar a venda!</p>
        
        <div className="flex flex-wrap gap-3 my-4">
          <button onClick={() => setFiltroStatus('todos')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'todos' ? 'bg-blue-500 text-white border-blue-400' : 'bg-transparent dark:bg-gray-700'}`}>Todos</button>
          <button onClick={() => setFiltroStatus('pendente')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'pendente' ? 'bg-yellow-500 text-white border-yellow-400' : 'bg-transparent dark:bg-gray-700'}`}>Pendentes</button>
          <button onClick={() => setFiltroStatus('atrasado')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'atrasado' ? 'bg-orange-500 text-white border-orange-400' : 'bg-transparent dark:bg-gray-700'}`}>Atrasados</button>
          <button onClick={() => setFiltroStatus('cancelado')} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${filtroStatus === 'cancelado' ? 'bg-red-500 text-white border-red-400' : 'bg-transparent dark:bg-gray-700'}`}>Cancelados</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <Th sortKey="created_at">Data</Th>
                <Th sortKey="nome_cliente">Cliente</Th>
                <th scope="col" className="px-6 py-3">Contato</th>
                <Th sortKey="nome_plano">Plano Desejado</Th>
                <th scope="col" className="px-6 py-3 font-bold text-yellow-600 dark:text-yellow-400">Comissão</th>
                <Th sortKey="data_vencimento">Vencimento</Th>
                <Th sortKey="status_pagamento">Status</Th>
              </tr>
            </thead>
            <tbody>
              {oportunidadesPaginadas.length > 0 ? ( 
                oportunidadesPaginadas.map((venda) => {
                  const statusInfo = getStatusInfo(venda.status_pagamento);
                  return (
                    <tr key={venda.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap">{formatSimpleDate(venda.created_at)}</td>
                      <td className="px-6 py-4 font-medium text-black dark:text-white">{venda.nome_cliente}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{venda.email_cliente || 'Não informado'}</span>
                          <span className="text-xs text-black">{venda.telefone_cliente || ''}</span>
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
                <tr><td colSpan="7" className="text-center py-10 px-6">Nenhuma oportunidade encontrada. Parabéns, todas as suas vendas foram pagas!</td></tr> 
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-300 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50">Anterior</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
