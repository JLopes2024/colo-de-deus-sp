
import { useEffect, useRef, useState } from 'react';
import '../estilos/cabecalho.css';

const LINKS = [
  { href: '#quem-somos', texto: 'Quem somos' },
  { href: '#celulas', texto: 'Células' },
  { href: '#cenaculos', texto: 'Cenáculos' },
  { href: '#agenda', texto: 'Agenda' },
  { href: '#contato', texto: 'Contato' },
];

function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [cabecalhoRolado, setCabecalhoRolado] = useState(false);

  const cabecalhoRef = useRef(null);
  const botaoMenuRef = useRef(null);
  const menuRef = useRef(null);

  function fecharMenu() {
    document.body.style.overflow = '';
    setMenuAberto(false);
  }

  function alternarMenu() {
    if (menuAberto) {
      fecharMenu();
    } else {
      setMenuAberto(true);
    }
  }

  useEffect(() => {
    function verificarRolagem() {
      setCabecalhoRolado(window.scrollY > 12);
    }

    verificarRolagem();

    window.addEventListener('scroll', verificarRolagem, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', verificarRolagem);
    };
  }, []);

  useEffect(() => {
    if (!menuAberto) return undefined;

    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    menuRef.current
      ?.querySelector('a')
      ?.focus({ preventScroll: true });

    function lidarComTeclado(evento) {
      if (evento.key === 'Escape') {
        fecharMenu();

        requestAnimationFrame(() => {
          botaoMenuRef.current?.focus({
            preventScroll: true,
          });
        });

        return;
      }

      if (evento.key !== 'Tab') return;

      const elementos = cabecalhoRef.current
        ?.querySelectorAll('a[href], button:not([disabled])');

      if (!elementos?.length) return;

      const visiveis = Array.from(elementos).filter(
        (elemento) => {
          const estilo = window.getComputedStyle(elemento);

          return (
            estilo.display !== 'none' &&
            estilo.visibility !== 'hidden'
          );
        },
      );

      if (!visiveis.length) return;

      const primeiro = visiveis[0];
      const ultimo = visiveis[visiveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
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
      document.body.style.overflow = overflowAnterior;

      document.removeEventListener('keydown', lidarComTeclado);
      window.removeEventListener('resize', verificarLargura);
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
          aria-label="Colo de Deus São Paulo - início"
          onClick={fecharMenu}
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
          {LINKS.map(({ href, texto }) => (
            <a key={href} href={href}>
              {texto}
            </a>
          ))}
        </nav>

        <a className="cabecalho__acao" href="#celulas">
          Encontre-nos
        </a>

        <button
          ref={botaoMenuRef}
          className={`cabecalho__menu${
            menuAberto ? ' cabecalho__menu--aberto' : ''
          }`}
          type="button"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
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
        aria-hidden={!menuAberto}
      >
        <nav
          className="menu-mobile__navegacao container"
          aria-label="Navegação mobile"
        >
          {LINKS.map(({ href, texto }) => (
            <a
              key={href}
              href={href}
              onClick={fecharMenu}
            >
              {texto}
            </a>
          ))}

          <div className="menu-mobile__social">
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
        </nav>
      </div>
    </header>
  );
}

export default Cabecalho;
