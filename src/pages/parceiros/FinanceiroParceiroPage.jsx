// src/pages/parceiros/FinanceiroParceiroPage.jsx - ATUALIZADO COM DESIGN PROFISSIONAL

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
// ==> ATUALIZAÇÃO 1: Importando ícones da Lucide <==
import { Eye, MessageSquare, ChevronDown, Wallet, Landmark, CircleHelp } from 'lucide-react';

// --- FUNÇÕES DE FORMATAÇÃO ---
const formatCurrency = (value) => { const numberValue = Number(value); if (isNaN(numberValue)) { return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const year = date.getUTCFullYear(); const month = date.getUTCMonth(); return new Date(year, month, 2).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); };
const formatSimpleDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };

// --- ESTILOS DE STATUS ---
const STATUS_STYLES = { PAGO_TOTAL: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', PAGO_PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', PENDENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;

// --- COMPONENTE DetalhesVendas (Agora um componente separado e mais inteligente) ---
function DetalhesVendas({ fechamento, user }) {
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

  // ==> ATUALIZAÇÃO 2: O conteúdo dos detalhes agora é um card bem formatado <==
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
      {fechamento.observacoes && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg mb-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <CircleHelp className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-200">Observações do Financeiro:</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap mt-1">{fechamento.observacoes}</p>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <h4 className="font-semibold text-md mb-3 text-gray-800 dark:text-white">Vendas Inclusas neste Fechamento</h4>
        {loading ? ( <p className="text-sm text-gray-500">Carregando detalhes...</p> ) : vendas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"><tr className="border-b border-gray-300 dark:border-gray-600"><th className="py-2 px-3">Cliente</th><th className="py-2 px-3">Plano</th><th className="py-2 px-3 text-right">Comissão</th><th className="py-2 px-3 text-right">Data</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vendas.map(venda => ( <tr key={venda.id}> <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{venda.nome_cliente}</td> <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{venda.nome_plano}</td> <td className="py-2 px-3 text-right font-semibold text-green-600">{formatCurrency(venda.valor * 0.4)}</td> <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">{formatSimpleDate(venda.data_competencia)}</td> </tr> ))}
              </tbody>
            </table>
          </div>
        ) : ( <p className="text-sm text-gray-500">Nenhuma venda encontrada para este período.</p> )}
      </div>
    </div>
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

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando seu histórico financeiro...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <title>Financeiro | Portal do Parceiro MedSinai</title>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Meu Financeiro</h1>
      
      {/* ==> ATUALIZAÇÃO 3: Tabela e lista envolvidas em um card principal <== */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {/* Tabela para Desktop */}
          <table className="w-full text-left hidden md:table">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4">Mês de Referência</th>
                <th className="p-4">Sua Comissão</th>
                <th className="p-4">Valor Recebido</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fechamentos.length > 0 ? fechamentos.map(f => (
                <React.Fragment key={f.id}>
                  <tr>
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(f.mes_referencia)}</td>
                    <td className="p-4 font-semibold text-gray-800 dark:text-white">{formatCurrency(f.valor_comissao_bruta)}</td>
                    <td className="p-4 font-semibold text-green-600 dark:text-green-400">{f.valor_pago ? formatCurrency(f.valor_pago) : '-'}</td>
                    <td className="p-4"> <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(f.status_pagamento)}`}> {f.status_pagamento.replace('_', ' ')} </span> </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleRowExpansion(f.id)} title="Ver Extrato Detalhado" className={`p-2 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform ${expandedRowId === f.id ? 'rotate-180' : ''}`}> <ChevronDown size={16} /> </button>
                        {f.url_comprovante && ( <a href={f.url_comprovante} target="_blank" rel="noopener noreferrer" title="Ver Comprovante" className="p-2 rounded-md text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700"> <Eye size={16} /> </a> )}
                        {f.observacoes && ( <div title={f.observacoes} className="p-2 rounded-md cursor-help text-yellow-500"> <MessageSquare size={16} /> </div> )}
                      </div>
                    </td>
                  </tr>
                  {/* ==> ATUALIZAÇÃO 4: Lógica de renderização da linha expansível simplificada <== */}
                  {expandedRowId === f.id && (
                    <tr className="bg-gray-100 dark:bg-gray-900/50">
                      <td colSpan="5" className="p-0"><DetalhesVendas fechamento={f} user={user} /></td>
                    </tr>
                  )}
                </React.Fragment>
              )) : ( <tr> <td colSpan="5" className="text-center p-10 text-gray-500">Nenhum registro financeiro encontrado.</td> </tr> )}
            </tbody>
          </table>

          {/* Lista de Cartões para Mobile */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
            {fechamentos.length > 0 ? fechamentos.map(f => (
              <div key={f.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{formatDate(f.mes_referencia)}</p>
                    <span className={`mt-1 inline-block px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(f.status_pagamento)}`}>
                      {f.status_pagamento.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-green-600 dark:text-green-400">{f.valor_pago ? formatCurrency(f.valor_pago) : formatCurrency(f.valor_comissao_bruta)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.valor_pago ? 'Recebido' : 'Comissão Bruta'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {f.observacoes && ( <div title={f.observacoes} className="cursor-help text-yellow-500"> <MessageSquare size={18} /> </div> )}
                  {f.url_comprovante && ( <a href={f.url_comprovante} target="_blank" rel="noopener noreferrer" title="Ver Comprovante" className="text-blue-500"> <Eye size={18} /> </a> )}
                  <button onClick={() => toggleRowExpansion(f.id)} className={`flex items-center gap-1 text-sm font-semibold ${expandedRowId === f.id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Detalhes</span>
                    <ChevronDown size={16} className={`transition-transform transform ${expandedRowId === f.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {/* ==> ATUALIZAÇÃO 5: Detalhes renderizados dentro do card no mobile <== */}
                {expandedRowId === f.id && <DetalhesVendas fechamento={f} user={user} />}
              </div>
            )) : (
              <div className="text-center p-10 text-gray-500">Nenhum registro financeiro encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
