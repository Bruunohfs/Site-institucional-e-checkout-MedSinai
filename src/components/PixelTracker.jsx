// Em: src/components/PixelTracker.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';

// Flag para garantir que a inicialização ocorra apenas uma vez
let isPixelInitialized = false;

function PixelTracker() {
  const location = useLocation();

  // Efeito para INICIALIZAR o Pixel
  useEffect(() => {
    if (isPixelInitialized) {
      return; // Se já foi inicializado, não faz nada
    }

    const pixelId = '1331351295054356'; // Seu ID do Pixel
    const options = {
      autoConfig: true, // Correspondência avançada
      debug: false,     // Mude para 'true' para testar
    };

    ReactPixel.init(pixelId, null, options);
    isPixelInitialized = true; // Marca como inicializado

    // Dispara o primeiro PageView assim que é inicializado
    ReactPixel.pageView(); 

  }, []); // Array vazio [] garante que rode apenas uma vez

  // Efeito para RASTREAR MUDANÇAS DE ROTA
  useEffect(() => {
    if (!isPixelInitialized) {
      return; // Não dispara PageView se o pixel ainda não foi iniciado
    }
    // Dispara um novo PageView a cada mudança de URL
    ReactPixel.pageView();
  }, [location]); // A dependência [location] aciona o efeito a cada nova rota

  return null; // Este componente não renderiza nada visualmente
}

export default PixelTracker;
