// src/layouts/AdminLayout.jsx - VERSÃO FINAL ATUALIZADA

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import AdminSidebar from '../pages/admin/AdminSidebar';
import useTracker from '@/hooks/useTracker';
import { Menu } from 'lucide-react';

export default function AdminLayout() {
  useTracker();
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Agora vai armazenar o usuário completo com perfil
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || session.user.user_metadata?.role !== 'admin') {
        navigate('/parceiros/login');
        return;
      }

      // ===================================================================
      // ==> A MUDANÇA ESTÁ AQUI: BUSCANDO O PERFIL JUNTO COM A SESSÃO <==
      // ===================================================================
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil do admin:", profileError);
        // Mesmo com erro no perfil, continuamos com os dados da sessão
        setUser(session.user);
      } else {
        // Combinamos os dados da sessão com os dados do perfil
        setUser({
          ...session.user,
          profile: profile,
        });
      }
      
      setLoading(false);
    };
    fetchSessionAndProfile();
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
    <div className="relative flex h-screen bg-gray-300 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <AdminSidebar 
        user={user} 
        onLogout={handleLogout}
        theme={theme}
        onThemeSwitch={handleThemeSwitch}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md border-b dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold">MedSinai</h1>
            <p className="text-xs font-semibold text-blue-400">PAINEL ADMIN</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-gray-500 dark:text-gray-400">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
