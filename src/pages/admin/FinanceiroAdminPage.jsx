import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import RegistrarPagamentoModal from './RegistrarPagamentoModal';
import { useNotification } from '@/components/notifications/NotificationContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

// --- ÍCONES ---
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = (  ) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

// --- FUNÇÕES DE FORMATAÇÃO E ESTILO ---
const STATUS_STYLES = {
  PAGO_TOTAL: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  PAGO_PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  PENDENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;
const formatCurrency = (value) => {
  const numberValue = Number(value);
  if (isNaN(numberValue)) return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return new Date(year, month, 2).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};
const formatSimpleDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
};

// ===================================================================
// ==> NOVO COMPONENTE RESPONSIVO: FechamentoRow <==
// ===================================================================
function FechamentoRow({ fechamento, onOpenModal, onToggleDetails, isExpanded, renderAs }) {
  
  // RENDERIZAÇÃO COMO CARD (MOBILE)
  if (renderAs === 'card') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">{fechamento.profiles?.nome_completo || 'Parceiro não encontrado'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(fechamento.mes_referencia)}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(fechamento.status_pagamento)}`}>
            {fechamento.status_pagamento.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Comissão Bruta</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(fechamento.valor_comissao_bruta)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Valor Pago</p>
            <p className="font-semibold text-green-600 dark:text-green-400">{fechamento.valor_pago ? formatCurrency(fechamento.valor_pago) : '-'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onToggleDetails} className="flex-1 text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg">
            {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </button>
          {fechamento.status_pagamento !== 'PAGO_TOTAL' && (
            <button onClick={onOpenModal} className="flex-1 text-center py-2 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              {fechamento.status_pagamento === 'PENDENTE' ? 'Registrar' : 'Gerenciar'}
            </button>
          )}
        </div>
        {isExpanded && <DetalhesRow fechamento={fechamento} isMobile={true} />}
      </div>
    );
  }

  // RENDERIZAÇÃO COMO LINHA (DESKTOP)
  return (
    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
      <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(fechamento.mes_referencia)}</td>
      <td className="p-4 text-gray-600 dark:text-gray-300">{fechamento.profiles?.nome_completo || 'Parceiro não encontrado'}</td>
      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(fechamento.valor_comissao_bruta)}</td>
      <td className="p-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{fechamento.valor_pago ? formatCurrency(fechamento.valor_pago) : '-'}</td>
      <td className="p-4">
        <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(fechamento.status_pagamento)}`}>
          {fechamento.status_pagamento.replace('_', ' ')}
        </span>
      </td>
      <td className="p-4">
        <button onClick={onToggleDetails} title="Ver Detalhes" className={`p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </button>
      </td>
      <td className="p-4">
        {fechamento.status_pagamento !== 'PAGO_TOTAL' ? (
          <button onClick={onOpenModal} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors">
            {fechamento.status_pagamento === 'PENDENTE' ? 'Registrar' : 'Gerenciar'}
          </button>
        ) : <span className="text-sm text-gray-500 dark:text-gray-400">Quitado</span>}
      </td>
    </tr>
  );
}

