
export const WHATSAPP_GERAL = '5511932172095';

export const REGIOES = [
  {
    nome: 'São Paulo — Zona Norte',
    whatsapp: '5511977038232',
  },
  {
    nome: 'São Paulo — Zona Sul',
    whatsapp: '5511940042507',
  },
  {
    nome: 'São Paulo — Zona Leste',
    whatsapp: '5511949804317',
  },
  {
    nome: 'São Paulo — Zona Oeste',
    whatsapp: '5511946956849',
  },
  {
    nome: 'ABC e região',
    whatsapp: '5543998075936',
  },
  {
    nome: 'Osasco e região',
    whatsapp: '5511966870139',
  },
  {
    nome: 'Outra região',
    whatsapp: WHATSAPP_GERAL,
  },
];

export function obterLinkWhatsApp(regiao, mensagem, contatoGeral = false) {
  const contato = REGIOES.find((item) => item.nome === regiao);

  const numero = contatoGeral
    ? WHATSAPP_GERAL
    : contato?.whatsapp ?? WHATSAPP_GERAL;

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
