import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './estilos/variaveis.css';
import './estilos/global.css';

import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

const ehAdmin = window.location.pathname.startsWith('/admin');

async function iniciarAplicacao() {
  if (ehAdmin) {
    // O admin só é carregado quando acessamos /admin.
    // Assim, o CSS do painel não interfere no site público.
    const { default: AdminApp } = await import('./admin/AdminApp.jsx');

    root.render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    );

    return;
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

iniciarAplicacao();