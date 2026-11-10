
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const imagens = [
  {
    entrada: 'public/imagens/comunidades/logo-cenaculos.jpg',
    saida: 'public/imagens/comunidades/logo-cenaculos.webp',
    largura: 1200,
  },
  {
    entrada: 'public/imagens/contato-servico.jpg',
    saida: 'public/imagens/contato-servico.webp',
    largura: 1400,
  },
  {
    entrada: 'public/imagens/contato-atendimento.jpg',
    saida: 'public/imagens/contato-atendimento.webp',
    largura: 1400,
  },
  {
    entrada: 'public/imagens/gerais/acao-evangelizacao.JPG',
    saida: 'public/imagens/gerais/acao-evangelizacao.webp',
    largura: 1200,
  },
  {
    entrada: 'public/imagens/gerais/acao-evangelizacao1.JPG',
    saida: 'public/imagens/gerais/acao-evangelizacao1.webp',
    largura: 1200,
  },
  {
    entrada: 'public/imagens/gerais/acao-evangelizacao2.JPG',
    saida: 'public/imagens/gerais/acao-evangelizacao2.webp',
    largura: 1200,
  },
];

async function otimizarImagem({ entrada, saida, largura }) {
  await mkdir(path.dirname(saida), { recursive: true });

  await sharp(entrada)
    .rotate()
    .resize({
      width: largura,
      withoutEnlargement: true,
    })
    .webp({
      quality: 78,
      effort: 5,
    })
    .toFile(saida);

  const original = await stat(entrada);
  const otimizado = await stat(saida);

  const reducao =
    (1 - otimizado.size / original.size) * 100;

  console.log(
    `${entrada}\n` +
    `  ${(original.size / 1024 / 1024).toFixed(2)} MB` +
    ` → ${(otimizado.size / 1024).toFixed(0)} KB` +
    ` (${reducao.toFixed(1)}% menor)\n`
  );
}

async function executar() {
  let falhas = 0;

  for (const imagem of imagens) {
    try {
      await otimizarImagem(imagem);
    } catch (erro) {
      falhas += 1;
      console.error(
        `Erro ao otimizar ${imagem.entrada}:`,
        erro.message
      );
    }
  }

  if (falhas > 0) {
    process.exitCode = 1;
  }
}

await executar();
