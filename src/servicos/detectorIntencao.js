
/** Detector local de intenções. Sem IA, servidor ou armazenamento. */
export function normalizarTexto(valor = '') {
  return String(valor).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

const INTENCOES = {
  celula: {
    nome: 'Célula',
    fortes: [ /\bcelul\w*\b/ ],
    contexto: [
      /\b(grupo|encontro|reuniao)\b.{0,45}\b(jovens?|juventude|participar|frequentar|perto|bairro)\b/,
      /\b(jovens?|juventude|participar|frequentar)\b.{0,45}\b(grupo|encontro|reuniao)\b/,
      /\b(grupo|encontro)\b.{0,35}\b(de|da)\s+(oracao|jovens?)\b/,
    ],
    exclusoes: [ /\bgrupo\s+(de\s+)?(whatsapp|zap|trabalho|empresa|voluntarios?)\b/ ],
  },
  cenaculo: {
    nome: 'Cenáculo',
    fortes: [ /\bcenacul\w*\b/ ],
    contexto: [
      /\b(visit\w*|rez\w*|ora\w*)\b.{0,60}\b(minha|nossa|em|na|aqui)\b.{0,22}\b(casa|lar|residencia)\b/,
      /\b(casa|lar|residencia)\b.{0,60}\b(visit\w*|rez\w*|ora\w*)\b/,
      /\b(receber|quero)\b.{0,50}\b(visita|oracao)\b/,
      /\b(orar|rezar|oracao)\b.{0,45}\b(familia|familiares)\b/,
    ],
    exclusoes: [ /\b(visit\w*|conhecer)\b.{0,25}\b(igreja|sede)\b/ ],
  },
};

function existeNegacaoPerto(texto, padrao) {
  const tokens = texto.split(' ');

  // Detecta negativas próximas ao termo explícito, não apenas o uso da palavra.
  for (let i = 0; i < tokens.length; i += 1) {
    if (!padrao.test(tokens[i])) continue;
    const anteriores = tokens.slice(Math.max(0, i - 5), i).join(' ');
    if (/\b(nao|nunca|jamais|sem)\b/.test(anteriores)) return true;
  }
  return false;
}

export function detectarIntencao(mensagem = '') {
  const texto = normalizarTexto(mensagem);
  if (texto.length < 3) return desconhecido(texto, 'mensagem-curta');

  const pontuacoes = Object.entries(INTENCOES).map(([intencao, config]) => {
    const evidencias = [];
    let pontos = 0;

    for (const padrao of config.fortes) {
      if (padrao.test(texto)) {
        pontos += 12;
        evidencias.push({ tipo: 'direta', pontos: 12 });
      }
    }

    for (const padrao of config.contexto) {
      if (padrao.test(texto)) {
        pontos += 7;
        evidencias.push({ tipo: 'contexto', pontos: 7 });
      }
    }

    for (const padrao of config.exclusoes) {
      if (padrao.test(texto)) {
        pontos -= 12;
        evidencias.push({ tipo: 'exclusao', pontos: -12 });
      }
    }

    if (existeNegacaoPerto(texto, intencao === 'celula' ? /celul\w*|grupo/ : /cenacul\w*|visita/)) {
      pontos -= 18;
      evidencias.push({ tipo: 'negacao', pontos: -18 });
    }

    return { intencao, nome: config.nome, pontos: Math.max(0, pontos), evidencias };
  }).sort((a, b) => b.pontos - a.pontos);

  const [primeiro, segundo] = pontuacoes;

  if (primeiro.pontos < 7) {
    return desconhecido(texto, 'pontuacao-insuficiente', pontuacoes);
  }

  if (segundo.pontos >= 7 && primeiro.pontos - segundo.pontos < 3) {
    return desconhecido(texto, 'resultado-ambiguo', pontuacoes);
  }

  return {
    encontrada: true,
    intencao: primeiro.intencao,
    nome: primeiro.nome,
    pontuacao: primeiro.pontos,
    confianca: primeiro.pontos >= 16 ? 'alta' : primeiro.pontos >= 10 ? 'media' : 'baixa',
    evidencias: primeiro.evidencias,
    textoNormalizado: texto,
    ambiguo: false,
    pontuacoes,
  };
}

function desconhecido(texto, motivo, pontuacoes = []) {
  return {
    encontrada: false,
    intencao: 'desconhecido',
    nome: null,
    confianca: 'insuficiente',
    pontuacao: 0,
    evidencias: [],
    textoNormalizado: texto,
    ambiguo: motivo === 'resultado-ambiguo',
    motivo,
    pontuacoes,
  };
}

export function obterPerguntaConfirmacao(intencao) {
  if (intencao === 'celula') {
    return 'Pelo que você contou, parece que você procura uma Célula. É isso? 💛';
  }

  if (intencao === 'cenaculo') {
    return 'Pelo que você contou, parece que você procura um Cenáculo. É isso? 💛';
  }

  return null;
}

export function obterOpcoesConfirmacao(intencao) {
  if (intencao === 'celula') {
    return {
      confirmar: 'Sim, quero encontrar uma Célula',
      negar: 'Não, quero falar de outra coisa',
    };
  }

  if (intencao === 'cenaculo') {
    return {
      confirmar: 'Sim, quero conhecer um Cenáculo',
      negar: 'Não, quero falar de outra coisa',
    };
  }

  return null;
}
