import React from 'react';

const routes = [['Home', '/'], ['Foundry', '/about/'], ['Approach', '/approach/'], ['Solutions', '/solutions/'], ['Partnership', '/partnership/'], ['Contact Us', '/contact/']];

export function SiteHeader({ currentPath }) {
  const assetBase = typeof window !== 'undefined' && window.CHUZOSHO_THEME_URI
    ? `${window.CHUZOSHO_THEME_URI}/assets`
    : '/assets';
  const logo = `${assetBase}/chuzosho-logo-with-text.png`;
  return <header className="site-header" data-header><div className="nav-shell"><a className="brand" href="/" aria-label="Chuzosho home"><img className="brand-logo" src={logo} alt="CHUZOSHO" /></a><button className="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button><nav className="nav-links" aria-label="Primary navigation">{routes.map(([label, href]) => <a key={href} className="nav-link" href={href} aria-current={currentPath === href || (href !== '/' && currentPath.startsWith(href)) ? 'page' : undefined}>{label}</a>)}</nav></div></header>;
}

export function SiteFooter() {
  const assetBase = typeof window !== 'undefined' && window.CHUZOSHO_THEME_URI
    ? `${window.CHUZOSHO_THEME_URI}/assets`
    : '/assets';
  const logo = `${assetBase}/chuzosho-logo-with-text.png`;
  return <footer className="site-footer"><div className="footer-shell"><div className="footer-top"><div className="footer-brand"><a className="brand" href="/"><img className="brand-logo brand-logo--footer" src={logo} alt="CHUZOSHO" /></a><p>A HOSHŌ DIGITAL Company.</p><div className="footer-socials"><a href="https://www.linkedin.com/company/hoshodigital/posts/?feedView=all" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://x.com/HoshoDigital" target="_blank" rel="noreferrer">X</a><a href="https://www.instagram.com/hoshodigital/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.youtube.com/@HoshoDigital" target="_blank" rel="noreferrer">YouTube</a></div></div><div className="footer-nav"><div><h2>Foundry</h2><a href="/about/">About</a><a href="/approach/">Approach</a><a href="/partnership/">Partnership</a></div><div><h2>Solutions</h2><a href="/solutions/isld/">iSLD</a><a href="/solutions/iprocure/">iPROCURE</a><a href="/solutions/igrc/">iGRC</a></div><div><h2>Contact</h2><a href="/contact/">Contact Us</a></div></div></div><div className="footer-bottom"><span>© 2026 CHUZOSHO. ALL RIGHTS RESERVED.</span><nav className="footer-legal"><a href="/privacy-policy/">Privacy Policy</a><a href="/accessibility/">Accessibility Statement</a><a href="/terms-of-use/">Terms of Use</a><a href="/cookies-policy/">Cookies Policy</a></nav></div></div></footer>;
}
