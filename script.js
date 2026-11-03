(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rodapé: ano
  $('[data-year]').textContent = new Date().getFullYear();

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
  $$('.tabs [role=tab]').forEach(tab => tab.addEventListener('click', () => {
    $$('.tabs [role=tab]').forEach(t => t.setAttribute('aria-selected', t === tab));
    const name = tab.dataset.tab;
    shot.hidden = false; note.hidden = true;
    shot.src = `assets/img/${name}.png`;
    shot.alt = `${tab.textContent} do Nullwaves Prontuário`;
  }));

  // Formulário: sem backend, abre o e-mail do usuário já preenchido
  const form = $('[data-form]'), out = $('.form-note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { out.textContent = 'Preencha nome, e-mail válido e mensagem.'; form.reportValidity(); return; }
    const d = new FormData(form);
    const body = `${d.get('msg')}\n\n— ${d.get('nome')} (${d.get('email')})`;
    location.href = `mailto:contato@nullwaves.systems?subject=${encodeURIComponent(d.get('assunto'))}&body=${encodeURIComponent(body)}`;
    out.textContent = 'Abrimos seu aplicativo de e-mail para finalizar o envio.';
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
  gsap.from('.caps article', { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power2.out',
    scrollTrigger: { trigger: '.caps', start: 'top 80%', once: true } });
  $$('.product').forEach(p => gsap.from(p.children, { y: 30, opacity: 0, duration: .9, stagger: .15, ease: 'power2.out',
    scrollTrigger: { trigger: p, start: 'top 80%', once: true } }));
})();
