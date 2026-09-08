{/*
Coloque em cada baluarte, um link para o vídeo do youtube que temos no nosso site da sede
*/}

{/*
Link São João Paulo II: https://www.youtube.com/watch?v=_DBCG7TglZo 
*/}

{/*
Busque os demais links
*/}

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
          <article
            className="baluartes__item"
            key={baluarte.id}
          >
            <div className="baluartes__imagem">
              <img
                src={baluarte.imagem}
                alt={baluarte.nome}
              />
            </div>

            <p className="baluartes__nome">
              {baluarte.nome}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Baluartes;