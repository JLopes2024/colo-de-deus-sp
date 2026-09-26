/*
 * =========================================================
 * DETECTOR DE INTENÇÃO — MISSÃO SP
 * =========================================================
 *
 * Detector local baseado em regras.
 *
 * NÃO usa IA.
 * NÃO envia mensagens para servidor.
 * NÃO salva mensagens.
 *
 * Estratégia:
 *
 * 1. Normaliza o texto.
 * 2. Identifica conceitos.
 * 3. Analisa combinações de conceitos.
 * 4. Aplica regras fortes.
 * 5. Aplica penalizações.
 * 6. Calcula confiança.
 *
 * A ideia NÃO é prever tudo.
 *
 * Se não houver evidência suficiente,
 * retornamos "desconhecido".
 * =========================================================
 */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const PONTUACAO_MINIMA = 7;
const MARGEM_MINIMA = 3;


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

export function normalizarTexto(texto = '') {
  return texto
    .toLowerCase()

    /*
     * Remove acentos:
     *
     * oração -> oracao
     * célula -> celula
     */
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

    /*
     * Remove pontuação.
     */
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')

    /*
     * Remove espaços duplicados.
     */
    .replace(/\s+/g, ' ')

    .trim();
}


/* =========================================================
   CONCEITOS
   ========================================================= */

/*
 * Aqui está uma das principais diferenças da nova versão.
 *
 * Em vez de procurar frases exatas, procuramos conceitos.
 *
 * Exemplo:
 *
 * "visita"
 * "visitar"
 * "visitarem"
 * "visitas"
 *
 * podem representar o mesmo conceito.
 */

const CONCEITOS = {
  cenaculo: [
    /^cenacul/,
  ],

  celula: [
    /^celul/,
  ],

  visita: [
    /^visit/,
  ],

  casa: [
    /^casa$/,
    /^lar$/,
    /^residenc/,
    /^domicil/,
  ],

  familia: [
    /^famil/,
    /^parent/,
  ],

  oracao: [
    /^ora$/,
    /^orar$/,
    /^oracao$/,
    /^oracoes$/,
    /^rez/,
    /^prece/,
  ],

  grupo: [
    /^grupo$/,
    /^grupos$/,
  ],

  jovem: [
    /^jovem$/,
    /^jovens$/,
    /^juventude$/,
  ],

  participar: [
    /^particip/,
    /^entrar$/,
    /^integrar$/,
    /^frequent/,
  ],

  proximidade: [
    /^perto$/,
    /^proximo$/,
    /^proxima$/,
    /^bairro$/,
    /^regiao$/,
    /^zona$/,
  ],

  receber: [
    /^receb/,
  ],

  encontro: [
    /^encontr/,
    /^reuniao$/,
    /^reunioes$/,
  ],

  whatsapp: [
    /^whatsapp$/,
    /^zap$/,
    /^wpp$/,
  ],

  trabalho: [
    /^trabalho$/,
    /^trabalh/,
  ],

  voluntariado: [
    /^voluntar/,
    /^servir$/,
    /^servico$/,
  ],
};


/* =========================================================
   TOKENIZAÇÃO
   ========================================================= */

function obterPalavras(texto) {
  return texto
    .split(' ')
    .filter(Boolean);
}


/* =========================================================
   DETECÇÃO DE CONCEITO
   ========================================================= */

function palavraCorresponde(
  palavra,
  padroes,
) {
  return padroes.some((padrao) => (
    padrao.test(palavra)
  ));
}


function possuiConceito(
  palavras,
  conceito,
) {
  const padroes = CONCEITOS[conceito];

  if (!padroes) {
    return false;
  }

  return palavras.some((palavra) => (
    palavraCorresponde(
      palavra,
      padroes,
    )
  ));
}


/* =========================================================
   POSIÇÕES DOS CONCEITOS
   ========================================================= */

/*
 * Além de saber se uma palavra existe, podemos saber
 * onde ela aparece.
 *
 * Isso permite entender:
 *
 * "visita na minha casa"
 *
 * melhor do que simplesmente:
 *
 * "visita ... [30 palavras] ... casa"
 */

