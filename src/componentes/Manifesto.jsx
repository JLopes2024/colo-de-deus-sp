
import { useEffect, useRef, useState } from 'react';

import '../estilos/manifesto.css';

const caracteristicas = [
  'Missionários',
  'Eucarísticos',
  'Pentecostais',
  'Marianos',
  'Artísticos',
];

function Manifesto() {
  const secaoRef = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const secao = secaoRef.current;

    if (!secao) return undefined;

    const movimentoReduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (
      movimentoReduzido ||
      !('IntersectionObserver' in window)
    ) {
      setVisivel(true);
      return undefined;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.unobserve(secao);
        }
      },
      {
        threshold: 0.15,
      },
    );

    observador.observe(secao);

    return () => observador.disconnect();
  }, []);

  return (
    <section
      ref={secaoRef}
      className={`manifesto ${
        visivel ? 'manifesto--visivel' : ''
      }`}
      aria-labelledby="manifesto-titulo"
    >
      {/* FAIXA EDITORIAL */}

      <div className="manifesto__faixa">
        <div className="manifesto__imagem">
          <img
            src="/imagens/gerais/fotos-gerais.jpg"
            alt="Integrantes da comunidade Colo de Deus reunidos"
            loading="lazy"
          />
        </div>

        <div
          className="manifesto__sobreposicao"
          aria-hidden="true"
        />

        <div className="manifesto__conteudo container">
          <div className="manifesto__texto">
            <p className="manifesto__indice">
              02 // Nossa essência
            </p>

            <h2
              className="manifesto__titulo"
              id="manifesto-titulo"
            >
              {caracteristicas.map((palavra, indice) => (
                <span
                  className="manifesto__linha"
                  data-eco={palavra}
                  style={{
                    '--indice': indice,
                  }}
                  key={palavra}
                >
                  {palavra}
                </span>
              ))}

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
        </div>
      </div>

      {/* TEXTO ORIGINAL DO MANIFESTO */}

      <div className="manifesto__rodape container">
        <div className="manifesto__marcador">
          <span aria-hidden="true" />
          <p>Nosso jeito de evangelizar</p>
        </div>

        <div className="manifesto__paragrafo">
          <p>
            Evangelizamos com criatividade, arte e cultura
            do encontro, apresentando o Cristo que
            conhecemos e amamos a esta geração.
            Queremos que cada pessoa seja alcançada,
            olhada e resgatada em sua dignidade.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Manifesto;
