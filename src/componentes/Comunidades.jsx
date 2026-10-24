
import '../estilos/comunidades.css';

function definirInteresse(interesse) {
  try {
    sessionStorage.setItem('interesse-contato', interesse);
  } catch {
    // O link para o contato continua funcionando.
  }
}

function Comunidades() {
  return (
    <section
      className="comunidades"
      aria-label="Células e Cenáculos"
    >
      {/* CÉLULAS */}

      <article
        className="comunidades__bloco comunidades__bloco--celulas"
        id="celulas"
        aria-labelledby="celulas-titulo"
      >
        <div className="comunidades__conteudo container">
          <div className="comunidades__texto">
            <p className="comunidades__indice">
              03 // Células
            </p>

            <h2
              className="comunidades__titulo"
              id="celulas-titulo"
            >
              <span className="comunidades__titulo-linha">
                Igreja viva
              </span>

              <span className="comunidades__titulo-destaque">
                nas casas
              </span>
            </h2>

            <div className="comunidades__descricoes">
              <p>
                Estamos presentes nas casas, nas famílias
                e na vida de jovens, crianças e adultos.
                Caminhamos por meio das células, dos
                cenáculos e do cuidado de um a um,
                tratando cada pessoa como única e
                preparando a volta de Cristo.
              </p>

              <p>
                As células são pequenos grupos que se
                reúnem nas casas para viver a fé, criar
                vínculos, partilhar a Palavra e caminhar
                juntos, mas ela foi pensada para você:
                jovem comum, com chamado extraordinário!
              </p>
            </div>

            <div className="comunidades__orientacao">
              <p className="comunidades__orientacao-indice">
                Seu próximo passo
              </p>

              <h3>Como encontrar uma célula?</h3>

              <p>
                Quer viver essa experiência em São Paulo?
                Conte que deseja participar pelo nosso
                formulário de contato.
              </p>
            </div>

            <a
              className="comunidades__acao"
              href="#contato"
              onClick={() => definirInteresse('celula')}
            >
              <span>Quero encontrar uma célula</span>

              <span
                className="comunidades__seta"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>

          <div
            className="comunidades__imagem"
            data-numero="03"
          >
            <img
              src="/imagens/comunidades/logo-celulas.jpg"
              alt="Imagem de apresentação das Células da Colo de Deus"
              loading="lazy"
            />
          </div>
        </div>
      </article>

      {/* CENÁCULOS */}

      <article
        className="comunidades__bloco comunidades__bloco--cenaculos"
        id="cenaculos"
        aria-labelledby="cenaculos-titulo"
      >
        <div className="comunidades__conteudo container">
          <div className="comunidades__texto">
            <p className="comunidades__indice">
              04 // Cenáculos
            </p>

            <h2
              className="comunidades__titulo"
              id="cenaculos-titulo"
            >
              <span className="comunidades__titulo-linha">
                Uma casa
              </span>

              <span className="comunidades__titulo-destaque">
                de oração
              </span>
            </h2>

            <div className="comunidades__descricoes">
              <p>
                A Colo de Deus nasceu dentro das casas,
                em um ambiente de oração, comunhão e
                encontro com Deus. É com essa mesma
                essência que acontece o Cenáculo: um
                momento de oração e intimidade com Deus,
                vivido junto à sua família.
              </p>

              <p>
                Nossos missionários vão até a sua casa
                para levar o Carisma Colo de Deus.
                Juntos, nos reunimos à mesa para rezar,
                partilhando da Palavra e da vida.
              </p>
            </div>

            <div className="comunidades__orientacao">
              <p className="comunidades__orientacao-indice">
                Seu próximo passo
              </p>

              <h3>Como participar de um cenáculo?</h3>

              <p>
                Deseja viver um momento de oração em sua
                casa? Entre em contato com a Missão SP
                e manifeste seu interesse.
              </p>
            </div>

            <a
              className="comunidades__acao"
              href="#contato"
              onClick={() => definirInteresse('cenaculo')}
            >
              <span>Quero participar de um cenáculo</span>

              <span
                className="comunidades__seta"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>

          <div
            className="comunidades__imagem"
            data-numero="04"
          >
            <img
              src="/imagens/comunidades/logo-cenaculos.jpg"
              alt="Imagem de apresentação dos Cenáculos da Colo de Deus"
              loading="lazy"
            />
          </div>
        </div>
      </article>
    </section>
  );
}

export default Comunidades;