function obterPosicoesConceito(
  palavras,
  conceito,
) {
  const padroes = CONCEITOS[conceito];

  if (!padroes) {
    return [];
  }

  const posicoes = [];

  palavras.forEach((palavra, indice) => {
    if (
      palavraCorresponde(
        palavra,
        padroes,
      )
    ) {
      posicoes.push(indice);
    }
  });

  return posicoes;
}


/* =========================================================
   PROXIMIDADE ENTRE CONCEITOS
   ========================================================= */

function conceitosProximos(
  palavras,
  conceitoA,
  conceitoB,
  distanciaMaxima = 7,
) {
  const posicoesA = obterPosicoesConceito(
    palavras,
    conceitoA,
  );

  const posicoesB = obterPosicoesConceito(
    palavras,
    conceitoB,
  );

  return posicoesA.some((posicaoA) => (
    posicoesB.some((posicaoB) => (
      Math.abs(
        posicaoA - posicaoB,
      ) <= distanciaMaxima
    ))
  ));
}


/* =========================================================
   EXPRESSÕES REGULARES
   ========================================================= */

/*
 * Algumas construções são mais fáceis de reconhecer
 * diretamente.
 *
 * O ".{0,60}" permite palavras no meio.
 *
 * Exemplo:
 *
 * "vocês poderiam fazer uma visita aqui na minha casa?"
 *
 * continua sendo reconhecido.
 */

const PADROES_FORTES = {
  cenaculo: [
    /\bcenacul\w*\b/,

    /\bvisit\w*\b.{0,60}\b(casa|lar|residenc\w*)\b/,

    /\b(casa|lar|residenc\w*)\b.{0,60}\bvisit\w*\b/,

    /\b(rez\w*|orar|oracao|oracoes)\b.{0,60}\b(casa|lar|famil\w*)\b/,

    /\b(casa|lar|famil\w*)\b.{0,60}\b(rez\w*|orar|oracao|oracoes)\b/,

    /\breceb\w*\b.{0,50}\b(visita|oracao|cenacul\w*)\b/,

    /\b(vir|venham|venha|irem|ir)\b.{0,60}\b(minha|nossa|aqui)\b.{0,30}\bcasa\b/,

    /\b(vir|venham|venha|ir)\b.{0,60}\bcasa\b/,
  ],

  celula: [
    /\bcelul\w*\b/,

    /\bgrupo\b.{0,60}\b(jovem|jovens|juventude)\b/,

    /\b(jovem|jovens|juventude)\b.{0,60}\bgrupo\b/,

    /\b(particip\w*|entrar|frequent\w*)\b.{0,60}\bgrupo\b/,

    /\bgrupo\b.{0,60}\b(particip\w*|entrar|frequent\w*)\b/,

    /\bgrupo\b.{0,60}\b(perto|bairro|regiao|zona)\b/,

    /\b(encontro|encontros|reuniao|reunioes)\b.{0,50}\b(jovem|jovens)\b/,
  ],
};


/* =========================================================
   CONTEXTOS NEGATIVOS
   ========================================================= */

const PADROES_NEGATIVOS = {
  cenaculo: [
    /\bvisitar\b.{0,30}\b(igreja|sede|comunidade|voces)\b/,

    /\bconhecer\b.{0,30}\b(sede|igreja)\b/,
  ],

  celula: [
    /\bgrupo\b.{0,30}\b(whatsapp|zap|wpp)\b/,

    /\bgrupo\b.{0,30}\b(trabalho|empresa)\b/,

    /\bgrupo\b.{0,30}\b(voluntarios|voluntariado|servico)\b/,
  ],
};


/* =========================================================
   EVIDÊNCIA
   ========================================================= */

function criarEvidencia(
  tipo,
  descricao,
  pontos,
) {
  return {
    tipo,
    valor: descricao,
    pontos,
  };
}


/* =========================================================
   CENÁCULO
   ========================================================= */

