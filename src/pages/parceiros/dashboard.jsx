// src/pages/parceiros/DashboardPage.jsx - ATUALIZADO COM DESIGN PROFISSIONAL

import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';
// ==> ATUALIZAÇÃO 1: Importando os ícones da Lucide <==
import { DollarSign, ShoppingCart, Link, Ticket, Copy, Check, ArrowDownUp } from 'lucide-react';

// --- Constantes e Funções Auxiliares ---
const TAXA_COMISSAO = 0.4;
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatSimpleDate = (dateString) => { if (!dateString) return 'Pendente'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };

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

// ==> ATUALIZAÇÃO 3: Componente CopyableInput com novo design <==
const CopyableInput = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!textToCopy || copied) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Falha ao copiar texto: ', err));
  };
  return (
    <div className="relative flex items-center w-full mt-2">
      <input type="text" readOnly value={textToCopy || 'Não definido'} className="w-full p-2 pr-24 border border-gray-600 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 rounded-md text-sm text-gray-700 dark:text-gray-200" />
      <button onClick={handleCopy} disabled={!textToCopy} className={`absolute right-1.5 px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50'}`}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  );
};

// ==> ATUALIZAÇÃO 4: Componente FilterButton com novo design <==
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

// ==> ATUALIZAÇÃO 5: Componente SortableHeader com ícone melhor <==
const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => {
  const isSorted = sortConfig.key === sortKey;
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50" onClick={() => requestSort(sortKey)}>
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


export default function DashboardPage() {
  const { user } = useOutletContext(); 
  const { loading, error, vendas } = usePartnerData(user?.id);

  // Lógica de estado e filtros (sem alterações)
  const [sortConfig, setSortConfig] = useState({ key: 'data_competencia', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITENS_POR_PAGINA = 15;
  const [filtroPeriodo, setFiltroPeriodo] = useState('month');
  
  const mesesDisponiveis = useMemo(() => { if (!vendas || vendas.length === 0) return []; const meses = new Set(); vendas.forEach(venda => { if (venda.status_pagamento !== 'CONFIRMED' && venda.status_pagamento !== 'RECEIVED') return; const isParcelada12x = venda.nome_plano && venda.nome_plano.includes('12x'); const dataCompetencia = isParcelada12x ? venda.data_vencimento : venda.data_pagamento; if (dataCompetencia) { meses.add(new Date(dataCompetencia).toISOString().slice(0, 7)); } }); return Array.from(meses).sort().reverse(); }, [vendas]);
  const { dataInicio, dataFim } = useMemo(() => { const agora = new Date(); let inicio, fim; if (filtroPeriodo === 'today') { inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()); fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999); } else if (filtroPeriodo === 'month') { inicio = new Date(agora.getFullYear(), agora.getMonth(), 1); fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999); } else if (filtroPeriodo.match(/^\d{4}-\d{2}$/)) { const [ano, mes] = filtroPeriodo.split('-').map(Number); inicio = new Date(ano, mes - 1, 1); fim = new Date(ano, mes, 0, 23, 59, 59, 999); } else { inicio = new Date(0); fim = new Date(8640000000000000); } return { dataInicio: inicio, dataFim: fim }; }, [filtroPeriodo]);

  const vendasProcessadas = useMemo(() => { const vendasComCompetencia = vendas.map(v => { const isParcelada12x = v.nome_plano && v.nome_plano.includes('12x'); return { ...v, data_competencia: isParcelada12x ? v.data_vencimento : v.data_pagamento }; }); return vendasComCompetencia.filter(venda => { if (venda.status_pagamento !== 'CONFIRMED' && venda.status_pagamento !== 'RECEIVED') { return false; } if (!venda.data_competencia) return filtroPeriodo === 'all'; const dataComp = new Date(venda.data_competencia); const dataCompSemHora = new Date(dataComp.getUTCFullYear(), dataComp.getUTCMonth(), dataComp.getUTCDate()); return dataCompSemHora >= dataInicio && dataCompSemHora <= dataFim; }).sort((a, b) => { const valA = a[sortConfig.key]; const valB = b[sortConfig.key]; if (valA === null || valA === undefined) return 1; if (valB === null || valB === undefined) return -1; if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; return 0; }); }, [vendas, sortConfig, dataInicio, dataFim]);
  const kpis = useMemo(() => { const idsVendasUnicas = new Set(); let comissaoTotal = 0; vendasProcessadas.forEach(venda => { comissaoTotal += venda.valor * TAXA_COMISSAO; const vendaId = venda.id_cobranca_principal || venda.id_pagamento || venda.id; if (vendaId) { idsVendasUnicas.add(vendaId); } }); return { comissaoAprovadaPeriodo: comissaoTotal, vendasPagasPeriodo: idsVendasUnicas.size, }; }, [vendasProcessadas]);

  const requestSort = (key) => { let direction = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'; setSortConfig({ key, direction }); setCurrentPage(1); };
  const vendasPaginadas = useMemo(() => { const firstPageIndex = (currentPage - 1) * ITENS_POR_PAGINA; return vendasProcessadas.slice(firstPageIndex, firstPageIndex + ITENS_POR_PAGINA); }, [vendasProcessadas, currentPage]);
  const totalPages = Math.ceil(vendasProcessadas.length / ITENS_POR_PAGINA);
  const handlePeriodoClick = (periodo) => { setFiltroPeriodo(periodo); const select = document.getElementById('month-selector'); if (select) select.value = 'default'; };

  if (loading) return <div className="p-8"><p className="text-gray-700 dark:text-gray-300">Carregando seus dados...</p></div>;
  if (error) return <div className="p-8"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="notranslate p-4 sm:p-6 lg:p-8 space-y-6">
      <title>Dashboard | Portal do Parceiro MedSinai</title>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Minhas Comissões Aprovadas</h1>
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton label="Hoje" onClick={() => handlePeriodoClick('today')} isActive={filtroPeriodo === 'today'} />
          <FilterButton label="Mês Atual" onClick={() => handlePeriodoClick('month')} isActive={filtroPeriodo === 'month'} />
          <FilterButton label="Todo o Período" onClick={() => handlePeriodoClick('all')} isActive={filtroPeriodo === 'all'} />
          <select id="month-selector" value={filtroPeriodo.match(/^\d{4}-\d{2}$/) ? filtroPeriodo : 'default'} onChange={(e) => setFiltroPeriodo(e.target.value)} className="px-3 py-1.5 text-sm rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500">
            <option value="default" disabled>Selecione um Mês</option>
            {mesesDisponiveis.map(mes => ( <option key={mes} value={mes}> {new Date(mes + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} </option> ))}
          </select>
        </div>
      </div>
      
      {/* ==> ATUALIZAÇÃO 6: KPIs com novo design e ícones <== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <KpiCard title="Vendas Pagas (Período)" value={kpis.vendasPagasPeriodo} icon={<ShoppingCart size={24} />} colorClass="text-blue-500" />
        <KpiCard title="Comissão Aprovada (Período)" value={formatCurrency(kpis.comissaoAprovadaPeriodo)} icon={<DollarSign size={24} />} colorClass="text-green-500" />
      </div>

      {/* ==> ATUALIZAÇÃO 7: Card principal com novo estilo <== */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-400 dark:border-gray-700 shadow-sm">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700"><div className="flex items-center gap-2 mb-1"><Link size={16} className="text-gray-600 dark:text-gray-400" /><h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Seu Link de Parceiro</h2></div><p className="text-xs text-gray-600 dark:text-gray-400">Compartilhe para rastrear suas vendas.</p><CopyableInput textToCopy={`https://www.medsinai.com.br/?pid=${user?.id}`} /></div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700"><div className="flex items-center gap-2 mb-1"><Ticket size={16} className="text-gray-600 dark:text-gray-400" /><h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Seu Cupom de Desconto</h2></div><p className="text-xs text-gray-600 dark:text-gray-400">Ofereça aos seus clientes no checkout.</p><CopyableInput textToCopy={user?.user_metadata?.cupom} /></div>
        </div>
        
        <div className="px-6 pb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Detalhes das Comissões Aprovadas</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 hidden md:table">
            <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <SortableHeader sortKey="data_competencia" sortConfig={sortConfig} requestSort={requestSort}>Data de Competência</SortableHeader>
                <SortableHeader sortKey="nome_cliente" sortConfig={sortConfig} requestSort={requestSort}>Cliente</SortableHeader>
                <SortableHeader sortKey="nome_plano" sortConfig={sortConfig} requestSort={requestSort}>Plano</SortableHeader>
                <SortableHeader sortKey="valor" sortConfig={sortConfig} requestSort={requestSort}>Valor da Venda</SortableHeader>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Sua Comissão</th>
                <SortableHeader sortKey="created_at" sortConfig={sortConfig} requestSort={requestSort}>Data da Contratação</SortableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
              {vendasPaginadas.length > 0 ? ( 
                vendasPaginadas.map((venda ) => (
                  <tr key={venda.id} className="hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{formatSimpleDate(venda.data_competencia)}</td>
                    <td className="px-6 py-4">{venda.nome_cliente}</td>
                    <td className="px-6 py-4">{venda.nome_plano}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(venda.valor)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600 dark:text-green-400">{formatCurrency(venda.valor * TAXA_COMISSAO)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatSimpleDate(venda.created_at)}</td>
                  </tr> 
                )) 
              ) : ( 
                <tr><td colSpan="6" className="text-center py-16 px-6 text-gray-500">Nenhuma comissão aprovada encontrada para o período selecionado.</td></tr> 
              )}
            </tbody>
          </table>

          <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
            {vendasPaginadas.length > 0 ? (
              vendasPaginadas.map(venda => (
                <div key={venda.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{venda.nome_cliente}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{venda.nome_plano}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(venda.valor * TAXA_COMISSAO)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Comissão</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                    <div className="text-gray-500 dark:text-gray-400">Competência:</div>
                    <div className="font-medium text-gray-700 dark:text-gray-300 text-right">{formatSimpleDate(venda.data_competencia)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Valor da Venda:</div>
                    <div className="text-gray-700 dark:text-gray-300 text-right">{formatCurrency(venda.valor)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Contratação:</div>
                    <div className="text-gray-700 dark:text-gray-300 text-right">{formatSimpleDate(venda.created_at)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 px-6 text-gray-500">Nenhuma comissão aprovada encontrada.</div>
            )}
          </div>
        </div>
        
        {totalPages > 1 && ( <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700"> <span className="text-sm text-gray-600 dark:text-gray-400"> Página {currentPage} de {totalPages} </span> <div className="flex gap-2"> <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50">Anterior</button> <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50">Próxima</button> </div> </div> )}
      </div>
    </div>
  );
}
