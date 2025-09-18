// src/components/RegistrarPagamentoModal.jsx

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RegistrarPagamentoModal({ fechamento, onClose, onSave }) {
  const valorRestante = (fechamento.valor_comissao_bruta || 0) - (fechamento.valor_pago || 0);
  const [valorPago, setValorPago] = useState(valorRestante.toFixed(2));
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
      let comprovanteUrl = null;
      // 1. Fazer upload do comprovante, se houver
      if (comprovante) {
        const fileExt = comprovante.name.split('.').pop();
        const fileName = `${fechamento.id_parceiro}-${Date.now()}.${fileExt}`;
        const filePath = `comprovantes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('materiais-publicos') // CERTIFIQUE-SE QUE ESSE BUCKET EXISTE!
          .upload(filePath, comprovante);

        if (uploadError) {
          console.error("Erro no Upload:", uploadError);
          throw uploadError;
        }

        // Pega a URL pública do arquivo
         const { data: urlData } = supabase.storage
          .from('materiais-publicos') // <-- NOME DO BUCKET CORRIGIDO
          .getPublicUrl(filePath);
        comprovanteUrl = urlData.publicUrl;
      }

      // 2. Atualizar o registro na tabela 'fechamentos'
      const status = parseFloat(valorPago) >= fechamento.valor_comissao_bruta ? 'PAGO_TOTAL' : 'PAGO_PARCIAL';

      const { error: updateError } = await supabase
        .from('fechamentos')
        .update({
          valor_pago: valorPago,
          data_pagamento: dataPagamento,
          status_pagamento: status,
          url_comprovante: comprovanteUrl || fechamento.url_comprovante,
          observacoes: fechamento.observacoes 
            ? `${fechamento.observacoes}\n--- Novo Pagamento ---\n${observacoes}` 
            : observacoes,
        })
        .eq('id', fechamento.id);

      if (updateError) throw updateError;

      onSave(); // Chama a função para fechar o modal e recarregar a lista
      
    } catch (err) {
      console.error("Erro ao salvar pagamento:", err);
      setError("Falha ao salvar. Verifique os dados e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Registrar Pagamento</h2>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Pago</label>
            <input
              type="number"
              step="0.01"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white"
              required
            />
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comprovante (Opcional)</label>
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
