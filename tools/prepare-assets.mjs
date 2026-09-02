import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const projectRoot = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.resolve(projectRoot, '..', '..', '.tmp', 'chuzosho-deck-audit', 'expanded', 'ppt', 'media');
const outputRoot = path.join(projectRoot, 'assets', 'images');

const assets = {
  'foundry-hero': 'image1.png',
  'model-streams': 'image2.png',
  'checked-actions': 'image3.png',
  'harness-system': 'image4.png',
  'observations': 'image5.png',
  'toolformer': 'image6.png',
  'repair-loop': 'image8.png',
  'memory-press': 'image9.png',
  'cache-receipt': 'image12.png',
  'evidence-vault': 'image13.png',
  'fallback-archive': 'image14.png',
  'trajectory-loop': 'image16.png',
  'executable-tests': 'image17.png',
  'program-proofs': 'image19.png',
  'constant-oracle': 'image21.png',
  'lean-model': 'image22.png',
  'correctness-gates': 'image24.png',
  'growing-archive': 'image25.png',
  'promotion-gates': 'image27.png',
  'learning-arc': 'image28.png',
  'subscription-stack': 'image30.png',
  'token-loop': 'image31.png',
};

fs.mkdirSync(outputRoot, { recursive: true });

for (const [name, source] of Object.entries(assets)) {
  const inputPath = path.join(sourceRoot, source);
  const outputPath = path.join(outputRoot, `${name}.webp`);
  await sharp(inputPath)
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(outputPath);
  const kb = Math.round(fs.statSync(outputPath).size / 1024);
  process.stdout.write(`${name}.webp ${kb} KB\n`);
}
