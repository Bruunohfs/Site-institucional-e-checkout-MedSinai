// src/pages/admin/AdminSidebar.jsx

import { NavLink } from 'react-router-dom';

// Ícones para o menu
const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-8 4 4 0 010 8z"></path></svg>;
const ContentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;

export default function AdminSidebar({ user, onLogout }) {
  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700";
  const activeLinkStyle = "bg-blue-600 text-white";

  return (
    <div className="w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">MedSinai</h1>
        <p className="text-xs text-blue-400 font-semibold">PAINEL ADMIN</p>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavLink to="/admin" end className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <DashboardIcon /> Dashboard
        </NavLink>
        <NavLink to="/admin/parceiros" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <UsersIcon /> Parceiros
        </NavLink>
        <NavLink to="/admin/conteudo" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
          <ContentIcon /> Conteúdo
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
        <p className="text-xs text-blue-400">Administrador</p>
        <button onClick={onLogout} className="w-full mt-2 text-left text-sm text-red-400 hover:text-red-300 font-medium">
          Sair
        </button>
      </div>
    </div>
  );
}
