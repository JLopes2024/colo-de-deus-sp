import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { perguntasGame } from '../dados/perguntas-game.js';

import '../estilos/game-colo.css';


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

/*
 * Quantidade de perguntas exibidas em cada partida.
 *
 * Mesmo que o banco tenha 15, 20 ou 50 perguntas,
 * cada rodada continuará tendo apenas 5.
 */
const QUANTIDADE_POR_PARTIDA = 5;


/*
 * Chave utilizada para salvar no navegador quais perguntas
 * o usuário já recebeu.
 *
 * Evite alterar este valor depois que o site estiver
 * publicado, pois trocar a chave equivale a zerar
 * o histórico dos usuários.
 */
const CHAVE_LOCAL_STORAGE =
  'colo-de-deus-game-perguntas-vistas';


/* =========================================================
   FUNÇÃO AUXILIAR — EMBARALHAR
   ========================================================= */

/*
 * Cria uma cópia do array antes de embaralhar.
 *
 * Isso é importante para não modificar diretamente
 * o array original importado de perguntas-game.js.
 */
function embaralhar(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const indiceAleatorio =
      Math.floor(Math.random() * (i + 1));

    [
      copia[i],
      copia[indiceAleatorio],
    ] = [
      copia[indiceAleatorio],
      copia[i],
    ];
  }

  return copia;
}


/* =========================================================
   HISTÓRICO DO LOCALSTORAGE
   ========================================================= */

function buscarPerguntasVistas() {

  /*
   * Em alguns ambientes React pode ser renderizado
   * sem acesso ao navegador.
   *
   * Esta proteção evita erro caso window não exista.
   */
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const valorSalvo =
      window.localStorage.getItem(
        CHAVE_LOCAL_STORAGE,
      );

    if (!valorSalvo) {
      return [];
    }

    const ids = JSON.parse(valorSalvo);

    /*
     * Garante que o dado salvo realmente seja um array.
     */
    return Array.isArray(ids)
      ? ids
      : [];
  } catch {

    /*
     * Se o localStorage estiver corrompido,
     * simplesmente começamos novamente.
     */
    return [];
  }
}


function salvarPerguntasVistas(ids) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      CHAVE_LOCAL_STORAGE,
      JSON.stringify(ids),
    );
  } catch {

    /*
     * O quiz continua funcionando mesmo se o navegador
     * bloquear o localStorage.
     *
     * Apenas perderemos o histórico entre visitas.
     */
  }
}


/* =========================================================
   PREPARAÇÃO DE UMA NOVA PARTIDA
   ========================================================= */

function criarPartida() {
  const vistas = buscarPerguntasVistas();

  /*
   * Selecionamos somente perguntas ainda não vistas.
   */
  let disponiveis =
    perguntasGame.filter(
      (pergunta) =>
        !vistas.includes(pergunta.id),
    );


  /*
   * Se restarem menos de 5 perguntas inéditas,
   * encerramos esse "ciclo" e começamos outro.
   *
   * Assim nunca temos uma rodada com menos perguntas.
   */
  let historicoAtual = vistas;

  if (
    disponiveis.length
    < QUANTIDADE_POR_PARTIDA
  ) {
    historicoAtual = [];

    disponiveis = [...perguntasGame];
  }


  /*
   * Embaralha o banco disponível e seleciona
   * apenas as primeiras 5 perguntas.
   */
  const selecionadas =
    embaralhar(disponiveis)
      .slice(
        0,
        QUANTIDADE_POR_PARTIDA,
      )
      .map((pergunta) => ({
        ...pergunta,

        /*
         * As alternativas também são embaralhadas.
         *
         * Isso evita que o usuário memorize:
         * "a resposta certa é sempre a primeira".
         */
        alternativas:
          embaralhar(
            pergunta.alternativas,
          ),
      }));


  /*
   * Atualiza o histórico com as perguntas
   * selecionadas nesta rodada.
   */
  const novosIds =
    selecionadas.map(
      (pergunta) => pergunta.id,
    );

  salvarPerguntasVistas([
    ...historicoAtual,
    ...novosIds,
  ]);

  return selecionadas;
}


