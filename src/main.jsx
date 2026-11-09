
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './estilos/variaveis.css';
import './estilos/global.css';

const elementoRaiz = document.getElementById('root');

if (!elementoRaiz) {
  throw new Error('Elemento #root não encontrado.');
}

const root = createRoot(elementoRaiz);

function TelaErro() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: '#101010',
        color: '#fff',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <div>
        <h1>Não foi possível carregar a página.</h1>
        <p>Atualize a página para tentar novamente.</p>
      </div>
    </main>
  );
}

async function iniciarAplicacao() {
  const caminho = window.location.pathname;

  const ehAdmin =
    caminho === '/admin' ||
    caminho.startsWith('/admin/');

  try {
    if (ehAdmin) {
      // O Admin continua separado do site público.
      const { default: AdminApp } = await import(
        './admin/AdminApp.jsx'
      );

      root.render(
        <StrictMode>
          <AdminApp />
        </StrictMode>
      );

      return;
    }

    // Analytics e site público são carregados juntos
    // somente para os visitantes da página pública.
    const [
      { default: App },
      { Analytics },
    ] = await Promise.all([
      import('./App.jsx'),
      import('@vercel/analytics/react'),
    ]);

    root.render(
      <StrictMode>
        <App />
        <Analytics />
      </StrictMode>
    );
  } catch (erro) {
    console.error(
      'Falha ao iniciar a aplicação:',
      erro
    );

    root.render(
      <StrictMode>
        <TelaErro />
      </StrictMode>
    );
  }
}

iniciarAplicacao();
