import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const expected = [
  'index.html',
  'about/index.html',
  'approach/index.html',
  'partnership/index.html',
  'contact/index.html',
  'solutions/index.html',
  'solutions/isld/index.html',
  'solutions/iprocure/index.html',
  'solutions/igrc/index.html',
  'privacy-policy/index.html',
  'accessibility/index.html',
  'terms-of-use/index.html',
  'cookies-policy/index.html',
  'assets/css/site-v3.css',
  'assets/js/site.js',
];

let failed = false;
for (const item of expected) {
  if (!fs.existsSync(path.join(root, item))) {
    console.error(`Missing: ${item}`);
    failed = true;
  }
}

for (const file of expected.filter((item) => item.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    const assetPath = match[1].split(/[?#]/, 1)[0];
    if (!fs.existsSync(path.join(root, assetPath))) {
      console.error(`${file}: missing asset ${match[1]}`);
      failed = true;
    }
  }
  if (html.includes('—')) {
    console.error(`${file}: contains an em dash`);
    failed = true;
  }

  if (file === 'contact/index.html') {
    const contactStage = html.match(/<section class="[^"]*\bcontact-stage\b[^"]*"[\s\S]*?<\/section>/)?.[0];
    if (!contactStage) {
      console.error(`${file}: missing integrated contact stage`);
      failed = true;
    } else if ((contactStage.match(/<h1\b/g) || []).length !== 1) {
      console.error(`${file}: contact stage must contain exactly one h1`);
      failed = true;
    }
    continue;
  }

  if (['privacy-policy/index.html', 'accessibility/index.html', 'terms-of-use/index.html', 'cookies-policy/index.html'].includes(file)) {
    if ((html.match(/<h1\b/g) || []).length !== 1) {
      console.error(`${file}: legal page must contain exactly one h1`);
      failed = true;
    }
    continue;
  }

  const hero = html.match(/<section class="[^"]*\bhero\b[^"]*">[\s\S]*?<\/section>/)?.[0];
  if (!hero) {
    console.error(`${file}: missing hero section`);
    failed = true;
  } else {
    const headingCount = (hero.match(/<h1\b/g) || []).length;
    if (headingCount !== 1) {
      console.error(`${file}: hero must contain exactly one h1`);
      failed = true;
    }
    if (/class="[^"]*(?:eyebrow|hero-copy|hero-actions|hero-index)/.test(hero)) {
      console.error(`${file}: hero must contain only the headline; supporting content belongs below it`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('Chuzosho site check passed.');
