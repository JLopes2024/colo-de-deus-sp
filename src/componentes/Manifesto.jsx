
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import '../estilos/manifesto.css';

function Manifesto() {
  const secaoRef = useRef(null);
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    const secao = secaoRef.current;

    if (!secao) {
      return undefined;
    }

    const prefereMenosMovimento =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    if (prefereMenosMovimento) {
      setAnimar(true);
      return undefined;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) {
          return;
        }

        setAnimar(true);
        observador.unobserve(secao);
      },
      {
        threshold: 0.3,
      },
    );

    observador.observe(secao);

    return () => {
      observador.disconnect();
    };
  }, []);

  return (
    <section
      ref={secaoRef}
      className={[
        'manifesto',
        animar ? 'manifesto--visivel' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="manifesto-titulo"
    >
      <div className="manifesto__conteudo container">

        <div className="manifesto__texto">
          <p className="manifesto__indice">
            02 // Nossa essência
          </p>

          <h2
            className="manifesto__titulo"
            id="manifesto-titulo"
          >
            <span className="manifesto__linha">
              Missionários
            </span>

            <span className="manifesto__linha">
              Eucarísticos
            </span>

            <span className="manifesto__linha">
              Pentecostais
            </span>

            <span className="manifesto__linha">
              Marianos
            </span>

            <span className="manifesto__linha">
              Artísticos
            </span>

            <span className="manifesto__linha manifesto__destaque">
              <span className="manifesto__e">
                &amp;
              </span>

              <span className="manifesto__criativos">
                Criativos
              </span>
            </span>
          </h2>
        </div>

     

        <div className="manifesto__imagem">
          <img
            src="/imagens/gerais/fotos-gerais.jpg"
            alt="Comunidade Colo de Deus"
          />
        </div>
           <div className="manifesto__paragrafo">
          <p>
            Evangelizamos com criatividade, arte e cultura
            do encontro, apresentando o Cristo que
            conhecemos e amamos a esta geração. Queremos
            que cada pessoa seja alcançada, olhada e
            resgatada em sua dignidade.
          </p>
        </div>

      </div>
    </section>
  );
}

export default Manifesto;
