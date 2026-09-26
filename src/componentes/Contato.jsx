import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  detectarIntencao,
  obterOpcoesConfirmacao,
  obterPerguntaConfirmacao,
} from '../servicos/detectorIntencao.js';

import '../estilos/contato.css';


const WHATSAPP = '5511977152219';
const LIMITE_MENSAGEM = 500;


const REGIOES = [
  'São Paulo — Zona Norte',
  'São Paulo — Zona Sul',
  'São Paulo — Zona Leste',
  'São Paulo — Zona Oeste',
  'São Paulo — Centro',
  'ABC e região',
  'Mogi e região',
  'Osasco e região',
  'Outra região',
];


const OPCOES_INICIAIS = [
  {
    id: 'celula',
    texto: 'Quero encontrar uma célula',
  },
  {
    id: 'cenaculo',
    texto: 'Quero conhecer um cenáculo',
  },
  {
    id: 'missao',
    texto: 'Quero falar com alguém da missão',
  },
];


const MENSAGENS_INICIAIS = [
  {
    id: 'inicio-1',
    autor: 'bot',
    texto: 'Oi! 👋',
  },
  {
    id: 'inicio-2',
    autor: 'bot',
    texto: 'Que bom ter você por aqui. Como a gente pode te ajudar?',
  },
];


