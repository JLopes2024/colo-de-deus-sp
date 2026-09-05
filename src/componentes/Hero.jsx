import { useEffect, useState } from 'react';

import '../estilos/hero.css';

const fotosHero = [
  '/imagens/hero-page.jpg',
  '/imagens/hero-page-1.jpg',
  '/imagens/hero-page-2.jpg',
  '/imagens/hero-page-3.jpg',
];

function Hero() {
  const [fotoAtual, setFotoAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFotoAtual((indiceAtual) => {
        return (indiceAtual + 1) % fotosHero.length;
      });
    }, 5000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  return (
    <section
      className="hero"
      id="inicio"
      aria-labelledby="hero-titulo"
    >
      <div
        className="hero__carrossel"
        aria-hidden="true"
      >
        {fotosHero.map((foto, indice) => (
          <img
            className={`hero__imagem ${
              indice === fotoAtual
                ? 'hero__imagem--ativa'
                : ''
            }`}
            src={foto}
            alt=""
            key={foto}
          />
        ))}
      </div>

      <div
        className="hero__camada"
        aria-hidden="true"
      />

      <div className="hero__conteudo container">
        <div className="hero__topo">
          <p className="hero__identificacao">
            Colo de Deus // Missão SP
          </p>

          <a
            className="hero__atalho"
            href="#quem-somos"
          >
            Quem somos?
            <span aria-hidden="true">↘</span>
          </a>
        </div>

        <div className="hero__principal">
          <h1
            className="hero__titulo"
            id="hero-titulo"
          >
            <span>Gente</span>
            <span>imperfeita</span>
            <span>cuidando de</span>
            <span>gente</span>
            <span>imperfeita</span>
          </h1>
        </div>

        <div className="hero__rodape">
                   <a
            href="#quem-somos"
            className="hero__acao"
          >
            Conheça a missão
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;