/* =========================================================
   RESULTADO
   ========================================================= */

function buscarResultado(acertos) {

  if (acertos <= 1) {
    return {
      titulo:
        'Tá na hora de conhecer a Colo 😅',

      texto:
        'Você encontrou um bom motivo para continuar explorando a nossa missão.',

      acao:
        'Conheça a nossa missão',

      destino:
        '#quem-somos',
    };
  }


  if (acertos <= 3) {
    return {
      titulo:
        'Você já conhece a família!',

      texto:
        'Já deu para perceber que você conhece bastante coisa. Agora falta viver isso mais de perto.',

      acao:
        'Conheça células e cenáculos',

      destino:
        '#celulas',
    };
  }


  if (acertos === 4) {
    return {
      titulo:
        'Quase Colo de carteirinha.',

      texto:
        'Foi por pouco. Você está a uma pergunta da perfeição — ou pelo menos da perfeição nesse quiz.',

      acao:
        'Veja nossa agenda',

      destino:
        '#agenda',
    };
  }


  return {
    titulo:
      'Você é Colo demais.',

    texto:
      'Cinco de cinco. Agora só falta provar que consegue fazer isso de novo com outras perguntas.',

    acao:
      'Jogar novamente',

    destino:
      'recomecar',
  };
}


/* =========================================================
   COMPONENTE
   ========================================================= */

