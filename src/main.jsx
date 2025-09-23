// src/main.jsx - VERSÃO CORRIGIDA PARA REMOVER O LAYOUT DAS LANDING PAGES

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, ScrollRestoration } from "react-router-dom"; // Importe ScrollRestoration aqui
import './index.css';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ReactGA from 'react-ga4';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx'; 
import App from './App.jsx';
import EmpresasPage from './pages/EmpresasPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import LandingPageEsc from './pages/LandingPageEscritorio.jsx';
import LandingPageCom from './pages/LandingPageComercio.jsx';
import LandingPageInd from './pages/LandingPageIndustria.jsx';
import LoginPage from './pages/parceiros/login.jsx';
import DashboardPage from './pages/parceiros/dashboard.jsx'; 
import AnalyticsPage from './pages/parceiros/AnalyticsPage';
import SupportMaterialPage from './pages/parceiros/SupportMaterialPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import GerenciarParceiros from './pages/admin/GerenciarParceiros';
import GerenciarConteudo from './pages/admin/GerenciarConteudo';
import VisaoGeralVendas from './pages/admin/VisaoGeralVendas';
import GerenciarDepoimentos from './pages/admin/GerenciarDepoimentos';
import GerenciarLeadsEmpresas from './pages/admin/GerenciarLeadsEmpresas';
import GerenciarLeadsParceiros from './pages/admin/GerenciarLeadsParceiros';
import MinhaContaPage from './pages/parceiros/MinhaConta.jsx';
import FinanceiroAdminPage from './pages/admin/FinanceiroAdminPage';
import FinanceiroParceiroPage from './pages/parceiros/FinanceiroParceiroPage';
import OportunidadesPage from './pages/parceiros/OportunidadesPage';
import CalculadoraPage from './pages/parceiros/CalculadoraPage';
import ParceirosPage from './pages/ParceirosPage';
import PoliticaDePrivacidade from './pages/PoliticaDePrivacidade.jsx';
import TermosDeUso from './pages/TermosDeUso.jsx';
import { Analytics } from '@vercel/analytics/react';

const GA_MEASUREMENT_ID = "G-Z1SN0XKENK";
ReactGA.initialize(GA_MEASUREMENT_ID);

const router = createBrowserRouter([
  // --- ROTAS COM O LAYOUT PRINCIPAL (CABEÇALHO E RODAPÉ) ---
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "empresas", element: <EmpresasPage /> },
      { path: "/pagamento/:tipoPlano/:idDoPlano", element: <CheckoutPage /> },
      { path: "sejaparceiro", element: <ParceirosPage /> },
      { path: "termos-de-uso", element: <TermosDeUso /> },
      { path: "politica-de-privacidade", element: <PoliticaDePrivacidade /> },
      // As landing pages foram removidas daqui
    ],
  },
  
  // --- ROTAS DE PÁGINA INTEIRA (SEM LAYOUT) ---

  // Landing Pages (agora sem o MainLayout)
  {
    path: "/escritorio",
    element: (
      <>
        <LandingPageEsc />
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/comercio",
    element: (
      <>
        <LandingPageCom />
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/industria",
    element: (
      <>
        <LandingPageInd />
        <ScrollRestoration />
      </>
    ),
  },

  // Rota de Login do Parceiro
  {
    path: "/parceiros/login",
    element: <LoginPage />,
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
      { path: "parceiros", element: <GerenciarParceiros /> },
      { path: "conteudo", element: <GerenciarConteudo /> },
      { path: "vendas", element: <VisaoGeralVendas /> },
      { path: "financeiro", element: <FinanceiroAdminPage /> },
      { path: "depoimentos", element: <GerenciarDepoimentos /> },
      { path: "leads-empresas", element: <GerenciarLeadsEmpresas /> },
      { path: "leads-parceiros", element: <GerenciarLeadsParceiros /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
);
