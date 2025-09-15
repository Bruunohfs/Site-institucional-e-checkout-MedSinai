// Arquivo: supabase/functions/_shared/cors.ts

// Lista de domínios que podem chamar suas funções
const allowedOrigins = [
  'http://localhost:5173',       // Para testes no seu computador
  'https://www.medsinai.com.br'   // Seu site no ar
];

// Esta função gera os cabeçalhos de CORS corretos
export function getCorsHeaders(requestOrigin: string | null ) {
  const headers = new Headers();

  // Verifica se a origem da requisição está na nossa lista de permitidos
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
  } else {
    // Se não estiver, por segurança, não define o header e a requisição pode falhar.
    // Para desenvolvimento inicial, você poderia descomentar a linha abaixo para permitir qualquer origem.
    // headers.set('Access-Control-Allow-Origin', '*');
  }
  
  headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT'); // Adicionei PUT para updates

  return headers;
};
