
import { useEffect, useRef, useState } from 'react';

import {
  detectarIntencao,
  obterOpcoesConfirmacao,
  obterPerguntaConfirmacao,
} from '../servicos/detectorIntencao.js';

import {
  REGIOES,
  obterLinkWhatsApp,
} from '../config/contatos.js';

import '../estilos/contato.css';

const LIMITE_MENSAGEM = 500;

const OPCOES_INICIAIS = [
  { id: 'celula', texto: 'Quero encontrar uma célula' },
  { id: 'cenaculo', texto: 'Quero conhecer um cenáculo' },
  { id: 'missao', texto: 'Quero falar com alguém da missão' },
];

const MENSAGENS_INICIAIS = [
  { id: 'inicio-1', autor: 'bot', texto: 'Oi! 👋' },
  {
    id: 'inicio-2',
    autor: 'bot',
    texto: 'Que bom ter você por aqui. Como a gente pode te ajudar?',
  },
];

const esperar = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

function Contato() {
  const [mensagens, setMensagens] = useState(MENSAGENS_INICIAIS);
  const [etapa, setEtapa] = useState('inicio');
  const [interesse, setInteresse] = useState('');
  const [regiao, setRegiao] = useState('');
  const [digitando, setDigitando] = useState(false);
  const [textoMensagem, setTextoMensagem] = useState('');
  const [mensagemLivre, setMensagemLivre] = useState('');
  const [erroMensagem, setErroMensagem] = useState('');
  const [intencaoDetectada, setIntencaoDetectada] = useState(null);

  const conversaRef = useRef(null);
  const textareaRef = useRef(null);
  const contadorIdRef = useRef(0);
  const operacaoRef = useRef(0);
  const bloqueadoRef = useRef(false);

  function adicionarMensagem(autor, texto, id) {
    contadorIdRef.current += 1;

    setMensagens((atuais) => [
      ...atuais,
      {
        id: id ?? `mensagem-${contadorIdRef.current}`,
        autor,
        texto,
      },
    ]);
  }

  async function iniciarEspera(ms = 500) {
    const operacao = ++operacaoRef.current;

    bloqueadoRef.current = true;
    setEtapa('aguardando');
    setDigitando(true);

    await esperar(ms);

    if (operacao !== operacaoRef.current) {
      return false;
    }

    bloqueadoRef.current = false;
    setDigitando(false);

    return true;
  }

  async function responderComRegiao(tipo) {
    const concluido = await iniciarEspera();

    if (!concluido) return;

    adicionarMensagem(
      'bot',
      tipo === 'celula'
        ? 'Que bom! 💛 Vamos te ajudar a encontrar uma célula perto de você. Em qual região você está?'
        : 'Bora! 🙌 Vamos te ajudar a encontrar um cenáculo. Em qual região você está?',
    );

    setEtapa('regiao');
  }

  // Rola apenas a área interna do chatbot.
  useEffect(() => {
    const conversa = conversaRef.current;

    if (!conversa) return undefined;

    const frame = window.requestAnimationFrame(() => {
      conversa.scrollTo({
        top: conversa.scrollHeight,
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mensagens, digitando, etapa]);

  // Foco no campo de mensagem, sem deslocar a página.
  useEffect(() => {
    if (etapa !== 'mensagem') return undefined;

    const timeout = window.setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true });
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [etapa]);

  // Recebe os interesses enviados pelos botões de Células e Cenáculos.
  useEffect(() => {
    function verificarInteresse() {
      let interesseSalvo;

      try {
        interesseSalvo = sessionStorage.getItem('interesse-contato');

        if (!['celula', 'cenaculo'].includes(interesseSalvo)) {
          return;
        }

        sessionStorage.removeItem('interesse-contato');
      } catch {
        return;
      }

      const texto =
        interesseSalvo === 'celula'
          ? 'Quero encontrar uma célula'
          : 'Quero conhecer um cenáculo';

      operacaoRef.current += 1;
      bloqueadoRef.current = false;

      setInteresse(interesseSalvo);
      setRegiao('');
      setMensagemLivre('');
      setIntencaoDetectada(null);

      setMensagens([
        {
          id: 'entrada-1',
          autor: 'bot',
          texto: 'Oi! 👋 Que bom ter você por aqui.',
        },
        {
          id: 'entrada-2',
          autor: 'usuario',
          texto,
        },
      ]);

      responderComRegiao(interesseSalvo);
    }

    verificarInteresse();

    window.addEventListener('hashchange', verificarInteresse);

    return () => {
      window.removeEventListener('hashchange', verificarInteresse);
      operacaoRef.current += 1;
    };
  }, []);

  async function escolherInteresse(opcao) {
    if (bloqueadoRef.current) return;

    setInteresse(opcao.id);
    adicionarMensagem('usuario', opcao.texto);

    if (opcao.id === 'celula' || opcao.id === 'cenaculo') {
      await responderComRegiao(opcao.id);
      return;
    }

    const concluido = await iniciarEspera();

    if (!concluido) return;

    adicionarMensagem(
      'bot',
      'Claro! 💛 Pode contar pra gente. O que você gostaria de falar?',
    );

    setEtapa('mensagem');
  }

  async function escolherRegiao(novaRegiao) {
    if (bloqueadoRef.current) return;

    if (!REGIOES.some((item) => item.nome === novaRegiao)) {
      return;
    }

    setRegiao(novaRegiao);
    adicionarMensagem('usuario', novaRegiao);

    const concluido = await iniciarEspera();

    if (!concluido) return;

    adicionarMensagem(
      'bot',
      interesse === 'celula'
        ? 'Perfeito! 💛 Já sabemos por onde começar. Vamos continuar pelo WhatsApp?'
        : 'Perfeito! 🙌 Já sabemos por onde começar. Vamos continuar pelo WhatsApp?',
    );

    setEtapa('final');
  }

  async function enviarMensagemLivre(evento) {
    evento.preventDefault();

    if (bloqueadoRef.current) return;

    const mensagem = textoMensagem.trim();

    if (!mensagem) {
      setErroMensagem('Escreva uma mensagem antes de continuar.');
      textareaRef.current?.focus({ preventScroll: true });
      return;
    }

    setErroMensagem('');
    setMensagemLivre(mensagem);
    setTextoMensagem('');

    adicionarMensagem('usuario', mensagem, 'mensagem-livre');

    const concluido = await iniciarEspera(550);

    if (!concluido) return;

    const resultado = detectarIntencao(mensagem);

    if (resultado.encontrada) {
      setIntencaoDetectada(resultado);

      adicionarMensagem(
        'bot',
        obterPerguntaConfirmacao(resultado.intencao),
        'detector-confirmacao',
      );

      setEtapa('confirmacao-intencao');
      return;
    }

    adicionarMensagem(
      'bot',
      'Entendi 💛 Sua mensagem está pronta. Se estiver tudo certo, podemos continuar pelo WhatsApp.',
      'confirmacao-mensagem',
    );

    setEtapa('confirmacao');
  }

  async function confirmarIntencao() {
    if (!intencaoDetectada || bloqueadoRef.current) return;

    const tipo = intencaoDetectada.intencao;
    const opcoes = obterOpcoesConfirmacao(tipo);

    adicionarMensagem('usuario', opcoes.confirmar, 'detector-resposta');
    setInteresse(tipo);

    await responderComRegiao(tipo);
  }

  async function negarIntencao() {
    if (!intencaoDetectada || bloqueadoRef.current) return;

    const opcoes = obterOpcoesConfirmacao(intencaoDetectada.intencao);

    adicionarMensagem('usuario', opcoes.negar, 'detector-resposta');

    setInteresse('missao');
    setIntencaoDetectada(null);

    const concluido = await iniciarEspera();

    if (!concluido) return;

    adicionarMensagem(
      'bot',
      'Sem problema 💛 Vamos continuar com a sua mensagem do jeito que você escreveu.',
      'confirmacao-mensagem',
    );

    setEtapa('confirmacao');
  }

  function editarMensagemLivre() {
    const idsRemovidos = new Set([
      'mensagem-livre',
      'detector-confirmacao',
      'detector-resposta',
      'confirmacao-mensagem',
    ]);

    setMensagens((atuais) =>
      atuais.filter((mensagem) => !idsRemovidos.has(mensagem.id)),
    );

    setInteresse('missao');
    setRegiao('');
    setIntencaoDetectada(null);
    setTextoMensagem(mensagemLivre);
    setErroMensagem('');
    setEtapa('mensagem');
  }

  
function obterMensagemWhatsApp() {
  const apresentacao = [
    'Hey!',
    '',
    'Vim pelo site da *Colo de Deus | Missão SP*.',
  ];

  if (interesse === 'celula' || interesse === 'cenaculo') {
    const tipo = interesse === 'celula' ? 'Célula' : 'Cenáculo';

    const partes = [
      ...apresentacao,
      '',
      `Gostaria de conhecer uma *${tipo}* na minha região.`,
      '',
      `*Região:* ${regiao}`,
      '',
      'Poderiam me passar mais informações?',
    ];

    if (mensagemLivre) {
      partes.push('', '*Minha mensagem:*', mensagemLivre);
    }

    partes.push('', 'Desde já, agradeço!');

    return partes.join('\n');
  }

  return [
    ...apresentacao,
    '',
    'Gostaria de conversar com alguém da missão.',
    '',
    '*Minha mensagem:*',
    mensagemLivre,
    '',
    'Desde já, agradeço!',
  ].join('\n');
}


  // Os números são definidos exclusivamente em config/contatos.js.
  function gerarLinkWhatsApp() {
    return obterLinkWhatsApp(
      regiao,
      obterMensagemWhatsApp(),
      interesse === 'missao',
    );
  }

  function reiniciarConversa() {
    operacaoRef.current += 1;
    bloqueadoRef.current = false;

    setMensagens(MENSAGENS_INICIAIS);
    setEtapa('inicio');
    setInteresse('');
    setRegiao('');
    setDigitando(false);
    setTextoMensagem('');
    setMensagemLivre('');
    setErroMensagem('');
    setIntencaoDetectada(null);

    window.requestAnimationFrame(() => {
      conversaRef.current?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  const opcoesIntencao = intencaoDetectada
    ? obterOpcoesConfirmacao(intencaoDetectada.intencao)
    : null;

  return (
    <section
      className="contato"
      id="contato"
      aria-labelledby="contato-titulo"
    >
      <div className="contato__conteudo container">
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
            <span>06 // Fale com a gente</span>

            <strong>
              Aqui tem
              <br />
              lugar pra você.
            </strong>
          </div>
        </div>

        <div className="contato__area-chat">
          <div className="contato__seo">
            <h2 id="contato-titulo">
              Fale com a Colo de Deus // Missão SP
            </h2>

            <p>
              Encontre uma célula, conheça um cenáculo
              ou converse com a Missão SP.
            </p>
          </div>

          <div className="chat">
            <header className="chat__cabecalho">
              <div className="chat__avatar">
                <img
                  src="/imagens/contato-atendimento.jpg"
                  alt=""
                />
              </div>

              <div className="chat__identidade">
                <strong>Missão SP</strong>
                <span className="chat__status">Online</span>
              </div>
            </header>

            <div
              className="chat__conversa"
              ref={conversaRef}
              aria-live="polite"
            >
              <div className="chat__data">Hoje</div>

              {mensagens.map((mensagem) => (
                <Mensagem
                  key={mensagem.id}
                  mensagem={mensagem}
                />
              ))}

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

              {!digitando && etapa === 'inicio' && (
                <div className="chat__respostas">
                  {OPCOES_INICIAIS.map((opcao) => (
                    <button
                      key={opcao.id}
                      type="button"
                      className="chat__resposta"
                      onClick={() => escolherInteresse(opcao)}
                    >
                      <span>{opcao.texto}</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )}

              {!digitando && etapa === 'regiao' && (
                <div className="chat__regioes">
                  <p>Escolha uma região</p>

                  <div className="chat__chips">
                    {REGIOES.map((item) => (
                      <button
                        key={item.nome}
                        type="button"
                        className="chat__chip"
                        onClick={() => escolherRegiao(item.nome)}
                      >
                        {item.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!digitando && etapa === 'mensagem' && (
                <form
                  className="chat__form-mensagem"
                  onSubmit={enviarMensagemLivre}
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
                      maxLength={LIMITE_MENSAGEM}
                      rows={4}
                      placeholder="Escreva sua mensagem..."
                      onChange={(evento) => {
                        setTextoMensagem(evento.target.value);

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
                      {textoMensagem.length}/{LIMITE_MENSAGEM}
                    </span>
                  </div>
                </form>
              )}

              {!digitando &&
                etapa === 'confirmacao-intencao' &&
                opcoesIntencao && (
                  <div className="chat__confirmar-intencao">
                    <button
                      type="button"
                      className="chat__resposta chat__resposta--confirmar"
                      onClick={confirmarIntencao}
                    >
                      <span>{opcoesIntencao.confirmar}</span>
                      <span aria-hidden="true">→</span>
                    </button>

                    <button
                      type="button"
                      className="chat__resposta chat__resposta--negar"
                      onClick={negarIntencao}
                    >
                      <span>{opcoesIntencao.negar}</span>
                    </button>
                  </div>
                )}

              {!digitando && etapa === 'confirmacao' && (
                <div className="chat__confirmacao">
                  <p>Sua mensagem está pronta.</p>

                  <button
                    type="button"
                    className="chat__editar"
                    onClick={editarMensagemLivre}
                  >
                    Editar mensagem
                  </button>

                  <a
                    className="chat__whatsapp"
                    href={gerarLinkWhatsApp()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      Confirmar e ir para o WhatsApp
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>

                  <p className="chat__aviso-whatsapp">
                    A mensagem será aberta no WhatsApp
                    para você confirmar o envio.
                  </p>

                  <button
                    type="button"
                    className="chat__reiniciar"
                    onClick={reiniciarConversa}
                  >
                    Recomeçar conversa
                  </button>
                </div>
              )}

              {!digitando && etapa === 'final' && (
                <div className="chat__final">
                  <a
                    className="chat__whatsapp"
                    href={gerarLinkWhatsApp()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Continuar no WhatsApp</span>
                    <span aria-hidden="true">↗</span>
                  </a>

                  <button
                    type="button"
                    className="chat__reiniciar"
                    onClick={reiniciarConversa}
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

function Mensagem({ mensagem }) {
  const ehUsuario = mensagem.autor === 'usuario';

  return (
    <div
      className={`chat__linha ${
        ehUsuario ? 'chat__linha--usuario' : 'chat__linha--bot'
      }`}
    >
      <div
        className={`chat__balao ${
          ehUsuario ? 'chat__balao--usuario' : 'chat__balao--bot'
        }`}
      >
        <p>{mensagem.texto}</p>
        <span className="chat__horario">agora</span>
      </div>
    </div>
  );
}

export default Contato;
