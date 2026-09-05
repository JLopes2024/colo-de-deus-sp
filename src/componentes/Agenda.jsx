import { useState } from 'react';

import { eventos } from '../dados/agenda.js';

import '../estilos/agenda.css';

function Agenda() {
  const [eventoAtivo, setEventoAtivo] = useState(null);

  const eventoSelecionado = eventos.find(
    (evento) => evento.id === eventoAtivo,
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
            05 // Acontece em SP
          </p>

          <h2
            className="agenda__titulo"
            id="agenda-titulo"
          >
            Próximos
            <span>eventos</span>
          </h2>
        </header>

        <div className="agenda__corpo">
          <div className="agenda__lista">
            {eventos.map((evento) => (
              <a
                className="agenda__evento"
                href={evento.link}
                key={evento.id}
                onMouseEnter={() => setEventoAtivo(evento.id)}
                onMouseLeave={() => setEventoAtivo(null)}
                onFocus={() => setEventoAtivo(evento.id)}
                onBlur={() => setEventoAtivo(null)}
              >
                <span className="agenda__data">
                  {evento.data}
                </span>

                <span className="agenda__nome">
                  {evento.titulo}
                </span>

                <span className="agenda__local">
                  {evento.local}
                </span>

                <span
                  className="agenda__seta"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            ))}
          </div>

          <div
            className={`agenda__preview ${
              eventoSelecionado
                ? 'agenda__preview--visivel'
                : ''
            }`}
            aria-hidden="true"
          >
            {eventoSelecionado && (
              <img
                src={eventoSelecionado.imagem}
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Agenda;