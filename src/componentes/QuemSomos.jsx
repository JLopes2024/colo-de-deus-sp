import '../estilos/quem-somos.css';

function QuemSomos() {
  return (
    <section
      className="quem-somos"
      id="quem-somos"
      aria-labelledby="quem-somos-titulo"
    >
      <div className="quem-somos__conteudo">
        <div className="quem-somos__vazio" />

        <div className="quem-somos__bloco">
          <div className="quem-somos__cabecalho">
            <p className="quem-somos__indice">
              01 // Quem somos?
            </p>

            <h2
              className="quem-somos__titulo"
              id="quem-somos-titulo"
            >
              Chamados a alcançar uma geração.
            </h2>
          </div>

          <div className="quem-somos__corpo">
            <div className="quem-somos__texto">
              <p>
                Somos uma nova comunidade católica, nascida como parte da
                Primavera da Igreja, com essência missionária e mariana.
                Nosso carisma nos move a trazer de volta à Igreja aqueles
                que se afastaram da fé, gestando uma humanidade cheia de
                Pentecostes.
              </p>

              <p>
                Evangelizamos com criatividade, arte e cultura do encontro,
                apresentando o Cristo que conhecemos e amamos a esta geração.
                Queremos que cada pessoa seja alcançada, olhada e resgatada
                em sua dignidade.
              </p>

              <p>
                Estamos presentes nas casas, nas famílias e na vida de jovens,
                crianças e adultos. Caminhamos por meio das células, dos
                cenáculos e do cuidado de um a um, tratando cada pessoa como
                única e preparando a volta de Cristo.
              </p>
            </div>

            <div className="quem-somos__imagem">
              <img
                src="/imagens/gerais/fotos-gerais.jpg"
                alt="Comunidade Colo de Deus reunida"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuemSomos;