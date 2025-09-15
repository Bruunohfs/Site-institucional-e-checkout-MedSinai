// src/pages/admin/EditPartnerModal.jsx

import { useState, useEffect } from 'react';

export default function EditPartnerModal({ parceiro, isOpen, onClose, onSave }) {
  const [nome, setNome] = useState('');
  const [cupom, setCupom] = useState('');

  // Quando o modal abre, preenche os campos com os dados do parceiro
  useEffect(() => {
    if (parceiro) {
      setNome(parceiro.user_metadata?.nome || '');
      setCupom(parceiro.user_metadata?.cupom || '');
    }
  }, [parceiro]);

  if (!isOpen || !parceiro) return null;

  const handleSave = () => {
    // Chama a função onSave passando os novos dados
    onSave(parceiro.id, { nome, cupom });
  };

  return (
    // Overlay (fundo escuro)
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      {/* Conteúdo do Modal */}
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Editar Parceiro</h2>
        <p className="text-sm text-gray-400 mb-6">Você está editando: <span className="font-semibold text-white">{parceiro.email}</span></p>

        <div className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome do Parceiro</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="cupom" className="block text-sm font-medium text-gray-300 mb-1">Cupom de Desconto</label>
            <input
              id="cupom"
              type="text"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
