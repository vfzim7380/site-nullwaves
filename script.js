/* ===== CONFIGURAÇÃO DE LINKS =====
 * Informe aqui as URLs definitivas (páginas comerciais são projetos separados deste site).
 * PRECISA SER PREENCHIDO: prontuario -> página comercial do Nullwaves Prontuário.
 *   Enquanto vazio, o botão "Conhecer o produto" fica desativado e o link do rodapé não aparece.
 * OPCIONAL: nixie -> página da NIXIE.IA / integração ao produto. Vazio = botão oculto. */
const NW_LINKS = {
  prontuario: '', // ex.: 'https://...'  <- URL a ser fornecida
  nixie: ''       // ex.: 'https://...'  (somente se existir página específica)
};

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rodapé: ano
  $('[data-year]').textContent = new Date().getFullYear();

  // Links configuráveis (produtos)
  $$('[data-link]').forEach(a => {
    const url = (NW_LINKS[a.dataset.link] || '').trim();
    if (url) { a.href = url; a.hidden = false; return; }
    if (a.dataset.fallback === 'disable') {
      a.setAttribute('aria-disabled', 'true'); a.removeAttribute('href'); a.setAttribute('role', 'link');
      a.title = 'Página do produto indisponível no momento';
      a.addEventListener('click', e => e.preventDefault());
      console.warn(`[Nullwaves] Defina NW_LINKS.${a.dataset.link} em script.js para ativar o botão "${a.textContent.trim()}".`);
    } else a.hidden = true;
  });

  // Navegação
  const menu = $('#menu'), toggle = $('.nav-toggle');
  // Tema claro/escuro (salvo no navegador)
  const root = document.documentElement, tbtn = $('[data-theme-toggle]');
  const paint = () => {
    const dark = root.dataset.theme === 'dark';
    $('.theme-label', tbtn).textContent = dark ? 'Light' : 'Dark';
    $('.theme-icon', tbtn).textContent = dark ? '☼' : '☾';
    tbtn.setAttribute('aria-pressed', dark);
  };
  paint();
  tbtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('nw-theme', root.dataset.theme); } catch (e) {}
    paint();
  });
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  const closeMenu = () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  addEventListener('resize', () => { if (innerWidth >= 1280) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.navbar')) closeMenu(); });
  // Destaque do item de menu da seção visível
  const links = $$('a[href^="#"]:not(.btn)', menu).filter(a => $(a.getAttribute('href')));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(l => l.getAttribute('href') === '#' + en.target.id ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')) }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => io.observe($(l.getAttribute('href'))));
  }
  $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));

  // Telas do produto: se a imagem não existir, mostra aviso em vez de ícone quebrado
  $$('[data-shot]').forEach(img => {
    const fail = () => {
      const note = img.parentElement.querySelector('.missing');
      img.hidden = true; note.hidden = false;
      note.querySelector('code').textContent = img.getAttribute('src');
    };
    img.addEventListener('error', fail);
    if (img.complete && !img.naturalWidth) fail();
  });

  // Abas do Prontuário
  const shot = $('[data-screen] img'), note = $('[data-screen] .missing');
  const tabs = $$('.tabs [role=tab]'), panel = $('#screen-pront');
  const select = (tab, focus) => {
    tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    const name = tab.dataset.tab, src = `assets/img/${name}.png`;
    shot.classList.add('swap');
    setTimeout(() => {
      shot.hidden = false; note.hidden = true; shot.src = src;
      shot.alt = `${tab.textContent} do Nullwaves Prontuário`;
      shot.classList.remove('swap');
    }, reduce ? 0 : 180);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });

  // Formulário: sem backend, abre o e-mail do usuário já preenchido
  const form = $('[data-form]'), out = $('.form-note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    $$('input,textarea', form).forEach(f => f.setAttribute('aria-invalid', !f.checkValidity()));
    if (!form.checkValidity()) { out.textContent = 'Preencha nome, e-mail válido e mensagem.'; form.reportValidity(); return; }
    const d = new FormData(form);
    const body = `${d.get('msg')}\n\n— ${d.get('nome')} (${d.get('email')})`;
    location.href = `mailto:contato@nullwaves.systems?subject=${encodeURIComponent(d.get('assunto'))}&body=${encodeURIComponent(body)}`;
    out.textContent = 'Abrimos seu aplicativo de e-mail. Finalize o envio por lá.';
  });

  // Animações (GSAP)
  if (reduce || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero: símbolo se desenha, texto entra, órbitas à deriva
  const mark = $('.hero-mark path'), len = mark.getTotalLength();
  gsap.set(mark, { strokeDasharray: len, strokeDashoffset: len });
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to(mark, { strokeDashoffset: 0, duration: 1.4 }, 0)
    .from('.hero-in > :not(.hero-mark)', { y: 26, opacity: 0, duration: .9, stagger: .1 }, .2);
  gsap.to('.o1', { x: -30, rotate: -20, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.o2', { x: 30, rotate: -28, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  $$('.o3,.o4').forEach(o => gsap.to(o, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: o.parentElement, scrub: true } }));

  // Visão: palavras acendem conforme o scroll
  const st = $('[data-words]');
  st.innerHTML = st.textContent.trim().split(' ').map(w => `<span class="w">${w}</span> `).join('');
  gsap.to($$('.w', st), { opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true } });

  // Entradas discretas só onde ajudam
  $$('.caps').forEach(c => gsap.from($$('article', c), { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power2.out',
    scrollTrigger: { trigger: c, start: 'top 80%', once: true } }));

  // Como trabalhamos: a linha se desenha e as etapas surgem em sequência
  const sw = $('.steps-wrap');
  gsap.fromTo(sw, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: sw, start: 'top 75%', end: 'bottom 70%', scrub: true } });
  gsap.from($$('.steps li'), { y: 24, opacity: 0, duration: .7, stagger: .15, ease: 'power2.out',
    scrollTrigger: { trigger: sw, start: 'top 80%', once: true } });
  $$('.product').forEach(p => gsap.from(p.children, { y: 30, opacity: 0, duration: .9, stagger: .15, ease: 'power2.out',
    scrollTrigger: { trigger: p, start: 'top 80%', once: true } }));
})();
