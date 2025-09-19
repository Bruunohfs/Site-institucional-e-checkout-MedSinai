// src/components/RegistrarPagamentoModal.jsx

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RegistrarPagamentoModal({ fechamento, onClose, onSave }) {
  // Calcula o valor restante a ser pago, considerando o que já foi pago
  const valorRestante = (fechamento.valor_comissao_bruta || 0) - (fechamento.valor_pago || 0);

  // Estados do formulário
  const [valorPago, setValorPago] = useState(valorRestante > 0 ? valorRestante.toFixed(2) : '0.00');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [comprovante, setComprovante] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      let comprovanteUrl = fechamento.url_comprovante; // Mantém o comprovante antigo se não for enviado um novo

      // 1. Fazer upload do novo comprovante, se houver
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

      // 2. Calcular o novo valor total pago e o novo status
      const novoValorPago = (fechamento.valor_pago || 0) + parseFloat(valorPago);
      const novoStatus = novoValorPago >= fechamento.valor_comissao_bruta ? 'PAGO_TOTAL' : 'PAGO_PARCIAL';

      // 3. Formatar as observações, acumulando as novas
      const novasObservacoes = observacoes
        ? (fechamento.observacoes ? `${fechamento.observacoes}\n\n--- Novo Pagamento em ${new Date().toLocaleDateString('pt-BR')} ---\n${observacoes}` : observacoes)
        : fechamento.observacoes;

      // 4. Atualizar o registro na tabela 'fechamentos'
      const { error: updateError } = await supabase
        .from('fechamentos')
        .update({
          valor_pago: novoValorPago,
          data_pagamento: dataPagamento,
          status_pagamento: novoStatus,
          url_comprovante: comprovanteUrl,
          observacoes: novasObservacoes,
        })
        .eq('id', fechamento.id);

      if (updateError) throw updateError;

      onSave(); // Fecha o modal e recarrega a lista na página principal

    } catch (err) {
      console.error("Erro ao salvar pagamento:", err);
      setError("Falha ao salvar. Verifique os dados e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Pagamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>

        {/* --- BLOCO DE DADOS DE PAGAMENTO DO PARCEIRO --- */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-200 dark:border-gray-600">
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Dados para Pagamento de: <span className="text-blue-600 dark:text-blue-400">{fechamento.profiles?.nome_completo}</span>
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            {fechamento.profiles?.chave_pix ? (
              <div>
                <p className="font-semibold">PIX ({fechamento.profiles.tipo_chave_pix || 'Não informado'})</p>
                <p className="bg-gray-200 dark:bg-gray-800 p-2 rounded font-mono break-all">{fechamento.profiles.chave_pix}</p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma chave PIX cadastrada.</p>
            )}
            
            {fechamento.profiles?.nome_banco && (
              <div className="pt-3 border-t border-blue-200 dark:border-gray-600 mt-3">
                <p className="font-semibold">Transferência Bancária</p>
                <p><strong>Banco:</strong> {fechamento.profiles.nome_banco}</p>
                <p><strong>Agência:</strong> {fechamento.profiles.agencia}</p>
                <p><strong>Conta:</strong> {fechamento.profiles.conta_corrente}</p>
              </div>
            )}
          </div>
        </div>

        {/* --- FORMULÁRIO DE PAGAMENTO --- */}
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor a Pagar Agora</label>
            <input
              type="number"
              step="0.01"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Valor restante: {formatCurrency(valorRestante)}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Pagamento</label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anexar Novo Comprovante (Opcional)</label>
            <input
              type="file"
              onChange={(e) => setComprovante(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações (Opcional)</label>
            <textarea
              rows="3"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Motivo do pagamento parcial, etc."
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
              {isSaving ? 'Salvando...' : 'Salvar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Função auxiliar para formatar moeda
function formatCurrency(value) {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
