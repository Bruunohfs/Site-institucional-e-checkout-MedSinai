// src/hooks/useTracker.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Função auxiliar para criar cookies (você já tinha)
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const useTracker = () => {
  // Hook para obter a localização atual (URL)
  const location = useLocation();

  // Efeito para rastrear o ID do parceiro (só roda uma vez)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    // Nota: No seu código estava 'ref', mas em outros lugares usamos 'pid'.
    // Verifique qual é o correto. Vou usar 'pid' para manter a consistência.
    const partnerId = urlParams.get('pid'); 

    if (partnerId) {
      setCookie('medsinai_partner_ref', partnerId, 60); // Salva o cookie do parceiro
    }
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez.

  // Efeito para rastrear visualizações de página do GA4
  useEffect(() => {
    // Envia um evento de "pageview" para o GA4 toda vez que a URL muda
    ReactGA.send({ 
    hitType: "pageview", // "pageview" tudo junto e em minúsculas
    page: location.pathname + location.search + location.hash 
  });
  }, [location]); // Este efeito roda toda vez que a 'location' muda.
};

export default useTracker;
