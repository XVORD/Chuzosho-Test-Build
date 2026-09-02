import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const imageDir = path.resolve('assets/images');
const files = fs.readdirSync(imageDir)
  .filter((file) => file.endsWith('-original-v1.webp'))
  .sort();

const thumbWidth = 360;
const thumbHeight = 203;
const labelHeight = 30;
const gap = 14;
const columns = 4;
const rows = Math.ceil(files.length / columns);
const composite = [];

for (const [index, file] of files.entries()) {
  const left = (index % columns) * (thumbWidth + gap);
  const top = Math.floor(index / columns) * (thumbHeight + labelHeight + gap);
  const image = await sharp(path.join(imageDir, file))
    .resize(thumbWidth, thumbHeight, { fit: 'cover' })
    .toBuffer();
  composite.push({ input: image, left, top });

  const label = file.replace('-original-v1.webp', '');
  const svg = Buffer.from(`<svg width="${thumbWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#111111"/>
    <text x="8" y="20" fill="#ffffff" font-size="13" font-family="Arial, sans-serif">${label}</text>
  </svg>`);
  composite.push({ input: svg, left, top: top + thumbHeight });
}

await sharp({
  create: {
    width: columns * thumbWidth + (columns - 1) * gap,
    height: rows * (thumbHeight + labelHeight) + (rows - 1) * gap,
    channels: 3,
    background: '#ece8df',
  },
})
  .composite(composite)
  .png()
  .toFile('qa-generated-image-system.png');

console.log(`${files.length} images -> qa-generated-image-system.png`);
