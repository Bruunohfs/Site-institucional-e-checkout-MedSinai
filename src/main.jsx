import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';

//componentes de layout e página
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
import MinhaContaPage from './pages/parceiros/MinhaConta.jsx';
import FinanceiroAdminPage from './pages/admin/FinanceiroAdminPage';
import FinanceiroParceiroPage from './pages/parceiros/FinanceiroParceiroPage';
import OportunidadesPage from './pages/parceiros/OportunidadesPage';
import CalculadoraPage from './pages/parceiros/CalculadoraPage';
import ParceirosPage from './pages/ParceirosPage';


// Crie as rotas
const router = createBrowserRouter([
  // Rotas Públicas (com cabeçalho e rodapé principal)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "empresas", element: <EmpresasPage /> },
      { path: "/pagamento/:tipoPlano/:idDoPlano", element: <CheckoutPage /> },
      { path: "sejaparceiro", element: <ParceirosPage /> },
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
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
