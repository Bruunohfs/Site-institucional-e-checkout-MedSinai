import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Novamente, usamos as variáveis de ambiente PÚBLICAS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      // 1. Pega a sessão do usuário (verifica se ele está logado)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Se não houver sessão, redireciona para o login
        console.error("Nenhuma sessão encontrada, redirecionando para login.");
        window.location.href = '/parceiros/login';
        return;
      }

      setUser(session.user);

      // 2. Busca as vendas do parceiro logado
      // A MÁGICA ACONTECE AQUI:
      // Graças à nossa política de RLS, este comando SÓ retornará as vendas
      // onde a coluna 'id_parceiro' é igual ao ID do usuário logado.
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas')
        .select('*'); // Pega todas as colunas

      if (vendasError) {
        console.error("Erro ao buscar vendas:", vendasError);
      } else {
        setVendas(vendasData);
      }

      setLoading(false);
    };

    fetchSessionAndData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando dados do parceiro...</div>;
  }

  // Estilos simples para a tabela
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thStyle = { background: '#f2f2f2', padding: '12px', border: '1px solid #ddd', textAlign: 'left' };
  const tdStyle = { padding: '12px', border: '1px solid #ddd' };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Bem-vindo ao seu Dashboard, {user?.email}!</h1>
      
      <div style={{ margin: '30px 0', padding: '20px', background: '#e0f7fa', borderRadius: '8px' }}>
        <h2>Seu Link de Afiliado</h2>
        <p>Compartilhe este link para rastrear suas vendas:</p>
        <input 
          type="text" 
          readOnly 
          value={`https://www.medsinai.com.br/?pid=${user?.id}`} 
          style={{ width: '100%', padding: '10px', marginTop: '10px', border: '1px solid #b2dfdb', borderRadius: '4px' }}
        />
      </div>

      <h2>Suas Vendas</h2>
      {vendas.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Plano</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda ) => (
              <tr key={venda.id}>
                <td style={tdStyle}>{new Date(venda.data_evento).toLocaleDateString()}</td>
                <td style={tdStyle}>{venda.nome_cliente}</td>
                <td style={tdStyle}>{venda.nome_plano}</td>
                <td style={tdStyle}>R$ {venda.valor}</td>
                <td style={tdStyle}>{venda.status_pagamento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Você ainda não realizou nenhuma venda.</p>
      )}
    </div>
  );
}
