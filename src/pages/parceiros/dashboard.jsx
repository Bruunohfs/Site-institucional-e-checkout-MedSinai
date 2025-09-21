// src/pages/partner/DashboardPage.jsx

import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usePartnerData } from '@/hooks/usePartnerData';

// --- Componentes de UI e Funções Auxiliares ---
const TAXA_COMISSAO = 0.4;
const StatCard = ({ title, value, icon }) => ( <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 flex items-center gap-4"><div className="text-3xl">{icon}</div><div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div></div> );
const CopyableInput = ({ textToCopy }) => { const [copied, setCopied] = useState(false); const handleCopy = () => { if (!textToCopy || copied) return; navigator.clipboard.writeText(textToCopy).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(err => console.error('Falha ao copiar texto: ', err)); }; const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM5 1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5v-1z"/></svg>; const CheckIcon = (      ) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>; return ( <div className="relative flex items-center w-full"><input type="text" readOnly value={textToCopy || 'Não definido'} className="w-full p-2 pr-24 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200" /><button onClick={handleCopy} disabled={!textToCopy} className={`absolute right-1.5 px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${ copied ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50' }`}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? 'Copiado!' : 'Copiar'}</button></div>      ); };
const formatSimpleDate = (dateString) => { if (!dateString) return 'Pendente'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };
const formatCurrency = (value) => { if (typeof value !== 'number') return 'R$ 0,00'; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };

export default function DashboardPage() {
  const { user } = useOutletContext(); 
  const { loading, error, vendas } = usePartnerData(user?.id);

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

  const Th = ({ children, sortKey }) => ( <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => requestSort(sortKey)}>{children} {sortConfig.key === sortKey && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th> );

  return (
    <div className="notranslate">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Minhas Comissões Aprovadas</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => handlePeriodoClick('today')} className={`px-3 py-1.5 text-sm rounded-md ${filtroPeriodo === 'today' ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>Hoje</button>
            <button onClick={() => handlePeriodoClick('month')} className={`px-3 py-1.5 text-sm rounded-md ${filtroPeriodo === 'month' ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>Mês Atual</button>
            <button onClick={() => handlePeriodoClick('all')} className={`px-3 py-1.5 text-sm rounded-md ${filtroPeriodo === 'all' ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>Todo o Período</button>
            <select id="month-selector" value={filtroPeriodo.match(/^\d{4}-\d{2}$/) ? filtroPeriodo : 'default'} onChange={(e) => setFiltroPeriodo(e.target.value)} className="px-3 py-1.5 text-sm rounded-md bg-gray-300 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <option value="default" disabled>Selecione um Mês</option>
              {mesesDisponiveis.map(mes => ( <option key={mes} value={mes}> {new Date(mes + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} </option> ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 ">
          <StatCard title="Vendas Pagas (Período)" value={kpis.vendasPagasPeriodo} icon="✅" />
          <StatCard title="Comissão Aprovada (Período)" value={formatCurrency(kpis.comissaoAprovadaPeriodo)} icon="💰" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="p-5 bg-green-50 dark:bg-gray-700/50 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seu Link de Parceiro</h2><p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">Compartilhe para rastrear suas vendas.</p><CopyableInput textToCopy={`https://www.medsinai.com.br/?pid=${user?.id}`} /></div>
            <div className="p-5 bg-green-50 dark:bg-gray-700/50 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seu Cupom de Desconto</h2><p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-2">Ofereça aos seus clientes no checkout.</p><CopyableInput textToCopy={user?.user_metadata?.cupom} /></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Detalhes das Comissões Aprovadas</h2>
          
          {/* =================================================================== */}
          {/* ==> A MÁGICA DA RESPONSIVIDADE ACONTECE AQUI <== */}
          {/* =================================================================== */}
          <div className="overflow-x-auto">
            {/* Tabela para Desktop */}
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 hidden md:table">
              <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <Th sortKey="data_competencia">Data de Competência</Th>
                  <Th sortKey="nome_cliente">Cliente</Th>
                  <Th sortKey="nome_plano">Plano</Th>
                  <Th sortKey="valor">Valor da Venda</Th>
                  <th scope="col" className="px-6 py-3 font-bold text-green-600 dark:text-green-400">Sua Comissão</th>
                  <Th sortKey="created_at">Data da Contratação</Th>
                </tr>
              </thead>
              <tbody>
                {vendasPaginadas.length > 0 ? ( 
                  vendasPaginadas.map((venda ) => (
                    <tr key={venda.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{formatSimpleDate(venda.data_competencia)}</td>
                      <td className="px-6 py-4">{venda.nome_cliente}</td>
                      <td className="px-6 py-4">{venda.nome_plano}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(venda.valor)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600 dark:text-green-400">{formatCurrency(venda.valor * TAXA_COMISSAO)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatSimpleDate(venda.created_at)}</td>
                    </tr> 
                  )) 
                ) : ( 
                  <tr><td colSpan="6" className="text-center py-10 px-6">Nenhuma comissão aprovada encontrada para o período selecionado.</td></tr> 
                )}
              </tbody>
            </table>

            {/* Lista de Cartões para Mobile */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
              {vendasPaginadas.length > 0 ? (
                vendasPaginadas.map(venda => (
                  <div key={venda.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{venda.nome_cliente}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{venda.nome_plano}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(venda.valor * TAXA_COMISSAO)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Comissão</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                <div className="text-center py-10 px-6">Nenhuma comissão aprovada encontrada para o período selecionado.</div>
              )}
            </div>
          </div>
          
          {totalPages > 1 && ( <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700"> <span className="text-sm text-gray-500 dark:text-gray-400"> Página {currentPage} de {totalPages} </span> <div className="flex gap-2"> <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Anterior</button> <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600">Próxima</button> </div> </div> )}
        </div>
      </div>
    </div>
  );
}
