
import { useEffect, useRef, useState } from 'react';
import '../estilos/cabecalho.css';

const LINKS = [
  { href: '#quem-somos', texto: 'Quem somos' },
  { href: '#celulas', texto: 'Células' },
  { href: '#cenaculos', texto: 'Cenáculos' },
  { href: '#agenda', texto: 'Agenda' },
  { href: '#contato', texto: 'Contato' },
];

const REDES = [
  {
    nome: 'Instagram',
    url: 'https://www.instagram.com/colodedeus/?hl=pt-br',
  },
  {
    nome: 'YouTube',
    url: 'https://www.youtube.com/channel/UCw7SCTLZq2byYiirHtc25-Q',
  },
];

function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [cabecalhoRolado, setCabecalhoRolado] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState(null);

  const cabecalhoRef = useRef(null);
  const botaoMenuRef = useRef(null);
  const menuRef = useRef(null);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function alternarMenu() {
    setMenuAberto((aberto) => !aberto);
  }

  function navegarPara(href) {
    setSecaoAtiva(href.slice(1));
    fecharMenu();
  }

  // Aparência do cabeçalho após iniciar a rolagem.
  useEffect(() => {
    function verificarRolagem() {
      setCabecalhoRolado((anterior) => {
        const rolado = window.scrollY > 12;
        return anterior === rolado ? anterior : rolado;
      });
    }

    verificarRolagem();

    window.addEventListener('scroll', verificarRolagem, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', verificarRolagem);
    };
  }, []);

  // Identifica a seção correspondente à área de leitura.
  useEffect(() => {
    const secoes = LINKS.map(({ href }) => ({
      id: href.slice(1),
      elemento: document.getElementById(href.slice(1)),
    })).filter(({ elemento }) => elemento !== null);

    if (!secoes.length) return undefined;

    function atualizarSecaoAtiva() {
      const alturaCabecalho =
        cabecalhoRef.current?.getBoundingClientRect().height ?? 72;

      // Ponto de referência próximo ao terço superior da tela.
      const pontoLeitura = Math.max(
        alturaCabecalho + 8,
        window.innerHeight * 0.35
      );

      const atual = secoes.find(({ elemento }) => {
        const limites = elemento.getBoundingClientRect();

        return (
          limites.top <= pontoLeitura &&
          limites.bottom > pontoLeitura
        );
      });

      setSecaoAtiva(atual?.id ?? null);
    }

    // O observador aciona a verificação somente quando
    // uma seção entra ou sai da área relevante.
    const observador = new IntersectionObserver(
      atualizarSecaoAtiva,
      {
        rootMargin: '-72px 0px -60% 0px',
        threshold: 0,
      }
    );

    secoes.forEach(({ elemento }) => {
      observador.observe(elemento);
    });

    // Permite sincronizar após atualização do hash,
    // mudanças de tamanho e carregamento inicial.
    function atualizarDepoisDaNavegacao() {
      window.requestAnimationFrame(atualizarSecaoAtiva);
    }

    window.addEventListener('resize', atualizarDepoisDaNavegacao);
    window.addEventListener('hashchange', atualizarDepoisDaNavegacao);

    atualizarDepoisDaNavegacao();

    return () => {
      observador.disconnect();

      window.removeEventListener(
        'resize',
        atualizarDepoisDaNavegacao
      );

      window.removeEventListener(
        'hashchange',
        atualizarDepoisDaNavegacao
      );
    };
  }, []);

  // Comportamento acessível do menu mobile.
  useEffect(() => {
    if (!menuAberto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focoAnterior = document.activeElement;

    const frame = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector('.menu-mobile__link')
        ?.focus({ preventScroll: true });
    });

    function lidarComTeclado(evento) {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        fecharMenu();

        window.requestAnimationFrame(() => {
          botaoMenuRef.current?.focus({
            preventScroll: true,
          });
        });

        return;
      }

      if (evento.key !== 'Tab') return;

      const elementos = [
        ...cabecalhoRef.current.querySelectorAll(
          '.cabecalho__logo, .cabecalho__menu'
        ),
        ...menuRef.current.querySelectorAll('a[href]'),
      ];

      if (!elementos.length) return;

      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (
        evento.shiftKey &&
        document.activeElement === primeiro
      ) {
        evento.preventDefault();
        ultimo.focus();
      } else if (
        !evento.shiftKey &&
        document.activeElement === ultimo
      ) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    function verificarLargura() {
      if (window.innerWidth > 900) {
        fecharMenu();
      }
    }

    document.addEventListener('keydown', lidarComTeclado);
    window.addEventListener('resize', verificarLargura);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = overflowAnterior;

      document.removeEventListener(
        'keydown',
        lidarComTeclado
      );

      window.removeEventListener(
        'resize',
        verificarLargura
      );

      if (
        focoAnterior instanceof HTMLElement &&
        document.contains(focoAnterior) &&
        document.activeElement === document.body
      ) {
        focoAnterior.focus({ preventScroll: true });
      }
    };
  }, [menuAberto]);

  return (
    <header
      ref={cabecalhoRef}
      className={`cabecalho${
        cabecalhoRolado ? ' cabecalho--rolado' : ''
      }`}
    >
      <div className="cabecalho__conteudo container">
        <a
          className="cabecalho__logo"
          href="#inicio"
          aria-label="Colo de Deus São Paulo — início"
          onClick={() => {
            setSecaoAtiva(null);
            fecharMenu();
          }}
        >
          <img
            src="/imagens/logo-branca.png"
            alt="Colo de Deus"
          />
        </a>

        <nav
          className="cabecalho__navegacao"
          aria-label="Navegação principal"
        >
          {LINKS.map(({ href, texto }) => {
            const ativa = secaoAtiva === href.slice(1);

            return (
              <a
                key={href}
                href={href}
                className={
                  ativa ? 'cabecalho__link--ativo' : undefined
                }
                aria-current={ativa ? 'location' : undefined}
                onClick={() => navegarPara(href)}
              >
                {texto}
              </a>
            );
          })}
        </nav>

        <a
          className="cabecalho__acao"
          href="#contato"
          onClick={() => navegarPara('#contato')}
        >
          Fale com a missão
        </a>

        <button
          ref={botaoMenuRef}
          className={`cabecalho__menu${
            menuAberto ? ' cabecalho__menu--aberto' : ''
          }`}
          type="button"
          aria-label={
            menuAberto ? 'Fechar navegação' : 'Abrir navegação'
          }
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
          onClick={alternarMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        ref={menuRef}
        id="menu-mobile"
        className={`menu-mobile${
          menuAberto ? ' menu-mobile--aberto' : ''
        }`}
        inert={!menuAberto}
        aria-hidden={!menuAberto}
      >
        <div className="menu-mobile__interior container">
          <div className="menu-mobile__topo">
            <span className="menu-mobile__etiqueta">
              Navegação // Missão SP
            </span>

            <span className="menu-mobile__edicao">
              01 — 05
            </span>
          </div>

          <nav
            className="menu-mobile__navegacao"
            aria-label="Navegação mobile"
          >
            {LINKS.map(({ href, texto }, indice) => {
              const ativa = secaoAtiva === href.slice(1);

              return (
                <a
                  key={href}
                  className={`menu-mobile__link${
                    ativa ? ' menu-mobile__link--ativo' : ''
                  }`}
                  href={href}
                  aria-current={ativa ? 'location' : undefined}
                  onClick={() => navegarPara(href)}
                  style={{ '--indice': indice }}
                >
                  <span
                    className="menu-mobile__numero"
                    aria-hidden="true"
                  >
                    {String(indice + 1).padStart(2, '0')}
                  </span>

                  <span className="menu-mobile__texto">
                    {texto}
                  </span>

                  <span
                    className="menu-mobile__seta"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="menu-mobile__rodape">
            <a
              className="menu-mobile__participar"
              href="#celulas"
              onClick={() => navegarPara('#celulas')}
            >
              <span>Quero participar</span>
              <span aria-hidden="true">↗</span>
            </a>

            <div className="menu-mobile__base">
              <span className="menu-mobile__assinatura">
                Colo de Deus São Paulo
              </span>

              <div className="menu-mobile__social">
                {REDES.map((rede) => (
                  <a
                    key={rede.nome}
                    href={rede.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {rede.nome} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Cabecalho;
