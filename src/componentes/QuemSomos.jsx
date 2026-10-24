
import { useEffect, useState } from 'react';
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

function QuemSomos() {
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const prefereMenosMovimento = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefereMenosMovimento || IMAGENS.length <= 1) {
      return undefined;
    }

    const intervalo = window.setInterval(() => {
      setImagemAtual((anterior) => (
        (anterior + 1) % IMAGENS.length
      ));
    }, TEMPO_TROCA);

    return () => window.clearInterval(intervalo);
  }, []);

  const imagem = IMAGENS[imagemAtual];

  return (
    <section
      className="quem-somos"
      id="quem-somos"
      aria-labelledby="quem-somos-titulo"
    >
      {/* FAIXA FOTOGRÁFICA */}

      <div className="quem-somos__faixa">
        <div className="quem-somos__imagem">
          <img
            key={imagem.src}
            src={imagem.src}
            alt={imagem.alt}
            className="quem-somos__imagem-atual"
          />
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
              Chamados a alcançar uma 
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
