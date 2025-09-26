import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import AnalyticsWrapper from './components/AnalyticsWrapper.jsx';

// IMPORTAÇÕES GLOBAIS
import { NotificationProvider } from './components/notifications/NotificationContext';
import NotificationContainer from './components/notifications/NotificationContainer';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx'; 
import BlankLayout from './layouts/BlankLayout.jsx';
import AdminLayout from './layouts/AdminLayout';

// Landing Pages
import LandingPageEsc from './pages/Landingpages/LandingPageEscritorio.jsx';
import LandingPageCom from './pages/Landingpages/LandingPageComercio.jsx';
import LandingPageInd from './pages/Landingpages/LandingPageIndustria.jsx';

// Páginas Principais
import App from './App.jsx';
import EmpresasPage from './pages/EmpresasPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ParceirosPage from './pages/ParceirosPage';
import PoliticaDePrivacidade from './pages/PoliticaDePrivacidade.jsx';
import TermosDeUso from './pages/TermosDeUso.jsx';

// Páginas de Parceiros
import LoginPage from './pages/parceiros/login.jsx';
import DashboardPage from './pages/parceiros/dashboard.jsx'; 
import AnalyticsPage from './pages/parceiros/AnalyticsPage';
import SupportMaterialPage from './pages/parceiros/SupportMaterialPage';
import MinhaContaPage from './pages/parceiros/MinhaConta.jsx';
import FinanceiroParceiroPage from './pages/parceiros/FinanceiroParceiroPage';
import OportunidadesPage from './pages/parceiros/OportunidadesPage';
import CalculadoraPage from './pages/parceiros/CalculadoraPage';

// Páginas de Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import GerenciarContas from './pages/admin/GerenciarContas.jsx';
import GerenciarConteudo from './pages/admin/GerenciarConteudo';
import VisaoGeralVendas from './pages/admin/VisaoGeralVendas';
import GerenciarDepoimentos from './pages/admin/GerenciarDepoimentos';
import GerenciarLeadsEmpresas from './pages/admin/GerenciarLeadsEmpresas';
import GerenciarLeadsParceiros from './pages/admin/GerenciarLeadsParceiros';
import FinanceiroAdminPage from './pages/admin/FinanceiroAdminPage';
import GerenciarClientes from './pages/admin/GerenciarClientes';
import MinhaContaAdmin from './pages/admin/MinhaContaAdmin';

const router = createBrowserRouter([
  // --- ROTAS COM O LAYOUT PRINCIPAL (CABEÇALHO E RODAPÉ) ---
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "empresas", element: <EmpresasPage /> },
      { path: "sejaparceiro", element: <ParceirosPage /> },
      { path: "termos-de-uso", element: <TermosDeUso /> },
      { path: "politica-de-privacidade", element: <PoliticaDePrivacidade /> },
    ],
  },
  
  // --- ROTAS DE PÁGINA INTEIRA (AGRUPADAS COM LAYOUT VAZIO) ---
  {
    element: <BlankLayout />, // O pai é o layout vazio
    children: [
      { path: "/escritorio", element: <LandingPageEsc /> },
      { path: "/comercio", element: <LandingPageCom /> },
      { path: "/industria", element: <LandingPageInd /> },
      { path: "/parceiros/login", element: <LoginPage /> },
      { path: "/pagamento/:tipoPlano/:idDoPlano", element: <CheckoutPage /> },
    ]
  },

  // --- ROTAS DO DASHBOARD DO PARCEIRO ---
  {
    path: "/parceiros",
    element: <DashboardLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'materiais', element: <SupportMaterialPage /> },
      { path: 'minha-conta', element: <MinhaContaPage /> },
      { path: 'financeiro', element: <FinanceiroParceiroPage /> },
      { path: 'oportunidades', element: <OportunidadesPage /> },
      { path: 'calculadora', element: <CalculadoraPage /> },
    ],
  },

  // --- ROTAS DO DASHBOARD DO ADMIN ---
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "contas", element: <GerenciarContas /> },
      { path: "conteudo", element: <GerenciarConteudo /> },
      { path: "vendas", element: <VisaoGeralVendas /> },
      { path: "financeiro", element: <FinanceiroAdminPage /> },
      { path: "depoimentos", element: <GerenciarDepoimentos /> },
      { path: "leads-empresas", element: <GerenciarLeadsEmpresas /> },
      { path: "leads-parceiros", element: <GerenciarLeadsParceiros /> },
      { path: "clientes", element: <GerenciarClientes /> },
      { path: "minha-conta", element: <MinhaContaAdmin /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <RouterProvider router={router} />
      <AnalyticsWrapper />
      <NotificationContainer />
    </NotificationProvider>
  </React.StrictMode>,
);
