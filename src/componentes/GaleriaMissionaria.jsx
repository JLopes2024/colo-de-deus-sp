
import { useEffect, useRef, useState } from 'react';
import '../estilos/galeria-missionaria.css';

const REGISTROS = [
  {
    id: 'missao1',
    imagem: '/imagens/missao/missao1.webp',
    alt: 'Missionários próximos à entrada de uma residência.',
  },
  {
    id: 'missao2',
    imagem: '/imagens/missao/missao2.webp',
    alt: 'Missionários reunidos em uma comunidade.',
  },
  {
    id: 'missao3',
    imagem: '/imagens/missao/missao3.webp',
    alt: 'Missionários caminhando entre casas.',
  },
  {
    id: 'missao4',
    imagem: '/imagens/missao/missao4.webp',
    alt: 'Missionários próximos a uma residência.',
  },
  {
    id: 'missao5',
    imagem: '/imagens/missao/missao5.webp',
    alt: 'Registro de um encontro da comunidade.',
  },
  {
    id: 'missao6',
    imagem: '/imagens/missao/missao6.webp',
    alt: 'Registro de uma atividade missionária.',
  },
  {
    id: 'missao7',
    imagem: '/imagens/missao/missao7.webp',
    categoria: 'Oração',
    alt: 'Crianças reunidas em um momento de oração.',
  },
  {
    id: 'missao8',
    imagem: '/imagens/missao/missao8.webp',
    alt: 'Atividade de acolhimento com uma criança.',
  },
  
{
  id: 'missao9',
  imagem: '/imagens/missao/missao9.webp',
  alt: 'Duas mulheres em um abraço durante uma ação missionária.',
},

{
  id: 'missao10',
  imagem: '/imagens/missao/missao10.webp',
  alt: 'Comunidade reunida em uma casa.',
},
{
  id: 'missao11',
  imagem: '/imagens/missao/missao11.webp',
  alt: 'Grupo da comunidade reunido em um encontro.',
},
{
  id: 'missao12',
  imagem: '/imagens/missao/missao12.webp',
  alt: 'Famílias e participantes reunidos em uma casa.',
},

];

function GaleriaMissionaria() {
  const trilhoRef = useRef(null);
  const frameRef = useRef(null);

  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  function obterDistanciaEntreFotos() {
    const trilho = trilhoRef.current;

    if (!trilho || trilho.children.length < 2) {
      return 0;
    }

    const primeiro = trilho.children[0];
    const segundo = trilho.children[1];

    return segundo.offsetLeft - primeiro.offsetLeft;
  }

  function sincronizarNavegacao() {
    const trilho = trilhoRef.current;

    if (!trilho) return;

    const limite = Math.max(
      0,
      trilho.scrollWidth - trilho.clientWidth
    );

    const posicao = Math.max(
      0,
      Math.min(trilho.scrollLeft, limite)
    );

    setPodeVoltar(posicao > 2);
    setPodeAvancar(posicao < limite - 2);
  }

  function atualizarNaRolagem() {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      sincronizarNavegacao();
    });
  }

  function navegar(direcao) {
    const trilho = trilhoRef.current;

    if (!trilho) return;

    const distancia = obterDistanciaEntreFotos();

    if (distancia <= 0) return;

    const limite = Math.max(
      0,
      trilho.scrollWidth - trilho.clientWidth
    );

    const destino = Math.max(
      0,
      Math.min(
        trilho.scrollLeft + distancia * direcao,
        limite
      )
    );

    const reduzirMovimento = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    trilho.scrollTo({
      left: destino,
      behavior: reduzirMovimento ? 'auto' : 'smooth',
    });
  }

  useEffect(() => {
    const trilho = trilhoRef.current;

    if (!trilho) return undefined;

    const atualizar = () => atualizarNaRolagem();

    const observador =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(atualizar)
        : null;

    observador?.observe(trilho);

    if (trilho.children[0]) {
      observador?.observe(trilho.children[0]);
    }

    window.addEventListener('resize', atualizar);

    atualizar();

    return () => {
      observador?.disconnect();
      window.removeEventListener('resize', atualizar);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return (
    <section
      className="galeria-missionaria"
      aria-labelledby="galeria-missionaria-titulo"
    >
      <div className="galeria-missionaria__conteudo container">
        {/* TÍTULO */}

        <div className="galeria-missionaria__cabecalho">
          <p className="galeria-missionaria__indice">
            Registros missionários // Missão SP
          </p>

          <h2
            className="galeria-missionaria__titulo"
            id="galeria-missionaria-titulo"
          >
            <span>O carisma</span>

            <span className="galeria-missionaria__titulo-segunda">
              <span>em</span>

              <span className="galeria-missionaria__destaque">
                movimento
              </span>
            </span>
          </h2>
        </div>

        {/* SETAS DE NAVEGAÇÃO */}

        <div className="galeria-missionaria__barra">
          <div
            className="galeria-missionaria__controles"
            role="group"
            aria-label="Navegação da galeria"
          >
            <button
              type="button"
              className="galeria-missionaria__botao"
              aria-label="Voltar na galeria"
              disabled={!podeVoltar}
              onClick={() => navegar(-1)}
            >
              <span aria-hidden="true">←</span>
            </button>

            <button
              type="button"
              className="galeria-missionaria__botao"
              aria-label="Avançar na galeria"
              disabled={!podeAvancar}
              onClick={() => navegar(1)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* FOTOGRAFIAS + CATEGORIAS */}

        <div
          ref={trilhoRef}
          className="galeria-missionaria__trilho"
          role="region"
          aria-roledescription="galeria de fotografias"
          aria-label="Registros fotográficos da missão. Deslize horizontalmente ou use as setas para navegar."
          tabIndex={0}
          onScroll={atualizarNaRolagem}
        >
          {REGISTROS.map((registro) => (
            <figure
              className="galeria-missionaria__item"
              key={registro.id}
            >
              <div className="galeria-missionaria__foto">
                <img
                  src={registro.imagem}
                  alt={registro.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <figcaption className="galeria-missionaria__legenda">
                <span className="galeria-missionaria__categoria">
                  {registro.categoria}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* CHAMADA PARA PARTICIPAÇÃO */}

        <div className="galeria-missionaria__rodape">
          <a href="#celulas">
            Viva essa missão com a gente
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default GaleriaMissionaria;
