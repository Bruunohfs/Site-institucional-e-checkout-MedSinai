// src/pages/admin/AdminSidebar.jsx

import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';

// Ícones existentes
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a3 3 0 00-3-3H9a3 3 0 00-3 3v1a6 6 0 006 6z"></path></svg>;
const ContentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;
const SalesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const TestimonialIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>;
const FinanceIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;


export default function AdminSidebar({ user, onLogout, theme, onThemeSwitch, isOpen, setIsOpen }) {
  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors";
  const activeLinkStyle = "bg-gradient-to-r from-green-400 to-blue-400 text-white";
  const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700";

  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-40 flex flex-col
                    md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-white">MedSinai</h1>
            <p className="text-xs text-blue-400 font-semibold">PAINEL ADMIN</p>
          </div>
          <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <NavLink to="/admin" end onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <DashboardIcon /> Dashboard
          </NavLink>
          <NavLink to="/admin/parceiros" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <UsersIcon /> Parceiros
          </NavLink>
          <NavLink to="/admin/vendas" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <SalesIcon /> Vendas
          </NavLink>
          <NavLink to="/admin/conteudo" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <ContentIcon /> Conteúdo
          </NavLink>
          <NavLink to="/admin/depoimentos" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <TestimonialIcon /> Depoimentos
          </NavLink>

          {/* <-- ADIÇÃO: Link para a página Financeiro --> */}
          <NavLink to="/admin/financeiro" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <FinanceIcon /> Financeiro
          </NavLink>

        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-sm font-medium text-white truncate">{user?.email}</p>
          <p className="text-xs text-blue-400">Administrador</p>
          <button onClick={onLogout} className="w-full mt-2 text-left text-sm text-red-500 hover:text-red-600 font-medium">
            Sair
          </button>
        </div>
      </div>
    </>
  );
}
