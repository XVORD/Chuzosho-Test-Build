import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// Site pages come from the cloned upstream Chuzosho site. The React shell
// itself also lives at the project root, so do not use it as page source.
const source = path.resolve(root, '..', 'upstream-chuzosho');
const out = path.resolve(root, 'src', 'generatedPages.js');
const routes = ['/', '/about/', '/approach/', '/solutions/', '/solutions/isld/', '/isld/', '/solutions/harness/', '/solutions/codegraff/', '/solutions/codedb/', '/solutions/iprocure/', '/solutions/igrc/', '/partnership/', '/contact/', '/accessibility/', '/privacy-policy/', '/cookies-policy/', '/terms-of-use/'];

const pages = {};
for (const route of routes) {
  // The ISLD solution is the custom product page built in the workspace root.
  // Keep the rest of the site sourced from the upstream Chuzosho pages.
// index.php is the deployable entry point and currently requires isld.html;
// resolve that PHP entry to its presentation markup for the React payload.
const customIsld = path.resolve(root, '..', 'isld.html');
  const file = (route === '/solutions/isld/' || route === '/isld/') && fs.existsSync(customIsld)
    ? customIsld
    : (route === '/' ? path.join(source, 'index.html') : path.join(source, route.slice(1), 'index.html'));
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const bodyClass = html.match(/<body[^>]*class="([^"]*)"/i)?.[1] ?? '';
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? 'Chuzosho';
  pages[route] = {
    title,
    bodyClass: (route === '/solutions/isld/' || route === '/isld/') ? 'page-isld-custom' : bodyClass,
    body: body
      .replace(/<site-header><\/site-header>/gi, '')
      .replace(/<site-footer><\/site-footer>/gi, '')
      // The custom ISLD source contains literal header/footer markup. React
      // supplies the shared Chuzosho shell, so remove those duplicates.
      .replace(/<header[^>]*class="[^"]*site-header[^"]*"[\s\S]*?<\/header>/i, '')
      .replace(/<footer[^>]*class="[^"]*site-footer[^"]*"[\s\S]*?<\/footer>/i, '')
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
