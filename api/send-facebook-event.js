// Em: /api/send-facebook-event.js

// Importa a biblioteca de criptografia do Node.js para fazer o hash dos dados
import crypto from 'crypto';

export default async function handler(req, res ) {
  // 1. Validação Inicial: Aceita apenas requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
  }

  try {
    // 2. Extrai os dados do corpo da requisição (enviados pelo frontend)
    const { eventName, eventData, userData } = req.body;

    // Valida se o nome do evento foi enviado
    if (!eventName) {
      return res.status(400).json({ message: 'O nome do evento (eventName) é obrigatório.' });
    }

    // 3. Pega as variáveis de ambiente que configuramos na Vercel
    const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    // 4. Prepara os dados do usuário (user_data) para envio
    // A API de Conversões exige que dados pessoais sejam "hasheados" com SHA-256
    const formattedUserData = {
      // Pega o IP e o User Agent diretamente dos cabeçalhos da requisição
      client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      client_user_agent: req.headers['user-agent'],
      // Se o frontend enviar dados do usuário, faz o hash deles
      ...(userData?.email && { em: crypto.createHash('sha256').update(userData.email.toLowerCase()).digest('hex') }),
      ...(userData?.phone && { ph: crypto.createHash('sha256').update(userData.phone).digest('hex') }),
      ...(userData?.fName && { fn: crypto.createHash('sha256').update(userData.fName.toLowerCase()).digest('hex') }),
      ...(userData?.lName && { ln: crypto.createHash('sha256').update(userData.lName.toLowerCase()).digest('hex') }),
    };

    // 5. Monta o payload final para a API do Facebook
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: formattedUserData,
          custom_data: {
            // Adiciona os dados customizados do evento (valor, moeda, etc.)
            ...eventData,
          },
        },
      ],
      // Opcional: Para testes. Envie o 'test_event_code' para ver os eventos no Gerenciador
      // test_event_code: 'TEST_YOUR_CODE' 
    };

    // 6. Envia a requisição para a API de Conversões do Facebook
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload ),
      }
    );

    const responseData = await response.json();

    // 7. Verifica se a API do Facebook retornou um erro
    if (!response.ok) {
      console.error('Erro da API do Facebook:', responseData);
      throw new Error(responseData.error?.message || 'Falha ao enviar evento para o Facebook.');
    }

    // 8. Retorna uma resposta de sucesso para o frontend
    res.status(200).json({ status: 'sucesso', facebookResponse: responseData });

  } catch (error) {
    console.error('Erro na função serverless:', error);
    res.status(500).json({ status: 'erro', message: error.message });
  }
}
