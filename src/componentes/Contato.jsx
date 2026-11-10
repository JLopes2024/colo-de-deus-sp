
import { useEffect, useRef, useState } from 'react';

import {
  detectarIntencao,
  normalizarTexto,
  obterPerguntaConfirmacao,
  obterOpcoesConfirmacao,
} from '../servicos/detectorIntencao.js';

import {
  REGIOES,
  obterLinkWhatsApp,
} from '../config/contatos.js';

import '../estilos/contato.css';

const LIMITE_MENSAGEM = 500;
const ATRASO_RESPOSTA = 420;

const MENSAGENS_INICIAIS = [
  {
    id: 'inicio-1',
    autor: 'bot',
    texto: 'Oi! Que bom ter você por aqui. 💛',
  },
  {
    id: 'inicio-2',
    autor: 'bot',
    texto: 'Como podemos te ajudar hoje?',
  },
];

const CAMINHOS = [
  {
    id: 'celula',
    titulo: 'Encontrar uma célula',
    detalhe: 'Quero participar de um grupo',
  },
  {
    id: 'cenaculo',
    titulo: 'Conhecer um cenáculo',
    detalhe: 'Quero receber uma visita',
  },
  {
    id: 'missao',
    titulo: 'Conversar com a missão',
    detalhe: 'Tenho outra pergunta',
  },
];

const RESPOSTAS_POSITIVAS =
  /^(sim|isso|isso mesmo|exatamente|exato|correto|confirmo|quero|pode ser|claro|com certeza)\b/;

const RESPOSTAS_NEGATIVAS =
  /^(nao|negativo|outra coisa|nada disso|nao e isso|errado)\b/;

function obterHorario() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function obterNomeInteresse(tipo) {
  if (tipo === 'celula') return 'uma célula';
  if (tipo === 'cenaculo') return 'um cenáculo';
  return 'a missão';
}

function identificarRegiao(texto) {
  const normalizado = normalizarTexto(texto).trim();

  if (!normalizado) return null;

  return (
    REGIOES.find((item) => {
      const nome = normalizarTexto(item.nome);

      return (
        normalizado === nome ||
        normalizado.includes(nome) ||
        (normalizado.length >= 5 && nome.includes(normalizado))
      );
    }) ?? null
  );
}

function Mensagem({ mensagem }) {
  const usuario = mensagem.autor === 'usuario';

  return (
    <div
      className={`chat__linha ${
        usuario ? 'chat__linha--usuario' : 'chat__linha--bot'
      }`}
    >
      <div
        className={`chat__balao ${
          usuario ? 'chat__balao--usuario' : 'chat__balao--bot'
        }`}
      >
        <p>{mensagem.texto}</p>

        {mensagem.horario && (
          <span className="chat__horario">
            {mensagem.horario}
          </span>
        )}
      </div>
    </div>
  );
}

