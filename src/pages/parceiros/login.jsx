import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import logo from '../../assets/logo.png';


// --- 2. ÍCONES PARA O BOTÃO DE TEMA ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;


export default function LoginPage( ) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 3. LÓGICA DO TEMA (DARK/LIGHT MODE) ---
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    // Se não houver tema salvo, verifica a preferência do sistema
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Aplica a classe 'dark' ao HTML e salva a preferência
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // 1. Faz o login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. Se houver erro no login, mostra a mensagem
  if (error) {
    setError('E-mail ou senha inválidos. Por favor, tente novamente.');
    setLoading(false);
    return; // Para a execução aqui
  }

  // 3. Se o login for bem-sucedido, verifica o 'role'
  if (data.user) {
    const userRole = data.user.user_metadata?.role;
    const userStatus = data.user.user_metadata?.status;

    if (userStatus === 'inativo') {
      setError('Sua conta de parceiro está desativada. Entre em contato com o suporte.');
      await supabase.auth.signOut(); // Desloga o usuário imediatamente
      setLoading(false);
      return;
    }

    // 4. Redireciona com base no 'role'
    if (userRole === 'admin') {
      console.log('Admin detectado. Redirecionando para /admin...');
      navigate('/admin');
    } else {
      console.log('Parceiro detectado. Redirecionando para /parceiros/dashboard...');
      navigate('/parceiros/dashboard');
    }
  } else {
    // Fallback, caso algo muito estranho aconteça
    setError('Não foi possível verificar os dados do usuário.');
    setLoading(false);
  }
};

  return (
    // A div principal agora tem cores de fundo que mudam com o tema
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <title>Login | Portal do Parceiro MedSinai</title>
      {/* --- 4. BOTÃO DE TEMA POSICIONADO NO CANTO --- */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={handleThemeSwitch} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {/* O card de login */}
      <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        
        {/* --- 5. LOGO ADICIONADO AQUI --- */}
        <div className="flex justify-center">
          <img src={logo} alt="MedSinai Logo" className="h-32 w-auto" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Portal do Parceiro
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              placeholder="Sua senha"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-4 font-semibold text-white bg-gradient-to-r from-green-400 to-blue-400 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
