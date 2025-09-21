import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RegistrarPagamentoModal from './RegistrarPagamentoModal';

// --- ÍCONES (sem alterações) ---
const DownloadIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = (   ) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

// --- FUNÇÕES DE FORMATAÇÃO E ESTILO (sem alterações) ---
const STATUS_STYLES = {
  PAGO_TOTAL: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  PAGO_PARCIAL: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  PENDENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
};
const getStatusClasses = (status) => STATUS_STYLES[status] || STATUS_STYLES.DEFAULT;
const formatCurrency = (value) => {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
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

// --- COMPONENTE DetalhesRow (sem alterações) ---
function DetalhesRow({ fechamento }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendasDoMesCorretamente = async () => {
      setLoading(true);
      
      const mesReferencia = new Date(fechamento.mes_referencia);
      const primeiroDiaMes = new Date(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth() + 1, 0, 23, 59, 59, 999).toISOString();

      try {
        const { data: vendasNaoParceladas, error: error1 } = await supabase
          .from('vendas')
          .select('id, nome_cliente, nome_plano, valor, data_pagamento')
          .eq('id_parceiro', fechamento.id_parceiro)
          .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
          .not('nome_plano', 'like', '%12x%')
          .gte('data_pagamento', primeiroDiaMes)
          .lte('data_pagamento', ultimoDiaMes);

        if (error1) throw new Error(`Erro ao buscar vendas não parceladas: ${error1.message}`);

        const { data: vendasParceladas, error: error2 } = await supabase
          .from('vendas')
          .select('id, nome_cliente, nome_plano, valor, data_vencimento')
          .eq('id_parceiro', fechamento.id_parceiro)
          .in('status_pagamento', ['CONFIRMED', 'RECEIVED'])
          .like('nome_plano', '%12x%')
          .gte('data_vencimento', primeiroDiaMes)
          .lte('data_vencimento', ultimoDiaMes);

        if (error2) throw new Error(`Erro ao buscar vendas parceladas: ${error2.message}`);

        const todasAsVendas = [
          ...(vendasNaoParceladas || []).map(v => ({ ...v, data_competencia: v.data_pagamento })),
          ...(vendasParceladas || []).map(v => ({ ...v, data_competencia: v.data_vencimento }))
        ];
        
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

  return (
    <tr className="bg-gray-50 dark:bg-gray-900/50">
      <td colSpan="7" className="p-4 space-y-4">
        {(fechamento.observacoes || fechamento.url_comprovante) && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-bold text-md mb-3 text-gray-800 dark:text-white">Detalhes do Pagamento</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              {fechamento.observacoes && (
                <div>
                  <strong className="block mb-1">Observações:</strong>
                  <p className="whitespace-pre-wrap p-2 bg-white dark:bg-gray-700 rounded">{fechamento.observacoes}</p>
                </div>
              )}
              {fechamento.url_comprovante && (
                <div>
                  <strong className="block mb-1">Comprovante:</strong>
                  <a href={fechamento.url_comprovante} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                    <DownloadIcon /> Baixar Comprovante
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-md mb-3 text-gray-800 dark:text-white">Vendas Inclusas neste Fechamento</h4>
          {loading ? (
            <p className="text-gray-500">Carregando detalhes das vendas...</p>
          ) : vendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="py-2 px-3">Cliente</th>
                    <th className="py-2 px-3">Plano</th>
                    <th className="py-2 px-3 text-right">Valor da Venda</th>
                    <th className="py-2 px-3 text-right">Comissão (40%)</th>
                    <th className="py-2 px-3 text-right">Data de Competência</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map(venda => (
                    <tr key={venda.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-3">{venda.nome_cliente}</td>
                      <td className="py-2 px-3">{venda.nome_plano}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(venda.valor)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{formatCurrency(venda.valor * 0.4)}</td>
                      <td className="py-2 px-3 text-right">{formatSimpleDate(venda.data_competencia)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma venda encontrada para este período.</p>
          )}
        </div>
      </td>
    </tr>
  );
}

// --- COMPONENTE PRINCIPAL (COM ALTERAÇÕES) ---
export default function FinanceiroAdminPage() {
  const [fechamentos, setFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFechamento, setSelectedFechamento] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // ===================================================================
  // ==> ALTERAÇÃO 1: Adicionar estado para o seletor de mês <==
  // ===================================================================
  // Define o estado para o mês a ser gerado, inicializando com o mês anterior.
  const [mesParaGerar, setMesParaGerar] = useState(() => {
    const hoje = new Date();
    hoje.setMonth(hoje.getMonth() - 1);
    return hoje.toISOString().slice(0, 7); // Formato 'AAAA-MM'
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: fechamentosData, error: fechamentosError } = await supabase
        .from('fechamentos')
        .select(`*, profiles (nome_completo, tipo_chave_pix, chave_pix, nome_banco, agencia, conta_corrente)`)
        .order('mes_referencia', { ascending: false });
      if (fechamentosError) throw fechamentosError;
      setFechamentos(fechamentosData || []);
    } catch (err) {
      console.error("Erro ao buscar dados financeiros:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ===================================================================
  // ==> ALTERAÇÃO 2: Modificar a função para usar o mês selecionado <==
  // ===================================================================
  const handleGerarFechamento = async () => {
    const nomeMes = new Date(mesParaGerar + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!confirm(`Tem certeza que deseja gerar o fechamento para ${nomeMes}? Esta ação calculará as comissões para as vendas confirmadas no mês selecionado.`)) return;
    
    setLoading(true);
    try {
      // Passa o mês selecionado como parâmetro para a Edge Function
      const { data, error } = await supabase.functions.invoke('gerar-fechamentos', {
        body: { mes: mesParaGerar } // Envia o mês no formato 'AAAA-MM'
      });

      if (error) throw error;
      alert(data.message || 'Operação concluída!');
      await fetchData();
    } catch (err) {
      console.error('Erro ao gerar fechamento:', err);
      alert('Erro ao gerar fechamento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (fechamento) => { 
    setSelectedFechamento(fechamento); 
    setShowModal(true); 
  };
  const handleCloseModal = () => { setShowModal(false); setSelectedFechamento(null); };
  const handleSaveSuccess = async () => { handleCloseModal(); setLoading(true); await fetchData(); };
  const toggleRowExpansion = (id) => { setExpandedRowId(expandedRowId === id ? null : id); };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financeiro - Admin</h1>
        
        {/* =================================================================== */}
        {/* ==> ALTERAÇÃO 3: Substituir o botão por um seletor de mês + botão <== */}
        {/* =================================================================== */}
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
          <label htmlFor="month-generator" className="font-medium text-gray-700 dark:text-gray-200">Mês para Fechamento:</label>
          <input
            type="month"
            id="month-generator"
            value={mesParaGerar}
            onChange={(e) => setMesParaGerar(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm shadow-sm"
          />
          <button onClick={handleGerarFechamento} className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
            Gerar Fechamento
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-300 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Mês Ref.</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Parceiro</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Comissão Bruta</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Valor Pago</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Detalhes</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.length > 0 ? fechamentos.map(f => (
                <React.Fragment key={f.id}>
                  <tr className="border-t border-gray-300 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{formatDate(f.mes_referencia)}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{f.profiles?.nome_completo || 'Parceiro não encontrado'}</td>
                    <td className="p-4 font-semibold text-black dark:text-white whitespace-nowrap">{formatCurrency(f.valor_comissao_bruta)}</td>
                    <td className="p-4 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{f.valor_pago ? formatCurrency(f.valor_pago) : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusClasses(f.status_pagamento)}`}>
                        {f.status_pagamento.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleRowExpansion(f.id)} title="Ver Detalhes" className={`p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform transform ${expandedRowId === f.id ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon />
                      </button>
                    </td>
                    <td className="p-4">
                      {f.status_pagamento !== 'PAGO_TOTAL' ? (
                        <button onClick={() => handleOpenModal(f)} className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-400 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                          {f.status_pagamento === 'PENDENTE' ? 'Registrar' : 'Gerenciar'}
                        </button>
                      ) : <span className="text-sm text-gray-900 dark:text-white">Quitado</span>}
                    </td>
                  </tr>
                  {expandedRowId === f.id && <DetalhesRow fechamento={f} />}
                </React.Fragment>
              )) : (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Nenhum fechamento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && selectedFechamento && (
        <RegistrarPagamentoModal fechamento={selectedFechamento} onClose={handleCloseModal} onSave={handleSaveSuccess} />
      )}
    </div>
  );
}
