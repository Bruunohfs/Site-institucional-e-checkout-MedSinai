
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';
import { LayoutDashboard, Users, Handshake, Building, MessageSquare, DollarSign, FolderKanban, ShoppingCart, ChevronsLeft } from 'lucide-react';

const SalesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;

export default function AdminSidebar({ user, onLogout, theme, onThemeSwitch, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  // ==> A CORREÇÃO ESTÁ AQUI: Adicionado 'transition-opacity' ao estilo do link <==
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
      {/* Overlay para mobile (sem alterações) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Container Principal do Sidebar */}
      <div 
        className={`
          bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out
          fixed top-0 left-0 h-full w-64 z-40 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 
          ${isCollapsed ? 'md:w-0' : 'md:w-64'}
        `}
      >
        <div className={`
          min-w-[16rem] flex flex-col h-full overflow-hidden transition-opacity duration-200 
          ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}>
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <div>
              <h1 className="text-xl font-bold text-white">MedSinai</h1>
              <p className="text-xs text-blue-400 font-semibold">PAINEL ADMIN</p>
            </div>
            <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
          </div>

          <nav className="flex-grow p-4 space-y-2">
            {/* Links do menu (sem alterações) */}
            <NavLink to="/admin" end onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</NavLink>
            <NavLink to="/admin/parceiros" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><Users className="w-5 h-5" /> Parceiros</NavLink>
            <NavLink to="/admin/clientes" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><ShoppingCart className="w-5 h-5" /> Clientes</NavLink>
            <NavLink to="/admin/vendas" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><SalesIcon /> Vendas</NavLink>
            <NavLink to="/admin/leads-empresas" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><Building className="w-5 h-5" /> Leads Empresas</NavLink>
            <NavLink to="/admin/leads-parceiros" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><Handshake className="w-5 h-5" /> Leads Parceiros</NavLink>
            <NavLink to="/admin/depoimentos" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><MessageSquare className="w-5 h-5" /> Depoimentos</NavLink>
            <NavLink to="/admin/financeiro" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><DollarSign className="w-5 h-5" /> Financeiro</NavLink>
            <NavLink to="/admin/conteudo" onClick={handleLinkClick} className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}><FolderKanban className="w-5 h-5" /> Material de Apoio</NavLink>
          </nav>

          <div className="p-4 border-t border-gray-700">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-blue-400">Administrador</p>
            <button onClick={onLogout} className="w-full mt-2 text-left text-sm text-red-500 hover:text-red-600 font-medium">Sair</button>
          </div>
        </div>
      </div>

      {/* Botão de recolher (sem alterações) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          hidden md:block absolute top-1/2 -translate-y-1/2 z-50
          bg-gray-700 hover:bg-blue-500 text-white p-1 rounded-full
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'left-0 transform -translate-x-1/2' : 'left-64 transform -translate-x-1/2'}
        `}
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        <ChevronsLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>
    </>
  );
}
