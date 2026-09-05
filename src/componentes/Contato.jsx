import '../estilos/contato.css';

function Contato() {
  function lidarComEnvio(evento) {
    evento.preventDefault();
  }

  return (
    <section
      className="contato"
      id="contato"
      aria-labelledby="contato-titulo"
    >
      <div className="contato__conteudo container">
        <div className="contato__apresentacao">
          <p className="contato__indice">
            05 — Fale com a gente
          </p>

          <h2
            className="contato__titulo"
            id="contato-titulo"
          >
            Quer caminhar com a gente?
          </h2>

          <p className="contato__texto">
            Se você quer conhecer uma célula, saber mais sobre
            os cenáculos ou falar com a missão, envie uma mensagem.
          </p>
        </div>

        <form
          className="contato__formulario"
          onSubmit={lidarComEnvio}
        >
          <div className="contato__campo">
            <label htmlFor="nome">
              Nome
            </label>

            <input
              type="text"
              id="nome"
              name="nome"
              autoComplete="name"
              required
            />
          </div>

          <div className="contato__campo">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="contato__campo contato__campo--inteiro">
            <label htmlFor="assunto">
              Assunto
            </label>

            <input
              type="text"
              id="assunto"
              name="assunto"
              required
            />
          </div>

          <div className="contato__campo contato__campo--inteiro">
            <label htmlFor="mensagem">
              Mensagem
            </label>

            <textarea
              id="mensagem"
              name="mensagem"
              rows="5"
              required
            />
          </div>

          <button
            className="contato__botao"
            type="submit"
          >
            Enviar mensagem
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contato;