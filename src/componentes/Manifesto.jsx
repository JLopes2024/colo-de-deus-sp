import '../estilos/manifesto.css';

function Manifesto() {
  return (
    <section
      className="manifesto"
      aria-labelledby="manifesto-titulo"
    >
      <div className="manifesto__conteudo container">
        <p className="manifesto__indice">
          02 — Nossa essência
        </p>

        <h2
          className="manifesto__titulo"
          id="manifesto-titulo"
        >
          Gente imperfeita
          <span>cuidando de</span>
          gente imperfeita.
        </h2>
      </div>
    </section>
  );
}

export default Manifesto;