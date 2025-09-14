import React from 'react';

// Ícones de Sol e Lua
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
 );

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
 );

export default function ThemeSwitcher({ theme, onThemeSwitch }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onThemeSwitch}
      className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${
        isDark ? 'bg-gray-600' : 'bg-gray-200'
      }`}
    >
      <span className="sr-only">Alternar tema</span>
      
      {/* Círculo que se move */}
      <span
        className={`absolute left-1 top-1 inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      />

      {/* Ícones dentro do botão */}
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
        <SunIcon />
      </span>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
        <MoonIcon />
      </span>
    </button>
  );
}