function analisarCenaculo(
  texto,
  palavras,
) {
  let pontos = 0;
  const evidencias = [];


  /* -------------------------------------------------------
     REGRA MAIS FORTE:
     A pessoa escreveu "Cenáculo".
     ------------------------------------------------------- */

  if (
    possuiConceito(
      palavras,
      'cenaculo',
    )
  ) {
    pontos += 12;

    evidencias.push(
      criarEvidencia(
        'conceito',
        'cenaculo',
        12,
      ),
    );
  }


  /* -------------------------------------------------------
     VISITA + CASA
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'visita',
      'casa',
      9,
    )
  ) {
    pontos += 8;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'visita + casa',
        8,
      ),
    );
  }


  /* -------------------------------------------------------
     ORAÇÃO + CASA
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'oracao',
      'casa',
      9,
    )
  ) {
    pontos += 8;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'oracao + casa',
        8,
      ),
    );
  }


  /* -------------------------------------------------------
     ORAÇÃO + FAMÍLIA
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'oracao',
      'familia',
      9,
    )
  ) {
    pontos += 7;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'oracao + familia',
        7,
      ),
    );
  }


  /* -------------------------------------------------------
     RECEBER + VISITA
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'receber',
      'visita',
      8,
    )
  ) {
    pontos += 6;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'receber + visita',
        6,
      ),
    );
  }


  /* -------------------------------------------------------
     PADRÕES DE LINGUAGEM NATURAL
     ------------------------------------------------------- */

  PADROES_FORTES.cenaculo.forEach(
    (padrao) => {
      if (!padrao.test(texto)) {
        return;
      }

      pontos += 5;

      evidencias.push(
        criarEvidencia(
          'padrao',
          padrao.source,
          5,
        ),
      );
    },
  );


  /* -------------------------------------------------------
     PENALIZAÇÕES
     ------------------------------------------------------- */

  PADROES_NEGATIVOS.cenaculo.forEach(
    (padrao) => {
      if (!padrao.test(texto)) {
        return;
      }

      pontos -= 8;

      evidencias.push(
        criarEvidencia(
          'penalizacao',
          padrao.source,
          -8,
        ),
      );
    },
  );


  return {
    intencao: 'cenaculo',
    nome: 'Cenáculo',
    pontos: Math.max(0, pontos),
    evidencias,
  };
}


/* =========================================================
   CÉLULA
   ========================================================= */

function analisarCelula(
  texto,
  palavras,
) {
  let pontos = 0;
  const evidencias = [];


  /* -------------------------------------------------------
     PALAVRA CÉLULA
     ------------------------------------------------------- */

  if (
    possuiConceito(
      palavras,
      'celula',
    )
  ) {
    pontos += 12;

    evidencias.push(
      criarEvidencia(
        'conceito',
        'celula',
        12,
      ),
    );
  }


  /* -------------------------------------------------------
     GRUPO + JOVEM
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'grupo',
      'jovem',
      8,
    )
  ) {
    pontos += 8;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'grupo + jovem',
        8,
      ),
    );
  }


  /* -------------------------------------------------------
     GRUPO + PARTICIPAR
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'grupo',
      'participar',
      8,
    )
  ) {
    pontos += 7;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'grupo + participar',
        7,
      ),
    );
  }


  /* -------------------------------------------------------
     GRUPO + PROXIMIDADE
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'grupo',
      'proximidade',
      8,
    )
  ) {
    pontos += 7;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'grupo + proximidade',
        7,
      ),
    );
  }


  /* -------------------------------------------------------
     ENCONTRO + JOVEM
     ------------------------------------------------------- */

  if (
    conceitosProximos(
      palavras,
      'encontro',
      'jovem',
      8,
    )
  ) {
    pontos += 6;

    evidencias.push(
      criarEvidencia(
        'contexto',
        'encontro + jovem',
        6,
      ),
    );
  }


  /* -------------------------------------------------------
     PADRÕES NATURAIS
     ------------------------------------------------------- */

  PADROES_FORTES.celula.forEach(
    (padrao) => {
      if (!padrao.test(texto)) {
        return;
      }

      pontos += 5;

      evidencias.push(
        criarEvidencia(
          'padrao',
          padrao.source,
          5,
        ),
      );
    },
  );


  /* -------------------------------------------------------
     PENALIZAÇÕES
     ------------------------------------------------------- */

  PADROES_NEGATIVOS.celula.forEach(
    (padrao) => {
      if (!padrao.test(texto)) {
        return;
      }

      pontos -= 9;

      evidencias.push(
        criarEvidencia(
          'penalizacao',
          padrao.source,
          -9,
        ),
      );
    },
  );


  return {
    intencao: 'celula',
    nome: 'Célula',
    pontos: Math.max(0, pontos),
    evidencias,
  };
}


