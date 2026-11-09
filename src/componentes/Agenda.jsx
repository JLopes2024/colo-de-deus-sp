
import { useEffect, useRef, useState } from 'react';

import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../servicos/firebase.js';
import '../estilos/agenda.css';

const FUSO_AGENDA = 'America/Sao_Paulo';

const FORMATADOR_MES = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  timeZone: 'UTC',
});

const FORMATADOR_COMPLETO = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const FORMATADOR_HOJE = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: FUSO_AGENDA,
});

function obterDataHoje() {
  const partes = FORMATADOR_HOJE.formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map(({ type, value }) => [type, value])
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

function dataValida(valor) {
  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const [ano, mes, dia] = valor.split('-').map(Number);

  const data = new Date(Date.UTC(ano, mes - 1, dia, 12));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

function criarData(valor) {
  const [ano, mes, dia] = valor.split('-').map(Number);

  return new Date(Date.UTC(ano, mes - 1, dia, 12));
}

function formatarData(valor) {
  const data = criarData(valor);

  return {
    dia: String(data.getUTCDate()).padStart(2, '0'),
    mes: FORMATADOR_MES
      .format(data)
      .replace('.', '')
      .toUpperCase(),
    ano: String(data.getUTCFullYear()),
    completa: FORMATADOR_COMPLETO.format(data),
  };
}

function validarLink(valor) {
  if (typeof valor !== 'string' || !valor.trim()) {
    return '';
  }

  try {
    const url = new URL(valor.trim());

    if (
      url.protocol !== 'https:' &&
      url.protocol !== 'http:'
    ) {
      return '';
    }

    return url.href;
  } catch {
    return '';
  }
}

function prepararEvento(documento) {
  const dados = documento.data();

  if (
    !dataValida(dados.data_evento) ||
    typeof dados.nome_evento !== 'string' ||
    !dados.nome_evento.trim()
  ) {
    return null;
  }

  const fimValido = dataValida(dados.data_fim_evento)
    ? dados.data_fim_evento
    : '';

  const dataFim =
    fimValido && fimValido >= dados.data_evento
      ? fimValido
      : dados.data_evento;

  return {
    id: documento.id,
    nome: dados.nome_evento.trim(),
    dataInicio: dados.data_evento,
    dataFim,
    cidade:
      typeof dados.cidade_evento === 'string'
        ? dados.cidade_evento.trim()
        : '',
    estado:
      typeof dados.estado_evento === 'string'
        ? dados.estado_evento.trim()
        : '',
    link: validarLink(dados.link_ingresso),
  };
}

function obterLocal(evento) {
  return [evento.cidade, evento.estado]
    .filter(Boolean)
    .join(' // ');
}

function EventoAgenda({ evento }) {
  const inicio = formatarData(evento.dataInicio);
  const fim = formatarData(evento.dataFim);

  const temPeriodo = evento.dataFim !== evento.dataInicio;

  const descricaoData = temPeriodo
    ? `De ${inicio.completa} até ${fim.completa}`
    : inicio.completa;

  const conteudo = (
    <>
      <time
        className="agenda__data"
        dateTime={evento.dataInicio}
        aria-label={descricaoData}
      >
        <span className="agenda__dia" aria-hidden="true">
          {inicio.dia}
        </span>

        <span className="agenda__mes" aria-hidden="true">
          {inicio.mes}
        </span>

        {temPeriodo && (
          <span className="agenda__periodo" aria-hidden="true">
            ATÉ {fim.dia} {fim.mes}
            {fim.ano !== inicio.ano ? ` ${fim.ano}` : ''}
          </span>
        )}
      </time>

      <div className="agenda__informacoes">
        <h3 className="agenda__nome">
          {evento.nome}
        </h3>

        {obterLocal(evento) && (
          <p className="agenda__local">
            {obterLocal(evento)}
          </p>
        )}

        {evento.link && (
          <span className="agenda__chamada">
            Ver detalhes
            <span aria-hidden="true">↗</span>
          </span>
        )}
      </div>

      {evento.link && (
        <span
          className="agenda__seta"
          aria-hidden="true"
        >
          ↗
        </span>
      )}
    </>
  );

  if (!evento.link) {
    return (
      <article className="agenda__evento agenda__evento--sem-link">
        {conteudo}
      </article>
    );
  }

  return (
    <a
      className="agenda__evento agenda__evento--link"
      href={evento.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver detalhes de ${evento.nome}, ${descricaoData}. Abre em uma nova aba.`}
    >
      {conteudo}
    </a>
  );
}

function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  const ultimoDiaConsultadoRef = useRef('');

  useEffect(() => {
    let ativo = true;

    async function carregarEventos() {
      setCarregando(true);
      setErro('');

      const hoje = obterDataHoje();
      ultimoDiaConsultadoRef.current = hoje;

      try {
        const referencia = collection(db, 'eventos');

        // Eventos que começam hoje ou no futuro.
        const consultaFuturos = query(
          referencia,
          where('data_evento', '>=', hoje),
          orderBy('data_evento', 'asc')
        );

        // Eventos que começaram antes, mas ainda estão em andamento.
        const consultaEmAndamento = query(
          referencia,
          where('data_fim_evento', '>=', hoje),
          orderBy('data_fim_evento', 'asc')
        );

        const [futuros, emAndamento] = await Promise.all([
          getDocs(consultaFuturos),
          getDocs(consultaEmAndamento),
        ]);

        if (!ativo) return;

        const porId = new Map();

        for (const documento of [
          ...futuros.docs,
          ...emAndamento.docs,
        ]) {
          const evento = prepararEvento(documento);

          if (evento && evento.dataFim >= hoje) {
            porId.set(evento.id, evento);
          }
        }

        const ordenados = Array.from(porId.values())
          .sort((a, b) => {
            const comparacao =
              a.dataInicio.localeCompare(b.dataInicio);

            return comparacao || a.nome.localeCompare(b.nome, 'pt-BR');
          });

        setEventos(ordenados);
        setErro('');
      } catch (erroCarregamento) {
        if (!ativo) return;

        console.error(
          'Erro ao carregar agenda:',
          erroCarregamento
        );

        setEventos([]);
        setErro(
          'Não foi possível carregar os encontros agora.'
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarEventos();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  // Atualiza quando o visitante retorna à aba em um novo dia.
  useEffect(() => {
    function verificarMudancaDeDia() {
      if (
        document.visibilityState === 'visible' &&
        ultimoDiaConsultadoRef.current &&
        obterDataHoje() !== ultimoDiaConsultadoRef.current
      ) {
        setTentativa((anterior) => anterior + 1);
      }
    }

    document.addEventListener(
      'visibilitychange',
      verificarMudancaDeDia
    );

    window.addEventListener(
      'focus',
      verificarMudancaDeDia
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        verificarMudancaDeDia
      );

      window.removeEventListener(
        'focus',
        verificarMudancaDeDia
      );
    };
  }, []);

  return (
    <section
      className="agenda"
      id="agenda"
      aria-labelledby="agenda-titulo"
    >
      <div className="agenda__conteudo container">
        <header className="agenda__cabecalho">
          <p className="agenda__indice">
            // Agenda
          </p>

          <h2
            className="agenda__titulo"
            id="agenda-titulo"
          >
            Próximos
            <span>encontros</span>
          </h2>
        </header>

        <div className="agenda__resultados">
          {carregando && (
            <div
              className="agenda__vazia"
              role="status"
              aria-live="polite"
            >
              <p>Carregando agenda...</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="agenda__vazia" role="alert">
              <p>{erro}</p>

              <button
                type="button"
                className="agenda__tentar"
                onClick={() =>
                  setTentativa((anterior) => anterior + 1)
                }
              >
                Tentar novamente
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}

          {!carregando && !erro && eventos.length > 0 && (
            <div className="agenda__lista">
              {eventos.map((evento) => (
                <EventoAgenda
                  key={evento.id}
                  evento={evento}
                />
              ))}
            </div>
          )}

          {!carregando && !erro && eventos.length === 0 && (
            <div className="agenda__vazia">
              <p>Novas datas em breve.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Agenda;
