// src/pages/admin/AdminSidebar.jsx - VERSÃO FINAL CORRIGIDA

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
  BarChart3,
  UserCircle,
  LogOut
} from 'lucide-react';

// Componente reutilizável para os links
const SidebarItem = ({ icon, text, to, isCollapsed, onClick }) => {
  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors";
  const activeLinkStyle = "bg-gradient-to-r from-green-400 to-blue-400 text-white";
  const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700";

  return (
    <NavLink 
      to={to} 
      end={to === "/admin"}
      onClick={onClick}
      className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
      title={isCollapsed ? text : ''}
    >
      {icon}
      {!isCollapsed && <span>{text}</span>}
    </NavLink>
  );
};

export default function AdminSidebar({ user, onLogout, theme, onThemeSwitch, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  
  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
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
        className={`fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-40 flex flex-col
                    md:relative md:translate-x-0 transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Cabeçalho */}
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-700">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">MedSinai</h1>
                <p className="text-xs text-blue-400 font-semibold">PAINEL ADMIN</p>
              </div>
            )}
            <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
          </div>

          {/* =================================================================== */}
          {/* ==> NAVEGAÇÃO ATUALIZADA COM O SEPARADOR <== */}
          {/* =================================================================== */}
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/admin" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<ShoppingCart size={20} />} text="Clientes" to="/admin/clientes" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<BarChart3 size={20} />} text="Vendas" to="/admin/vendas" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<Building size={20} />} text="Leads Empresas" to="/admin/leads-empresas" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<Handshake size={20} />} text="Leads Parceiros" to="/admin/leads-parceiros" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<DollarSign size={20} />} text="Financeiro" to="/admin/financeiro" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<MessageSquare size={20} />} text="Depoimentos" to="/admin/depoimentos" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<FolderKanban size={20} />} text="Material de Apoio" to="/admin/conteudo" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            <SidebarItem icon={<Users size={20} />} text="Contas" to="/admin/contas" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            
            {/* A linha divisória e o link "Minha Conta" */}
            <div className="pt-4 mt-4 border-t border-gray-700">
              <SidebarItem icon={<UserCircle size={20} />} text="Minha Conta" to="/admin/minha-conta" isCollapsed={isCollapsed} onClick={handleLinkClick} />
            </div>
          </nav>

          {/* =================================================================== */}
          {/* ==> RODAPÉ ATUALIZADO PARA ESPELHAR O DO PARCEIRO <== */}
          {/* =================================================================== */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.profile?.nome_completo ? user.profile.nome_completo[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : '?')}
                </span>
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate" title={user?.profile?.nome_completo || 'Administrador'}>
                    {user?.profile?.nome_completo || 'Administrador'}
                  </p>
                  <p className="text-xs text-gray-400 truncate" title={user?.email}>{user?.email}</p>
                  <p className="text-xs font-bold text-blue-400 mt-1">Administrador</p>
                </div>
              )}
            </div>
            <button 
              onClick={onLogout} 
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 font-medium transition-colors"
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Botão de Recolher */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`hidden md:block absolute top-1/2 -translate-y-1/2 bg-gray-800 text-white p-1 rounded-full border-2 border-gray-700 shadow-lg transition-all duration-300 ease-in-out z-50
                    ${isCollapsed ? 'left-20 -translate-x-1/2' : 'left-64 -translate-x-1/2'}`}
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        <ChevronsLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>
    </>
  );
}