function Contato() {
  const [mensagens, setMensagens] = useState(MENSAGENS_INICIAIS);
  const [etapa, setEtapa] = useState('inicio');
  const [interesse, setInteresse] = useState('');
  const [regiao, setRegiao] = useState('');
  const [texto, setTexto] = useState('');
  const [observacoes, setObservacoes] = useState([]);
  const [intencaoPendente, setIntencaoPendente] = useState(null);
  const [digitando, setDigitando] = useState(false);
  const [erro, setErro] = useState('');

  const conversaRef = useRef(null);
  const campoRef = useRef(null);
  const timerRef = useRef(null);
  const operacaoRef = useRef(0);
  const sequenciaRef = useRef(0);
  const bloqueadoRef = useRef(false);

  function adicionarMensagem(autor, mensagem) {
    sequenciaRef.current += 1;

    setMensagens((atuais) => [
      ...atuais,
      {
        id: `mensagem-${sequenciaRef.current}`,
        autor,
        texto: mensagem,
        horario: obterHorario(),
      },
    ]);
  }

  function cancelarResposta() {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;

    operacaoRef.current += 1;
    bloqueadoRef.current = false;

    setDigitando(false);
  }

  function responder(mensagem, proximaEtapa, atraso = ATRASO_RESPOSTA) {
    window.clearTimeout(timerRef.current);

    const operacao = ++operacaoRef.current;

    bloqueadoRef.current = true;
    setDigitando(true);
    setEtapa('aguardando');

    timerRef.current = window.setTimeout(() => {
      if (operacao !== operacaoRef.current) return;

      adicionarMensagem('bot', mensagem);
      bloqueadoRef.current = false;
      setDigitando(false);
      setEtapa(proximaEtapa);
      timerRef.current = null;
    }, atraso);
  }

  function reiniciarConversa() {
    cancelarResposta();

    setMensagens(MENSAGENS_INICIAIS);
    setEtapa('inicio');
    setInteresse('');
    setRegiao('');
    setTexto('');
    setObservacoes([]);
    setIntencaoPendente(null);
    setErro('');

    try {
      sessionStorage.removeItem('interesse-contato');
    } catch {
      // O chat funciona sem armazenamento.
    }
  }

  function escolherCaminho(tipo, rotulo, registrar = true) {
    if (bloqueadoRef.current) return;

    if (registrar) {
      adicionarMensagem('usuario', rotulo);
    }

    setInteresse(tipo);
    setRegiao('');
    setIntencaoPendente(null);
    setErro('');

    if (tipo === 'celula') {
      responder(
        'Que alegria! 💛 Vamos te ajudar a encontrar uma célula. Em qual região de São Paulo você está?',
        'regiao'
      );
      return;
    }

    if (tipo === 'cenaculo') {
      responder(
        'Vai ser um prazer ajudar! 🙌 Em qual região você gostaria de conhecer um cenáculo?',
        'regiao'
      );
      return;
    }

    responder(
      'Pode contar com a gente. 💛 Escreva sua dúvida aqui ou continue pelo WhatsApp.',
      'conversar'
    );
  }

  function escolherRegiao(nome, registrar = true) {
    if (bloqueadoRef.current) return;

    const valida = REGIOES.some((item) => item.nome === nome);

    if (!valida) return;

    if (registrar) {
      adicionarMensagem('usuario', nome);
    }

    setRegiao(nome);

    responder(
      'Perfeito! 💛 Preparei seu contato para o WhatsApp. Se quiser, você também pode acrescentar uma mensagem aqui.',
      'final'
    );
  }

  function confirmarIntencao(aceitou, registrar = true) {
    if (bloqueadoRef.current || !intencaoPendente) return;

    const tipo = intencaoPendente.intencao;
    const opcoes = obterOpcoesConfirmacao(tipo);

    if (registrar && opcoes) {
      adicionarMensagem(
        'usuario',
        aceitou ? opcoes.confirmar : opcoes.negar
      );
    }

    setIntencaoPendente(null);

    if (aceitou && ['celula', 'cenaculo'].includes(tipo)) {
      setInteresse(tipo);
      setRegiao('');

      responder(
        `Entendi! 💛 Vamos falar sobre ${obterNomeInteresse(tipo)}. Em qual região de São Paulo você está?`,
        'regiao'
      );
      return;
    }

    setInteresse('missao');
    setRegiao('');

    responder(
      aceitou
        ? 'Entendi! 💛 Você pode me contar mais ou continuar pelo WhatsApp.'
        : 'Sem problema! 💛 Pode me contar um pouco mais ou falar diretamente com a missão pelo WhatsApp.',
      'conversar'
    );
  }

  function registrarObservacao(mensagem) {
    setObservacoes((atuais) => [...atuais, mensagem]);
  }

  function interpretarMensagem(mensagem) {
    const normalizada = normalizarTexto(mensagem).trim();

    // Interpreta respostas a uma pergunta de confirmação.
    if (etapa === 'confirmar' && intencaoPendente) {
      if (RESPOSTAS_POSITIVAS.test(normalizada)) {
        confirmarIntencao(true, false);
        return;
      }

      if (RESPOSTAS_NEGATIVAS.test(normalizada)) {
        confirmarIntencao(false, false);
        return;
      }

      responder(
        'Só para confirmar: é sobre isso que você gostaria de conversar? Você pode responder sim ou não, ou usar as opções abaixo.',
        'confirmar'
      );
      return;
    }

    // Reconhece a região escrita em linguagem natural.
    if (etapa === 'regiao') {
      const encontrada = identificarRegiao(mensagem);

      if (encontrada) {
        escolherRegiao(encontrada.nome, false);
      } else {
        responder(
          'Não consegui identificar essa região. 💛 Selecione uma das opções abaixo para continuarmos.',
          'regiao'
        );
      }

      return;
    }

    // Em conversa já encaminhada, guarda observações
    // para compor a mensagem final do WhatsApp.
    if (etapa === 'final') {
      registrarObservacao(mensagem);

      responder(
        'Anotei sua mensagem. 💛 Ela será incluída no texto que você poderá enviar pelo WhatsApp.',
        'final'
      );
      return;
    }

    // Identificação local, sem uso de IA externa.
    const resultado = detectarIntencao(mensagem);

    if (
      resultado?.encontrada &&
      ['celula', 'cenaculo'].includes(resultado.intencao)
    ) {
      registrarObservacao(mensagem);
      setIntencaoPendente(resultado);

      responder(
        obterPerguntaConfirmacao(resultado.intencao),
        'confirmar'
      );
      return;
    }

    registrarObservacao(mensagem);
    setInteresse('missao');
    setIntencaoPendente(null);

    responder(
      'Entendi. 💛 Sua mensagem está preparada para nossa equipe. Você pode acrescentar mais informações ou continuar pelo WhatsApp.',
      'conversar'
    );
  }

  function enviarMensagem(evento) {
    evento.preventDefault();

    if (bloqueadoRef.current) return;

    const mensagem = texto.trim();

    if (!mensagem) {
      setErro('Escreva uma mensagem antes de enviar.');
      campoRef.current?.focus({ preventScroll: true });
      return;
    }

    adicionarMensagem('usuario', mensagem);
    setTexto('');
    setErro('');

    interpretarMensagem(mensagem);
  }

  function obterMensagemWhatsApp() {
    const partes = [
      'Oi! 💛',
      '',
      'Vim pelo site da *Colo de Deus | Missão SP*.',
    ];

    if (interesse === 'celula' || interesse === 'cenaculo') {
      const nome = interesse === 'celula' ? 'Célula' : 'Cenáculo';

      partes.push(
        '',
        `Gostaria de conhecer um(a) *${nome}* na minha região.`
      );

      if (regiao) {
        partes.push(`*Região:* ${regiao}`);
      }
    } else {
      partes.push(
        '',
        'Gostaria de conversar com alguém da missão.'
      );
    }

    if (observacoes.length > 0) {
      partes.push(
        '',
        '*Informações que escrevi no site:*',
        ...observacoes.map((item) => `• ${item}`)
      );
    }

    partes.push('', 'Obrigado!');

    return partes.join('\n');
  }

  function gerarLinkWhatsApp() {
    return obterLinkWhatsApp(
      regiao,
      obterMensagemWhatsApp(),
      interesse !== 'celula' && interesse !== 'cenaculo'
    );
  }

  // Integração com os botões das seções Células e Cenáculos.
  useEffect(() => {
    function verificarInteresse() {
      let salvo;

      try {
        salvo = sessionStorage.getItem('interesse-contato');

        if (!['celula', 'cenaculo'].includes(salvo)) {
          return;
        }

        sessionStorage.removeItem('interesse-contato');
      } catch {
        return;
      }

      cancelarResposta();

      setMensagens([
        {
          id: 'entrada-1',
          autor: 'bot',
          texto: 'Oi! Que bom ter você aqui. 💛',
        },
        {
          id: 'entrada-2',
          autor: 'usuario',
          texto:
            salvo === 'celula'
              ? 'Quero encontrar uma célula'
              : 'Quero conhecer um cenáculo',
        },
      ]);

      setInteresse(salvo);
      setRegiao('');
      setTexto('');
      setObservacoes([]);
      setIntencaoPendente(null);
      setErro('');

      responder(
        salvo === 'celula'
          ? 'Que bom! 💛 Em qual região você gostaria de encontrar uma célula?'
          : 'Que alegria! 🙌 Em qual região você gostaria de conhecer um cenáculo?',
        'regiao'
      );
    }

    verificarInteresse();

    window.addEventListener('hashchange', verificarInteresse);
    window.addEventListener('interesse-contato', verificarInteresse);

    return () => {
      window.removeEventListener('hashchange', verificarInteresse);
      window.removeEventListener('interesse-contato', verificarInteresse);

      window.clearTimeout(timerRef.current);
      operacaoRef.current += 1;
    };
  }, []);

  // Rolagem somente dentro da conversa.
  useEffect(() => {
    const conversa = conversaRef.current;

    if (!conversa) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const reduzido = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      conversa.scrollTo({
        top: conversa.scrollHeight,
        behavior: reduzido ? 'auto' : 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mensagens, etapa, digitando]);

  const disponivel = !digitando && etapa !== 'aguardando';

  const opcoesConfirmacao = intencaoPendente
    ? obterOpcoesConfirmacao(intencaoPendente.intencao)
    : null;

  const exibirCaminhos =
    disponivel && (etapa === 'inicio' || etapa === 'conversar');

  const exibirWhatsApp =
    disponivel && (etapa === 'final' || etapa === 'conversar');

  return (
    <section
      className="contato"
      id="contato"
      aria-labelledby="contato-titulo"
    >
      <div className="contato__conteudo container">
        {/* FOTO */}

        <div className="contato__foto">
          <img
            src="/imagens/contato-servico.webp"
            alt="Pessoa servindo em uma ação da Colo de Deus"
            loading="lazy"
            decoding="async"
          />

          <div
            className="contato__foto-sombra"
            aria-hidden="true"
          />

          <div className="contato__foto-legenda">
            <span>// Fale com a gente</span>

            <strong>
              Aqui tem
              <br />
              lugar pra você.
            </strong>
          </div>
        </div>

        {/* CHAT */}

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
                  src="/imagens/contato-atendimento.webp"
                  alt=""
                  decoding="async"
                />
              </div>

              <div className="chat__identidade">
                <strong>Missão SP</strong>
                <span className="chat__status">
                  Atendimento via WhatsApp
                </span>
              </div>

              <button
                type="button"
                className="chat__reiniciar"
                onClick={reiniciarConversa}
                title="Recomeçar conversa"
                aria-label="Recomeçar conversa"
              >
                ↻
              </button>
            </header>

            <div
              className="chat__conversa"
              ref={conversaRef}
              aria-label="Conversa com a Missão SP"
            >
              <div className="chat__data">
                Conversa no site
              </div>

              <div
                className="chat__mensagens"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Mensagens da conversa"
              >
                {mensagens.map((mensagem) => (
                  <Mensagem
                    key={mensagem.id}
                    mensagem={mensagem}
                  />
                ))}

                {digitando && (
                  <div
                    className="chat__linha chat__linha--bot"
                    role="status"
                    aria-label="Preparando resposta"
                  >
                    <div className="chat__balao chat__balao--digitando">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>

              {exibirCaminhos && (
                <div className="chat__opcoes">
                  {CAMINHOS.map((caminho) => (
                    <button
                      key={caminho.id}
                      type="button"
                      className="chat__opcao"
                      onClick={() =>
                        escolherCaminho(
                          caminho.id,
                          caminho.titulo
                        )
                      }
                    >
                      <span className="chat__opcao-conteudo">
                        <strong>{caminho.titulo}</strong>
                        <small>{caminho.detalhe}</small>
                      </span>

                      <span
                        className="chat__opcao-seta"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {disponivel && etapa === 'regiao' && (
                <div className="chat__regioes">
                  <p className="chat__auxiliar">
                    Selecione sua região
                  </p>

                  <div className="chat__chips">
                    {REGIOES.map((item) => (
                      <button
                        key={item.nome}
                        type="button"
                        className="chat__chip"
                        onClick={() =>
                          escolherRegiao(item.nome)
                        }
                      >
                        {item.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {disponivel &&
                etapa === 'confirmar' &&
                opcoesConfirmacao && (
                  <div className="chat__confirmar-intencao">
                    <button
                      type="button"
                      className="chat__resposta chat__resposta--confirmar"
                      onClick={() =>
                        confirmarIntencao(true)
                      }
                    >
                      <span>
                        {opcoesConfirmacao.confirmar}
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>

                    <button
                      type="button"
                      className="chat__resposta chat__resposta--negar"
                      onClick={() =>
                        confirmarIntencao(false)
                      }
                    >
                      {opcoesConfirmacao.negar}
                    </button>
                  </div>
                )}

              {exibirWhatsApp && (
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

                  <p>
                    Você poderá revisar e enviar sua
                    mensagem no WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* CAMPO FIXO NO RODAPÉ DO CHAT */}

            <form
              className="chat__rodape"
              onSubmit={enviarMensagem}
            >
              <label
                className="chat__sr-only"
                htmlFor="mensagem-missao"
              >
                Sua mensagem
              </label>

              <div className="chat__campo-mensagem">
                <textarea
                  ref={campoRef}
                  id="mensagem-missao"
                  value={texto}
                  maxLength={LIMITE_MENSAGEM}
                  rows={1}
                  disabled={!disponivel}
                  placeholder="Escreva sua mensagem..."
                  aria-invalid={Boolean(erro)}
                  aria-describedby="chat-erro-mensagem"
                  onChange={(evento) => {
                    setTexto(evento.target.value);
                    setErro('');
                  }}
                  onKeyDown={(evento) => {
                    if (
                      evento.key === 'Enter' &&
                      !evento.shiftKey &&
                      !evento.nativeEvent.isComposing
                    ) {
                      evento.preventDefault();
                      evento.currentTarget.form?.requestSubmit();
                    }
                  }}
                />

                <button
                  type="submit"
                  className="chat__enviar-mensagem"
                  disabled={!disponivel || !texto.trim()}
                  aria-label="Enviar mensagem no chat"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12 14-7-4 14-3-6-7-1Z" />
                    <path d="m12 13 7-8" />
                  </svg>
                </button>
              </div>

              <div className="chat__rodape-info">
                <span
                  id="chat-erro-mensagem"
                  role="alert"
                >
                  {erro}
                </span>

                <span>
                  {texto.length > 400
                    ? `${texto.length}/${LIMITE_MENSAGEM}`
                    : 'Enter para enviar · Shift + Enter para nova linha'}
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contato;
