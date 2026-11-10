
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ajustes = [
  {
    componente: 'src/componentes/Cabecalho.jsx',
    imagem: '/imagens/logo-branca.png',
  },
  {
    componente: 'src/componentes/Rodape.jsx',
    imagem: '/imagens/logo-branca.png',
  },
  {
    componente: 'src/componentes/Comunidades.jsx',
    imagem: '/imagens/comunidades/logo-celulas.jpg',
  },
  {
    componente: 'src/componentes/Comunidades.jsx',
    imagem: '/imagens/comunidades/logo-cenaculos.webp',
  },
];

async function obterDimensoes(imagem) {
  const caminho = path.join(
    'public',
    imagem.replace(/^\//, ''),
  );

  const metadata = await sharp(caminho).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(
      `Dimensões inválidas: ${caminho}`,
    );
  }

  return {
    width: metadata.width,
    height: metadata.height,
  };
}

async function executar() {
  const alteracoes = new Map();

  // Primeiro verifica todos os arquivos e as imagens.
  // Se algo estiver faltando, não altera nenhum JSX.
  for (const ajuste of ajustes) {
    const { componente, imagem } = ajuste;

    let codigo = alteracoes.get(componente);

    if (codigo === undefined) {
      codigo = await readFile(componente, 'utf8');
    }

    const { width, height } =
      await obterDimensoes(imagem);

    const imagensEncontradas = [];
    const expressao = /<img\b[\s\S]*?\/>/g;

    for (const resultado of codigo.matchAll(expressao)) {
      if (
        resultado[0].includes(`src="${imagem}"`) ||
        resultado[0].includes(`src='${imagem}'`)
      ) {
        imagensEncontradas.push(resultado[0]);
      }
    }

    if (imagensEncontradas.length !== 1) {
      throw new Error(
        `Esperada uma imagem "${imagem}" em "${componente}", ` +
        `encontradas: ${imagensEncontradas.length}. ` +
        'Nenhum arquivo foi salvo.',
      );
    }

    const original = imagensEncontradas[0];

    // Evita gerar atributos duplicados.
    const semDimensoes = original
      .replace(/\s+width=\{?\d+\}?/g, '')
      .replace(/\s+height=\{?\d+\}?/g, '');

    const corrigida = semDimensoes.replace(
      /\s*\/>$/,
      `\n              width={${width}}\n` +
      `              height={${height}}\n` +
      '            />',
    );

    codigo = codigo.replace(original, corrigida);

    alteracoes.set(componente, codigo);

    console.log(
      `${componente}\n` +
      `  ${imagem}\n` +
      `  ${width} × ${height}\n`,
    );
  }

  // Só grava depois que todas as validações passaram.
  for (const [arquivo, codigo] of alteracoes) {
    await writeFile(arquivo, codigo, 'utf8');
  }

  console.log(
    'Dimensões adicionadas aos três componentes.',
  );
}

executar().catch((erro) => {
  console.error('Erro:', erro.message);
  process.exitCode = 1;
});
