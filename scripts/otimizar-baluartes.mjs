
import sharp from 'sharp';
import { stat } from 'node:fs/promises';

const imagens = [
  'santa-teresa',
  'santa-faustina',
  'sao-francisco',
  'sao-jp2',
];

async function otimizar(nome) {
  const origem = `public/imagens/baluartes/${nome}.png`;
  const destino = `public/imagens/baluartes/${nome}.webp`;

  const original = await stat(origem);

  const resultado = await sharp(origem)
    .rotate()
    .resize({
      width: 1200,
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      alphaQuality: 100,
      effort: 6,
    })
    .toFile(destino);

  const economia = (
    (1 - resultado.size / original.size) * 100
  ).toFixed(1);

  console.log(
    `${nome}: ` +
    `${(original.size / 1024).toFixed(0)} KiB → ` +
    `${(resultado.size / 1024).toFixed(0)} KiB ` +
    `(-${economia}%)`
  );
}

async function executar() {
  for (const nome of imagens) {
    await otimizar(nome);
  }

  console.log('\nConversão concluída.');
}

executar().catch((erro) => {
  console.error('Falha na conversão:', erro);
  process.exitCode = 1;
});