function Contato() {
  const [
    mensagens,
    setMensagens,
  ] = useState(MENSAGENS_INICIAIS);

  const [
    etapa,
    setEtapa,
  ] = useState('inicio');

  const [
    interesse,
    setInteresse,
  ] = useState('');

  const [
    regiao,
    setRegiao,
  ] = useState('');

  const [
    digitando,
    setDigitando,
  ] = useState(false);

  const [
    textoMensagem,
    setTextoMensagem,
  ] = useState('');

  const [
    mensagemLivre,
    setMensagemLivre,
  ] = useState('');

  const [
    erroMensagem,
    setErroMensagem,
  ] = useState('');

  const [
    intencaoDetectada,
    setIntencaoDetectada,
  ] = useState(null);


  const conversaRef = useRef(null);
  const textareaRef = useRef(null);
  const contadorIdRef = useRef(0);


  /* =======================================================
     IDs DAS MENSAGENS
     ======================================================= */

  function gerarId() {
    contadorIdRef.current += 1;

    return `mensagem-${contadorIdRef.current}`;
  }


  /* =======================================================
     SCROLL AUTOMÁTICO
     ======================================================= */

  useEffect(() => {
    const conversa = conversaRef.current;

    if (!conversa) return;

    conversa.scrollTo({
      top: conversa.scrollHeight,
      behavior: 'smooth',
    });
  }, [
    mensagens,
    digitando,
    etapa,
  ]);


  /* =======================================================
     FOCO NO CAMPO LIVRE
     ======================================================= */

  useEffect(() => {
    if (etapa !== 'mensagem') return undefined;

    const timeout = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 150);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [etapa]);


  /* =======================================================
     ENTRADA PELOS CTAs DO SITE
     ======================================================= */

  useEffect(() => {
    const interesseSalvo = sessionStorage.getItem(
      'interesse-contato',
    );

    if (
      interesseSalvo !== 'celula'
      && interesseSalvo !== 'cenaculo'
    ) {
      return;
    }

    sessionStorage.removeItem(
      'interesse-contato',
    );

    const textoUsuario = (
      interesseSalvo === 'celula'
        ? 'Quero encontrar uma célula'
        : 'Quero conhecer um cenáculo'
    );

    setInteresse(interesseSalvo);

    setMensagens([
      {
        id: 'entrada-1',
        autor: 'bot',
        texto: 'Oi! 👋 Que bom ter você por aqui.',
      },
      {
        id: 'entrada-2',
        autor: 'usuario',
        texto: textoUsuario,
      },
    ]);

    responderComRegiao(
      interesseSalvo,
    );
  }, []);


  /* =======================================================
     AUXILIARES
     ======================================================= */

  function esperar(ms) {
    return new Promise((resolve) => {
      window.setTimeout(
        resolve,
        ms,
      );
    });
  }


  function adicionarMensagem(
    autor,
    texto,
    id = null,
  ) {
    setMensagens((atuais) => [
      ...atuais,
      {
        id: id ?? gerarId(),
        autor,
        texto,
      },
    ]);
  }


  /* =======================================================
     PERGUNTA DE REGIÃO
     ======================================================= */

  async function responderComRegiao(
    tipoInteresse,
  ) {
    setEtapa('aguardando');
    setDigitando(true);

    await esperar(500);

    setDigitando(false);

    if (tipoInteresse === 'celula') {
      adicionarMensagem(
        'bot',
        'Que bom! 💛 Vamos te ajudar a encontrar uma célula perto de você. Em qual região você está?',
      );
    } else {
      adicionarMensagem(
        'bot',
        'Bora! 🙌 Vamos te ajudar a encontrar um cenáculo. Em qual região você está?',
      );
    }

    setEtapa('regiao');
  }


  /* =======================================================
     PRIMEIRA ESCOLHA
     ======================================================= */

  async function escolherInteresse(opcao) {
    if (digitando) return;

    setInteresse(opcao.id);

    adicionarMensagem(
      'usuario',
      opcao.texto,
    );

    /*
     * Célula e Cenáculo entram diretamente
     * no fluxo guiado.
     */
    if (
      opcao.id === 'celula'
      || opcao.id === 'cenaculo'
    ) {
      await responderComRegiao(
        opcao.id,
      );

      return;
    }

    /*
     * Conversa com a Missão libera texto livre.
     */
    setEtapa('aguardando');
    setDigitando(true);

    await esperar(500);

    setDigitando(false);

    adicionarMensagem(
      'bot',
      'Claro! 💛 Pode contar pra gente. O que você gostaria de falar?',
    );

    setEtapa('mensagem');
  }


  /* =======================================================
     ESCOLHA DE REGIÃO
     ======================================================= */

  async function escolherRegiao(
    novaRegiao,
  ) {
    if (digitando) return;

    setRegiao(novaRegiao);

    adicionarMensagem(
      'usuario',
      novaRegiao,
    );

    setEtapa('aguardando');
    setDigitando(true);

    await esperar(500);

    setDigitando(false);

    adicionarMensagem(
      'bot',
      interesse === 'celula'
        ? 'Perfeito! 💛 Já sabemos por onde começar. Vamos continuar pelo WhatsApp?'
        : 'Perfeito! 🙌 Já sabemos por onde começar. Vamos continuar pelo WhatsApp?',
    );

    setEtapa('final');
  }


  /* =======================================================
     ENVIO DA MENSAGEM LIVRE
     ======================================================= */

  async function enviarMensagemLivre(event) {
    event.preventDefault();

    if (digitando) return;

    const mensagem = textoMensagem.trim();

    if (!mensagem) {
      setErroMensagem(
        'Escreva uma mensagem antes de continuar.',
      );

      textareaRef.current?.focus();

      return;
    }

    setErroMensagem('');
    setMensagemLivre(mensagem);
    setTextoMensagem('');

    adicionarMensagem(
      'usuario',
      mensagem,
      'mensagem-livre',
    );

    setEtapa('aguardando');
    setDigitando(true);

    await esperar(550);

    /*
     * Aqui entra nosso motor de regras.
     */
    const resultado = detectarIntencao(
      mensagem,
    );

    setDigitando(false);

    /*
     * Encontramos uma intenção conhecida.
     *
     * NÃO alteramos o fluxo automaticamente.
     * Primeiro pedimos confirmação.
     */
    if (resultado.encontrada) {
      setIntencaoDetectada(resultado);

      adicionarMensagem(
        'bot',
        obterPerguntaConfirmacao(
          resultado.intencao,
        ),
        'detector-confirmacao',
      );

      setEtapa(
        'confirmacao-intencao',
      );

      return;
    }

    /*
     * Nenhuma intenção confiável encontrada.
     * Segue como conversa normal.
     */
    adicionarMensagem(
      'bot',
      'Entendi 💛 Sua mensagem está pronta. Se estiver tudo certo, podemos continuar pelo WhatsApp.',
      'confirmacao-mensagem',
    );

    setEtapa('confirmacao');
  }


  /* =======================================================
     CONFIRMOU A INTENÇÃO DETECTADA
     ======================================================= */

  async function confirmarIntencao() {
    if (
      !intencaoDetectada
      || digitando
    ) {
      return;
    }

    const tipo = intencaoDetectada.intencao;

    const opcoes = obterOpcoesConfirmacao(
      tipo,
    );

    adicionarMensagem(
      'usuario',
      opcoes.confirmar,
      'detector-resposta',
    );

    /*
     * A partir daqui o fluxo passa oficialmente
     * a ser Célula ou Cenáculo.
     */
    setInteresse(tipo);

    await responderComRegiao(tipo);
  }


  /* =======================================================
     NEGOU A INTENÇÃO DETECTADA
     ======================================================= */

  async function negarIntencao() {
    if (
      !intencaoDetectada
      || digitando
    ) {
      return;
    }

    const opcoes = obterOpcoesConfirmacao(
      intencaoDetectada.intencao,
    );

    adicionarMensagem(
      'usuario',
      opcoes.negar,
      'detector-resposta',
    );

    /*
     * Continua sendo uma conversa comum
     * com alguém da Missão.
     */
    setInteresse('missao');
    setIntencaoDetectada(null);

    setEtapa('aguardando');
    setDigitando(true);

    await esperar(500);

    setDigitando(false);

    adicionarMensagem(
      'bot',
      'Sem problema 💛 Vamos continuar com a sua mensagem do jeito que você escreveu.',
      'confirmacao-mensagem',
    );

    setEtapa('confirmacao');
  }


  /* =======================================================
     EDITAR MENSAGEM
     ======================================================= */

  function editarMensagemLivre() {
    /*
     * Voltamos ao ponto imediatamente anterior
     * ao envio da mensagem livre.
     */
    setMensagens((atuais) => (
      atuais.filter((mensagem) => (
        mensagem.id !== 'mensagem-livre'
        && mensagem.id !== 'detector-confirmacao'
        && mensagem.id !== 'detector-resposta'
        && mensagem.id !== 'confirmacao-mensagem'
      ))
    ));

    setInteresse('missao');
    setIntencaoDetectada(null);

    setTextoMensagem(
      mensagemLivre,
    );

    setErroMensagem('');
    setEtapa('mensagem');
  }


  /* =======================================================
     TEXTO DO WHATSAPP
     ======================================================= */

  function obterMensagemWhatsApp() {
    if (interesse === 'celula') {
      const partes = [
        'Oi! Vim pelo site da Missão SP 👋',
        '',
        'Quero encontrar uma célula.',
        `Minha região é: ${regiao}.`,
      ];

      /*
       * Se a pessoa chegou aqui escrevendo livremente,
       * preservamos a mensagem original.
       */
      if (mensagemLivre) {
        partes.push(
          '',
          'Mensagem que escrevi no site:',
          mensagemLivre,
        );
      }

      return partes.join('\n');
    }

    if (interesse === 'cenaculo') {
      const partes = [
        'Oi! Vim pelo site da Missão SP 👋',
        '',
        'Quero conhecer um cenáculo.',
        `Minha região é: ${regiao}.`,
      ];

      if (mensagemLivre) {
        partes.push(
          '',
          'Mensagem que escrevi no site:',
          mensagemLivre,
        );
      }

      return partes.join('\n');
    }

    return [
      'Oi! Vim pelo site da Missão SP 👋',
      '',
      'Gostaria de conversar com alguém da missão.',
      '',
      'Minha mensagem:',
      mensagemLivre,
    ].join('\n');
  }


  function obterLinkWhatsApp() {
    const mensagem = encodeURIComponent(
      obterMensagemWhatsApp(),
    );

    return (
      `https://wa.me/${WHATSAPP}`
      + `?text=${mensagem}`
    );
  }


  /* =======================================================
     RECOMEÇAR
     ======================================================= */

  function reiniciarConversa() {
    setMensagens(
      MENSAGENS_INICIAIS,
    );

    setEtapa('inicio');
    setInteresse('');
    setRegiao('');
    setDigitando(false);

    setTextoMensagem('');
    setMensagemLivre('');
    setErroMensagem('');

    setIntencaoDetectada(null);
  }


  /* =======================================================
     RENDER
     ======================================================= */

  const opcoesIntencao = (
    intencaoDetectada
      ? obterOpcoesConfirmacao(
        intencaoDetectada.intencao,
      )
      : null
  );


  return (
    <section
      className="contato"
      id="contato"
      aria-labelledby="contato-titulo"
    >
      <div className="contato__conteudo container">

        {/* ===============================================
            FOTO PRINCIPAL
            =============================================== */}

        <div className="contato__foto">
          <img
            src="/imagens/contato-servico.jpg"
            alt="Pessoa servindo em uma ação da Colo de Deus"
            loading="lazy"
          />

          <div
            className="contato__foto-sombra"
            aria-hidden="true"
          />

          <div className="contato__foto-legenda">
            <span>
              06 // Fale com a gente
            </span>

            <strong>
              Aqui tem
              <br />
              lugar pra você.
            </strong>
          </div>
        </div>


        {/* ===============================================
            CHAT
            =============================================== */}

        <div className="contato__area-chat">

          <div className="contato__seo">
            <h2 id="contato-titulo">
              Fale com a Colo de Deus // Missão SP
            </h2>

            <p>
              Encontre uma célula, conheça um
              cenáculo ou converse com a Missão SP.
            </p>
          </div>


          <div className="chat">

            {/* CABEÇALHO */}

            <header className="chat__cabecalho">
              <div className="chat__avatar">
                <img
                  src="/imagens/contato-atendimento.jpg"
                  alt=""
                />
              </div>

              <div className="chat__identidade">
                <strong>
                  Missão SP
                </strong>

                <span>
                  Atendimento pelo WhatsApp
                </span>
              </div>
            </header>


            {/* CONVERSA */}

            <div
              className="chat__conversa"
              ref={conversaRef}
              aria-live="polite"
            >
              <div className="chat__data">
                Hoje
              </div>


              {mensagens.map((mensagem) => (
                <Mensagem
                  key={mensagem.id}
                  mensagem={mensagem}
                />
              ))}


              {/* DIGITANDO */}

              {digitando && (
                <div
                  className="chat__linha chat__linha--bot"
                  aria-label="Missão SP está respondendo"
                >
                  <div className="chat__balao chat__balao--digitando">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}


              {/* OPÇÕES INICIAIS */}

              {!digitando
                && etapa === 'inicio'
                && (
                  <div className="chat__respostas">
                    {OPCOES_INICIAIS.map(
                      (opcao) => (
                        <button
                          type="button"
                          className="chat__resposta"
                          key={opcao.id}
                          onClick={() => (
                            escolherInteresse(
                              opcao,
                            )
                          )}
                        >
                          <span>
                            {opcao.texto}
                          </span>

                          <span aria-hidden="true">
                            →
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                )}


              {/* REGIÕES */}

              {!digitando
                && etapa === 'regiao'
                && (
                  <div className="chat__regioes">
                    <p>
                      Escolha uma região
                    </p>

                    <div className="chat__chips">
                      {REGIOES.map((item) => (
                        <button
                          type="button"
                          className="chat__chip"
                          key={item}
                          onClick={() => (
                            escolherRegiao(item)
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}


              {/* MENSAGEM LIVRE */}

              {!digitando
                && etapa === 'mensagem'
                && (
                  <form
                    className="chat__form-mensagem"
                    onSubmit={
                      enviarMensagemLivre
                    }
                  >
                    <label
                      className="chat__label-mensagem"
                      htmlFor="mensagem-missao"
                    >
                      Sua mensagem
                    </label>

                    <div className="chat__campo-mensagem">
                      <textarea
                        ref={textareaRef}
                        id="mensagem-missao"
                        value={textoMensagem}
                        maxLength={
                          LIMITE_MENSAGEM
                        }
                        rows="4"
                        placeholder="Escreva sua mensagem..."
                        onChange={(event) => {
                          setTextoMensagem(
                            event.target.value,
                          );

                          if (erroMensagem) {
                            setErroMensagem('');
                          }
                        }}
                      />

                      <button
                        type="submit"
                        className="chat__enviar-mensagem"
                        aria-label="Enviar mensagem no chat"
                      >
                        →
                      </button>
                    </div>

                    <div className="chat__mensagem-meta">
                      <span
                        className="chat__erro-mensagem"
                        role="alert"
                      >
                        {erroMensagem}
                      </span>

                      <span className="chat__contador">
                        {textoMensagem.length}
                        /
                        {LIMITE_MENSAGEM}
                      </span>
                    </div>
                  </form>
                )}


              {/* =========================================
                  CONFIRMAÇÃO DA INTENÇÃO DETECTADA
                  ========================================= */}

              {!digitando
                && etapa === 'confirmacao-intencao'
                && opcoesIntencao
                && (
                  <div className="chat__confirmar-intencao">

                    <button
                      type="button"
                      className="chat__resposta chat__resposta--confirmar"
                      onClick={
                        confirmarIntencao
                      }
                    >
                      <span>
                        {opcoesIntencao.confirmar}
                      </span>

                      <span aria-hidden="true">
                        →
                      </span>
                    </button>

                    <button
                      type="button"
                      className="chat__resposta chat__resposta--negar"
                      onClick={
                        negarIntencao
                      }
                    >
                      <span>
                        {opcoesIntencao.negar}
                      </span>
                    </button>

                  </div>
                )}


              {/* =========================================
                  CONFIRMAÇÃO DE CONVERSA NORMAL
                  ========================================= */}

              {!digitando
                && etapa === 'confirmacao'
                && (
                  <div className="chat__confirmacao">
                    <p>
                      Sua mensagem está pronta.
                    </p>

                    <button
                      type="button"
                      className="chat__editar"
                      onClick={
                        editarMensagemLivre
                      }
                    >
                      Editar mensagem
                    </button>

                    <a
                      className="chat__whatsapp"
                      href={
                        obterLinkWhatsApp()
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        Confirmar e ir para o WhatsApp
                      </span>

                      <span aria-hidden="true">
                        ↗
                      </span>
                    </a>

                    <p className="chat__aviso-whatsapp">
                      A mensagem será aberta no
                      WhatsApp para você confirmar
                      o envio.
                    </p>

                    <button
                      className="chat__reiniciar"
                      type="button"
                      onClick={
                        reiniciarConversa
                      }
                    >
                      Recomeçar conversa
                    </button>
                  </div>
                )}


              {/* FINAL CÉLULA / CENÁCULO */}

              {!digitando
                && etapa === 'final'
                && (
                  <div className="chat__final">
                    <a
                      className="chat__whatsapp"
                      href={
                        obterLinkWhatsApp()
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        Continuar no WhatsApp
                      </span>

                      <span aria-hidden="true">
                        ↗
                      </span>
                    </a>

                    <button
                      className="chat__reiniciar"
                      type="button"
                      onClick={
                        reiniciarConversa
                      }
                    >
                      Recomeçar conversa
                    </button>
                  </div>
                )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   MENSAGEM
   ========================================================= */

function Mensagem({ mensagem }) {
  const ehUsuario = (
    mensagem.autor === 'usuario'
  );

  return (
    <div
      className={
        ehUsuario
          ? 'chat__linha chat__linha--usuario'
          : 'chat__linha chat__linha--bot'
      }
    >
      <div
        className={
          ehUsuario
            ? 'chat__balao chat__balao--usuario'
            : 'chat__balao chat__balao--bot'
        }
      >
        <p>
          {mensagem.texto}
        </p>

        <span className="chat__horario">
          agora
        </span>
      </div>
    </div>
  );
}


export default Contato;