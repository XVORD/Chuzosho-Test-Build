import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// Site pages come from the cloned upstream Chuzosho site. The React shell
// itself also lives at the project root, so do not use it as page source.
const upstreamDir = path.resolve(root, '..', 'upstream-chuzosho');
const source = fs.existsSync(upstreamDir) ? upstreamDir : root;
const out = path.resolve(root, 'src', 'generatedPages.js');
const routes = ['/', '/about/', '/approach/', '/solutions/', '/solutions/isld/', '/isld/', '/solutions/harness/', '/solutions/codegraff/', '/solutions/codedb/', '/solutions/iprocure/', '/solutions/igrc/', '/partnership/', '/contact/', '/accessibility/', '/privacy-policy/', '/cookies-policy/', '/terms-of-use/'];

// Ensure igrc-hero.png is copied to assets/images and public/assets/images
const igrcHeroSrc = path.join(root, 'wordpress-theme', 'react-theme', 'assets', 'images', 'igrc-hero.png');
if (fs.existsSync(igrcHeroSrc)) {
  const dest1 = path.join(root, 'assets', 'images', 'igrc-hero.png');
  const dest2 = path.join(root, 'public', 'assets', 'images', 'igrc-hero.png');
  fs.mkdirSync(path.dirname(dest1), { recursive: true });
  fs.copyFileSync(igrcHeroSrc, dest1);
  fs.mkdirSync(path.dirname(dest2), { recursive: true });
  fs.copyFileSync(igrcHeroSrc, dest2);
}

const pages = {};
for (const route of routes) {
  // The ISLD solution is the custom product page built in the workspace root.
  // Keep the rest of the site sourced from the upstream Chuzosho pages.
  // index.php is the deployable entry point and currently requires isld.html;
  // resolve that PHP entry to its presentation markup for the React payload.
  const customIsld = path.resolve(root, '..', 'isld.html');
  let file;
  if ((route === '/solutions/isld/' || route === '/isld/') && fs.existsSync(customIsld)) {
    file = customIsld;
  } else if (route === '/') {
    const rootIndex = path.join(source, 'index.html');
    if (fs.existsSync(rootIndex) && !fs.readFileSync(rootIndex, 'utf8').includes('app-root')) {
      file = rootIndex;
    } else {
      file = path.join(source, 'about', 'index.html');
    }
  } else {
    file = path.join(source, route.replace(/^\/|\/$/g, ''), 'index.html');
  }

  if (!file || !fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  let body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const bodyClass = html.match(/<body[^>]*class="([^"]*)"/i)?.[1] ?? '';
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? 'Chuzosho';
  const styles = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi)?.join('\n') ?? '';
  if (styles && !body.includes('<style')) {
    body = styles + '\n' + body;
  }

  pages[route] = {
    title,
    bodyClass: (route === '/solutions/isld/' || route === '/isld/') ? 'page-isld-custom' : bodyClass,
    body: body
      .replace(/<site-header><\/site-header>/gi, '')
      .replace(/<site-footer><\/site-footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<main[^>]*>/i, '')
      .replace(/<\/main>/i, '')
      // Normalize assets from both upstream (/assets) and custom (./assets)
      // pages so nested SPA routes resolve them from the shared public folder.
      .replace(/(?:\.\.\/|\.\/|\/)assets\//g, '/assets/')
      .replace(/(?:\.\.\/|\.\/|\/)favicon\.svg/g, '/favicon.svg')
      // Use the real electrical ISLD visual for the ISLD portfolio card.
      .replace(route === '/' || route === '/solutions/'
        ? /\/assets\/images\/harness-foundry-system-v1\.webp/g
        : /$^/, '/assets/Hero%20Banner.png')
  };
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `export const pages = ${JSON.stringify(pages, null, 2)};\n`);
console.log(`Generated ${Object.keys(pages).length} React page payloads.`);
