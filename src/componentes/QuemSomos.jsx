
import { useEffect, useRef, useState } from 'react';
import '../estilos/quem-somos.css';

const IMAGENS = [
  {
    src: '/imagens/gerais/acao-evangelizacao.JPG',
    alt: 'Comunidade Colo de Deus em ação de evangelização',
  },
  {
    src: '/imagens/gerais/acao-evangelizacao1.JPG',
    alt: 'Missionários da Colo de Deus durante ação de evangelização',
  },
  {
    src: '/imagens/gerais/acao-evangelizacao2.JPG',
    alt: 'Encontro durante ação de evangelização da Colo de Deus',
  },
];

const TEMPO_TROCA = 4500;

function prefereMovimentoReduzido() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function QuemSomos() {
  const secaoRef = useRef(null);
  const carregamentosRef = useRef(new Map());
  const prontasRef = useRef(new Set());
  const falhasRef = useRef(new Set());

  const [imagemAtual, setImagemAtual] = useState(0);
  const [imagemPronta, setImagemPronta] = useState(false);
  const [secaoVisivel, setSecaoVisivel] = useState(false);
  const [abaVisivel, setAbaVisivel] = useState(
    () =>
      typeof document === 'undefined' ||
      document.visibilityState === 'visible'
  );
  const [movimentoReduzido, setMovimentoReduzido] = useState(
    prefereMovimentoReduzido
  );

  // Observa a visibilidade da seção.
  useEffect(() => {
    const secao = secaoRef.current;

    if (!secao) return undefined;

    if (!('IntersectionObserver' in window)) {
      setSecaoVisivel(true);
      return undefined;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        setSecaoVisivel(entrada.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    observador.observe(secao);

    return () => observador.disconnect();
  }, []);

  // Pausa quando a aba está oculta.
  useEffect(() => {
    function atualizarVisibilidade() {
      setAbaVisivel(document.visibilityState === 'visible');
    }

    document.addEventListener(
      'visibilitychange',
      atualizarVisibilidade
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        atualizarVisibilidade
      );
    };
  }, []);

  // Acompanha a preferência de movimento do sistema.
  useEffect(() => {
    const consulta = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    function atualizarPreferencia(evento) {
      setMovimentoReduzido(evento.matches);
    }

    consulta.addEventListener('change', atualizarPreferencia);

    return () => {
      consulta.removeEventListener(
        'change',
        atualizarPreferencia
      );
    };
  }, []);

  // Registra o carregamento de uma imagem.
  function registrarPronta(indice) {
    if (prontasRef.current.has(indice)) return;

    prontasRef.current.add(indice);

    if (indice === 0) {
      setImagemPronta(true);
    }
  }

  // Pré-carrega uma imagem sem duplicar solicitações.
  function prepararImagem(indice) {
    if (
      prontasRef.current.has(indice) ||
      falhasRef.current.has(indice) ||
      carregamentosRef.current.has(indice)
    ) {
      return;
    }

    const imagem = new Image();

    carregamentosRef.current.set(indice, imagem);

    imagem.onload = () => {
      registrarPronta(indice);
      carregamentosRef.current.delete(indice);
    };

    imagem.onerror = () => {
      falhasRef.current.add(indice);
      carregamentosRef.current.delete(indice);
    };

    imagem.src = IMAGENS[indice].src;
  }

  // Carrega a primeira foto e prepara a seguinte.
  useEffect(() => {
    prepararImagem(0);

    return () => {
      carregamentosRef.current.forEach((imagem) => {
        imagem.onload = null;
        imagem.onerror = null;
      });

      carregamentosRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (
      !secaoVisivel ||
      !abaVisivel ||
      movimentoReduzido
    ) {
      return;
    }

    for (let passo = 1; passo < IMAGENS.length; passo += 1) {
      const indice = (imagemAtual + passo) % IMAGENS.length;

      if (!falhasRef.current.has(indice)) {
        prepararImagem(indice);
        break;
      }
    }
  }, [imagemAtual, secaoVisivel, abaVisivel, movimentoReduzido]);

  // Rotação automática somente quando a seção é vista.
  useEffect(() => {
    if (
      !secaoVisivel ||
      !abaVisivel ||
      movimentoReduzido ||
      !imagemPronta ||
      IMAGENS.length <= 1
    ) {
      return undefined;
    }

    const intervalo = window.setInterval(() => {
      setImagemAtual((atual) => {
        for (let passo = 1; passo < IMAGENS.length; passo += 1) {
          const proxima = (atual + passo) % IMAGENS.length;

          if (falhasRef.current.has(proxima)) {
            continue;
          }

          if (prontasRef.current.has(proxima)) {
            return proxima;
          }

          prepararImagem(proxima);
          return atual;
        }

        return atual;
      });
    }, TEMPO_TROCA);

    return () => window.clearInterval(intervalo);
  }, [
    secaoVisivel,
    abaVisivel,
    movimentoReduzido,
    imagemPronta,
  ]);

  return (
    <section
      ref={secaoRef}
      className="quem-somos"
      id="quem-somos"
      aria-labelledby="quem-somos-titulo"
    >
      {/* FAIXA FOTOGRÁFICA */}

      <div className="quem-somos__faixa">
        <div
          className="quem-somos__imagem"
          aria-hidden="true"
        >
          {IMAGENS.map((imagem, indice) => (
            <img
              key={imagem.src}
              src={imagem.src}
              alt=""
              className={`quem-somos__imagem-atual${
                indice === imagemAtual
                  ? ' quem-somos__imagem-atual--ativa'
                  : ''
              }`}
              loading={indice === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => registrarPronta(indice)}
              onError={() => {
                falhasRef.current.add(indice);
              }}
            />
          ))}
        </div>

        <div
          className="quem-somos__sobreposicao"
          aria-hidden="true"
        />

        <div className="quem-somos__conteudo">
          <div className="quem-somos__cabecalho">
            <p className="quem-somos__indice">
              01 // Quem somos?
            </p>

            <h2
              className="quem-somos__titulo"
              id="quem-somos-titulo"
            >
              Chamados a alcançar uma{' '}
              <span className="quem-somos__destaque">
                geração
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* TEXTO INTEGRADO AO FUNDO PRETO */}

      <div className="quem-somos__rodape">
        <div className="quem-somos__texto">
          <p>
            Somos uma Comunidade Católica, nascida como
            parte da Primavera da Igreja, com essência
            Mariana. Nosso carisma nos move a trazer de
            volta ao seio da igreja aqueles que se
            afastaram da fé, gestando uma humanidade
            cheia de Pentecostes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default QuemSomos;
