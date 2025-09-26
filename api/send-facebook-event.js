// Em: /api/send-facebook-event.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Apenas capturamos os dados essenciais do frontend
  const { eventName, eventData, userData } = req.body;

  if (!eventName || !eventData) {
    return res.status(400).json({ error: 'eventName and eventData are required' });
  }

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pixelId = process.env.FACEBOOK_PIXEL_ID;

  if (!accessToken || !pixelId) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const apiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`;

  const hashedUserData = {};
  if (userData ) {
    for (const key in userData) {
      if (Object.prototype.hasOwnProperty.call(userData, key) && userData[key]) {
        hashedUserData[key] = crypto.createHash('sha256').update(userData[key]).digest('hex');
      }
    }
  }

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
    // ===================================================================
    // ==> A CORREÇÃO FINAL: CÓDIGO DE TESTE FIXO AQUI <==
    // ===================================================================
    test_event_code: 'TEST10770', // Coloque seu código de teste aqui
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, access_token: accessToken }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro da API do Facebook:', responseData);
      return res.status(response.status).json({ error: 'Failed to send event', details: responseData });
    }

    res.status(200).json({ success: true, facebookResponse: responseData });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
