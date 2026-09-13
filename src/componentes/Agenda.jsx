import { agenda } from '../dados/agenda.js';

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

function Agenda() {
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  const eventos = agenda
    .filter((evento) => {
      const dataEvento = new Date(`${evento.data}T12:00:00`);

      return dataEvento >= hoje;
    })
    .sort(
      (eventoA, eventoB) =>
        new Date(eventoA.data) - new Date(eventoB.data),
    );

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
            <span>encontros.</span>
          </h2>
        </header>

        {eventos.length > 0 ? (
          <div className="agenda__lista">
            {eventos.map((evento) => {
              const data = formatarData(evento.data);

              const conteudoEvento = (
                <>
                  <time
                    className="agenda__data"
                    dateTime={evento.data}
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
                      {evento.titulo}
                    </h3>

                    <p className="agenda__local">
                      {evento.local}
                    </p>
                  </div>

                  <span
                    className="agenda__seta"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </>
              );

              if (!evento.link || evento.link === '#') {
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
                  href={evento.link}
                  key={evento.id}
                >
                  {conteudoEvento}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="agenda__vazia">
            <p>Novas datas em breve.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Agenda;