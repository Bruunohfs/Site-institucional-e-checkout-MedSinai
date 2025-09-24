// src/pages/admin/AdminSidebar.jsx - VERSÃO FINAL COM SCROLLBAR CUSTOMIZADO

import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';
import { 
  LayoutDashboard, 
  Users, 
  Handshake, 
  Building, 
  MessageSquare, 
  DollarSign, 
  FolderKanban, 
  ShoppingCart,
  ChevronsLeft,
  BarChart3
} from 'lucide-react';

export default function AdminSidebar({ user, onLogout, theme, onThemeSwitch, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  
  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors transition-opacity";
  const activeLinkStyle = "bg-gradient-to-r from-green-400 to-blue-400 text-white";
  const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700";

  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para fechar no mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Container Principal do Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-40 flex flex-col
                    md:relative md:translate-x-0 transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isCollapsed ? 'w-0' : 'w-64'}`}
      >
        <div className={`flex flex-col h-full overflow-hidden transition-opacity duration-200 
          ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}>
          
          {/* Cabeçalho (não rola) */}
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-700">
            <div>
              <h1 className="text-xl font-bold text-white">MedSinai</h1>
              <p className="text-xs text-blue-400 font-semibold">PAINEL ADMIN</p>
            </div>
            <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
          </div>

          {/* ==> ATUALIZAÇÃO FINAL: Classes de scrollbar customizado <== */}
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto 
                       scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
            <NavLink to="/admin" end onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </NavLink>
            <NavLink to="/admin/parceiros" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <Users className="w-5 h-5" /> Parceiros
            </NavLink>
            <NavLink to="/admin/clientes" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <ShoppingCart className="w-5 h-5" /> Clientes
            </NavLink>
            <NavLink to="/admin/vendas" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <BarChart3 className="w-5 h-5" /> Vendas
            </NavLink>
            <NavLink to="/admin/leads-empresas" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <Building className="w-5 h-5" /> Leads Empresas
            </NavLink>
            <NavLink to="/admin/leads-parceiros" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <Handshake className="w-5 h-5" /> Leads Parceiros
            </NavLink>
            <NavLink to="/admin/depoimentos" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <MessageSquare className="w-5 h-5" /> Depoimentos
            </NavLink>
            <NavLink to="/admin/financeiro" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <DollarSign className="w-5 h-5" /> Financeiro
            </NavLink>
            <NavLink to="/admin/conteudo" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
              <FolderKanban className="w-5 h-5" /> Material de Apoio
            </NavLink>
          </nav>

          {/* Rodapé (não rola) */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-blue-400">Administrador</p>
            <button onClick={onLogout} className="w-full mt-2 text-left text-sm text-red-500 hover:text-red-600 font-medium">
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Botão de Recolher (fora do container principal) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`hidden md:block absolute top-1/2 -translate-y-1/2 bg-gray-800 text-white p-1 rounded-full border-2 border-gray-700 shadow-lg transition-all duration-300 ease-in-out z-50
                    ${isCollapsed ? 'left-0' : 'left-64 -translate-x-1/2'}
                  `}
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        <ChevronsLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>
    </>
  );
}
