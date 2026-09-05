import {
  useEffect,
  useRef,
  useState,
} from 'react';

import '../estilos/cabecalho.css';

function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [cabecalhoRolado, setCabecalhoRolado] = useState(false);

  const cabecalhoRef = useRef(null);
  const botaoMenuRef = useRef(null);
  const menuRef = useRef(null);

  function alternarMenu() {
    setMenuAberto((estadoAtual) => !estadoAtual);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }


  /* =======================================================
     DETECTA ROLAGEM DA PÁGINA
     ======================================================= */

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


  /* =======================================================
     CONTROLES DO MENU MOBILE
     ======================================================= */

  useEffect(() => {
    if (!menuAberto) {
      document.body.style.overflow = '';

      return;
    }

    /* Impede a página de rolar atrás do menu */
    document.body.style.overflow = 'hidden';


    /* Move o foco para o primeiro link do menu */
    const primeiroLink = menuRef.current?.querySelector('a');

    primeiroLink?.focus();


    function lidarComTeclado(evento) {
      /* Fecha o menu com ESC */
      if (evento.key === 'Escape') {
        setMenuAberto(false);

        requestAnimationFrame(() => {
          botaoMenuRef.current?.focus();
        });

        return;
      }

      /* Mantém o foco dentro da navegação mobile */
      if (evento.key !== 'Tab') {
        return;
      }

      const elementosFocaveis = cabecalhoRef.current?.querySelectorAll(
        [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(','),
      );

      if (!elementosFocaveis?.length) {
        return;
      }

      const elementosVisiveis = Array.from(elementosFocaveis).filter(
        (elemento) => {
          const estilos = window.getComputedStyle(elemento);

          return (
            estilos.display !== 'none' &&
            estilos.visibility !== 'hidden'
          );
        },
      );

      if (!elementosVisiveis.length) {
        return;
      }

      const primeiroElemento = elementosVisiveis[0];
      const ultimoElemento =
        elementosVisiveis[elementosVisiveis.length - 1];

      if (
        evento.shiftKey &&
        document.activeElement === primeiroElemento
      ) {
        evento.preventDefault();

        ultimoElemento.focus();
      }

      if (
        !evento.shiftKey &&
        document.activeElement === ultimoElemento
      ) {
        evento.preventDefault();

        primeiroElemento.focus();
      }
    }


    /* Se a tela voltar para desktop, fecha o menu */
    function verificarTamanhoDaTela() {
      if (window.innerWidth > 900) {
        setMenuAberto(false);
      }
    }

    document.addEventListener('keydown', lidarComTeclado);
    window.addEventListener('resize', verificarTamanhoDaTela);

    return () => {
      document.body.style.overflow = '';

      document.removeEventListener(
        'keydown',
        lidarComTeclado,
      );

      window.removeEventListener(
        'resize',
        verificarTamanhoDaTela,
      );
    };
  }, [menuAberto]);


  /* =======================================================
     RETORNA O FOCO AO BOTÃO APÓS FECHAR PELO MENU
     ======================================================= */

  function fecharMenuPeloLink() {
    setMenuAberto(false);
  }


  return (
    <header
      ref={cabecalhoRef}
      className={[
        'cabecalho',
        cabecalhoRolado
          ? 'cabecalho--rolado'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
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
          <a href="#quem-somos">
            Quem somos
          </a>

          <a href="#celulas">
            Células
          </a>

          <a href="#cenaculos">
            Cenáculos
          </a>

          <a href="#agenda">
            Agenda
          </a>

          <a href="#contato">
            Contato
          </a>
        </nav>

        <a
          className="cabecalho__acao"
          href="#celulas"
        >
          Encontre-nos
        </a>

        <button
          ref={botaoMenuRef}
          className={[
            'cabecalho__menu',
            menuAberto
              ? 'cabecalho__menu--aberto'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type="button"
          aria-label={
            menuAberto
              ? 'Fechar menu'
              : 'Abrir menu'
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
        className={[
          'menu-mobile',
          menuAberto
            ? 'menu-mobile--aberto'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        id="menu-mobile"
        aria-hidden={!menuAberto}
      >
        <nav
          className="menu-mobile__navegacao container"
          aria-label="Navegação mobile"
        >
          <a
            href="#quem-somos"
            onClick={fecharMenuPeloLink}
          >
            Quem somos
          </a>

          <a
            href="#celulas"
            onClick={fecharMenuPeloLink}
          >
            Células
          </a>

          <a
            href="#cenaculos"
            onClick={fecharMenuPeloLink}
          >
            Cenáculos
          </a>

          <a
            href="#agenda"
            onClick={fecharMenuPeloLink}
          >
            Agenda
          </a>

          <a
            href="#contato"
            onClick={fecharMenuPeloLink}
          >
            Contato
          </a>

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