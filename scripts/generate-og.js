// Generate 16 OG share images (400x400 PNG) for social media previews.
// Each image: dog's cardColor background + felt dog image centered.
// Usage: node scripts/generate-og.js

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const dogs = [
  { id: 'philosopher', cardColor: '#c1e6df' },
  { id: 'architect', cardColor: '#c0eaf1' },
  { id: 'intern', cardColor: '#c3e8ef' },
  { id: 'commander', cardColor: '#cbe3e5' },
  { id: 'rereader', cardColor: '#bae6f1' },
  { id: 'caretaker', cardColor: '#cee9d2' },
  { id: 'perfectionist', cardColor: '#d1e9da' },
  { id: 'mentor', cardColor: '#c2e3db' },
  { id: 'vampire', cardColor: '#c5f0e2' },
  { id: 'drifter', cardColor: '#c5e4e5' },
  { id: 'goldfish', cardColor: '#bbe3d7' },
  { id: 'helper', cardColor: '#d1e9e8' },
  { id: 'brute', cardColor: '#dbebd8' },
  { id: 'ghost', cardColor: '#b6e4de' },
  { id: 'speedrunner', cardColor: '#c0e5ed' },
  { id: 'googler', cardColor: '#c3eae2' },
];

const outDir = path.join(process.cwd(), 'static/og');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

async function generate() {
  let ok = 0;
  let skip = 0;

  for (const dog of dogs) {
    const srcPath = path.join(process.cwd(), `static/dogs/felt-${dog.id}-nobg.png`);

    if (!existsSync(srcPath)) {
      console.log(`SKIP: ${srcPath} not found`);
      skip++;
      continue;
    }

    const { r, g, b } = hexToRgb(dog.cardColor);

    const dogImg = await sharp(srcPath)
      .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: { width: 400, height: 400, channels: 4, background: { r, g, b, alpha: 255 } },
    })
      .composite([{ input: dogImg, gravity: 'centre' }])
      .png()
      .toFile(path.join(outDir, `${dog.id}.png`));

    console.log(`OK: ${dog.id}.png`);
    ok++;
  }

  console.log(`\nDone: ${ok} generated, ${skip} skipped`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
