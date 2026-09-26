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

        /*
         * Busca somente eventos de hoje em diante.
         * Assim o evento continua visível durante
         * todo o dia em que acontece.
         */
        const consulta = query(
          collection(db, 'eventos'),
          where('data_evento', '>=', hoje),
          orderBy('data_evento', 'asc'),
        );

        const resultado = await getDocs(consulta);

        if (!componenteAtivo) return;

        const eventosCarregados = resultado.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setEventos(eventosCarregados);
      } catch (error) {
        if (!componenteAtivo) return;

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
        </header>

        {carregando && (
          <div className="agenda__vazia">
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
              const data = formatarData(evento.data_evento);

              const conteudoEvento = (
                <>
                  <time
                    className="agenda__data"
                    dateTime={evento.data_evento}
                  >
                    <span className="agenda__dia">
                      {data.dia}
                    </span>

                    <span className="agenda__mes">
                      {data.mes}
                    </span>
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
                  </div>

                  {evento.link_ingresso && (
                    <span
                      className="agenda__seta"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </>
              );

              /*
               * Sem ingresso: mantém o evento como bloco normal.
               * Com ingresso: o card inteiro vira link.
               */
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
                  className="agenda__evento"
                  href={evento.link_ingresso}
                  target="_blank"
                  rel="noreferrer"
                  key={evento.id}
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