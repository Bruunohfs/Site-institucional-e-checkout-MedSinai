import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';
import { supabase } from '@/lib/supabaseClient';

// --- ÍCONES (ATUALIZADOS) ---
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const BookOpenIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;

// NOVO ÍCONE PARA FINANCEIRO
const CashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;

// NOVO ÍCONE PARA OPORTUNIDADES
const TargetIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"></path></svg>;


export default function Sidebar({ user, onLogout, theme, onThemeSwitch, isOpen, setIsOpen }) {
  const [displayName, setDisplayName] = useState('Parceiro');

  useEffect(() => {
    const fetchProfileName = async () => {
      if (user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nome_completo')
          .eq('id', user.id)
          .single();
        
        const finalName = profile?.nome_completo || user.user_metadata?.nome || 'Parceiro';
        setDisplayName(finalName);
      }
    };

    fetchProfileName();

    const handleProfileUpdate = () => {
      fetchProfileName();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors";
  const activeLinkStyle = "bg-gradient-to-r from-green-400 to-blue-400 text-white";
  const inactiveLinkStyle = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
  const userRole = user?.user_metadata?.role;

  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-64 z-40 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">MedSinai</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Portal do Parceiro</p>
            </div>
            <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
          </div>

          <nav className="flex-grow p-4 space-y-2">
            <NavLink to="/parceiros/dashboard" end onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><HomeIcon />Dashboard</NavLink>
            
            {/* =================================================================== */}
            {/* ==> NOVO LINK AQUI <== */}
            {/* =================================================================== */}
            <NavLink to="/parceiros/oportunidades" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><TargetIcon /> Oportunidades</NavLink>
            
            <NavLink to="/parceiros/analytics" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><ChartIcon /> Análises e Gráficos</NavLink>
            <NavLink to="/parceiros/materiais" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><BookOpenIcon /> Material de Apoio</NavLink>
            
            {/* =================================================================== */}
            {/* ==> ÍCONE ATUALIZADO AQUI <== */}
            {/* =================================================================== */}
            <NavLink to="/parceiros/financeiro" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><CashIcon /> Meu Financeiro</NavLink>
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
             <NavLink to="/parceiros/minha-conta" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><SettingsIcon /> Minha Conta</NavLink>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                {displayName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                {userRole === 'admin' && (<p className="text-xs font-bold text-green-500 dark:text-green-400 mt-1">Administrador</p>)}
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 font-medium transition-colors"><LogoutIcon /> Sair</button>
          </div>
        </div>
      </div>
    </>
  );
}
