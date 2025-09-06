// /api/webhook-asaas.js - VERSÃO 1: APENAS PARA TESTE DE RECEBIMENTO

export default async function handler(req, res) {
  // Apenas aceite requisições POST, que é o que a Asaas envia.
  if (req.method !== 'POST') {
    console.log('Recebida requisição não-POST, ignorando.');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega o corpo da notificação enviada pela Asaas.
    const notification = req.body;

    // ✨ A PARTE MAIS IMPORTANTE DO TESTE ✨
    // Imprime a notificação completa nos logs da Vercel.
    // É assim que vamos saber se funcionou.
    console.log('=========================================');
    console.log('🎉 WEBHOOK DA ASAAS RECEBIDO! 🎉');
    console.log('=========================================');
    console.log('Evento:', notification.event);
    console.log('Corpo completo:', JSON.stringify(notification, null, 2));
    console.log('=========================================');

    // Responda para a Asaas imediatamente com "200 OK" para que ela saiba
    // que a notificação foi entregue com sucesso.
    res.status(200).json({ message: 'Notificação recebida com sucesso.' });

  } catch (error) {
    // Se algo der errado ao processar o log, registre o erro.
    console.error("Erro ao processar o webhook da Asaas:", error.message);
    res.status(500).json({ error: 'Erro interno ao processar a notificação.' });
  }
}
