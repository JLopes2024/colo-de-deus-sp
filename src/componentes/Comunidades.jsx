import '../estilos/comunidades.css';

function Comunidades() {
  return (
    <section className="comunidades">

      {/* =====================================================
          CÉLULAS

          Estrutura pensada para o Serial Position Effect:
          1. Entrada forte: índice + título
          2. Meio mais calmo: descrição
          3. Saída forte: CTA em formato de faixa editorial
          ===================================================== */}
      <article
        className="comunidade comunidade--celulas"
        id="celulas"
        aria-labelledby="titulo-celulas"
      >
        <div className="comunidade__conteudo container">

          {/* ===================================================
              BLOCO DE TEXTO
              =================================================== */}
          <div className="comunidade__texto">

            {/* Pequeno marcador editorial da seção */}
            <p className="comunidade__indice">
              03 // Células
            </p>

            {/* Primeiro grande ponto de memória da seção */}
            <h2
              className="comunidade__titulo"
              id="titulo-celulas"
            >
              Gente imperfeita cuidando de gente imperfeita.
            </h2>

            {/* Parte intermediária:
                texto propositalmente mais calmo para não competir
                com o título e com o CTA final. */}
            <p className="comunidade__descricao">
              Somos um lugar de essência, de lifestyle, de ser
              Colo de Deus no um a um. Uma evangelização próxima,
              de pessoas para pessoas, formando líderes,
              acreditando nos improváveis e na manifestação
              do Reino de Deus por meio de gente real.
            </p>

            {/* Último grande ponto de memória da seção.
                O CTA recebe tratamento visual mais forte para
                reforçar o Serial Position Effect. */}
            <a
              className="comunidade__acao"
              href="#contato"
            >
              <span>
                Encontre uma célula
              </span>

              <span
                className="comunidade__acao-seta"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>

          {/* ===================================================
              ARTE / IMAGEM DE CÉLULAS
              =================================================== */}
          <div className="comunidade__midia">
            <img
              src="/imagens/comunidades/logo-celulas.jpg"
              alt="Células Colo de Deus"
            />
          </div>
        </div>
      </article>


      {/* =====================================================
          CENÁCULOS

          Mantém a mesma lógica visual de Células para criar
          consistência entre as duas frentes.
          ===================================================== */}
      <article
        className="comunidade comunidade--cenaculos"
        id="cenaculos"
        aria-labelledby="titulo-cenaculos"
      >
        <div className="comunidade__conteudo comunidade__conteudo--invertido container">

          {/* ===================================================
              ARTE / IMAGEM DE CENÁCULOS

              Corrigido:
              antes havia uma .comunidade__midia dentro de outra.
              Agora existe apenas um container de mídia.
              =================================================== */}
          <div className="comunidade__midia">
            <img
              src="/imagens/comunidades/logo-cenaculos.jpg"
              alt="Cenáculos Colo de Deus"
            />
          </div>

          {/* ===================================================
              BLOCO DE TEXTO
              =================================================== */}
          <div className="comunidade__texto">

            {/* Pequeno marcador editorial da seção */}
            <p className="comunidade__indice">
              04 // Cenáculos
            </p>

            {/* Primeiro grande ponto de memória */}
            <h2
              className="comunidade__titulo"
              id="titulo-cenaculos"
            >
              A evangelização começa nas casas.
            </h2>

            {/* Miolo explicativo */}
            <p className="comunidade__descricao">
              Promovemos cenáculos nas casas e famílias,
              reunindo pessoas para oração e partilha.
              Como os discípulos de Jesus, queremos subir
              à sala de cima e nos aproximar cada vez mais
              d&apos;Ele. Receba a Colo de Deus na sua casa.
            </p>

            {/* Último grande ponto de memória */}
            <a
              className="comunidade__acao"
              href="#contato"
            >
              <span>
                Quero receber um cenáculo
              </span>

              <span
                className="comunidade__acao-seta"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}

export default Comunidades;