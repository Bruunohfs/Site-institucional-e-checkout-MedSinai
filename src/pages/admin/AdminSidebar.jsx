import { NavLink } from 'react-router-dom';
// --- 1. IMPORTAR O THEME SWITCHER ---
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';

// Ícones (sem alterações)
const DashboardIcon = () => { /* ... */ };
const UsersIcon = () => { /* ... */ };
const ContentIcon = () => { /* ... */ };
const SalesIcon = () => { /* ... */ };

// --- 2. RECEBER AS PROPS DE TEMA ---
export default function AdminSidebar({ user, onLogout, theme, onThemeSwitch }) {
  // --- 3. CLASSES DE ESTILO DINÂMICAS ---
  const linkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors";
  const activeLinkStyle = "bg-blue-600 text-white";
  // Estilo para links inativos que muda com o tema
  const inactiveLinkStyle = "text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700";

  return (
    // --- 4. CORES DINÂMICAS NO COMPONENTE ---
    <div className="w-64 flex-shrink-0 bg-gray-800 dark:bg-gray-800 border-r border-gray-500 dark:border-gray-500 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700 dark:border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white dark:text-white">MedSinai</h1>
          <p className="text-xs text-blue-400 dark:text-blue-400 font-semibold">PAINEL ADMIN</p>
        </div>
        {/* --- 5. ADICIONAR O BOTÃO DE TEMA --- */}
        <ThemeSwitcher theme={theme} onThemeSwitch={onThemeSwitch} />
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavLink to="/admin" end className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
          <DashboardIcon /> Dashboard
        </NavLink>
        <NavLink to="/admin/parceiros" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
          <UsersIcon /> Parceiros
        </NavLink>
        <NavLink to="/admin/vendas" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
          <SalesIcon /> Vendas
        </NavLink>
        <NavLink to="/admin/conteudo" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
          <ContentIcon /> Conteúdo
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-700 dark:border-gray-700">
        <p className="text-sm font-medium text-white dark:text-white truncate">{user?.email}</p>
        <p className="text-xs text-blue-400 dark:text-blue-400">Administrador</p>
        <button onClick={onLogout} className="w-full mt-2 text-left text-sm text-red-500 hover:text-red-600 font-medium">
          Sair
        </button>
      </div>
    </div>
  );
}