// --- COMPONENTE DetalhesRow ---
function DetalhesRow({ fechamento, isMobile }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendasDoMesCorretamente = async () => {
      setLoading(true);
      const mesReferencia = new Date(fechamento.mes_referencia);
      const primeiroDiaMes = new Date(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      try {
        const { data: vendasNaoParceladas, error: error1 } = await supabase.from('vendas').select('id, nome_cliente, nome_plano, valor, data_pagamento').eq('id_parceiro', fechamento.id_parceiro).in('status_pagamento', ['CONFIRMED', 'RECEIVED']).not('nome_plano', 'like', '%12x%').gte('data_pagamento', primeiroDiaMes).lte('data_pagamento', ultimoDiaMes);
        if (error1) throw new Error(`Erro ao buscar vendas não parceladas: ${error1.message}`);
        const { data: vendasParceladas, error: error2 } = await supabase.from('vendas').select('id, nome_cliente, nome_plano, valor, data_vencimento').eq('id_parceiro', fechamento.id_parceiro).in('status_pagamento', ['CONFIRMED', 'RECEIVED']).like('nome_plano', '%12x%').gte('data_vencimento', primeiroDiaMes).lte('data_vencimento', ultimoDiaMes);
        if (error2) throw new Error(`Erro ao buscar vendas parceladas: ${error2.message}`);
        const todasAsVendas = [...(vendasNaoParceladas || []).map(v => ({ ...v, data_competencia: v.data_pagamento })), ...(vendasParceladas || []).map(v => ({ ...v, data_competencia: v.data_vencimento }))];
        todasAsVendas.sort((a, b) => new Date(a.data_competencia) - new Date(b.data_competencia));
        setVendas(todasAsVendas);
      } catch (error) {
        console.error("Erro ao buscar vendas do extrato:", error);
        setVendas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVendasDoMesCorretamente();
  }, [fechamento]);

  const content = (
    <div className="space-y-4">
      {(fechamento.observacoes || fechamento.url_comprovante) && (
        <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
          <h4 className="font-bold text-md mb-3 text-gray-800 dark:text-white">Detalhes do Pagamento</h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            {fechamento.observacoes && (<div><strong className="block mb-1">Observações:</strong><p className="whitespace-pre-wrap p-2 bg-white dark:bg-gray-700 rounded">{fechamento.observacoes}</p></div>)}
            {fechamento.url_comprovante && (<div><strong className="block mb-1">Comprovante:</strong><a href={fechamento.url_comprovante} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><DownloadIcon /> Baixar Comprovante</a></div>)}
          </div>
        </div>
      )}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-md mb-3 text-gray-800 dark:text-white">Vendas Inclusas neste Fechamento</h4>
        {loading ? (<p className="text-gray-500">Carregando...</p>) : vendas.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-gray-500 dark:text-gray-400"><tr><th className="py-2 px-3 font-medium">Cliente</th><th className="py-2 px-3 font-medium">Plano</th><th className="py-2 px-3 font-medium text-right">Valor</th><th className="py-2 px-3 font-medium text-right">Comissão</th><th className="py-2 px-3 font-medium text-right">Data</th></tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{vendas.map(venda => (<tr key={venda.id}><td className="py-2 px-3">{venda.nome_cliente}</td><td className="py-2 px-3">{venda.nome_plano}</td><td className="py-2 px-3 text-right">{formatCurrency(venda.valor)}</td><td className="py-2 px-3 text-right font-semibold text-green-600">{formatCurrency(venda.valor * 0.4)}</td><td className="py-2 px-3 text-right">{formatSimpleDate(venda.data_competencia)}</td></tr>))}</tbody></table></div>
        ) : (<p className="text-gray-500">Nenhuma venda encontrada.</p>)}
      </div>
    </div>
  );

  if (isMobile) {
    return <div className="col-span-full -m-4 mt-4 p-4">{content}</div>;
  }

  return (
  <tr className="bg-gray-100 dark:bg-gray-900/50">
    <td colSpan="7" className="p-4">{content}</td>
  </tr>
  );
}
// --- COMPONENTE PRINCIPAL ---
export default function FinanceiroAdminPage() {
  const [fechamentos, setFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFechamento, setSelectedFechamento] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [mesParaGerar, setMesParaGerar] = useState(() => {
    const hoje = new Date();
    hoje.setMonth(hoje.getMonth() - 1);
    return hoje.toISOString().slice(0, 7);
  });
  const { addNotification } = useNotification();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: fechamentosData, error: fechamentosError } = await supabase.from('fechamentos').select(`*, profiles (nome_completo, tipo_chave_pix, chave_pix, nome_banco, agencia, conta_corrente)`).order('mes_referencia', { ascending: false });
      if (fechamentosError) throw fechamentosError;
      setFechamentos(fechamentosData || []);
    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
      setError("Não foi possível carregar os dados.");
      addNotification("Não foi possível carregar os dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const executeGerarFechamento = async () => {
    setLoading(true);
    addNotification("Gerando fechamento, por favor aguarde...", "info");
    try {
      const { data, error } = await supabase.functions.invoke('gerar-fechamentos', {
        body: { mes: mesParaGerar },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
        }
      });
      if (error) throw error;
      addNotification(data.message || 'Operação concluída!', 'success');
      await fetchData();
    } catch (err) {
      console.error('Erro ao gerar fechamento:', err);
      addNotification(`Erro ao gerar fechamento: ${err.message}`, 'error');
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
    <>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <title>Financeiro | Painel Admin MedSinai</title>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro - Admin</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
          <label htmlFor="month-generator" className="font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Mês para Fechamento:</label>
          <div className="flex gap-3 w-full">
            <input type="month" id="month-generator" value={mesParaGerar} onChange={(e) => setMesParaGerar(e.target.value)} className="flex-grow bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm" />
            <button onClick={() => setIsConfirmationOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors">Gerar</button>
          </div>
        </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden shadow-lg">
          {loading && <p className="p-4 text-center">Atualizando lista...</p>}
          {!loading && fechamentos.length === 0 && (<p className="text-center p-8 text-gray-500">Nenhum fechamento encontrado.</p>)}
          {!loading && fechamentos.length > 0 && (
            <>
              {/* TABELA PARA DESKTOP */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-300 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mês Ref.</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Parceiro</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Comissão Bruta</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Valor Pago</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Detalhes</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                  {fechamentos.map(f => (
                    <React.Fragment key={`desktop-${f.id}`}>
                      <FechamentoRow 
                        fechamento={f}
                        onOpenModal={() => handleOpenModal(f)}
                        onToggleDetails={() => toggleRowExpansion(f.id)}
                        isExpanded={expandedRowId === f.id}
                        renderAs="row"
                      />
                      {/* AQUI ESTÁ A CORREÇÃO: Renderiza a linha de detalhes SE estiver expandida */}
                      {expandedRowId === f.id && (
                        <DetalhesRow fechamento={f} isMobile={false} />
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                </table>
              </div>

              {/* LISTA DE CARDS PARA MOBILE */}
              <div className="md:hidden divide-y divide-gray-300 dark:divide-gray-700">
                {fechamentos.map(f => (
                  <FechamentoRow 
                    key={`mobile-${f.id}`}
                    fechamento={f}
                    onOpenModal={() => handleOpenModal(f)}
                    onToggleDetails={() => toggleRowExpansion(f.id)}
                    isExpanded={expandedRowId === f.id}
                    renderAs="card"
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {showModal && selectedFechamento && (<RegistrarPagamentoModal fechamento={selectedFechamento} onClose={handleCloseModal} onSave={handleSaveSuccess} />)}
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={executeGerarFechamento}
        title="Gerar Fechamento?"
        message={`Tem certeza que deseja gerar o fechamento para ${new Date(mesParaGerar + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}? Esta ação é irreversível.`}
      />
    </>
  );
}
