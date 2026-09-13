import { baluartes } from '../dados/baluartes.js';

import '../estilos/baluartes.css';

function Baluartes() {
  return (
    <section
      className="baluartes"
      aria-labelledby="baluartes-titulo"
    >
      <div className="baluartes__cabecalho container">
        <p className="baluartes__indice">
          00 // Nossos baluartes
        </p>

        <h2
          className="baluartes__titulo"
          id="baluartes-titulo"
        >
          Nossos
          <span>baluartes</span>
        </h2>
      </div>

      <div className="baluartes__faixa">
        {baluartes.map((baluarte) => (
          <a
            className="baluartes__item"
            href={baluarte.video}
            target="_blank"
            rel="noreferrer"
            key={baluarte.id}
            aria-label={`Assistir vídeo sobre ${baluarte.nome} no YouTube`}
          >
            <div className="baluartes__imagem">
              <img
                src={baluarte.imagem}
                alt={baluarte.nome}
              />
            </div>

            <div className="baluartes__rodape">
              <p className="baluartes__nome">
                {baluarte.nome}
              </p>

              <span className="baluartes__assistir">
                Assistir
                <span aria-hidden="true">
                  ↗
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default Baluartes;