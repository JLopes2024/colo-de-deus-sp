import Cabecalho from './componentes/Cabecalho.jsx';
import Hero from './componentes/Hero.jsx';
import QuemSomos from './componentes/QuemSomos.jsx';
import Manifesto from './componentes/Manifesto.jsx';
import Comunidades from './componentes/Comunidades.jsx';
import Agenda from './componentes/Agenda.jsx';
import Contato from './componentes/Contato.jsx';
import Rodape from './componentes/Rodape.jsx';
import Baluartes from './componentes/Baluartes.jsx';

function App() {
  return (
    <>
      <Cabecalho />

      <main>
       <Hero />
        <Baluartes />
        <QuemSomos />
        <Manifesto />
        <Comunidades />
        <Agenda />
        <Contato />
      </main>

      <Rodape />
    </>
  );
}

export default App;