/* =========================================================
   CONFIANÇA
   ========================================================= */

function obterConfianca(pontos) {
  if (pontos >= 16) {
    return 'alta';
  }

  if (pontos >= 10) {
    return 'media';
  }

  if (pontos >= PONTUACAO_MINIMA) {
    return 'baixa';
  }

  return 'insuficiente';
}


/* =========================================================
   RESULTADO DESCONHECIDO
   ========================================================= */

function criarDesconhecido(
  texto,
  motivo,
  pontuacoes = [],
) {
  return {
    encontrada: false,

    intencao: 'desconhecido',

    nome: null,

    confianca: 'insuficiente',

    pontuacao: 0,

    evidencias: [],

    textoNormalizado: texto,

    ambiguo:
      motivo === 'resultado-ambiguo',

    motivo,

    pontuacoes,
  };
}


/* =========================================================
   DETECTOR PRINCIPAL
   ========================================================= */

export function detectarIntencao(
  mensagem = '',
) {
  const texto = normalizarTexto(
    mensagem,
  );

  if (texto.length < 3) {
    return criarDesconhecido(
      texto,
      'mensagem-curta',
    );
  }

  const palavras = obterPalavras(
    texto,
  );

  const resultados = [
    analisarCenaculo(
      texto,
      palavras,
    ),

    analisarCelula(
      texto,
      palavras,
    ),
  ].sort(
    (a, b) => (
      b.pontos - a.pontos
    ),
  );


  const primeiro = resultados[0];
  const segundo = resultados[1];


  /* -------------------------------------------------------
     NÃO TEM EVIDÊNCIA SUFICIENTE
     ------------------------------------------------------- */

  if (
    !primeiro
    || primeiro.pontos
      < PONTUACAO_MINIMA
  ) {
    return criarDesconhecido(
      texto,
      'pontuacao-insuficiente',
      resultados,
    );
  }


  /* -------------------------------------------------------
     AMBIGUIDADE
     ------------------------------------------------------- */

  if (
    segundo
    && segundo.pontos
      >= PONTUACAO_MINIMA
    && (
      primeiro.pontos
      - segundo.pontos
    ) < MARGEM_MINIMA
  ) {
    return criarDesconhecido(
      texto,
      'resultado-ambiguo',
      resultados,
    );
  }


  /* -------------------------------------------------------
     INTENÇÃO ENCONTRADA
     ------------------------------------------------------- */

  return {
    encontrada: true,

    intencao:
      primeiro.intencao,

    nome:
      primeiro.nome,

    confianca:
      obterConfianca(
        primeiro.pontos,
      ),

    pontuacao:
      primeiro.pontos,

    evidencias:
      primeiro.evidencias,

    textoNormalizado:
      texto,

    ambiguo: false,

    pontuacoes:
      resultados,
  };
}


/* =========================================================
   TEXTO DE CONFIRMAÇÃO
   ========================================================= */

export function obterPerguntaConfirmacao(
  intencao,
) {
  switch (intencao) {
    case 'cenaculo':
      return (
        'Pelo que você contou, parece que '
        + 'você está procurando um Cenáculo. '
        + 'É isso? 💛'
      );

    case 'celula':
      return (
        'Pelo que você contou, parece que '
        + 'uma Célula pode ser o que você '
        + 'está procurando. É isso? 💛'
      );

    default:
      return null;
  }
}


/* =========================================================
   BOTÕES DE CONFIRMAÇÃO
   ========================================================= */

export function obterOpcoesConfirmacao(
  intencao,
) {
  switch (intencao) {
    case 'cenaculo':
      return {
        confirmar:
          'Sim, quero conhecer um Cenáculo',

        negar:
          'Não, quero falar sobre outra coisa',
      };

    case 'celula':
      return {
        confirmar:
          'Sim, quero encontrar uma Célula',

        negar:
          'Não, quero falar sobre outra coisa',
      };

    default:
      return null;
  }
}