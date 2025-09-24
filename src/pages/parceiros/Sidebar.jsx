// src/pages/parceiros/Sidebar.jsx - VERSÃO FINAL COM SCROLLBAR CUSTOMIZADO E RESPONSIVO AO TEMA

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';
import { supabase } from '@/lib/supabaseClient';

import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  BookOpen, 
  Calculator, 
  DollarSign, 
  User, 
  LogOut,
  ChevronsLeft
} from 'lucide-react';

export default function Sidebar({ user, onLogout, theme, onThemeSwitch, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const [displayName, setDisplayName] = useState('Parceiro');

  useEffect(() => {
    const fetchProfileName = async () => {
      if (user?.id) {
        const { data: profile, error } = await supabase.from('profiles').select('nome_completo').eq('id', user.id).single();
        const finalName = profile?.nome_completo || user.user_metadata?.nome || 'Parceiro';
        setDisplayName(finalName);
      }
    };
    fetchProfileName();
    const handleProfileUpdate = () => fetchProfileName();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors transition-opacity";
  const activeLinkStyle = "bg-gradient-to-r from-green-400 to-blue-400 text-white";
  const inactiveLinkStyle = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
  const userRole = user?.user_metadata?.role;

  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
    <>
      {/* Overlay para mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Container Principal do Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full w-64 z-40 transition-all duration-300 ease-in-out
          md:relative md:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-0' : 'md:w-64'}
        `}
      >
        {/* ==> ATUALIZAÇÃO 1: Adicionando flex-col ao container interno <== */}
        <div className={`
          flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          min-w-[16rem] overflow-hidden transition-opacity duration-200
          ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}>
          
          {/* Cabeçalho (não rola) */}
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">MedSinai</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Portal do Parceiro</p>
            </div>
            <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
          </div>

          {/* ==> ATUALIZAÇÃO 2: Classes de scrollbar customizado e responsivo ao tema <== */}
          <nav className={`
            flex-grow p-4 space-y-2 overflow-y-auto
            scrollbar-thin 
            scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 
            scrollbar-track-white dark:scrollbar-track-gray-800 
            hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
          `}>
            <NavLink to="/parceiros/dashboard" end onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</NavLink>
            <NavLink to="/parceiros/oportunidades" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><Target className="w-5 h-5" /> Oportunidades</NavLink>
            <NavLink to="/parceiros/analytics" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><BarChart3 className="w-5 h-5" /> Análises e Gráficos</NavLink>
            <NavLink to="/parceiros/materiais" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><BookOpen className="w-5 h-5" /> Material de Apoio</NavLink>
            <NavLink to="/parceiros/calculadora" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><Calculator className="w-5 h-5" /> Simulação de Vendas</NavLink>
            <NavLink to="/parceiros/financeiro" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><DollarSign className="w-5 h-5" /> Meu Financeiro</NavLink>
            <div className="pt-4 mt-4 border-t border-gray-300 dark:border-gray-700">
             <NavLink to="/parceiros/minha-conta" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><User className="w-5 h-5" /> Minha Conta</NavLink>
            </div>
          </nav>

          {/* Rodapé (não rola) */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-white flex-shrink-0">{displayName?.charAt(0).toUpperCase() || '?'}</div><div className="overflow-hidden"><p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{displayName}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>{userRole === 'admin' && (<p className="text-xs font-bold text-green-500 dark:text-green-400 mt-1">Administrador</p>)}</div></div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 font-medium transition-colors"><LogOut className="w-5 h-5" /> Sair</button>
          </div>
        </div>
      </div>

      {/* Botão de Recolher */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          hidden md:block absolute top-1/2 -translate-y-1/2 z-50
          bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 
          hover:bg-blue-500 hover:text-white
          p-1 rounded-full shadow-lg border border-gray-300 dark:border-gray-600
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'left-0' : 'left-64 -translate-x-1/2'}
        `}
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        <ChevronsLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>
    </>
  );
}
