import { useEffect } from 'react';

// Ícone para o botão de fechar
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

export default function VideoModal({ videoUrl, onClose }) {
  // Efeito para fechar o modal com a tecla 'Esc'
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!videoUrl) return null;

  return (
    // Overlay (fundo escuro)
    <div 
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
      onClick={onClose} // Fecha o modal ao clicar no fundo
    >
      {/* Botão de Fechar no canto */}
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      {/* Container do Vídeo */}
      <div 
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no vídeo feche o modal
      >
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-2xl">
          <video 
            src={videoUrl} 
            className="w-full h-full"
            controls    // Adiciona controles de play, volume, etc.
            autoPlay    // Começa a tocar automaticamente ao abrir
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        </div>
      </div>
    </div>
  );
}
