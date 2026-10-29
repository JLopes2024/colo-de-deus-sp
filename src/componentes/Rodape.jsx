
import '../estilos/rodape.css';

const LINKS_NAVEGACAO = [
  { texto: 'Início', href: '#inicio' },
  { texto: 'Quem somos', href: '#quem-somos' },
  { texto: 'Células', href: '#celulas' },
  { texto: 'Cenáculos', href: '#cenaculos' },
  { texto: 'Agenda', href: '#agenda' },
  { texto: 'Contato', href: '#contato' },
];

const REDES_SOCIAIS = [
  {
    nome: 'Instagram',
    tipo: 'instagram',
    url: 'https://www.instagram.com/colodedeus/?hl=pt-br',
  },
  {
    nome: 'YouTube',
    tipo: 'youtube',
    url: 'https://www.youtube.com/channel/UCw7SCTLZq2byYiirHtc25-Q',
  },
  {
    nome: 'Spotify',
    tipo: 'spotify',
    url: 'https://open.spotify.com/intl-pt/artist/1AY6YtpuVujP4Pa3ibD1M1',
  },
];

function IconeRede({ tipo }) {
  if (tipo === 'instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (tipo === 'youtube') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path
          d="M10 9 L16 12 L10 15 Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (tipo === 'spotify') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M5.5 9.2 C10 7.7 15.5 8.3 19 10.5" />
        <path d="M6.5 12.5 C10 11.3 14.5 11.7 17.5 13.5" />
        <path d="M7.5 15.7 C10.5 14.8 13.5 15.2 16 16.5" />
      </svg>
    );
  }

  return null;
}

function Rodape() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="rodape">
      <div className="rodape__conteudo container">
        <div className="rodape__marca">
          <a
            className="rodape__logo"
            href="#inicio"
            aria-label="Colo de Deus São Paulo — voltar ao início"
          >
            <img
              src="/imagens/logo-branca.png"
              alt="Colo de Deus"
            />
          </a>

          <p>Colo de Deus São Paulo</p>
        </div>

        <nav
          className="rodape__links"
          aria-label="Navegação do rodapé"
        >
          {LINKS_NAVEGACAO.map((link) => (
            <a key={link.href} href={link.href}>
              {link.texto}
            </a>
          ))}
        </nav>

        <nav
          className="rodape__social"
          aria-label="Redes sociais da Colo de Deus"
        >
          {REDES_SOCIAIS.map((rede) => (
            <a
              key={rede.tipo}
              className="rodape__icone-social"
              href={rede.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visitar ${rede.nome} da Colo de Deus`}
              title={rede.nome}
            >
              <IconeRede tipo={rede.tipo} />
            </a>
          ))}
        </nav>

        <div className="rodape__base">
          <p>© {anoAtual} Colo de Deus São Paulo</p>
          <p>São Paulo • Brasil</p>
        </div>
      </div>
    </footer>
  );
}

export default Rodape;
