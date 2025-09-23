// /src/layouts/BlankLayout.jsx
import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

function BlankLayout() {
  return (
    <>
      <Outlet /> {/* Renderiza o componente da rota filha */}
      <ScrollRestoration /> {/* Garante que a página abra no topo */}
    </>
  );
}

export default BlankLayout;
