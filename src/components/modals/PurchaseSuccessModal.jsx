import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Apple, Smartphone } from 'lucide-react'; // <-- MUDANÇA: Importando ícones da Lucide

// --- FUNÇÃO QUE GERA ESTILOS DINÂMICOS (sem alterações) ---
const getModalStyles = (theme) => {
  const isDark = theme === 'dark';
  return {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1a202c',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '550px',
      padding: '40px',
      border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
    },
  };
};

Modal.setAppElement('#root');

const PurchaseSuccessModal = ({ isOpen, onClose, paymentMethod, data }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    if (isOpen) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(savedTheme);
    }
  }, [isOpen]);

  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.stations.medsinai&hl=pt_BR";
  const appStoreUrl = "https://apps.apple.com/br/app/medsinai/id6751971767";

  const isDarkTheme = currentTheme === 'dark';

  // --- COMPONENTE DE BOTÕES DE DOWNLOAD ATUALIZADO --- // <-- MUDANÇA
  const DownloadButtons = ( ) => {
    const buttonBaseStyle = "flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2";
    const darkStyle = "bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-blue-500";
    const lightStyle = "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:border-blue-500";
    
    return (
      <div className={`mt-8 pt-6 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Seu acesso está liberado! Baixe nosso app e entre com o CPF utilizado na compra.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className={`${buttonBaseStyle} ${isDarkTheme ? darkStyle : lightStyle}`}>
            <Apple size={20} className="mr-2" />
            <span>Baixar na <br className="sm:hidden"/> App Store</span>
          </a>
          <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className={`${buttonBaseStyle} ${isDarkTheme ? darkStyle : lightStyle}`}>
            <Smartphone size={20} className="mr-2" />
            <span>Disponível no <br className="sm:hidden"/> Google Play</span>
          </a>
        </div>
      </div>
    );
  };

  // --- RENDER CONTENT (sem alterações na lógica, apenas no estilo que vem do DownloadButtons) ---
  const renderContent = () => {
    const textColor = isDarkTheme ? 'text-gray-300' : 'text-gray-600';
    const inputBg = isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300';
    const inputTextColor = isDarkTheme ? 'text-gray-300' : 'text-gray-800';

    switch (paymentMethod) {
      case 'boleto':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-500 mb-4">Boleto Gerado com Sucesso!</h2>
            <p className={`mb-6 ${textColor}`}>O boleto tambem foi enviado para o seu e-mail. Após o pagamento, seu acesso será liberado.</p>
            <a href={data.boletoUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              Visualizar Boleto
            </a>
            <DownloadButtons />
          </>
        );
      case 'pix':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-500 mb-4">QR Code Pix Gerado!</h2>
            <p className={`mb-4 ${textColor}`}>Aponte a câmera do seu celular ou use o código abaixo.</p>
            <div className="p-2 bg-white rounded-lg inline-block">
              <img src={data.qrCodeUrl} alt="QR Code Pix" className="w-48 h-48 mx-auto" />
            </div>
            <div className="mt-4">
              <label className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Pix Copia e Cola:</label>
              <input type="text" readOnly value={data.pixCopiaECola} className={`w-full p-2 mt-1 border rounded text-xs ${inputBg} ${inputTextColor}`} onClick={(e) => e.target.select()} />
            </div>
            <DownloadButtons />
          </>
        );
      case 'cartao':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-500 mb-4">Pagamento Aprovado!</h2>
            <p className={textColor}>Sua assinatura foi confirmada. Seja bem-vindo(a)!</p>
            <p className={textColor}>Enviamos todos os detalhes para o seu e-mail.</p>
            <DownloadButtons />
          </>
        );
      default:
        return null;
    }
  };

  // --- RENDERIZAÇÃO FINAL DO MODAL (sem alterações) ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={getModalStyles(currentTheme)}
      contentLabel="Confirmação de Pagamento"
    >
      <div className="text-center">
        {renderContent()}
        <button onClick={onClose} className={`mt-8 ${isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} transition-colors text-sm`}>
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default PurchaseSuccessModal;
