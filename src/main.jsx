// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';

// Importe seus componentes de layout e página
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx'; // <<< NOVO
import App from './App.jsx';
import EmpresasPage from './pages/EmpresasPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import LoginPage from './pages/parceiros/login.jsx';
import DashboardPage from './pages/parceiros/dashboard.jsx'; // <<< Nossa página de "Visão Geral"
import AnalyticsPage from './pages/parceiros/AnalyticsPage';
import ToolsPage from './pages/parceiros/ToolsPage';

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
      { path: 'ferramentas', element: <ToolsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
