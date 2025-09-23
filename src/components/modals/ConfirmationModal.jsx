// src/components/modals/ConfirmationModal.jsx

import React from 'react';

// Ícone de aviso para dar um impacto visual
const WarningIcon = () => (
  <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    // Overlay de fundo
    <div 
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
      onClick={onClose} // Permite fechar clicando fora
    >
      {/* Conteúdo do Modal */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-300 dark:border-gray-700 text-center"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <WarningIcon />
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {message}
        </p>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose} 
            className="py-2 px-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose(); // Fecha o modal após confirmar
            }} 
            className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
