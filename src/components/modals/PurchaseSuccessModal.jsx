// Em: src/components/PurchaseSuccessModal.jsx

import React from 'react';
import Modal from 'react-modal';

// Estilos customizados para o modal (pode ajustar conforme seu design)
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#2d3748', // Cor de fundo escura
    color: 'white',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '500px',
    padding: '30px',
    border: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
};

// Vincula o modal ao elemento raiz do seu app para acessibilidade
Modal.setAppElement('#root');

const PurchaseSuccessModal = ({ isOpen, onClose, paymentMethod, data }) => {
  
  const renderContent = () => {
    switch (paymentMethod) {
      case 'boleto':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Boleto Gerado com Sucesso!</h2>
            <p className="mb-6">O boleto também foi enviado para o seu e-mail.</p>
            <a
              href={data.boletoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Clique aqui para visualizar o Boleto
            </a>
          </>
        );
      case 'pix':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-4">QR Code Pix Gerado!</h2>
            <p className="mb-4">Aponte a câmera do seu celular ou use o código abaixo.</p>
            <img src={data.qrCodeUrl} alt="QR Code Pix" className="mx-auto bg-white p-2 rounded-md" />
            <div className="mt-4">
              <label className="text-sm text-gray-400">Pix Copia e Cola:</label>
              <input
                type="text"
                readOnly
                value={data.pixCopiaECola}
                className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 rounded text-xs"
                onClick={(e) => e.target.select()}
              />
            </div>
          </>
        );
      case 'cartao':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Pagamento Aprovado!</h2>
            <p>Sua assinatura foi confirmada. Seja bem-vindo(a)!</p>
            <p>Enviamos todos os detalhes para o seu e-mail.</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Confirmação de Pagamento"
    >
      <div className="text-center">
        {renderContent()}
        <button 
          onClick={onClose} 
          className="mt-8 text-gray-400 hover:text-white transition-colors"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default PurchaseSuccessModal;
