import '../estilos/comunidades.css';

function Comunidades() {
  function definirInteresse(interesse) {
    sessionStorage.setItem(
      'interesse-contato',
      interesse,
    );
  }

  return (
    <section
      className="comunidades"
      aria-label="Células e Cenáculos"
    >
      <article
        className="comunidades__bloco comunidades__bloco--celulas"
        id="celulas"
      >
        <div className="comunidades__conteudo container">
          <div className="comunidades__texto">
            <p className="comunidades__indice">
              03 // Células
            </p>

            <h2 className="comunidades__titulo">
              Igreja viva
              <span>nas casas</span>
            </h2>

            <p className="comunidades__descricao">
              Estamos presentes nas casas, nas famílias e na vida de jovens, crianças e adultos. Caminhamos por meio das células, cenáculos e do cuidado no um a um, tratando cada pessoa como única e preparando a volta de Cristo.
            </p>
            <p className="comunidades__descricao">
            As células são pequenos grupos que se reúnem nas casas para viver a fé, criar vínculos, partilhar a Palavra e caminhar juntos, mas ela foi pensada para você: Jovem comum, com chamado extaordinário!
            </p>


            <a
              className="comunidades__acao"
              href="#contato"
              onClick={() => definirInteresse('celula')}
            >
              Quero encontrar uma célula

              <span aria-hidden="true">
                →
              </span>
            </a>
          </div>

          <div className="comunidades__imagem">
            <img
              src="/imagens/comunidades/logo-celulas.jpg"
              alt="Encontro de uma célula da comunidade Colo de Deus"
            />
          </div>
        </div>
      </article>

      <article
        className="comunidades__bloco comunidades__bloco--cenaculos"
        id="cenaculos"
      >
        <div className="comunidades__conteudo comunidades__conteudo--invertido container">
          <div className="comunidades__texto">
            <p className="comunidades__indice">
              04 // Cenáculos
            </p>

            <h2 className="comunidades__titulo">
              Uma casa
              <span>de oração</span>
            </h2>

            <p className="comunidades__descricao">
              A Colo de Deus nasceu dentro das casas, em um ambiente de oração, comunhão e encontro com Deus. É com essa mesma essência que acontece o Cenáculo: um momento de oração e intimidade com Deus, vivido junto à sua família.
            </p>

<p className="comunidades__descricao">
Nossos missionários vão até a sua casa para levar o Carisma Colo de Deus. Juntos, nos reunimos à mesa para rezar, partilhando da Palavra e da vida.
            </p>

            <a
              className="comunidades__acao"
              href="#contato"
              onClick={() => definirInteresse('cenaculo')}
            >
              Quero participar de um cenáculo

              <span aria-hidden="true">
                →
              </span>
            </a>
          </div>

          <div className="comunidades__imagem">
            <img
              src="/imagens/comunidades/logo-cenaculos.jpg"
              alt="Momento de oração em um cenáculo da comunidade Colo de Deus"
            />
          </div>
        </div>
      </article>
    </section>
  );
}

export default Comunidades;