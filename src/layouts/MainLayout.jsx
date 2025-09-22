import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import logo from '@/assets/logo.webp';
import HeartbeatLine from '@/components/ui/HeartbeatLine';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';

// ===================================================================
// =================== ÍCONES PARA O RODAPÉ ==========================
// ===================================================================
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// VERSÃO CORRIGIDA DO ÍCONE DO INSTAGRAM
const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.25-9.75a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
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

  const isCheckoutPage = location.pathname.startsWith('/pagamento');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('pid');
    if (partnerId) {
      localStorage.setItem('medsinai_affiliate_id', partnerId);
      console.log(`ID de parceiro ${partnerId} foi salvo no localStorage.`);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleNavigateAndScroll = (sectionId) => {
    navigate(`/#${sectionId}`);
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleThemeSwitch = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const openWhatsApp = () => {
    const whatsappNumber = "16992291295";
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank'     );
    setIsMobileMenuOpen(false);
  };

  const navLinkTextColor = isScrolled ? 'text-white' : 'text-gray-700 dark:text-white';
  const navLinkClasses = `font-medium relative transition-colors duration-300 ${navLinkTextColor}`;

  return (
    <div className={`min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900`}>
      <header className={`relative px-4 sm:px-6 py-4 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gradient-to-r from-green-400 to-blue-400 shadow-lg' : 'bg-transparent'}`}>
         <div className="container mx-auto w-full flex items-center justify-between gap-4">
          
          <Link to="/" className="flex items-center gap-x-3 flex-shrink-0">
            <img src={logo} alt="MedSinai Logo" className="h-10 w-auto" />
            <span className={`text-2xl font-bold ${navLinkTextColor}`}>
              MedSinai
            </span>
          </Link>
          
          {!isCheckoutPage && (
            <nav className="hidden lg:flex items-center gap-x-8">
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
              <Link to="/sejaparceiro" onClick={handleLinkClick} className={`${navLinkClasses} group`}>
              Seja um Parceiro
              <HeartbeatLine className="opacity-0 group-hover:opacity-100" />
            </Link>
            </nav>
          )}

          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <ThemeSwitcher theme={theme} onThemeSwitch={handleThemeSwitch} />

            {!isCheckoutPage && (
              <>
                <div className="hidden lg:flex items-center gap-x-4">
                  <Link 
                  to="/parceiros/login" 
                  className="flex items-center gap-x-2 px-3 py-2 rounded-lg bg-white text-green-600 font-bold hover:bg-gray-200 transition-colors whitespace-nowrap shadow-sm"
                >
                  <UserIcon />
                  Portal do Parceiro
                </Link>
                </div>

                <div className="lg:hidden">
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <div className={`w-6 h-6 flex flex-col justify-center items-center`}>
                      <span className={`${mobileMenuIconColor} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                      <span className={`${mobileMenuIconColor} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                      <span className={`${mobileMenuIconColor} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`lg:hidden absolute top-full left-0 w-full bg-gradient-to-r from-green-400 to-blue-400 shadow-lg transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen py-4' : 'max-h-0 py-0 overflow-hidden'}`}>
          <div className="px-6 space-y-4">
            <button onClick={() => handleNavigateAndScroll('services')} className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors">
              Especialidades
            </button>
            <button onClick={() => handleNavigateAndScroll('plans')} className="block w-full text-left text-white font-medium py-2 hover:text-blue-200 transition-colors">
              Para Você 
            </button>
            <Link to="/empresas" onClick={handleLinkClick} className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors">
              Para Empresas
            </Link>
            <Link to="/sejaparceiro" onClick={handleLinkClick} className="block w-full text-left text-white font-medium py-2 hover:text-yellow-200 transition-colors">
              Seja um Parceiro
            </Link>
            <div className="border-t border-white/20 pt-4 space-y-4">
              <Link 
                to="/parceiros/login" 
                onClick={handleLinkClick}
                className="w-full flex items-center justify-center gap-x-2 px-4 py-3 rounded-lg bg-white text-green-600 font-medium hover:bg-gray-100 transition-colors"
                >
                <UserIcon />
                Portal do Parceiro
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        <Outlet />
        <ScrollRestoration />
      </main>

      {!isCheckoutPage && (
        <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300">
          <div className="container mx-auto py-12 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <Link to="/" className="text-white text-2xl font-bold">MedSinai</Link>
                <p className="text-gray-400">Sua saúde completa e seus benefícios ilimitados em um só lugar. Cuidando de você 24h por dia.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Navegação</h3>
                {/* =================================================================== */}
                {/* =================== NAVEGAÇÃO ATUALIZADA AQUI ===================== */}
                {/* =================================================================== */}
                <ul className="space-y-2">
                  <li><button onClick={() => handleNavigateAndScroll('services')} className="hover:text-white transition-colors">Especialidades</button></li>
                  <li><button onClick={() => handleNavigateAndScroll('plans')} className="hover:text-white transition-colors">Planos</button></li>
                  <li><Link to="/empresas" onClick={handleLinkClick} className="hover:text-white transition-colors">Para Empresas</Link></li>
                  <li><Link to="/sejaparceiro" onClick={handleLinkClick} className="hover:text-white transition-colors">Seja um Parceiro</Link></li>
                  <li><Link to="/parceiros/login" onClick={handleLinkClick} className="hover:text-white transition-colors">Portal do Parceiro</Link></li>
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
                  <a href="https://www.instagram.com/medsinai/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><InstagramIcon /></a>
                  <a href="https://www.facebook.com/profile.php?id=61580940337404" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FacebookIcon /></a>
                  <a href="#" onClick={openWhatsApp} className="hover:text-white transition-colors"><WhatsAppIcon /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-black/50 py-4 px-6">
            <div className="container mx-auto text-center text-gray-500 text-sm">
              <p>&copy; {new Date( ).getFullYear()} MedSinai. Todos os direitos reservados.</p>
              <p className="mt-1">CNPJ: 35.202.378/0001-52</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default MainLayout;
