import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// Site pages come from the cloned upstream Chuzosho site. The React shell
// itself also lives at the project root, so do not use it as page source.
const source = path.resolve(root, '..', 'upstream-chuzosho');
// Product pages contributed by the GitHub solution branches live in this
// project so they can evolve independently from the upstream marketing copy.
// React still strips their standalone shell and renders them inside the
// shared SiteHeader/SiteFooter below.
const mergedSolutions = path.resolve(root, 'solutions');
const out = path.resolve(root, 'src', 'generatedPages.js');
const routes = ['/', '/about/', '/approach/', '/solutions/', '/solutions/isld/', '/isld/', '/solutions/harness/', '/solutions/codegraff/', '/solutions/codedb/', '/solutions/iprocure/', '/solutions/igrc/', '/partnership/', '/contact/', '/accessibility/', '/privacy-policy/', '/cookies-policy/', '/terms-of-use/'];

const pages = {};
for (const route of routes) {
  // The ISLD solution is the custom product page built in the workspace root.
  // Keep the rest of the site sourced from the upstream Chuzosho pages.
// index.php is the deployable entry point and currently requires isld.html;
// resolve that PHP entry to its presentation markup for the React payload.
const customIsld = path.resolve(root, '..', 'isld.html');
  const mergedSolutionFile = (route === '/solutions/igrc/' || route === '/solutions/iprocure/')
    ? path.join(mergedSolutions, route.split('/')[2], 'index.html')
    : null;
  const file = mergedSolutionFile && fs.existsSync(mergedSolutionFile)
    ? mergedSolutionFile
    : (route === '/solutions/isld/' || route === '/isld/') && fs.existsSync(customIsld)
    ? customIsld
    : (route === '/' ? path.join(source, 'index.html') : path.join(source, route.slice(1), 'index.html'));
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  // The iGRC branch keeps its product-specific CSS in the document head.
  // React renders only the body payload, so carry those inline styles into
  // the payload instead of dropping the complete visual system.
  const headStyles = (route === '/solutions/igrc/'
    ? [...html.matchAll(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi)].map((match) => match[0]).join('\n')
    : '');
  const mainTypography = route === '/solutions/igrc/' ? `<style>
    /* Preserve the iGRC product layout while aligning its typography with Chuzosho. */
    .page-igrc { font-family: var(--sans); font-size: 16px; line-height: 1.55; }
    .page-igrc h1, .page-igrc h2, .page-igrc h3, .page-igrc h4 {
      font-family: var(--sans); font-weight: 790; letter-spacing: -.055em; line-height: .94;
    }
    .page-igrc h1 { font-size: clamp(3.4rem, 8.5vw, 8.7rem); }
    .page-igrc .hero-igrc, .page-igrc .hero-igrc *,
    .page-igrc .sect-light, .page-igrc .sect-paper, .page-igrc .sect-dark,
    .page-igrc .final-cta { font-family: var(--sans) !important; }
    .page-igrc .hero-igrc .hero-label { display:none !important; }
    .page-igrc .section-head h2 { font-size: clamp(2.8rem, 6vw, 6.4rem); }
    .page-igrc .section-head .support, .page-igrc .hero-sub, .page-igrc .evidence-copy p { font-family: var(--sans); line-height: 1.55; }
    .page-igrc .triad-col h3 { font-size: clamp(1.65rem, 2.4vw, 2.4rem); }
    .page-igrc .domain h4, .page-igrc .flow-step h4, .page-igrc .loop-item h4 { font-family: var(--sans); font-weight: 700; letter-spacing: -.035em; }
  </style>` : '';
  const bodyClass = html.match(/<body[^>]*class="([^"]*)"/i)?.[1] ?? '';
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? 'Chuzosho';
  pages[route] = {
    title,
    bodyClass: (route === '/solutions/isld/' || route === '/isld/') ? 'page-isld-custom' : bodyClass,
    body: `${headStyles}${mainTypography}${body}`
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
