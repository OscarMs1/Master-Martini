/* Master Martini — solo tratamiento visual no destructivo de /nosotros.
   Conservar sin cambios Nosotros.jsx, navegación y contenido del servidor. */
(() => {
  const clean = (text) => (text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').replace(/[.!]/g, '').trim().toLowerCase();
  const headings = () => [...document.querySelectorAll('main h1, main h2, main h3')];
  const findHeading = (name) => headings().find((h) => clean(h.textContent) === name);

  function innerChild(section, node) {
    let current = node;
    while (current?.parentElement && current.parentElement !== section) current = current.parentElement;
    return current && current !== section ? current : null;
  }

  function markIntro() {
    const heading = findHeading('lo que hacemos');
    const section = heading?.closest('section');
    if (!section) return;
    section.classList.add('mm-nosotros-crema-intro');
    innerChild(section, heading)?.classList.add('mm-nosotros-intro-inner');
    heading.classList.add('mm-nosotros-title');

    const description = [...section.querySelectorAll('p')].find((p) =>
      clean(p.textContent).startsWith('creemos que detras de cada gran creacion')
    );
    description?.classList.add('mm-nosotros-lead');

    if (section.querySelector('.mm-nosotros-hojas-mark')) return;
    const headingRect = heading.getBoundingClientRect();
    const centerX = headingRect.left + headingRect.width / 2;
    const candidates = [...section.querySelectorAll('svg, img, [class*="estrella"], [class*="star"]')]
      .filter((node) => {
        const r = node.getBoundingClientRect();
        return r.width >= 14 && r.width <= 170 && r.height >= 14 && r.height <= 160 &&
          r.bottom <= headingRect.top + 15 && Math.abs((r.left + r.width / 2) - centerX) < 180;
      }).sort((a, b) => Math.abs(headingRect.top - a.getBoundingClientRect().bottom) -
                       Math.abs(headingRect.top - b.getBoundingClientRect().bottom));
    const glyph = candidates[0];
    const wrapper = glyph?.parentElement;
    if (!wrapper || wrapper === section || wrapper.contains(heading)) return;
    const rect = wrapper.getBoundingClientRect();
    if (rect.width > 240 || rect.height > 200) return;
    wrapper.classList.add('mm-nosotros-hojas-mark');
  }

  function markEssence() {
    const heading = findHeading('el oficio detras de cada creacion');
    const section = heading?.closest('section');
    if (!section) return;
    section.classList.add('mm-nosotros-essence-section');
    heading.classList.add('mm-nosotros-essence-title');
    // Localizar el bloque textual completo, sin capturar la fotografía vecina.
    let copy = heading.parentElement;
    const hasLink = (el) => !![...el.querySelectorAll('a')]
      .find((a) => clean(a.textContent).includes('explorar nuestros productos'));
    while (copy && copy !== section && !hasLink(copy)) copy = copy.parentElement;
    if (!copy || copy === section || copy.querySelector('img')) copy = heading.parentElement;
    if (!copy || copy === section) return;
    copy.classList.add('mm-nosotros-essence-copy');
    let grid = copy.parentElement;
    while (grid && grid !== section && !grid.querySelector('img')) grid = grid.parentElement;
    if (grid && grid !== section) grid.classList.add('mm-nosotros-essence-grid');
  }

  function markLines() {
    const heading = findHeading('un mundo de posibilidades');
    const section = heading?.closest('section');
    if (!section) return;
    section.classList.add('mm-nosotros-lines-section');
    heading.classList.add('mm-nosotros-lines-title');
    // El encabezado es un grupo independiente, antes de las 4 especialidades.
    let group = heading.parentElement;
    while (group && group !== section && !group.querySelector('p')) group = group.parentElement;
    if (group && group !== section) group.classList.add('mm-nosotros-lines-heading');
    const links = [...section.querySelectorAll('a[href*="categoria="]')];
    if (links.length < 4) return;
    let grid = links[0].parentElement;
    while (grid && grid !== section && !links.every((link) => grid.contains(link))) grid = grid.parentElement;
    if (grid && grid !== section) grid.classList.add('mm-nosotros-lines-grid');
  }

  function apply() {
    if (location.pathname.replace(/\/+$/, '') !== '/nosotros') return;
    markIntro(); markEssence(); markLines();
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; apply(); });
  }
  function ready() {
    schedule();
    const root = document.getElementById('root');
    if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    window.addEventListener('popstate', schedule);
    document.addEventListener('visibilitychange', schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
