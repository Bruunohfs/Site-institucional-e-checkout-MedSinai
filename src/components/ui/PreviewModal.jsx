import { useEffect } from 'react';

const CloseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

export default function PreviewModal({ material, onClose }) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!material) return null;

  // Função para renderizar o conteúdo com base no tipo
  const renderContent = () => {
    switch (material.tipo) {
      case 'imagem':
        return (
          <img 
            src={material.url_do_arquivo} 
            alt={material.titulo} 
            className="max-w-full max-h-[85vh] object-contain" 
          />
        );
      case 'video':
        return (
          <div className="w-full max-w-4xl aspect-w-16 aspect-h-9 bg-black">
            <video 
              src={material.url_do_arquivo} 
              className="w-full h-full"
              controls 
              autoPlay
            />
          </div>
        );
      case 'documento': // Assumindo que 'documento' é PDF
        return (
          <iframe 
            src={material.url_do_arquivo} 
            className="w-full h-[85vh] border-none"
            title={material.titulo}
          />
        );
      default:
        return <p className="text-white">Tipo de arquivo não suportado para pré-visualização.</p>;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      <div onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
}
