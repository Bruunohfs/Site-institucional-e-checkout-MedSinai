// src/components/ui/PreviewModal.jsx

import { useState, useEffect } from 'react';

// Ícones (sem alterações)
const CloseIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const PrevIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const NextIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

export default function PreviewModal({ material, onClose }) {
  if (!material) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const isGallery = material.tipo === 'galeria';
  const isImage = material.tipo === 'imagem';
  const isVideo = material.tipo === 'video';
  const isText = material.tipo === 'texto';
  const isDocument = material.tipo === 'documento';

  // Array de URLs para tipos de arquivo visual
  const fileUrls = (isGallery || isImage || isVideo || isDocument) ? material.url_do_arquivo : [];

  const goToPrevious = () => { if (isGallery) setCurrentIndex(prev => (prev === 0 ? fileUrls.length - 1 : prev - 1)); };
  const goToNext = () => { if (isGallery) setCurrentIndex(prev => (prev === fileUrls.length - 1 ? 0 : prev + 1)); };

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onClose, goToPrevious, goToNext]);

  const renderContent = () => {
    // ===================================================================
    // ==> LÓGICA DE RENDERIZAÇÃO CORRIGIDA <==
    // ===================================================================
    if ((isImage || isGallery) && fileUrls.length > 0) {
      const url = isGallery ? fileUrls[currentIndex] : fileUrls[0];
      return <img src={url} alt={material.titulo} className="max-w-full max-h-full object-contain rounded-lg" />;
    }
    if (isVideo && fileUrls.length > 0) {
      return <video src={fileUrls[0]} controls className="max-w-full max-h-full object-contain rounded-lg" />;
    }
    if (isText) {
      return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-2xl text-left overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{material.titulo}</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{material.conteudo_texto}</p>
        </div>
      );
    }
    // Mensagem de fallback para documentos ou outros tipos
    return (
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Preview Indisponível</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">O preview para este tipo de arquivo ({material.tipo}) não é suportado. Use o botão de download.</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white z-20" onClick={onClose}><CloseIcon /></button>
      {isGallery && <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 p-2" onClick={(e) => { e.stopPropagation(); goToPrevious(); }}><PrevIcon /></button>}
      <div className="relative w-full h-full max-w-4xl max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
        {isGallery && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm py-1 px-3 rounded-full">
            {currentIndex + 1} / {fileUrls.length}
          </div>
        )}
      </div>
      {isGallery && <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 p-2" onClick={(e) => { e.stopPropagation(); goToNext(); }}><NextIcon /></button>}
    </div>
  );
}
