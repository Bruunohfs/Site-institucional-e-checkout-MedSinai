import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import logo from '@/assets/logo.png';
import HeartbeatLine from '@/components/ui/HeartbeatLine';

// ===================================================================
// =================== ÍCONES PARA O RODAPÉ ==========================
// ===================================================================
const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.27.058 2.15.298 2.92.598.78.3 1.45.75 2.01 1.31s1.01 1.23 1.31 2.01c.3.77.54 1.65.598 2.92.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.058 1.27-.298 2.15-.598 2.92-.3.78-.75 1.45-1.31 2.01s-1.23 1.01-2.01 1.31c-.77.3-1.65.54-2.92.598-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.27-.058-2.15-.298-2.92-.598-.78-.3-1.45-.75-2.01-1.31s-1.01-1.23-1.31-2.01c-.3-.77-.54-1.65-.598-2.92-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.058-1.27.298-2.15.598-2.92.3-.78.75-1.45 1.31-2.01s1.23-1.01 2.01-1.31c.77-.3 1.65-.54 2.92-.598C8.416 2.175 8.796 2.163 12 2.163zm0 1.44c-3.115 0-3.486.01-4.706.06-1.14.05-1.8.25-2.3.45-.55.23-.98.5-1.4.95-.45.45-.72.85-.95 1.4-.2.5-.4 1.16-.45 2.3-.05 1.22-.06 1.59-.06 4.706s.01 3.486.06 4.706c.05 1.14.25 1.8.45 2.3.23.55.5.98.95 1.4.45.45.85.72 1.4.95.5.2 1.16.4 2.3.45 1.22.05 1.59.06 4.706.06s3.486-.01 4.706-.06c1.14-.05 1.8-.25 2.3-.45.55-.23.98-.5 1.4-.95.45-.45.72-.85.95-1.4.2-.5.4-1.16.45-2.3.05-1.22.06-1.59.06-4.706s-.01-3.486-.06-4.706c-.05-1.14-.25-1.8-.45-2.3-.23-.55-.5-.98-.95-1.4-.45-.45-.85-.72-1.4-.95-.5-.2-1.16-.4-2.3-.45-1.22-.05-1.59-.06-4.706-.06zM12 6.8c-2.86 0-5.18 2.32-5.18 5.18s2.32 5.18 5.18 5.18 5.18-2.32 5.18-5.18-2.32-5.18-5.18-5.18zm0 8.74c-1.96 0-3.56-1.6-3.56-3.56s1.6-3.56 3.56-3.56 3.56 1.6 3.56 3.56-1.6 3.56-3.56 3.56zm4.86-8.82c-.6 0-1.08.48-1.08 1.08s.48 1.08 1.08 1.08 1.08-.48 1.08-1.08-.48-1.08-1.08-1.08z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

function MainLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuIconColor = isScrolled ? 'bg-white' : 'bg-gray-800 dark:bg-white';

