const routes = [
  ["Home", "/"],
  ["Foundry", "/about/"],
  ["Approach", "/approach/"],
  ["Solutions", "/solutions/"],
  ["Partnership", "/partnership/"],
  ["Contact Us", "/contact/"],
];

const currentPath = () => {
  const path = window.location.pathname.replace(/index\.html$/, "");
  return path.endsWith("/") ? path : `${path}/`;
};

const activeRoute = (href) => {
  const current = currentPath();
  if (href === "/") return current === "/";
  return current.startsWith(href);
};

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header" data-header>
        <div class="nav-shell">
          <a class="brand" href="/" aria-label="Chuzosho homepage">
            <span class="brand-mark" aria-hidden="true">CZ</span>
            <span class="brand-name">CHUZOSHO</span>
          </a>
          <button class="nav-toggle" type="button" aria-label="Open navigation" aria-controls="primary-navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <nav id="primary-navigation" class="nav-links" aria-label="Primary navigation">
            ${routes.map(([label, href]) => `<a class="nav-link" href="${href}" ${activeRoute(href) ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
        </div>
      </header>`;

    const header = this.querySelector("[data-header]");
    const toggle = this.querySelector(".nav-toggle");
    const nav = this.querySelector(".nav-links");

    const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 18);
    const closeNavigation = () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      document.body.classList.remove("nav-open");
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      document.body.classList.toggle("nav-open", open);
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation();
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="footer-shell">
          <div class="footer-top">
            <div class="footer-brand">
              <a class="brand" href="/" aria-label="Chuzosho homepage"><span class="brand-mark" aria-hidden="true">CZ</span><span>CHUZOSHO</span></a>
              <p>A Hosho Digital Company.</p>
              <div class="footer-socials" aria-label="Social media">
                <a href="https://www.linkedin.com/company/hoshodigital" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://x.com/HoshoDigital" target="_blank" rel="noreferrer">X</a>
                <a href="https://www.instagram.com/hoshodigital/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.youtube.com/@HoshoDigital" target="_blank" rel="noreferrer">YouTube</a>
              </div>
            </div>
            <div class="footer-nav">
              <div><h2>Foundry</h2><a href="/about/">About</a><a href="/approach/">Approach</a><a href="/partnership/">Partnership</a></div>
              <div><h2>Solutions</h2><a href="/solutions/isld/">ISLD</a><a href="/solutions/iprocure/">IProcure</a><a href="/solutions/igrc/">IGRC</a></div>
              <div><h2>Contact</h2><a href="/contact/">Contact Us</a></div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${year} CHUZOSHO. ALL RIGHTS RESERVED.</span>
            <span class="footer-legal"><a href="/privacy-policy/">Privacy Policy</a><a href="/accessibility/">Accessibility Statement</a><a href="/terms-of-use/">Terms of Use</a><a href="/cookies-policy/">Cookies Policy</a></span>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealNodes = document.querySelectorAll("[data-reveal]");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
  revealNodes.forEach((node) => observer.observe(node));
}

document.querySelectorAll("form[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    if (status) {
      status.hidden = false;
      status.textContent = "The secure submission endpoint is being connected. No information has been sent.";
      status.focus();
    }
    window.setTimeout(() => { button.disabled = false; }, 3000);
  });
});
