import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
// ===================================================================
// ==> IMPORTS CORRIGIDOS <==
// ===================================================================
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { useNotification } from '@/components/notifications/NotificationContext';

export default function RegistrarPagamentoModal({ fechamento, onClose, onSave }) {
  const valorJaPago = fechamento.valor_pago || 0;
  const comissaoBruta = fechamento.valor_comissao_bruta || 0;
  const valorRestante = comissaoBruta - valorJaPago;

  const [valorASerPago, setValorASerPago] = useState(valorRestante > 0 ? valorRestante.toFixed(2) : '0.00');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [comprovante, setComprovante] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { addNotification } = useNotification();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const executeSave = async () => {
    setIsSaving(true);
    addNotification('Processando pagamento...', 'info');

    try {
      let comprovanteUrl = fechamento.url_comprovante;

      if (comprovante) {
        const fileExt = comprovante.name.split('.').pop();
        const fileName = `${fechamento.id_parceiro}-${Date.now()}.${fileExt}`;
        const filePath = `comprovantes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('materiais-publicos')
          .upload(filePath, comprovante);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('materiais-publicos').getPublicUrl(filePath);
        comprovanteUrl = urlData.publicUrl;
      }

      const novoTotalPago = valorJaPago + parseFloat(valorASerPago);
      
      const TOLERANCIA = 0.001;
      let novoStatus;

      if (Math.abs(comissaoBruta - novoTotalPago) < TOLERANCIA) {
        novoStatus = 'PAGO_TOTAL';
      } else if (novoTotalPago > 0) {
        novoStatus = 'PAGO_PARCIAL';
      } else {
        novoStatus = 'PENDENTE';
      }

      const novasObservacoes = observacoes
        ? (fechamento.observacoes ? `${fechamento.observacoes}\n\n--- Novo Pagamento em ${new Date().toLocaleDateString('pt-BR')} ---\n${observacoes}` : observacoes)
        : fechamento.observacoes;

      const { error: updateError } = await supabase
        .from('fechamentos')
        .update({
          valor_pago: novoTotalPago,
          data_pagamento: dataPagamento,
          status_pagamento: novoStatus,
          url_comprovante: comprovanteUrl,
          observacoes: novasObservacoes,
        })
        .eq('id', fechamento.id);

      if (updateError) throw updateError;
      
      addNotification('Pagamento salvo com sucesso!', 'success');
      onSave();

    } catch (err) {
      console.error("Erro ao salvar pagamento:", err);
      addNotification(`Falha ao salvar: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (parseFloat(valorASerPago) <= 0) {
        addNotification('O valor a ser pago deve ser maior que zero.', 'error');
        return;
    }
    setIsConfirmationOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Pagamento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-light">&times;</button>
          </div>

          <div className="py-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Dados para Pagamento de: <span className="text-blue-600 dark:text-blue-400">{fechamento.profiles?.nome_completo}</span>
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 space-y-3">
              {fechamento.profiles?.chave_pix ? (
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-400">PIX ({fechamento.profiles.tipo_chave_pix || 'Não informado'})</p>
                  <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded font-mono break-all">{fechamento.profiles.chave_pix}</p>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma chave PIX cadastrada.</p>
              )}
              
              {fechamento.profiles?.nome_banco && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
                  <p className="font-semibold text-gray-600 dark:text-gray-400">Transferência Bancária</p>
                  <p><strong>Banco:</strong> {fechamento.profiles.nome_banco}</p>
                  <p><strong>Agência:</strong> {fechamento.profiles.agencia}</p>
                  <p><strong>Conta:</strong> {fechamento.profiles.conta_corrente}</p>
                </div>
              )}
            </div>
          </div>

          <div className="py-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Resumo Financeiro</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                      <p className="text-sm text-gray-500">Comissão Bruta</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{formatCurrency(comissaoBruta)}</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-500">Total já Pago</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(valorJaPago)}</p>
                  </div>
                  <div>
                      <p className="text-sm text-gray-500">Valor Restante</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(valorRestante)}</p>
                  </div>
              </div>
          </div>

          <form onSubmit={handleSaveClick} className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor a Pagar Agora</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={valorASerPago}
                  onChange={(e) => setValorASerPago(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Pagamento</label>
                <input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anexar Novo Comprovante (Opcional)</label>
              <input
                type="file"
                onChange={(e) => setComprovante(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações (Opcional)</label>
              <textarea
                rows="3"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Motivo do pagamento parcial, etc."
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold transition-colors">
                {isSaving ? 'Salvando...' : 'Salvar Pagamento'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={executeSave}
        title="Confirmar Registro de Pagamento"
        message={`Você confirma o pagamento de ${formatCurrency(parseFloat(valorASerPago))} para ${fechamento.profiles?.nome_completo}? Esta ação não pode ser desfeita.`}
      />
    </>
  );
}

function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
