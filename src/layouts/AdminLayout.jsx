// src/layouts/AdminLayout.jsx - VERSÃO FINAL ATUALIZADA

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js';
import AdminSidebar from '../pages/admin/AdminSidebar';
import useTracker from '@/hooks/useTracker';
import { NotificationProvider } from '../components/notifications/NotificationContext';
import NotificationContainer from '../components/notifications/NotificationContainer';
import { Menu } from 'lucide-react'; // Usando o ícone da Lucide para consistência

export default function AdminLayout() {
  useTracker();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  // ==> ATUALIZAÇÃO 1: Novo estado para controlar o sidebar no desktop <==
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
    <NotificationProvider>
      {/* ==> ATUALIZAÇÃO 2: Adicionando 'relative' ao container principal <== */}
      <div className="relative flex h-screen bg-gray-300 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        
        <NotificationContainer />

        <AdminSidebar 
          user={user} 
          onLogout={handleLogout}
          theme={theme}
          onThemeSwitch={handleThemeSwitch}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
          // ==> ATUALIZAÇÃO 3: Passando o estado e a função para o sidebar <==
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
    </NotificationProvider>
  );
}
