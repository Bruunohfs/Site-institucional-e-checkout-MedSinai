import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import './index.css'


// Importe seus componentes
import MainLayout from './layouts/MainLayout.jsx'; // O layout principal com header/footer
import App from './App.jsx'; // Sua página inicial
import EmpresasPage from './pages/EmpresasPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx'

// Crie as rotas
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // O MainLayout é o elemento PAI de todas as rotas
    children: [
      {
        index: true, // A rota "/" vai renderizar o App
        element: <App />,
      },
      {
        path: "empresas", // A rota "/empresas" vai renderizar a EmpresasPage
        element: <EmpresasPage />,
      },
      { path: "/pagamento/:tipoPlano/:idDoPlano", 
        element: <CheckoutPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
