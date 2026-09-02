import { chromium } from 'file:///C:/Users/Evan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const origin = process.env.ORIGIN || 'http://127.0.0.1:4360';
const defaultRoutes = ['/', '/about/', '/approach/', '/partnership/', '/contact/', '/solutions/', '/solutions/isld/', '/solutions/iprocure/', '/solutions/igrc/', '/privacy-policy/', '/accessibility/', '/terms-of-use/', '/cookies-policy/'];
const routes = process.env.ROUTES ? process.env.ROUTES.split(',') : defaultRoutes;
const outputDirectory = path.resolve(import.meta.dirname, '..', 'qa-20260827-v2');
fs.mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let failed = false;

for (const route of routes) {
  for (const [label, viewport] of Object.entries({
    desktop: { width: 1440, height: 1000 },
    wide: { width: 1918, height: 910 },
    mobile: { width: 390, height: 844 },
  })) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
      const distance = Math.max(320, Math.floor(window.innerHeight * 0.72));
      for (let position = 0; position < document.documentElement.scrollHeight; position += distance) {
        window.scrollTo({ top: position, behavior: 'instant' });
        await delay(70);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-visible'));
      await delay(120);
    });
    const dimensions = await page.evaluate(() => {
        const hero = document.querySelector('.hero, .contact-stage, .legal-main');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        textLength: document.body.innerText.trim().length,
        viewportHeight: window.innerHeight,
        heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
        overflowNodes: [...document.querySelectorAll('body *')]
          .map((node) => ({ node, rect: node.getBoundingClientRect() }))
          .filter(({ rect }) => rect.right > document.documentElement.clientWidth + 1 || rect.left < -1)
          .slice(0, 12)
          .map(({ node, rect }) => `${node.tagName.toLowerCase()}.${[...node.classList].join('.')}:${Math.round(rect.left)}..${Math.round(rect.right)}`),
      };
    });
    const result = {
      route,
      label,
      status: response?.status(),
      overflow: dimensions.scrollWidth > dimensions.clientWidth,
      textLength: dimensions.textLength,
      heroHeight: dimensions.heroHeight,
      viewportHeight: dimensions.viewportHeight,
      heroFillsViewport: dimensions.heroHeight >= dimensions.viewportHeight,
      overflowNodes: dimensions.overflowNodes,
      errors,
    };
    if (result.status !== 200 || result.overflow || result.textLength < 200 || !result.heroFillsViewport || result.errors.length) failed = true;
    console.log(JSON.stringify(result));
    if (route === '/' && label === 'desktop') await page.screenshot({ path: path.join(outputDirectory, 'qa-home-desktop.png'), fullPage: true });
    if (route === '/' && label === 'mobile') await page.screenshot({ path: path.join(outputDirectory, 'qa-home-mobile.png'), fullPage: true });
    if (['/solutions/', '/approach/', '/about/'].includes(route) && label === 'wide') {
      await page.screenshot({ path: path.join(outputDirectory, `qa-${route.split('/').filter(Boolean)[0]}-wide.png`), fullPage: false });
    }
    if (route === '/contact/' && label === 'desktop') await page.screenshot({ path: path.join(outputDirectory, 'qa-contact-desktop.png'), fullPage: true });
    if (route === '/contact/' && label === 'mobile') await page.screenshot({ path: path.join(outputDirectory, 'qa-contact-mobile.png'), fullPage: true });
    if (route === '/solutions/isld/' && label === 'mobile') await page.screenshot({ path: path.join(outputDirectory, 'qa-isld-mobile.png'), fullPage: true });
    await page.close();
  }
}

await browser.close();
if (failed) process.exit(1);
