import '../estilos/comunidades.css';

function Comunidades() {
  return (
    <section className="comunidades">
      <article
        className="comunidade comunidade--celulas"
        id="celulas"
        aria-labelledby="titulo-celulas"
      >
        <div className="comunidade__conteudo container">
          <div className="comunidade__texto">
            <p className="comunidade__indice">
              03 // Células
            </p>

            <h2
              className="comunidade__titulo"
              id="titulo-celulas"
            >
              Gente imperfeita cuidando de gente imperfeita.
            </h2>

            <p className="comunidade__descricao">
              Somos um lugar de essência, de lifestyle, de ser
              Colo de Deus no um a um. Uma evangelização próxima,
              de pessoas para pessoas, formando líderes,
              acreditando nos improváveis e na manifestação
              do Reino de Deus por meio de gente real.
            </p>

            <a
              className="comunidade__acao"
              href="#contato"
            >
              Encontre uma célula
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="comunidade__midia">
            <img
              src="/imagens/comunidades/logo-celulas.jpg"
              alt="Células Colo de Deus"
            />
          </div>
        </div>
      </article>

      <article
        className="comunidade comunidade--cenaculos"
        id="cenaculos"
        aria-labelledby="titulo-cenaculos"
      >
        <div className="comunidade__conteudo comunidade__conteudo--invertido container">
          <div className="comunidade__midia comunidade__midia--placeholder">
           <div className="comunidade__midia">
            <img
              src="/imagens/comunidades/logo-cenaculos.jpg"
              alt="Cenáculos Colo de Deus"
            />
          </div>
          </div>

          <div className="comunidade__texto">
            <p className="comunidade__indice">
              04 // Cenáculos
            </p>

            <h2
              className="comunidade__titulo"
              id="titulo-cenaculos"
            >
              A evangelização começa nas casas.
            </h2>

            <p className="comunidade__descricao">
              Promovemos cenáculos nas casas e famílias,
              reunindo pessoas para oração e partilha.
              Como os discípulos de Jesus, queremos subir
              à sala de cima e nos aproximar cada vez mais
              d&apos;Ele. Receba a Colo de Deus na sua casa.
            </p>

            <a
              className="comunidade__acao"
              href="#contato"
            >
              Quero receber um cenáculo
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}

export default Comunidades;