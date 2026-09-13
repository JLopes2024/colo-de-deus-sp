import {
  useEffect,
  useState,
} from 'react';

import '../estilos/hero.css';


/* =========================================================
   IMAGENS DO HERO

   Cada imagem possui seu próprio enquadramento.

   Isso evita depender de um único "center center"
   para fotografias com composições diferentes.
   ========================================================= */

const fotosHero = [
  {
    src: '/imagens/hero-page.jpg',
    posicao: 'center 40%',
  },
  {
    src: '/imagens/hero-page-1.jpg',
    posicao: 'center center',
  },
  {
    src: '/imagens/hero-page-2.jpg',
    posicao: '60% center',
  },
  {
    src: '/imagens/hero-page-3.jpg',
    posicao: 'center 35%',
  },
];


function Hero() {
  const [fotoAtual, setFotoAtual] = useState(0);


  /* =======================================================
     CARROSSEL AUTOMÁTICO

     Para usuários com "reduzir movimento" ativado,
     mantemos apenas a primeira fotografia.

     Dessa forma não basta esconder a transição no CSS:
     evitamos também a troca automática no React.
     ======================================================= */

  useEffect(() => {
    const prefereMenosMovimento =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    if (prefereMenosMovimento) {
      return undefined;
    }

    const intervalo = window.setInterval(() => {
      setFotoAtual((indiceAtual) => {
        return (
          indiceAtual + 1
        ) % fotosHero.length;
      });
    }, 6000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);


  return (
    <section
      className="hero"
      id="inicio"
      aria-labelledby="hero-titulo"
    >

      {/* ===================================================
          CARROSSEL FOTOGRÁFICO
          =================================================== */}

      <div
        className="hero__carrossel"
        aria-hidden="true"
      >
        {fotosHero.map((foto, indice) => (
          <img
            className={[
              'hero__imagem',
              indice === fotoAtual
                ? 'hero__imagem--ativa'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            src={foto.src}
            style={{
              objectPosition:
                foto.posicao,
            }}
            alt=""
            key={foto.src}
          />
        ))}
      </div>


      {/* ===================================================
          CAMADA PARA GARANTIR CONTRASTE DO TEXTO
          =================================================== */}

      <div
        className="hero__camada"
        aria-hidden="true"
      />


      {/* ===================================================
          CONTEÚDO
          =================================================== */}

      <div className="hero__conteudo container">

        {/* ---------------------------------------------------
            TOPO
            --------------------------------------------------- */}

        <div className="hero__topo">

          <p className="hero__identificacao">
            Colo de Deus // Missão SP
          </p>

          <a
            className="hero__atalho"
            href="#quem-somos"
          >
            Conheça a missão

            <span aria-hidden="true">
              ↘
            </span>
          </a>
        </div>


        {/* ---------------------------------------------------
            MENSAGEM PRINCIPAL
            --------------------------------------------------- */}

        <div className="hero__principal">

          <h1
            className="hero__titulo"
            id="hero-titulo"
          >
            <span>Gente</span>

            <span>imperfeita</span>

            <span>cuidando de</span>

            <span>gente</span>

            <span>imperfeita</span>
          </h1>
        </div>


        {/* ---------------------------------------------------
            CTA PRINCIPAL

            A ação deixa de repetir "Quem somos"
            e passa a levar para uma próxima ação concreta.
            --------------------------------------------------- */}

        <div className="hero__rodape">

          <a
            href="#celulas"
            className="hero__acao"
          >
            Encontre uma célula

            <span aria-hidden="true">
              →
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}

export default Hero;