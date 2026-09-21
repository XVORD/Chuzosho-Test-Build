import React, { useEffect, useMemo } from 'react';
import { pages } from './generatedPages';
import { SiteHeader, SiteFooter } from './components/SiteHeader';

function IsldHeader() {
  return <header className="site-header isld-header" data-header><div className="nav-shell">
    <a className="brand" href="#top" aria-label="Chuzosho home"><span className="brand-mark" aria-hidden="true">CZ</span><span className="brand-name">CHUZOSHO</span></a>
    <button className="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav className="nav-links" aria-label="ISLD navigation"><a className="nav-link" href="#what-is-isld">Overview</a><a className="nav-link" href="#workflow">Workflow</a><a className="nav-link" href="#output">Output</a><a className="nav-cta" href="#contact">Start a conversation</a></nav>
  </div></header>;
}

function StaticPage({ page, path }) {
  useEffect(() => {
    document.title = page.title;
    document.body.className = page.bodyClass || '';
    document.documentElement.style.overflowY = 'auto';
    let customIsldStyles;
    if (path === '/solutions/isld/' || path === '/isld/') {
      customIsldStyles = document.createElement('link');
      customIsldStyles.rel = 'stylesheet';
      customIsldStyles.href = './isld-custom.css';
      customIsldStyles.dataset.isldStyles = 'true';
      document.head.appendChild(customIsldStyles);
    }
    const header = document.querySelector('[data-header]');
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-links');
    const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 18);
    const close = () => { nav?.classList.remove('is-open'); document.body.classList.remove('nav-open'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Open navigation'); };
    const onToggle = () => { const open = nav?.classList.toggle('is-open') ?? false; toggle?.setAttribute('aria-expanded', String(open)); toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); document.body.classList.toggle('nav-open', open); };
    toggle?.addEventListener('click', onToggle);
    const links = nav ? [...nav.querySelectorAll('a')] : [];
    links.forEach((link) => link.addEventListener('click', close));
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const nodes = [...document.querySelectorAll('[data-reveal], .reveal')];
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      }), { threshold: .12, rootMargin: '0px 0px -40px' });
      nodes.forEach((node) => observer.observe(node));
    } else nodes.forEach((node) => { node.classList.add('is-visible'); node.classList.add('in'); });

    // Restore the custom ISLD workflow interaction after React injects its HTML.
    const steps = [...document.querySelectorAll('[data-step]')];
    const stepHandlers = steps.map((step) => {
      const activate = () => steps.forEach((item) => {
        const active = item === step;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      };
      step.addEventListener('click', activate);
      step.addEventListener('keydown', onKeyDown);
      return [step, activate, onKeyDown];
    });
    return () => {
      removeEventListener('scroll', onScroll); toggle?.removeEventListener('click', onToggle); links.forEach((link) => link.removeEventListener('click', close));
      stepHandlers.forEach(([step, activate, onKeyDown]) => { step.removeEventListener('click', activate); step.removeEventListener('keydown', onKeyDown); });
      observer?.disconnect(); close(); customIsldStyles?.remove();
    };
  }, [page, path]);
  if (!page) {
    return (
      <>
        <SiteHeader currentPath={path} />
        <main id="main" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h2>Page Not Found</h2>
          <p>The requested page <code>{path}</code> is not available.</p>
          <a href="/solutions/igrc/" className="button button-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Go to IGRC</a>
        </main>
        <SiteFooter />
      </>
    );
  }
  const assetBase = typeof window !== 'undefined' && window.CHUZOSHO_THEME_URI ? `${window.CHUZOSHO_THEME_URI}/assets` : '/assets';
  const body = (page.body || '').replace(/\/assets\//g, `${assetBase}/`);
  return <><SiteHeader currentPath={path} /><main id="main" dangerouslySetInnerHTML={{ __html: body }} /><SiteFooter /></>;
}

export default function App() {
  const path = useMemo(() => { const value = window.location.pathname.replace(/index\.html$/, ''); return value.endsWith('/') ? value : `${value}/`; }, []);
  const page = pages[path] || pages['/'] || pages['/about/'] || Object.values(pages)[0];
  return <StaticPage page={page} path={path} />;
}
