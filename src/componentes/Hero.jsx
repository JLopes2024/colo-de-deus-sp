
import { useEffect, useRef, useState } from 'react';
import '../estilos/hero.css';

const INTERVALO_FOTOS = 6000;

const fotosHero = [
  {
    src: '/imagens/hero-page.webp',
    posicao: 'center 40%',
  },
  {
    src: '/imagens/hero-page-1.webp',
    posicao: 'center center',
  },
  {
    src: '/imagens/hero-page-2.webp',
    posicao: '60% center',
  },
  {
    src: '/imagens/hero-page-3.webp',
    posicao: 'center 35%',
  },
];

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
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
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
        <rect x="2" y="5" width="20" height="14" rx="4" />
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
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M5.5 9.2 C10 7.7 15.5 8.3 19 10.5" />
        <path d="M6.5 12.5 C10 11.3 14.5 11.7 17.5 13.5" />
        <path d="M7.5 15.7 C10.5 14.8 13.5 15.2 16 16.5" />
      </svg>
    );
  }

  return null;
}

function IconeControle({ pausado }) {
  return pausado ? (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function Hero() {
  const [fotoAtual, setFotoAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const [movimentoReduzido, setMovimentoReduzido] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const [abaVisivel, setAbaVisivel] = useState(
    () =>
      typeof document === 'undefined' ||
      document.visibilityState === 'visible'
  );

  const [, setImagensProntas] = useState(() => [0]);

  const imagensProntasRef = useRef(new Set([0]));
  const imagensComFalhaRef = useRef(new Set());
  const carregamentosRef = useRef(new Map());

  useEffect(() => {
    const consulta = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    function atualizarPreferencia(evento) {
      setMovimentoReduzido(evento.matches);
    }

    setMovimentoReduzido(consulta.matches);

    consulta.addEventListener('change', atualizarPreferencia);

    return () => {
      consulta.removeEventListener(
        'change',
        atualizarPreferencia
      );
    };
  }, []);

  useEffect(() => {
    function atualizarVisibilidade() {
      setAbaVisivel(
        document.visibilityState === 'visible'
      );
    }

    document.addEventListener(
      'visibilitychange',
      atualizarVisibilidade
    );

    atualizarVisibilidade();

    return () => {
      document.removeEventListener(
        'visibilitychange',
        atualizarVisibilidade
      );
    };
  }, []);

  function registrarImagemPronta(indice) {
    if (imagensProntasRef.current.has(indice)) {
      return;
    }

    imagensProntasRef.current.add(indice);

    setImagensProntas(
      Array.from(imagensProntasRef.current)
    );
  }

  function prepararImagem(indice) {
    if (
      imagensProntasRef.current.has(indice) ||
      imagensComFalhaRef.current.has(indice) ||
      carregamentosRef.current.has(indice)
    ) {
      return;
    }

    const imagem = new Image();

    carregamentosRef.current.set(indice, imagem);

    imagem.onload = () => {
      registrarImagemPronta(indice);
      carregamentosRef.current.delete(indice);
    };

    imagem.onerror = () => {
      imagensComFalhaRef.current.add(indice);
      carregamentosRef.current.delete(indice);
    };

    imagem.src = fotosHero[indice].src;
  }

  // Não prepara novas fotos enquanto o carrossel
  // estiver pausado ou a aba estiver oculta.
  useEffect(() => {
    if (
      movimentoReduzido ||
      !abaVisivel ||
      pausado
    ) {
      return;
    }

    for (
      let passo = 1;
      passo < fotosHero.length;
      passo += 1
    ) {
      const indice =
        (fotoAtual + passo) % fotosHero.length;

      if (!imagensComFalhaRef.current.has(indice)) {
        prepararImagem(indice);
        break;
      }
    }
  }, [
    fotoAtual,
    movimentoReduzido,
    abaVisivel,
    pausado,
  ]);

  // A rotação fica suspensa enquanto a pessoa
  // escolher manter a fotografia atual.
  useEffect(() => {
    if (
      movimentoReduzido ||
      !abaVisivel ||
      pausado
    ) {
      return undefined;
    }

    const intervalo = window.setInterval(() => {
      setFotoAtual((atual) => {
        for (
          let passo = 1;
          passo < fotosHero.length;
          passo += 1
        ) {
          const proxima =
            (atual + passo) % fotosHero.length;

          if (
            imagensComFalhaRef.current.has(proxima)
          ) {
            continue;
          }

          if (
            imagensProntasRef.current.has(proxima)
          ) {
            return proxima;
          }

          prepararImagem(proxima);
          return atual;
        }

        return atual;
      });
    }, INTERVALO_FOTOS);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [
    movimentoReduzido,
    abaVisivel,
    pausado,
  ]);

  useEffect(() => {
    const carregamentos = carregamentosRef.current;

    return () => {
      carregamentos.forEach((imagem) => {
        imagem.onload = null;
        imagem.onerror = null;
      });

      carregamentos.clear();
    };
  }, []);

  return (
    <section
      className="hero"
      id="inicio"
      aria-labelledby="hero-titulo"
    >
      <div
        className="hero__carrossel"
        aria-hidden="true"
      >
        {fotosHero.map((foto, indice) => (
          <img
            key={foto.src}
            className={`hero__imagem${
              indice === fotoAtual
                ? ' hero__imagem--ativa'
                : ''
            }`}
            src={foto.src}
            style={{
              objectPosition: foto.posicao,
            }}
            alt=""
            loading={
              indice === 0 ? 'eager' : 'lazy'
            }
            fetchPriority={
              indice === 0 ? 'high' : 'auto'
            }
            decoding="async"
            onLoad={() =>
              registrarImagemPronta(indice)
            }
            onError={() => {
              imagensComFalhaRef.current.add(indice);
            }}
          />
        ))}
      </div>

      <div
        className="hero__camada"
        aria-hidden="true"
      />

      <div className="hero__conteudo container">
        <div className="hero__topo">
          <p className="hero__identificacao">
            Colo de Deus // Missão SP
          </p>

          {!movimentoReduzido && (
            <button
              type="button"
              className="hero__controle"
              onClick={() =>
                setPausado((atual) => !atual)
              }
              aria-label={
                pausado
                  ? 'Retomar fotografias do início'
                  : 'Pausar fotografias do início'
              }
              title={
                pausado
                  ? 'Retomar fotografias'
                  : 'Pausar fotografias'
              }
            >
              <IconeControle pausado={pausado} />
            </button>
          )}
        </div>

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

        <div className="hero__rodape">
          <div className="hero__acoes">
            <a
              href="#celulas"
              className="hero__participar"
            >
              <span>Quero participar</span>
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href="#quem-somos"
              className="hero__explorar"
            >
              <span>Conheça a missão</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

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
        </div>
      </div>
    </section>
  );
}

export default Hero;
