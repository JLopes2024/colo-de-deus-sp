import '../estilos/rodape.css';

function Rodape() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="rodape">
      <div className="rodape__conteudo container">
        <div className="rodape__marca">
          <img
            src="/imagens/logo-branca.png"
            alt="Colo de Deus"
          />

          <p>
            Colo de Deus São Paulo
          </p>
        </div>

        <div className="rodape__links">
          <a
            href="#inicio"
          >
            Início
          </a>

          <a
            href="#quem-somos"
          >
            Quem somos
          </a>

          <a
            href="#celulas"
          >
            Células
          </a>

          <a
            href="#cenaculos"
          >
            Cenáculos
          </a>

          <a
            href="#agenda"
          >
            Agenda
          </a>

          <a
            href="#contato"
          >
            Contato
          </a>
        </div>

        <div className="rodape__social">
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>

          <a
            href="#"
            target="_blank"
            rel="noreferrer"
          >
            YouTube ↗
          </a>
        </div>

        <div className="rodape__base">
          <p>
            © {anoAtual} Colo de Deus São Paulo
          </p>

          <p>
            São Paulo • Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Rodape;