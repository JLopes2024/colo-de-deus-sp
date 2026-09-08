/* =========================================================
   PERGUNTAS DO GAME — COLO DE DEUS

   Este arquivo concentra todo o conteúdo do quiz.

   Para adicionar uma nova pergunta:
   1. crie um novo objeto;
   2. use um ID único;
   3. informe a pergunta;
   4. adicione as alternativas;
   5. informe exatamente qual delas é a resposta correta;
   6. opcionalmente escreva uma explicação curta.

   IMPORTANTE:
   A ordem das alternativas NÃO precisa ser aleatória aqui.
   O componente GameColo.jsx já embaralha as opções
   automaticamente a cada partida.
   ========================================================= */


export const perguntasGame = [

  /* =======================================================
     IDENTIDADE / CARISMA
     ======================================================= */

  {
    id: 1,

    pergunta:
      'Qual destas características faz parte da identidade da Colo de Deus?',

    alternativas: [
      'Missionária',
      'Competitiva',
      'Corporativa',
      'Acadêmica',
    ],

    resposta:
      'Missionária',

    explicacao:
      'A Colo de Deus possui uma forte identidade missionária.',
  },


  {
    id: 2,

    pergunta:
      'Além de missionária, qual destas características faz parte da identidade da Colo de Deus?',

    alternativas: [
      'Mariana',
      'Monástica',
      'Empresarial',
      'Esportiva',
    ],

    resposta:
      'Mariana',

    explicacao:
      'A espiritualidade mariana faz parte da identidade da comunidade.',
  },


  {
    id: 3,

    pergunta:
      'Qual destas palavras também representa fortemente a identidade da Colo de Deus?',

    alternativas: [
      'Criativos',
      'Formais',
      'Tradicionais',
      'Reservados',
    ],

    resposta:
      'Criativos',

    explicacao:
      'A criatividade é uma das marcas da forma de evangelizar da Colo de Deus.',
  },


  {
    id: 4,

    pergunta:
      'A Colo de Deus busca especialmente alcançar quem?',

    alternativas: [
      'Pessoas que se afastaram da fé',
      'Somente religiosos',
      'Somente crianças',
      'Somente estudantes',
    ],

    resposta:
      'Pessoas que se afastaram da fé',

    explicacao:
      'Parte importante da missão é trazer de volta à Igreja aqueles que se afastaram da fé.',
  },


  {
    id: 5,

    pergunta:
      'A missão da Colo de Deus busca gestar uma humanidade cheia de quê?',

    alternativas: [
      'Pentecostes',
      'Silêncio',
      'Conhecimento',
      'Tradições',
    ],

    resposta:
      'Pentecostes',

    explicacao:
      'O carisma fala sobre gestar uma humanidade cheia de Pentecostes.',
  },


  /* =======================================================
     EVANGELIZAÇÃO
     ======================================================= */

  {
    id: 6,

    pergunta:
      'Qual destes elementos faz parte da forma de evangelizar da Colo de Deus?',

    alternativas: [
      'Arte',
      'Competição',
      'Publicidade',
      'Diplomacia',
    ],

    resposta:
      'Arte',

    explicacao:
      'A arte é uma das linguagens usadas pela Colo de Deus para evangelizar.',
  },


  {
    id: 7,

    pergunta:
      'Qual expressão combina melhor com a evangelização vivida pela Colo de Deus?',

    alternativas: [
      'Cultura do encontro',
      'Cultura da distância',
      'Cultura da competição',
      'Cultura da performance',
    ],

    resposta:
      'Cultura do encontro',

    explicacao:
      'A cultura do encontro é parte importante da forma como a comunidade se aproxima das pessoas.',
  },


  {
    id: 8,

    pergunta:
      'Na evangelização da Colo de Deus, cada pessoa deve ser tratada como...',

    alternativas: [
      'Única',
      'Parte de uma multidão',
      'Um número',
      'Um visitante',
    ],

    resposta:
      'Única',

    explicacao:
      'O cuidado pessoal e o olhar para cada pessoa são elementos importantes da missão.',
  },


  /* =======================================================
     CÉLULAS
     ======================================================= */

  {
    id: 9,

    pergunta:
      'Qual frase representa a proposta das células da Colo de Deus?',

    alternativas: [
      'Gente imperfeita cuidando de gente imperfeita',
      'Pessoas perfeitas formando pessoas perfeitas',
      'Conhecimento acima de relacionamento',
      'Evangelização apenas em grandes eventos',
    ],

    resposta:
      'Gente imperfeita cuidando de gente imperfeita',

    explicacao:
      'As células vivem uma evangelização próxima, no cuidado de pessoa para pessoa.',
  },


  {
    id: 10,

    pergunta:
      'A evangelização nas células acontece principalmente de qual forma?',

    alternativas: [
      'De pessoas para pessoas',
      'Somente através da internet',
      'Somente em grandes eventos',
      'Somente durante missas',
    ],

    resposta:
      'De pessoas para pessoas',

    explicacao:
      'As células valorizam a evangelização próxima e o cuidado no um a um.',
  },


  {
    id: 11,

    pergunta:
      'As células da Colo de Deus acreditam especialmente em quem?',

    alternativas: [
      'Nos improváveis',
      'Somente nos especialistas',
      'Somente nos líderes',
      'Somente nos mais experientes',
    ],

    resposta:
      'Nos improváveis',

    explicacao:
      'A proposta das células inclui acreditar nos improváveis e formar novos líderes.',
  },


  /* =======================================================
     CENÁCULOS
     ======================================================= */

  {
    id: 12,

    pergunta:
      'Onde acontece principalmente a experiência dos cenáculos?',

    alternativas: [
      'Nas casas e famílias',
      'Somente em igrejas',
      'Somente em escolas',
      'Somente em auditórios',
    ],

    resposta:
      'Nas casas e famílias',

    explicacao:
      'Os cenáculos levam oração, encontro e partilha para dentro das casas.',
  },


  {
    id: 13,

    pergunta:
      'O que as pessoas fazem juntas em um cenáculo?',

    alternativas: [
      'Oram e partilham',
      'Competem',
      'Estudam para provas',
      'Participam de reuniões administrativas',
    ],

    resposta:
      'Oram e partilham',

    explicacao:
      'O cenáculo é um espaço de oração, encontro e partilha.',
  },


  /* =======================================================
     BALUARTES
     ======================================================= */

  {
    id: 14,

    pergunta:
      'Qual destes santos é um dos baluartes apresentados pela Colo de Deus?',

    alternativas: [
      'São João Paulo II',
      'São Bento',
      'São Tomás de Aquino',
      'São Domingos',
    ],

    resposta:
      'São João Paulo II',

    explicacao:
      'São João Paulo II está entre os baluartes apresentados pela comunidade.',
  },


  {
    id: 15,

    pergunta:
      'Qual destas santas aparece entre os baluartes da Colo de Deus?',

    alternativas: [
      'Santa Faustina',
      'Santa Clara',
      'Santa Mônica',
      'Santa Catarina de Sena',
    ],

    resposta:
      'Santa Faustina',

    explicacao:
      'Santa Faustina está entre os baluartes apresentados pela comunidade.',
  },
];