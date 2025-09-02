import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';

function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigateAndScroll = (sectionId) => {
     if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleThemeSwitch = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme) {
    if (theme === "dark") {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
  else {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  setTheme(prefersDark ? 'dark' : 'light'); 
}
}, [theme]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const openWhatsApp = () => {
    const whatsappNumber = "16992291295";
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank' );
    setIsMobileMenuOpen(false);
  };

  return (

    <div className={`min-h-screen w-full flex flex-col ${theme}`}>
      <header className="bg-gradient-to-r from-green-400 to-blue-400 px-6 py-4 relative sticky top-0 z-50">
        <div className="w-full flex items-center justify-between">
          <Link to="/" className="text-white text-2xl font-bold">
          MedSinai
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => handleNavigateAndScroll('services')}
              className="text-white font-medium hover:text-yellow-200 transition-colors"
            >
              Especialidades
            </button>
            <button onClick={() => handleNavigateAndScroll("plans")}
             className="text-white font-medium hover:text-blue-200 transition-colors"
            >
              Para Você
            </button>

            <Link to="/empresas" className="text-white font-medium hover:text-yellow-200 transition-colors">
            Para Empresas
            </Link>

            <button 
              onClick={openWhatsApp}
              className="text-white font-medium hover:text-orange-200 transition-colors"
            >
              Contato
            </button>

            <button onClick={handleThemeSwitch} className="p-2 rounded-full hover:bg-white/20 transition">
               {theme === 'light' ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                   ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
             </button>
            </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={openWhatsApp}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              Entre em Contato
            </button>
            <button 
              onClick={() => scrollToSection('plans')}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              Assinar Agora
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button onClick={handleThemeSwitch} className="p-2 rounded-full hover:bg-white/20 transition">
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                 ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 )}
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              <div className={`w-6 h-6 flex flex-col justify-center items-center`}>
                <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        <div className={`md:hidden absolute top-full left-0 w-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="px-6 py-4 space-y-4">
            <button 
              onClick={() => scrollToSection('services')}
              className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors"
            >
              Sobre
            </button>
            <button 
              onClick={() => scrollToSection('plans')}
              className="block w-full text-left text-white font-medium py-2 hover:text-blue-200 transition-colors"
            >
              Para Você 
            </button>

            <Link to="/empresas" className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors">
              Para Empresas
            </Link>

            <button 
              onClick={openWhatsApp}
              className="block w-full text-left text-white font-medium py-2 hover:text-orange-200 transition-colors"
            >
              Contato
            </button>
            <button 
              onClick={openWhatsApp}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-white text-green-600 font-medium hover:bg-gray-100 transition-colors"
            >
              Entre em Contato
            </button>
            <button 
              onClick={() => scrollToSection('plans')}
              className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-8 px-6 dark:bg-gray-800">
        <div className="w-full text-center">
          <h3 className="text-2xl font-bold mb-4">MedSinai</h3>
          <p className="text-gray-300 mb-4">
            Cuidando da sua saúde com excelência e dedicação
          </p>
          <div className="text-gray-400">
            <p>© 2024 MedSinai. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
        <ScrollRestoration />
    </div>
  );
}

export default MainLayout;
