import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import ReactGA from 'react-ga4';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx'; 
import App from './App.jsx';
import EmpresasPage from './pages/EmpresasPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
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
    ],
  },
  
  // Rota de Login do Parceiro (página inteira, sem layout)
  {
    path: "/parceiros/login",
    element: <LoginPage />,
  },

  // --- NOVA ESTRUTURA DE ROTAS DO DASHBOARD ---
  {
    path: "/parceiros",
    element: <DashboardLayout />, // O DashboardLayout é o PAI
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
{
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      // Futuramente, as outras rotas de admin virão aqui:
      { path: "parceiros", element: <GerenciarParceiros /> },
      { path: "conteudo", element: <GerenciarConteudo /> },
      { path: "vendas", element: <VisaoGeralVendas /> },
      { path: "financeiro", element: <FinanceiroAdminPage /> },
      { path: "depoimentos", element: <GerenciarDepoimentos /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Analytics />
  </React.StrictMode>,
);
