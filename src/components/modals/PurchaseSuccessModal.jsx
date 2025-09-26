import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

// --- ÍCONES SVG PARA OS BOTÕES DAS LOJAS ---
const AppleIcon = () => (
  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.33 12.25c0 .02-.01.03-.01.05-.84 2.53-2.86 4.2-5.32 4.2-1.29 0-2.55-.49-3.53-1.49-.93-.95-1.48-2.2-1.48-3.54 0-2.65 2.09-4.58 4.89-4.58.96 0 1.9.33 2.69.95.14.11.28.22.41.34.07-.05.14-.1.21-.15.3-.21.63-.39.99-.52-1.1-1.29-2.6-2.08-4.3-2.08-3.3 0-5.99 2.69-5.99 6.01s2.69 6.01 5.99 6.01c1.54 0 2.98-.58 4.09-1.56.91-.8 1.54-1.91 1.73-3.15h-3.33v.01zm-1.89-6.99c.77-.89 1.25-2.09 1.15-3.26-.02-.13-.04-.26-.06-.39-.89.06-1.86.54-2.6 1.32-.7.73-1.25 1.86-1.13 3.05.02.12.04.24.07.36.87-.06 1.81-.53 2.57-1.08z"/>
  </svg>
);

const GooglePlayIcon = () => (
  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 20.4V3.6C3 3.2 3.2 3 3.5 3L12 12l-9 8.4c-.3.2-.5 0-.5-.4zM13.1 12.8l5.8-3.3c.3-.2.3-.5 0-.7l-5.8-3.3c-.2-.1-.4 0-.4.3v6.8c0 .3.2.4.4.2zM12 12l-3.2-1.8L3.5 3H12v9zm6.9-3.9L13.1 11.2 12 12v9h.1l5.3-5.3c.2-.2.2-.5 0-.7l-1.5-1.5z"/>
  </svg>
);

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
      backgroundColor: isDark ? '#1a202c' : '#ffffff', // Fundo dinâmico
      color: isDark ? '#e2e8f0' : '#1a202c',           // Cor do texto dinâmica
      borderRadius: '12px',
      width: '90%',
      maxWidth: '550px',
      padding: '40px',
      border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`, // Borda dinâmica
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
  const [currentTheme, setCurrentTheme] = useState('light'); // Define 'light' como padrão

  // --- EFEITO PARA LER O TEMA DO LOCALSTORAGE QUANDO O MODAL ABRE ---
  useEffect(() => {
    if (isOpen) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setCurrentTheme(savedTheme);
    }
  }, [isOpen]); // A dependência [isOpen] garante que o efeito rode apenas quando o modal for aberto

  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.stations.medsinai&hl=pt_BR";
  const appStoreUrl = "https://apps.apple.com/br/app/medsinai/id6751971767";

  const isDarkTheme = currentTheme === 'dark';

  // --- COMPONENTE INTERNO PARA OS BOTÕES DE DOWNLOAD ---
  const DownloadButtons = ( ) => (
    <div className={`mt-8 pt-6 border-t ${isDarkTheme ? 'border-gray-600' : 'border-gray-200'}`}>
      <p className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
        Seu acesso está liberado! Baixe nosso app e entre com o CPF utilizado na compra.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-colors border ${isDarkTheme ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'}`}>
          <AppleIcon />
          Baixar na App Store
        </a>
        <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-colors border ${isDarkTheme ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'}`}>
          <GooglePlayIcon />
          Disponível no Google Play
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
      style={getModalStyles(currentTheme)} // Aplica os estilos dinâmicos baseados no tema
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
