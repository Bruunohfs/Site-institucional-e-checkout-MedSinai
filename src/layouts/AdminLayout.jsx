// src/layouts/AdminLayout.jsx

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient.js'; // Já usando o alias!
import AdminSidebar from '../pages/admin/AdminSidebar';

// Ícone do menu hambúrguer
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- 1. ADICIONAR ESTADO PARA O MENU MOBILE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lógica de tema (sem alterações)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

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
    <div className="flex h-screen bg-gray-300 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* --- 2. PASSAR AS PROPS DE CONTROLE DO MENU PARA O SIDEBAR --- */}
      <AdminSidebar 
        user={user} 
        onLogout={handleLogout}
        theme={theme}
        onThemeSwitch={handleThemeSwitch}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- 3. ADICIONAR O CABEÇALHO MOBILE --- */}
        <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md border-b dark:border-gray-700">
          <div>
            <h1 className="text-lg font-bold">MedSinai</h1>
            <p className="text-xs font-semibold text-blue-400">PAINEL ADMIN</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-gray-500 dark:text-gray-400">
            <MenuIcon />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
