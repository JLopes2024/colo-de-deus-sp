
import { useEffect, useState } from 'react';

import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../servicos/firebase.js';

import '../estilos/agenda.css';

// Formata a data sem converter para outro fuso horário.
function formatarData(data) {
  const dataEvento = new Date(`${data}T12:00:00`);

  return {
    dia: new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
    }).format(dataEvento),
    mes: new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
    })
      .format(dataEvento)
      .replace('.', '')
      .toUpperCase(),
    ano: data.slice(0, 4),
  };
}

function obterDataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarEventos() {
      setCarregando(true);
      setErro('');

      try {
        const hoje = obterDataHoje();
        const referencia = collection(db, 'eventos');

        // Eventos futuros, inclusive os de apenas um dia.
        const consultaFuturos = query(
          referencia,
          where('data_evento', '>=', hoje),
          orderBy('data_evento', 'asc'),
        );

        // Eventos que começaram antes de hoje,
        // mas ainda não terminaram.
        const consultaEmAndamento = query(
          referencia,
          where('data_fim_evento', '>=', hoje),
          orderBy('data_fim_evento', 'asc'),
        );

        const [futuros, emAndamento] = await Promise.all([
          getDocs(consultaFuturos),
          getDocs(consultaEmAndamento),
        ]);

        if (!componenteAtivo) {
          return;
        }

        // Remove duplicatas das duas consultas.
        const eventosPorId = new Map();

        for (const documento of [
          ...futuros.docs,
          ...emAndamento.docs,
        ]) {
          eventosPorId.set(documento.id, {
            id: documento.id,
            ...documento.data(),
          });
        }

        const eventosCarregados = Array.from(
          eventosPorId.values(),
        )
          .filter((evento) => (
            (evento.data_fim_evento || evento.data_evento) >= hoje
          ))
          .sort((a, b) => (
            a.data_evento.localeCompare(b.data_evento)
          ));

        setEventos(eventosCarregados);
      } catch (error) {
        if (!componenteAtivo) {
          return;
        }

        console.error('Erro ao carregar agenda:', error);
        setErro('Não foi possível carregar a agenda agora.');
        setEventos([]);
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    carregarEventos();

    return () => {
      componenteAtivo = false;
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
            05 // Agenda
          </p>

          <h2
            className="agenda__titulo"
            id="agenda-titulo"
          >
            Próximos
            <span>encontros</span>
          </h2>

          <p className="agenda__descricao">
            Momentos para viver a fé,
            encontrar pessoas e experimentar
            a missão.
          </p>
        </header>

        {carregando && (
          <div className="agenda__vazia" role="status">
            <p>Carregando agenda...</p>
          </div>
        )}

        {!carregando && erro && (
          <div className="agenda__vazia" role="alert">
            <p>{erro}</p>
          </div>
        )}

        {!carregando && !erro && eventos.length > 0 && (
          <div className="agenda__lista">
            {eventos.map((evento) => {
              const inicio = formatarData(evento.data_evento);

              const temPeriodo = Boolean(
                evento.data_fim_evento
                && evento.data_fim_evento !== evento.data_evento,
              );

              const fim = temPeriodo
                ? formatarData(evento.data_fim_evento)
                : null;

              const conteudoEvento = (
                <>
                  <time
                    className="agenda__data"
                    dateTime={evento.data_evento}
                    aria-label={
                      temPeriodo
                        ? `De ${evento.data_evento} até ${evento.data_fim_evento}`
                        : `Em ${evento.data_evento}`
                    }
                  >
                    <span className="agenda__dia">
                      {inicio.dia}
                    </span>

                    <span className="agenda__mes">
                      {inicio.mes}
                    </span>

                    {fim && (
                      <span className="agenda__periodo">
                        ATÉ {fim.dia} {fim.mes}
                        {fim.ano !== inicio.ano
                          ? ` ${fim.ano}`
                          : ''}
                      </span>
                    )}
                  </time>

                  <div className="agenda__informacoes">
                    <h3 className="agenda__nome">
                      {evento.nome_evento}
                    </h3>

                    <p className="agenda__local">
                      {evento.cidade_evento}
                      {' // '}
                      {evento.estado_evento}
                    </p>

                    {evento.link_ingresso && (
                      <span className="agenda__chamada">
                        Ver detalhes
                        <span aria-hidden="true">↗</span>
                      </span>
                    )}
                  </div>

                  {evento.link_ingresso && (
                    <span
                      className="agenda__seta"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  )}
                </>
              );

              if (!evento.link_ingresso) {
                return (
                  <div
                    className="agenda__evento agenda__evento--sem-link"
                    key={evento.id}
                  >
                    {conteudoEvento}
                  </div>
                );
              }

              return (
                <a
                  className="agenda__evento agenda__evento--link"
                  href={evento.link_ingresso}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={evento.id}
                  aria-label={`Ver informações ou ingressos de ${evento.nome_evento} (abre em nova aba)`}
                >
                  {conteudoEvento}
                </a>
              );
            })}
          </div>
        )}

        {!carregando && !erro && eventos.length === 0 && (
          <div className="agenda__vazia">
            <p>Novas datas em breve.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Agenda;
