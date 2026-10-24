
import {
  useEffect,
  useState,
} from 'react';

import '../estilos/hero.css';

/* =========================================================
   IMAGENS DO HERO
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

/* =========================================================
   REDES SOCIAIS
   ========================================================= */

const redesSociais = [
  {
    nome: 'Instagram',
    tipo: 'instagram',
    url: 'https://www.instagram.com/colodedeus/?hl=pt-br',
  },
  {
    nome: 'YouTube',
    tipo: 'youtube',
    url: 'https://www.youtube.com/channel/UCw7SCTLZq2byYiirHtc25-Q',
  },
  {
    nome: 'Spotify',
    tipo: 'spotify',
    url: 'https://open.spotify.com/intl-pt/artist/1AY6YtpuVujP4Pa3ibD1M1',
  },
];

/* =========================================================
   ÍCONES SVG
   Sem dependências adicionais
   ========================================================= */

function IconeRede({ tipo }) {
  if (tipo === 'instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
        />
        <circle
          cx="12"
          cy="12"
          r="4.2"
        />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (tipo === 'youtube') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="4"
        />
        <path
          d="M10 9 L16 12 L10 15 Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (tipo === 'spotify') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path d="M5.5 9.2 C10 7.7 15.5 8.3 19 10.5" />
        <path d="M6.5 12.5 C10 11.3 14.5 11.7 17.5 13.5" />
        <path d="M7.5 15.7 C10.5 14.8 13.5 15.2 16 16.5" />
      </svg>
    );
  }

  return null;
}

/* =========================================================
   COMPONENTE HERO
   ========================================================= */

function Hero() {
  const [fotoAtual, setFotoAtual] = useState(0);

  useEffect(() => {
    const prefereMenosMovimento =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    if (prefereMenosMovimento) {
      return undefined;
    }

    const intervalo = window.setInterval(() => {
      setFotoAtual((indiceAtual) => (
        (indiceAtual + 1) % fotosHero.length
      ));
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
      {/* CARROSSEL FOTOGRÁFICO */}

      <div
        className="hero__carrossel"
        aria-hidden="true"
      >
        {fotosHero.map((foto, indice) => (
          <img
            key={foto.src}
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
              objectPosition: foto.posicao,
            }}
            alt=""
            loading={indice === 0 ? 'eager' : 'lazy'}
            fetchPriority={
              indice === 0 ? 'high' : 'auto'
            }
          />
        ))}
      </div>

      {/* CAMADA DE CONTRASTE */}

      <div
        className="hero__camada"
        aria-hidden="true"
      />

      {/* CONTEÚDO */}

      <div className="hero__conteudo container">

        {/* IDENTIFICAÇÃO */}

        <div className="hero__topo">
          <p className="hero__identificacao">
            Colo de Deus // Missão SP
          </p>
        </div>

        {/* TÍTULO PRINCIPAL */}

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

        {/* RODAPÉ E REDES SOCIAIS */}

        <div className="hero__rodape">

          <nav
            className="hero__sociais"
            aria-label="Redes sociais da Colo de Deus"
          >
            {redesSociais.map((rede) => (
              <a
                key={rede.tipo}
                className="hero__social"
                href={rede.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar ${rede.nome} da Colo de Deus`}
                title={rede.nome}
              >
                <IconeRede tipo={rede.tipo} />
              </a>
            ))}
          </nav>

          <a
            href="#quem-somos"
            className="hero__explorar"
          >
            Explore a missão

            <span aria-hidden="true">
              ↓
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}

export default Hero;
