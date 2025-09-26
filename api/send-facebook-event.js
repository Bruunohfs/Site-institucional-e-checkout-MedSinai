// Em: /api/send-facebook-event.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { eventName, eventData, userData, test_event_code } = req.body; // <-- 1. Capturamos o test_event_code aqui

  if (!eventName || !eventData) {
    return res.status(400).json({ error: 'eventName and eventData are required' });
  }

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pixelId = process.env.FACEBOOK_PIXEL_ID;

  if (!accessToken || !pixelId) {
    console.error('Variáveis de ambiente do Facebook não configuradas.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const apiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`;

  // --- Prepara os dados do usuário com HASH ---
  const hashedUserData = {};
  if (userData ) {
    for (const key in userData) {
      if (Object.prototype.hasOwnProperty.call(userData, key) && userData[key]) {
        hashedUserData[key] = crypto.createHash('sha256').update(userData[key]).digest('hex');
      }
    }
  }

  // --- Monta o payload do evento ---
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: hashedUserData,
        custom_data: eventData,
      },
    ],
  };

  // --- 2. ADICIONA O CÓDIGO DE TESTE NO NÍVEL CORRETO DO PAYLOAD ---
  // Esta é a correção crucial.
  if (test_event_code) {
    payload.test_event_code = test_event_code;
    console.log(`Enviando evento para o Facebook com test_event_code: ${test_event_code}`);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, access_token: accessToken }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro da API do Facebook:', responseData);
      return res.status(response.status).json({ error: 'Failed to send event to Facebook', details: responseData });
    }

    console.log('Evento enviado com sucesso para a API do Facebook:', responseData);
    res.status(200).json({ success: true, facebookResponse: responseData });

  } catch (error) {
    console.error('Erro de rede ou de fetch ao contatar a API do Facebook:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
