import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

// ===================================================================
// ==> NOVOS COMPONENTES SVG PARA OS BADGES DAS LOJAS <==
// ===================================================================

// --- Badge da App Store (Light e Dark) ---
const AppStoreBadge = ({ theme = 'light' }) => (
  <svg width="150" height="50" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="40" rx="5" fill={theme === 'dark' ? 'white' : 'black'} />
    <path d="M17.53 20.58c-.01 2.33 1.88 4.21 4.2 4.21 2.33 0 4.22-1.88 4.21-4.21 0-2.33-1.88-4.21-4.21-4.21-2.32 0-4.2 1.88-4.2 4.21zm1.63 0c0-1.43 1.16-2.58 2.57-2.58s2.57 1.15 2.57 2.58c0 1.43-1.16 2.58-2.57 2.58s-2.57-1.15-2.57-2.58zM14.98 14.12c.98-1.18 1.54-2.6 1.43-4.01-.9.07-1.86.55-2.6 1.33-.7.73-1.25 1.86-1.13 3.05.87-.06 1.81-.54 2.3-1.37z" fill={theme === 'dark' ? 'black' : 'white'} />
    <text x="35" y="17" fontFamily="Arial, sans-serif" fontSize="8" fill={theme === 'dark' ? 'black' : 'white'}>Download on the</text>
    <text x="35" y="31" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={theme === 'dark' ? 'black' : 'white'}>App Store</text>
  </svg>
 );

// --- Badge do Google Play (Light e Dark) ---
const GooglePlayBadge = ({ theme = 'light' }) => (
  <svg width="150" height="50" viewBox="0 0 125 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="125" height="40" rx="5" fill={theme === 'dark' ? 'white' : 'black'} />
    <path d="M11.5 12.87l6.53 3.77-6.53 3.77V12.87z" fill="#FFD042"/>
    <path d="M11.5 27.13V12.87L4 20l7.5 7.13z" fill="#FF3D00"/>
    <path d="M24.03 20l-5.99 6.01-6.54-3.78 6.54-3.77 5.99 1.54z" fill="#4CAF50"/>
    <path d="M4 20l7.5-7.13 6.53 3.77-5.98 1.82L4 20z" fill="#1976D2"/>
    <text x="32" y="17" fontFamily="Arial, sans-serif" fontSize="8" fill={theme === 'dark' ? 'black' : 'white'}>GET IT ON</text>
    <text x="32" y="31" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill={theme === 'dark' ? 'black' : 'white'}>Google Play</text>
  </svg>
 );
// ===================================================================

// --- FUNÇÃO QUE GERA ESTILOS DINÂMICOS PARA LIGHT E DARK MODE ---
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

// Vincula o modal ao elemento raiz do app para acessibilidade
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

  // --- COMPONENTE DE BOTÕES DE DOWNLOAD ATUALIZADO ---
  const DownloadButtons = ( ) => (
    <div className={`mt-8 pt-6 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
      <p className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
        Seu acesso está liberado! Baixe nosso app e entre com o CPF utilizado na compra.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
          <AppStoreBadge theme={currentTheme} />
        </a>
        <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
          <GooglePlayBadge theme={currentTheme} />
        </a>
      </div>
    </div>
  );

  // --- FUNÇÃO QUE RENDERIZA O CONTEÚDO PRINCIPAL DO MODAL ---
  const renderContent = () => {
    const textColor = isDarkTheme ? 'text-gray-300' : 'text-gray-600';
    const inputBg = isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300';
    const inputTextColor = isDarkTheme ? 'text-gray-300' : 'text-gray-800';

    switch (paymentMethod) {
      case 'boleto':
        return (
          <>
            <h2 className="text-2xl font-bold text-green-500 mb-4">Boleto Gerado com Sucesso!</h2>
            <p className={`mb-6 ${textColor}`}>O boleto foi enviado para o seu e-mail. Após o pagamento, seu acesso será liberado.</p>
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

  // --- RENDERIZAÇÃO FINAL DO MODAL ---
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
