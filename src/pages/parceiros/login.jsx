import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Use as variáveis de ambiente para as chaves do Supabase!
// Estas são as chaves PÚBLICAS (anon), seguras para usar no frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error; // Joga o erro para o bloco catch
      }

      // Se o login for bem-sucedido, redireciona para o dashboard
      console.log('Login bem-sucedido!', data);
      window.location.href = '/parceiros/dashboard'; // Vamos criar essa página depois

    } catch (error) {
      console.error("Erro no login:", error.message);
      setError('E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Estilos simples para a página (pode ser substituído pela sua biblioteca de UI)
  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
    form: { padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '360px' },
    title: { textAlign: 'center', color: '#333', marginBottom: '24px' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { width: '100%', padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', textAlign: 'center', marginTop: '16px' }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Portal de Parceiros</h2>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
