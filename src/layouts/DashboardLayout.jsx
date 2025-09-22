// src/layouts/DashboardLayout.jsx

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from "../pages/parceiros/Sidebar.jsx";
import useTracker from '@/hooks/useTracker';

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

export default function DashboardLayout() {
  useTracker();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const userRole = user?.user_metadata?.role;

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeSwitch = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/parceiros/login'); };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/parceiros/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    fetchSession();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">Carregando...</div>;
  }

  // ===================================================================
  // ==> CORREÇÃO AQUI <==
  // ===================================================================
  return (
    <div className="flex h-screen bg-gray-300 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-x-hidden">
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        theme={theme} 
        onThemeSwitch={handleThemeSwitch}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
          <h1 className="text-lg font-bold">MedSinai</h1>
          
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                ADMIN
              </span>
            )}
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-gray-500 dark:text-gray-400">
              <MenuIcon />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ user, userRole }} />
        </main>
      </div>
    </div>
  );
}
