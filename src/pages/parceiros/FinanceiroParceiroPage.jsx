// src/pages/parceiros/FinanceiroParceiroPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

// --- ÍCONES ---
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const ChatIcon = (  ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = (  ) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

// --- FUNÇÕES DE FORMATAÇÃO ---
const formatCurrency = (value) => { const numberValue = Number(value); if (isNaN(numberValue)) { return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const year = date.getUTCFullYear(); const month = date.getUTCMonth(); return new Date(year, month, 2).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); };
const formatSimpleDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };

// --- ESTILOS DE STATUS ---
const STATUS_STYLES = { PAGO_TOTAL: 'bg-green-400 text-green-800 dark:bg-green-500/20 dark:text-green-400', PAGO_PARCIAL: 'bg-blue-400 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400', PENDENTE: 'bg-yellow-400 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', DEFAULT: 'bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-gray-300' };
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

// --- COMPONENTE DetalhesVendasRow (sem alterações) ---
function DetalhesVendasRow({ fechamento, user }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendasDoMesCorretamente = async () => {
      setLoading(true);
      const mesReferencia = new Date(fechamento.mes_referencia);
      const primeiroDiaMes = new Date(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      try {
        const { data: vendasNaoParceladas, error: error1 } = await supabase.from('vendas').select('id, nome_cliente, nome_plano, valor, data_pagamento').eq('id_parceiro', user.id).in('status_pagamento', ['CONFIRMED', 'RECEIVED']).not('nome_plano', 'like', '%12x%').gte('data_pagamento', primeiroDiaMes).lte('data_pagamento', ultimoDiaMes);
        if (error1) throw new Error(`Erro ao buscar vendas não parceladas: ${error1.message}`);
        const { data: vendasParceladas, error: error2 } = await supabase.from('vendas').select('id, nome_cliente, nome_plano, valor, data_vencimento').eq('id_parceiro', user.id).in('status_pagamento', ['CONFIRMED', 'RECEIVED']).like('nome_plano', '%12x%').gte('data_vencimento', primeiroDiaMes).lte('data_vencimento', ultimoDiaMes);
        if (error2) throw new Error(`Erro ao buscar vendas parceladas: ${error2.message}`);
        const todasAsVendas = [ ...(vendasNaoParceladas || []).map(v => ({ ...v, data_competencia: v.data_pagamento })), ...(vendasParceladas || []).map(v => ({ ...v, data_competencia: v.data_vencimento })) ];
        todasAsVendas.sort((a, b) => new Date(a.data_competencia) - new Date(b.data_competencia));
        setVendas(todasAsVendas);
      } catch (error) { console.error("Erro ao buscar vendas do extrato do parceiro:", error); setVendas([]); } 
      finally { setLoading(false); }
    };
    fetchVendasDoMesCorretamente();
  }, [fechamento, user.id]);

  // O conteúdo desta linha expansível não precisa ser responsivo, pois já é bem formatado.
  return (
    <tr className="bg-gray-300 dark:bg-gray-900/50 md:table-row hidden">
      <td colSpan="5" className="p-4 space-y-4">
        {fechamento.observacoes && ( <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"> <h4 className="font-bold text-md mb-2 text-gray-800 dark:text-white">Observações:</h4> <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{fechamento.observacoes}</p> </div> )}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
          <h4 className="font-bold text-md mb-3 text-gray-800 dark:text-white">Vendas Inclusas neste Fechamento</h4>
          {loading ? ( <p className="text-gray-500">Carregando detalhes...</p> ) : vendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-900 dark:text-gray-400"><tr><th className="py-2 px-3">Cliente</th><th className="py-2 px-3">Plano</th><th className="py-2 px-3 text-right">Valor da Venda</th><th className="py-2 px-3 text-right">Sua Comissão (40%)</th><th className="py-2 px-3 text-right">Data de Competência</th></tr></thead>
                <tbody>
                  {vendas.map(venda => ( <tr key={venda.id} className="border-t border-gray-300 dark:border-gray-700"> <td className="py-2 px-3">{venda.nome_cliente}</td> <td className="py-2 px-3">{venda.nome_plano}</td> <td className="py-2 px-3 text-right">{formatCurrency(venda.valor)}</td> <td className="py-2 px-3 text-right font-semibold text-green-600">{formatCurrency(venda.valor * 0.4)}</td> <td className="py-2 px-3 text-right">{formatSimpleDate(venda.data_competencia)}</td> </tr> ))}
                </tbody>
              </table>
            </div>
          ) : ( <p className="text-gray-500">Nenhuma venda encontrada para este período.</p> )}
        </div>
      </td>
    </tr>
  );
}

