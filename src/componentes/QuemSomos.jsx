import {
  useEffect,
  useState,
} from 'react';

import '../estilos/quem-somos.css';


/* =========================================================
   IMAGENS DO CARROSSEL
   ========================================================= */

/*
 * Para adicionar novas fotos futuramente,
 * basta incluir outro objeto neste array.
 *
 * IMPORTANTE:
 * O nome do arquivo precisa ser exatamente igual
 * ao arquivo dentro de /public/imagens/gerais/.
 */

const IMAGENS = [
  {
    src: '/imagens/gerais/acao-evangeliza.JPG',
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


/*
 * Tempo que cada fotografia permanece na tela.
 *
 * 4500 = 4,5 segundos.
 */

const TEMPO_TROCA = 4500;


function QuemSomos() {
  const [
    imagemAtual,
    setImagemAtual,
  ] = useState(0);


  /* =======================================================
     CARROSSEL AUTOMÁTICO
     ======================================================= */

  useEffect(() => {
    /*
     * Respeita a configuração de acessibilidade
     * do dispositivo.
     *
     * Se a pessoa pediu redução de movimento,
     * mantemos somente a primeira fotografia.
     */

    const prefereMenosMovimento =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;


    if (
      prefereMenosMovimento
      || IMAGENS.length <= 1
    ) {
      return undefined;
    }


    const intervalo = window.setInterval(() => {
      setImagemAtual((imagemAnterior) => (
        (imagemAnterior + 1)
        % IMAGENS.length
      ));
    }, TEMPO_TROCA);


    return () => {
      window.clearInterval(intervalo);
    };
  }, []);


  /* =======================================================
     IMAGEM ATUAL
     ======================================================= */

  const imagem = IMAGENS[imagemAtual];


  return (
    <section
      className="quem-somos"
      id="quem-somos"
      aria-labelledby="quem-somos-titulo"
    >
      <div className="quem-somos__conteudo">

        <div className="quem-somos__vazio" />


        <div className="quem-somos__bloco">

          {/* ===============================================
              CABEÇALHO
              =============================================== */}

          <div className="quem-somos__cabecalho">

            <p className="quem-somos__indice">
              01 // Quem somos?
            </p>


            <h2
              className="quem-somos__titulo"
              id="quem-somos-titulo"
            >
              Chamados a alcançar uma geração
            </h2>

          </div>


          {/* ===============================================
              CARROSSEL DE IMAGENS

              Mantemos somente um <img> no DOM para preservar
              o comportamento do CSS original da seção.
              =============================================== */}

          <div className="quem-somos__imagem">

            <img
              key={imagem.src}
              src={imagem.src}
              alt={imagem.alt}
              className="quem-somos__imagem-atual"
            />

          </div>


          {/* ===============================================
              TEXTO
              =============================================== */}

          <div className="quem-somos__texto">

            <p>
              Somos uma Comunidade Católica, nascida como
              parte da Primavera da Igreja, com essência
              Mariana. Nosso carisma nos move a trazer de
              volta ao seio da igreja aqueles que se
              afastaram da fé, gestando uma humanidade
              cheia de Pentecostes.
            </p>


            <p>
              Evangelizamos com criatividade, arte e cultura
              do encontro, apresentando o Cristo que
              conhecemos e amamos a esta geração. Queremos
              que cada pessoa seja alcançada, olhada e
              resgatada em sua dignidade.
            </p>


            <p>
              Estamos presentes nas casas, nas famílias e
              na vida de jovens, crianças e adultos.
              Caminhamos por meio das células, dos cenáculos
              e do cuidado de um a um, tratando cada pessoa
              como única e preparando a volta de Cristo.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}


export default QuemSomos;