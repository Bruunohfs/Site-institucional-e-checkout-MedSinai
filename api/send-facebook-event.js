// Em: /api/send-facebook-event.js

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Capturamos todos os dados enviados pelo frontend
  const { eventName, eventData, userData, browserData } = req.body;

  if (!eventName || !eventData) {
    return res.status(400).json({ error: 'eventName and eventData are required' });
  }

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pixelId = process.env.FACEBOOK_PIXEL_ID;

  if (!accessToken || !pixelId) {
    console.error('Variáveis de ambiente do Facebook não configuradas na Vercel.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const apiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events`;

  // Objeto que conterá todos os dados de identificação do cliente
  const finalUserData = {};

  // 1. Processa os dados do formulário (email, telefone, etc. ), se existirem
  if (userData && Object.keys(userData).length > 0) {
    for (const key in userData) {
      if (Object.prototype.hasOwnProperty.call(userData, key) && userData[key]) {
        // Converte as chaves para o formato snake_case esperado pelo Facebook (ex: nomeCompleto -> fn)
        const facebookKey = {
          em: 'em', ph: 'ph', fn: 'fn', ln: 'ln'
        }[key] || key;
        finalUserData[facebookKey] = crypto.createHash('sha256').update(userData[key]).digest('hex');
      }
    }
  }

  // 2. Adiciona os dados do navegador (IP e User-Agent) como fallback e para enriquecimento
  const clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const clientUserAgent = req.headers['user-agent'];

  if (clientIpAddress) {
    finalUserData.client_ip_address = clientIpAddress;
  }
  if (clientUserAgent) {
    finalUserData.client_user_agent = clientUserAgent;
  }

  // 3. Adiciona os cookies de clique (fbc) e navegador (fbp), se existirem
  if (browserData) {
    if (browserData.fbc) {
      finalUserData.fbc = browserData.fbc;
    }
    if (browserData.fbp) {
      finalUserData.fbp = browserData.fbp;
    }
  }

  // Monta o payload final para o Facebook
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: finalUserData, // Objeto com todos os dados do cliente
        custom_data: eventData,
      },
    ],
  };

  // Envia os dados para a API de Conversões do Facebook
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

    console.log(`Evento '${eventName}' enviado com sucesso para a API do Facebook:`, responseData);
    res.status(200).json({ success: true, facebookResponse: responseData });

  } catch (error) {
    console.error(`Erro de rede ao contatar a API do Facebook para o evento '${eventName}':`, error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
