import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import AdminSidebar from '../pages/admin/AdminSidebar';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. LÓGICA DE TEMA ADICIONADA AQUI ---
  const [theme, setTheme] = useState(() => {
    // Pega o tema do localStorage ou usa a preferência do sistema
    return localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Aplica a classe 'dark' no HTML e salva a preferência
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Lógica de segurança (sem alterações)
  useEffect(() => {
    const fetchSessionAndCheckRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.user_metadata?.role !== 'admin') {
        navigate('/parceiros/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    fetchSessionAndCheckRole();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/parceiros/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        Verificando permissões de administrador...
      </div>
    );
  }

  return (
    // --- 2. CORES DINÂMICAS NO LAYOUT PRINCIPAL ---
    <div className="flex h-screen bg-gray-300 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <AdminSidebar 
        user={user} 
        onLogout={handleLogout}
        theme={theme} // Passa o tema atual
        onThemeSwitch={handleThemeSwitch} // Passa a função de troca
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