useEffect(() => {
  // Cria um objeto para manipular os parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Procura pelo parâmetro 'pid' (partner id)
  const partnerId = urlParams.get('pid');

  // Se um 'pid' for encontrado na URL...
  if (partnerId) {
    // ...salva ele no localStorage.
    // Isso garante que o ID não se perca durante a navegação.
    localStorage.setItem('medsinai_affiliate_id', partnerId);
    console.log(`ID de parceiro ${partnerId} foi salvo no localStorage.`);
  }
}, []);

  // Efeito para o cabeçalho com scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito para a rolagem suave após a navegação
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Efeito para gerenciar o tema (dark/light)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [theme]);

  // Função para navegar e rolar
  const handleNavigateAndScroll = (sectionId) => {
    navigate(`/#${sectionId}`);
    setIsMobileMenuOpen(false);
  };

  // Função para fechar o menu em links simples
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Função para trocar o tema
  const handleThemeSwitch = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Função para abrir o WhatsApp
  const openWhatsApp = () => {
    const whatsappNumber = "16992291295";
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank' );
    setIsMobileMenuOpen(false);
  };

  // --- FIM DA LÓGICA ---

  const navLinkTextColor = isScrolled ? 'text-white' : 'text-gray-700 dark:text-white';
  const navLinkClasses = `font-medium relative transition-colors duration-300 ${navLinkTextColor}`;

  return (
    <div className={`min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900`}>
      <header className={`px-6 py-4 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gradient-to-r from-green-400 to-blue-400 shadow-lg' : 'bg-transparent'}`}>
        <div className="w-full flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-x-3 flex-shrink-0">
            <img src={logo} alt="MedSinai Logo" className="h-10 w-auto" />
            <span className={`text-2xl font-bold ${navLinkTextColor}`}>
              MedSinai
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleNavigateAndScroll('services')} className={`${navLinkClasses} group`}>
              Especialidades
              <HeartbeatLine className="opacity-0 group-hover:opacity-100" />
            </button>

             <button onClick={() => handleNavigateAndScroll("plans")} className={`${navLinkClasses} group`}>
              Para Você
              <HeartbeatLine className="opacity-0 group-hover:opacity-100" />
            </button>

            <Link to="/empresas" onClick={handleLinkClick} className={`${navLinkClasses} group`}>
              Para Empresas
              <HeartbeatLine className="opacity-0 group-hover:opacity-100" />
            </Link>

            <button onClick={openWhatsApp} className={`${navLinkClasses} group`}>
              Contato
              <HeartbeatLine className="opacity-0 group-hover:opacity-100" />
            </button>

            <button onClick={handleThemeSwitch} className="p-2 rounded-full hover:bg-white/20 transition">
              {theme === 'light' ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isScrolled ? 'text-white' : 'text-gray-700 dark:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
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
              onClick={() => handleNavigateAndScroll('plans')}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              Assinar Agora
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button onClick={handleThemeSwitch} className="p-2 rounded-full hover:bg-white/20 transition">
              {theme === 'light' ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isScrolled ? 'text-white' : 'text-gray-700 dark:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                     ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2" // A cor do texto aqui não importa mais para o ícone
            >
              <div className={`w-6 h-6 flex flex-col justify-center items-center`}>
                {/* Aplicando a classe de cor dinâmica nos 3 spans do ícone */}
                <span className={`${mobileMenuIconColor} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`${mobileMenuIconColor} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`${mobileMenuIconColor} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        <div className={`md:hidden absolute top-full left-0 w-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="px-6 py-4 space-y-4">
            <button 
              onClick={() => handleNavigateAndScroll('services')}
              className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors"
            >
              Especialidades
            </button>
            <button 
              onClick={() => handleNavigateAndScroll('plans')}
              className="block w-full text-left text-white font-medium py-2 hover:text-blue-200 transition-colors"
            >
              Para Você 
            </button>

            <Link to="/empresas" onClick={handleLinkClick} className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors">
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
              onClick={() => handleNavigateAndScroll('plans')}
              className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        <Outlet />
        <ScrollRestoration />
      </main>

      <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300">
        <div className="container mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link to="/" className="text-white text-2xl font-bold">MedSinai</Link>
              <p className="text-gray-400">Sua saúde completa e seus benefícios ilimitados em um só lugar. Cuidando de você 24h por dia.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Navegação</h3>
              <ul className="space-y-2">
                <li><button onClick={() => handleNavigateAndScroll('services')} className="hover:text-white transition-colors">Especialidades</button></li>
                <li><button onClick={() => handleNavigateAndScroll('plans')} className="hover:text-white transition-colors">Planos</button></li>
                <li><Link to="/empresas" onClick={handleLinkClick} className="hover:text-white transition-colors">Para Empresas</Link></li>
                <li><button onClick={() => handleNavigateAndScroll('faq')} className="hover:text-white transition-colors">Dúvidas Frequentes</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/termos-de-uso" onClick={handleLinkClick} className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link to="/politica-de-privacidade" onClick={handleLinkClick} className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Siga-nos</h3>
              <div className="flex space-x-4">
                <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><InstagramIcon /></a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FacebookIcon /></a>
                <a href="#" onClick={openWhatsApp} className="hover:text-white transition-colors"><WhatsAppIcon /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 dark:bg-black/50 py-4 px-6">
          <div className="container mx-auto text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} MedSinai. Todos os direitos reservados.</p>
            <p className="mt-1">CNPJ: XX.XXX.XXX/0001-XX</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