export default function FinanceiroParceiroPage() {
  const { user } = useOutletContext();
  const [fechamentos, setFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    const fetchFechamentosParceiro = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from('fechamentos').select('*').eq('id_parceiro', user.id).order('mes_referencia', { ascending: false });
        if (error) throw error;
        setFechamentos(data || []);
      } catch (err) { console.error("Erro ao buscar dados financeiros do parceiro:", err); setError("Não foi possível carregar seu histórico financeiro."); } 
      finally { setLoading(false); }
    };
    fetchFechamentosParceiro();
  }, [user]);

  const toggleRowExpansion = (id) => { setExpandedRowId(expandedRowId === id ? null : id); };

  if (loading) return <div className="p-8">Carregando seu histórico financeiro...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Meu Financeiro</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {/* Tabela para Desktop */}
          <table className="w-full text-left hidden md:table">
            <thead className="bg-gray-400 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Mês de Referência</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Sua Comissão</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Valor Recebido</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.length > 0 ? fechamentos.map(f => (
                <React.Fragment key={f.id}>
                  <tr className="border-t border-gray-400 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(f.mes_referencia)}</td>
                    <td className="p-4 font-semibold text-black dark:text-white">{formatCurrency(f.valor_comissao_bruta)}</td>
                    <td className="p-4 font-semibold text-green-600 dark:text-green-400">{f.valor_pago ? formatCurrency(f.valor_pago) : '-'}</td>
                    <td className="p-4"> <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(f.status_pagamento)}`}> {f.status_pagamento.replace('_', ' ')} </span> </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleRowExpansion(f.id)} title="Ver Extrato Detalhado" className={`p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform ${expandedRowId === f.id ? 'rotate-180' : ''}`}> <ChevronDownIcon /> </button>
                        {f.url_comprovante && ( <a href={f.url_comprovante} target="_blank" rel="noopener noreferrer" title="Ver Comprovante" className="text-blue-500 hover:text-blue-400"> <EyeIcon /> </a> )}
                        {f.observacoes && ( <span title={f.observacoes} className="cursor-help text-gray-500 hover:text-gray-400"><ChatIcon /></span> )}
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === f.id && <DetalhesVendasRow fechamento={f} user={user} />}
                </React.Fragment>
              )) : ( <tr> <td colSpan="5" className="text-center p-8 text-gray-500">Nenhum registro financeiro encontrado.</td> </tr> )}
            </tbody>
          </table>

          {/* Lista de Cartões para Mobile */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
            {fechamentos.length > 0 ? fechamentos.map(f => (
              <div key={f.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{formatDate(f.mes_referencia)}</p>
                    <span className={`mt-1 px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(f.status_pagamento)}`}>
                      {f.status_pagamento.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-green-600 dark:text-green-400">{f.valor_pago ? formatCurrency(f.valor_pago) : formatCurrency(f.valor_comissao_bruta)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.valor_pago ? 'Recebido' : 'Comissão'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {f.observacoes && ( <span title={f.observacoes} className="cursor-help text-gray-500 hover:text-gray-400"><ChatIcon /></span> )}
                  {f.url_comprovante && ( <a href={f.url_comprovante} target="_blank" rel="noopener noreferrer" title="Ver Comprovante" className="text-blue-500 hover:text-blue-400"> <EyeIcon /> </a> )}
                  <button onClick={() => toggleRowExpansion(f.id)} title="Ver Extrato Detalhado" className="flex items-center gap-1 text-sm text-blue-500 font-semibold">
                    <span>Detalhes</span>
                    <ChevronDownIcon />
                  </button>
                </div>
                {/* A linha de detalhes expansível é renderizada aqui, mas visível apenas no mobile */}
                {expandedRowId === f.id && (
                  <div className="mt-2">
                    <DetalhesVendasRow fechamento={f} user={user} />
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center p-8 text-gray-500">Nenhum registro financeiro encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
