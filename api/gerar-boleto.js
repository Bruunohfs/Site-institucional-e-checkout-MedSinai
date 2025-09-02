// api/gerar-boleto.js - CÓDIGO DE DIAGNÓSTICO TEMPORÁRIO

module.exports = async (req, res) => {
  console.log("LOG INICIAL: A função foi invocada com sucesso.");

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY || process.env.VITE_ASAAS_API_KEY;

  if (ASAAS_API_KEY) {
    console.log("LOG DE SUCESSO: A chave de API foi encontrada.");
    // Vamos retornar apenas os 5 primeiros caracteres para confirmar que lemos a chave certa.
    const chaveParcial = ASAAS_API_KEY.substring(0, 5);
    
    res.status(200).json({
      success: true,
      message: "API de diagnóstico está online!",
      apiKeyEncontrada: true,
      chave: `${chaveParcial}...`
    });
  } else {
    console.error("LOG DE FALHA: A chave de API NÃO foi encontrada nas variáveis de ambiente.");
    
    res.status(500).json({
      success: false,
      message: "API de diagnóstico está online, mas falhou em ler a chave.",
      apiKeyEncontrada: false
    });
  }
};
