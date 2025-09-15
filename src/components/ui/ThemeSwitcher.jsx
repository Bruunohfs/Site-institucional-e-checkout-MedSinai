// src/components/ui/ThemeSwitcher.jsx

// Ícones de Sol e Lua (sem alterações, mas incluídos para referência)
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = ( ) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

export default function ThemeSwitcher({ theme, onThemeSwitch } ) {
  return (
    <button 
      onClick={onThemeSwitch} 
      // --- 1. Container principal ---
      // 'relative' para posicionar a bolinha, 'flex' para alinhar os ícones
      className="relative flex items-center w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1 transition-colors duration-300 ease-in-out"
      aria-label="Mudar tema"
    >
      {/* --- 2. A "bolinha" do switch --- */}
      {/* Posicionada de forma absoluta, se move com 'translate-x' */}
      <div 
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                    ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
      ></div>

      {/* --- 3. Container para os ícones --- */}
      {/* 'z-10' para ficar acima da bolinha, 'flex' para alinhar lado a lado */}
      <div className="relative z-10 flex justify-between w-full">
        <div className="w-6 h-6 flex items-center justify-center">
          <SunIcon />
        </div>
        <div className="w-6 h-6 flex items-center justify-center">
          <MoonIcon />
        </div>
      </div>
    </button>
  );
}
