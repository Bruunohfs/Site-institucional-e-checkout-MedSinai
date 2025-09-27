// Em: src/utils/trackingHelper.js

import ReactPixel from 'react-facebook-pixel';
import { getCookie } from './cookieHelper'; // Reutilizando nosso leitor de cookies

/**
 * Dispara um evento de Lead para o Facebook Pixel e a API de Conversões.
 * @param {object} leadData - Dados do lead (ex: { nome, email, telefone }).
 * @param {string} leadType - O tipo de lead (ex: 'Lead Empresa', 'Lead Parceiro').
 */
export const trackLeadEvent = (leadData, leadType) => {
  if (!leadData || !leadType) {
    console.error("Dados do lead ou tipo de lead ausentes para o rastreamento.");
    return;
  }

  console.log(`Disparando evento Lead para: ${leadType}`);

  const eventData = {
    content_name: leadType,
    content_category: 'Lead',
  };

  const userData = {
    em: leadData.email || '',
    ph: leadData.telefone || '',
    fn: leadData.nome?.split(' ')[0] || '',
    ln: leadData.nome?.split(' ').slice(1).join(' ') || '',
  };

  const fbc = getCookie('_fbc');
  const fbp = getCookie('_fbp');

  ReactPixel.track('Lead', eventData);

  fetch('/api/send-facebook-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'Lead',
      eventData: eventData,
      userData: userData,
      browserData: { fbc, fbp }
    }),
  }).catch(error => console.error(`Falha ao enviar evento Lead (${leadType}) para API:`, error));
};
