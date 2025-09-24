// src/components/AnalyticsWrapper.jsx

import { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const GA_MEASUREMENT_ID = "G-Z1SN0XKENK"; // Seu ID de medição

export default function AnalyticsWrapper() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAnalytics = () => {
      // Verifica se já foi inicializado para não rodar duas vezes
      if (initialized || !GA_MEASUREMENT_ID) {
        return;
      }

      // Inicializa o Google Analytics
      ReactGA.initialize(GA_MEASUREMENT_ID);
      
      // Marca como inicializado
      setInitialized(true);

      // Remove os "ouvintes" de evento para não ficarem rodando à toa
      window.removeEventListener('scroll', initAnalytics);
      window.removeEventListener('mousemove', initAnalytics);
      window.removeEventListener('touchstart', initAnalytics);
    };

    // Adiciona os "ouvintes" que vão disparar a inicialização
    window.addEventListener('scroll', initAnalytics, { once: true });
    window.addEventListener('mousemove', initAnalytics, { once: true });
    window.addEventListener('touchstart', initAnalytics, { once:true });

    // Função de limpeza para remover os ouvintes se o componente for desmontado
    return () => {
      window.removeEventListener('scroll', initAnalytics);
      window.removeEventListener('mousemove', initAnalytics);
      window.removeEventListener('touchstart', initAnalytics);
    };
  }, [initialized]); // O efeito depende do estado 'initialized'

  // O componente renderiza os scripts da Vercel e, se o GA já foi inicializado,
  // ele não faz mais nada. Os scripts da Vercel são leves e podem carregar normalmente.
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