function GameColo() {

  /* -------------------------------------------------------
     CONTROLE DO MODAL
     ------------------------------------------------------- */

  const [aberto, setAberto] =
    useState(false);


  /* -------------------------------------------------------
     PERGUNTAS DA PARTIDA ATUAL
     ------------------------------------------------------- */

  const [
    perguntas,
    setPerguntas,
  ] = useState([]);


  /* -------------------------------------------------------
     ÍNDICE DA PERGUNTA ATUAL
     ------------------------------------------------------- */

  const [
    indiceAtual,
    setIndiceAtual,
  ] = useState(0);


  /* -------------------------------------------------------
     ALTERNATIVA ESCOLHIDA
     ------------------------------------------------------- */

  const [
    respostaSelecionada,
    setRespostaSelecionada,
  ] = useState(null);


  /* -------------------------------------------------------
     PONTUAÇÃO
     ------------------------------------------------------- */

  const [
    acertos,
    setAcertos,
  ] = useState(0);


  /* -------------------------------------------------------
     CONTROLE DA TELA FINAL
     ------------------------------------------------------- */

  const [
    finalizado,
    setFinalizado,
  ] = useState(false);


  /* =======================================================
     PERGUNTA ATUAL
     ======================================================= */

  const perguntaAtual =
    perguntas[indiceAtual];


  /* =======================================================
     PROGRESSO — GOAL-GRADIENT EFFECT
     ======================================================= */

  const progresso =
    perguntas.length > 0
      ? (
          (
            indiceAtual + 1
          )
          / perguntas.length
        ) * 100
      : 0;


  /* =======================================================
     RESULTADO FINAL
     ======================================================= */

  const resultado =
    useMemo(
      () =>
        buscarResultado(acertos),
      [acertos],
    );


  /* =======================================================
     NOVA PARTIDA
     ======================================================= */

  function iniciarPartida() {

    const novaPartida =
      criarPartida();

    setPerguntas(novaPartida);

    setIndiceAtual(0);

    setRespostaSelecionada(null);

    setAcertos(0);

    setFinalizado(false);
  }


  /* =======================================================
     ABRIR O GAME
     ======================================================= */

  function abrirGame() {

    /*
     * Sempre cria uma nova partida ao abrir
     * depois de uma partida já finalizada.
     */
    if (
      perguntas.length === 0
      || finalizado
    ) {
      iniciarPartida();
    }

    setAberto(true);
  }


  /* =======================================================
     FECHAR
     ======================================================= */

  function fecharGame() {
    setAberto(false);
  }


  /* =======================================================
     RESPONDER
     ======================================================= */

  function responder(alternativa) {

    /*
     * Depois que a resposta foi escolhida,
     * não permitimos nova seleção.
     */
    if (respostaSelecionada) {
      return;
    }

    setRespostaSelecionada(
      alternativa,
    );

    if (
      alternativa
      === perguntaAtual.resposta
    ) {
      setAcertos(
        (valorAtual) =>
          valorAtual + 1,
      );
    }
  }


  /* =======================================================
     PRÓXIMA PERGUNTA
     ======================================================= */

  function proximaPergunta() {

    const ultimaPergunta =
      indiceAtual
      === perguntas.length - 1;

    if (ultimaPergunta) {
      setFinalizado(true);

      return;
    }

    setIndiceAtual(
      (valorAtual) =>
        valorAtual + 1,
    );

    setRespostaSelecionada(null);
  }


  /* =======================================================
     CTA DO RESULTADO
     ======================================================= */

  function executarAcaoResultado() {

    if (
      resultado.destino
      === 'recomecar'
    ) {
      iniciarPartida();

      return;
    }

    setAberto(false);
  }


  /* =======================================================
     ESC PARA FECHAR
     ======================================================= */

  useEffect(() => {

    function lidarComTecla(evento) {

      if (
        evento.key === 'Escape'
      ) {
        setAberto(false);
      }
    }

    window.addEventListener(
      'keydown',
      lidarComTecla,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        lidarComTecla,
      );
    };
  }, []);


  /* =======================================================
     BLOQUEIO DE SCROLL

     Quando o painel estiver aberto no celular,
     impedimos que o conteúdo atrás role.
     ======================================================= */

  useEffect(() => {

    if (!aberto) {
      return undefined;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        overflowAnterior;
    };
  }, [aberto]);


  return (
    <>

      {/* ===================================================
          BOTÃO FLUTUANTE

          A própria logo funciona como entrada para o game.
          =================================================== */}

      <button
        className="game-colo__gatilho"
        type="button"
        onClick={abrirGame}
        aria-label="Jogar o quiz da Colo de Deus"
      >
        <img
          src="/imagens/logo-final-branca.png"
          alt=""
          aria-hidden="true"
        />

        {/* Texto mostrado como pequena dica no desktop */}
        <span className="game-colo__gatilho-texto">
          Você conhece a Colo?
        </span>
      </button>


      {/* ===================================================
          PAINEL / MODAL
          =================================================== */}

      {aberto && (
        <div
          className="game-colo__overlay"
          role="presentation"
          onMouseDown={(evento) => {

            /*
             * Fecha ao clicar somente no fundo.
             *
             * Clique dentro do painel não fecha.
             */
            if (
              evento.target
              === evento.currentTarget
            ) {
              fecharGame();
            }
          }}
        >
          <section
            className="game-colo__painel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-colo-titulo"
          >

            {/* =============================================
                CABEÇALHO
                ============================================= */}

            <header className="game-colo__cabecalho">

              <div>
                <p className="game-colo__indice">
                  GAME // COLO DE DEUS
                </p>

                <h2 id="game-colo-titulo">
                  Quanto você conhece a Colo?
                </h2>
              </div>

              <button
                className="game-colo__fechar"
                type="button"
                onClick={fecharGame}
                aria-label="Fechar o game"
              >
                ×
              </button>
            </header>


            {/* =============================================
                PARTIDA
                ============================================= */}

            {!finalizado
              && perguntaAtual
              && (
                <>

                  {/* =========================================
                      GOAL-GRADIENT EFFECT

                      Número + pontos + barra.

                      Conforme a pessoa avança,
                      o objetivo fica visualmente mais próximo.
                      ========================================= */}

                  <div className="game-colo__progresso">

                    <div className="game-colo__progresso-topo">

                      <div
                        className="game-colo__pontos"
                        aria-hidden="true"
                      >
                        {perguntas.map(
                          (pergunta, indice) => (
                            <span
                              key={pergunta.id}
                              className={
                                indice
                                <= indiceAtual
                                  ? 'game-colo__ponto game-colo__ponto--ativo'
                                  : 'game-colo__ponto'
                              }
                            />
                          ),
                        )}
                      </div>

                      <span className="game-colo__contador">
                        {String(
                          indiceAtual + 1,
                        ).padStart(2, '0')}
                        {' / '}
                        {String(
                          perguntas.length,
                        ).padStart(2, '0')}
                      </span>
                    </div>


                    <div
                      className="game-colo__barra"
                      aria-hidden="true"
                    >
                      <span
                        style={{
                          width:
                            `${progresso}%`,
                        }}
                      />
                    </div>
                  </div>


                  {/* =========================================
                      PERGUNTA
                      ========================================= */}

                  <div className="game-colo__pergunta">

                    <p className="game-colo__rotulo">
                      Pergunta
                    </p>

                    <h3>
                      {perguntaAtual.pergunta}
                    </h3>
                  </div>


                  {/* =========================================
                      ALTERNATIVAS
                      ========================================= */}

                  <div className="game-colo__alternativas">

                    {perguntaAtual.alternativas.map(
                      (alternativa) => {

                        const selecionada =
                          respostaSelecionada
                          === alternativa;

                        const correta =
                          alternativa
                          === perguntaAtual.resposta;

                        let classe =
                          'game-colo__alternativa';

                        /*
                         * Somente depois que o usuário
                         * respondeu mostramos o estado.
                         */
                        if (
                          respostaSelecionada
                        ) {

                          if (correta) {
                            classe +=
                              ' game-colo__alternativa--correta';
                          } else if (
                            selecionada
                          ) {
                            classe +=
                              ' game-colo__alternativa--errada';
                          }
                        }

                        return (
                          <button
                            key={alternativa}
                            className={classe}
                            type="button"
                            disabled={
                              Boolean(
                                respostaSelecionada,
                              )
                            }
                            onClick={() =>
                              responder(
                                alternativa,
                              )
                            }
                          >
                            {alternativa}
                          </button>
                        );
                      },
                    )}
                  </div>


                  {/* =========================================
                      FEEDBACK
                      ========================================= */}

                  {respostaSelecionada && (
                    <div
                      className="game-colo__feedback"
                      aria-live="polite"
                    >

                      <strong>
                        {
                          respostaSelecionada
                          === perguntaAtual.resposta
                            ? '✓ Acertou!'
                            : '✕ Quase!'
                        }
                      </strong>

                      <p>
                        {perguntaAtual.explicacao}
                      </p>

                      <button
                        type="button"
                        className="game-colo__proxima"
                        onClick={proximaPergunta}
                      >
                        {
                          indiceAtual
                          === perguntas.length - 1
                            ? 'Ver resultado'
                            : 'Próxima'
                        }

                        <span aria-hidden="true">
                          →
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}


            {/* =============================================
                RESULTADO FINAL
                ============================================= */}

            {finalizado && (
              <div className="game-colo__resultado">

                <p className="game-colo__resultado-pontos">
                  {acertos} / {perguntas.length}
                </p>

                <h3>
                  {resultado.titulo}
                </h3>

                <p>
                  {resultado.texto}
                </p>

                <a
                  className="game-colo__resultado-acao"
                  href={
                    resultado.destino
                    === 'recomecar'
                      ? undefined
                      : resultado.destino
                  }
                  onClick={(evento) => {

                    if (
                      resultado.destino
                      === 'recomecar'
                    ) {
                      evento.preventDefault();

                      executarAcaoResultado();
                    }
                  }}
                >
                  {resultado.acao}

                  <span aria-hidden="true">
                    →
                  </span>
                </a>


                {/* Jogar novamente fica disponível para
                    qualquer pontuação, mesmo quando o CTA
                    principal aponta para outra área. */}

                {resultado.destino
                  !== 'recomecar'
                  && (
                    <button
                      className="game-colo__recomecar"
                      type="button"
                      onClick={iniciarPartida}
                    >
                      Jogar novamente
                    </button>
                  )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default GameColo;