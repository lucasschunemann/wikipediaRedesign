// Melhorias progressivas da página do artigo.
// Sem este arquivo a página continua legível e navegável: o sumário é uma lista de links,
// as referências levam à lista no fim e os botões do cabeçalho abrem as páginas da Wikipédia.
(function () {
  'use strict';

  const DATA = JSON.parse(document.getElementById('dados').textContent);
  const S = DATA.strings;
  const P = DATA.page;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const fmt = (t, ...a) => t.replace(/\{(\d)\}/g, (_, i) => a[i]);
  const nf = new Intl.NumberFormat(S.locale);
  const small = matchMedia('(max-width: 47.99em)');
  const rail = matchMedia('(min-width: 64em)');
  const body = $('.article-body');

  function h(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null) node.append(kid);
    return node;
  }
  // Fecha um <dialog> e roda a limpeza na hora. O evento 'close' é assíncrono e o navegador
  // pode adiá-lo em abas em segundo plano; ele continua ligado para os fechamentos nativos (Esc em modal).
  function closeDialog(d) {
    // Guarda se o foco estava dentro, para devolvê-lo a quem abriu.
    d.dataset.hadFocus = d.contains(document.activeElement) ? '1' : '';
    if (d.open) d.close();
    d.dispatchEvent(new Event('fechado'));
  }
  function onClosed(d, fn) {
    let done = true;
    const run = () => {
      if (done) return;
      done = true;
      fn();
    };
    d.addEventListener('close', run);
    d.addEventListener('fechado', run);
    return () => {
      done = false;
    };
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function dateLong(iso, withYear = true) {
    const d = new Date(iso);
    const base = `${d.getDate()} de ${S.months[d.getMonth()]}`;
    return withYear ? `${base} de ${d.getFullYear()}` : base;
  }
  function dateShort(iso) {
    const d = new Date(iso);
    const time = d.toLocaleTimeString(S.locale, { hour: '2-digit', minute: '2-digit' });
    return `${d.getDate()} ${S.monthsShort[d.getMonth()]} ${d.getFullYear()}, ${time}`;
  }
  function duration(ms) {
    const s = Math.round(ms / 1000);
    const pick = (n, u) => `${n} ${S.units[u][n === 1 ? 0 : 1]}`;
    if (s < 60) return pick(s, 's');
    if (s < 3600) return pick(Math.round(s / 60), 'm');
    if (s < 86400) return pick(Math.round(s / 3600), 'h');
    return pick(Math.round(s / 86400), 'd');
  }

  // Elementos que só fazem sentido com JavaScript.
  $$('.find, [data-close]').forEach((el) => el.removeAttribute('hidden'));
  $$('.sections-head [data-close]').forEach((el) => el.setAttribute('hidden', ''));

  /* ---------- Preferências de leitura ---------- */

  const PREF_KEY = 'leitura';
  const DEFAULTS = { theme: 'auto', font: 'serif', size: '0', leading: 'normal', measure: 'normal' };
  let prefs = {};
  try {
    prefs = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
  } catch {
    prefs = {};
  }
  function getPref(k) {
    return prefs[k] ?? DEFAULTS[k];
  }
  function setPref(k, v) {
    if (v === DEFAULTS[k]) {
      delete prefs[k];
      root.removeAttribute(`data-${k}`);
    } else {
      prefs[k] = v;
      root.setAttribute(`data-${k}`, v);
    }
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {
      // Navegação privada ou armazenamento bloqueado: a escolha vale só para esta visita.
    }
    queueUpdate();
  }

  /* ---------- Estrutura de seções ---------- */

  const tocLinks = $$('.toc a[data-target]');
  const headings = $$('.article-body h2[id], .article-body h3[id], .article-body h4[id]');
  // Caminho de cada seção ("Cultivo › Portugal › Açores"), a partir do sumário.
  const sectionPath = new Map();
  for (const a of tocLinks) {
    const names = [];
    let li = a.parentElement;
    while (li && li.tagName === 'LI') {
      names.unshift(li.querySelector(':scope > a').firstChild.textContent.trim());
      li = li.parentElement.closest('li');
    }
    sectionPath.set(a.dataset.target, names);
  }
  const pathOf = (id) => (sectionPath.get(id) || [S.introduction]).join(' › ');
  const sectionIdOf = (node) => {
    const sec = node.closest && node.closest('section[data-heading]');
    return sec ? sec.dataset.heading : 'inicio';
  };

  let currentId = null;
  const topSection = $('.topbar-section');
  const bottomSection = $('.bottombar-current');

  function topOffset() {
    return small.matches ? 0 : $('.topbar').getBoundingClientRect().height;
  }

  function updateCurrent() {
    const line = topOffset() + window.innerHeight * 0.25;
    let id = 'inicio';
    for (const hd of headings) {
      if (hd.getBoundingClientRect().top <= line) id = hd.id;
      else break;
    }
    if (id === currentId) return;
    currentId = id;
    for (const a of tocLinks) {
      if (a.dataset.target === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
    const label = pathOf(id);
    if (topSection) topSection.textContent = label;
    if (bottomSection) bottomSection.textContent = label;
    // Mantém o item atual visível no sumário lateral, sem rolar a página.
    const link = tocLinks.find((a) => a.dataset.target === id);
    const nav = $('.layout > .sections');
    if (link && nav && rail.matches && nav.contains(link)) {
      const r = link.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      if (r.top < n.top + 40 || r.bottom > n.bottom - 40) nav.scrollTop += r.top - n.top - n.height / 3;
    }
  }

  let ticking = false;
  function queueUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateCurrent();
      positionRefnote();
    });
  }
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);

  function scrollToNode(node, ratio = 0) {
    const rect = node.getBoundingClientRect();
    const y = window.scrollY + rect.top - topOffset() - 16 - window.innerHeight * ratio;
    window.scrollTo(0, Math.max(0, y));
  }

  function focusNode(node) {
    if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });
  }

  function goTo(id) {
    const target = id === 'inicio' ? $('.article-header') : document.getElementById(id);
    if (!target) return;
    history.pushState(null, '', `#${id}`);
    scrollToNode(target);
    focusNode(id === 'inicio' ? $('.article h1') : target);
    updateCurrent();
  }

  /* ---------- Painel de seções em telas estreitas ---------- */

  const secNav = $('#secoes');
  const secInner = $('.sections-inner');
  const secDialog = $('#secoes-painel');
  let secOpener = null;

  const armSections = onClosed(secDialog, () => {
    $('.sections-head [data-close]', secInner).setAttribute('hidden', '');
    secNav.append(secInner);
    if (secOpener) secOpener.focus();
    secOpener = null;
  });
  function openSections(opener) {
    armSections();
    secOpener = opener || null;
    secDialog.append(secInner);
    $('.sections-head [data-close]', secDialog).removeAttribute('hidden');
    secDialog.showModal();
    const cur = $('.toc a[aria-current]', secDialog) || $('.toc a', secDialog);
    cur.scrollIntoView({ block: 'center' });
    cur.focus();
  }
  rail.addEventListener('change', () => {
    if (rail.matches && secDialog.open) closeDialog(secDialog);
  });

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      if (opener.dataset.open === 'sections') openSections(opener);
      else openPanel(opener.dataset.open, opener);
      return;
    }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      closeDialog(closer.closest('dialog'));
      return;
    }
    const tocLink = e.target.closest('.toc a[data-target]');
    if (tocLink) {
      e.preventDefault();
      const id = tocLink.dataset.target;
      if (secDialog.open) {
        secOpener = null;
        closeDialog(secDialog);
      }
      goTo(id);
    }
  });

  /* ---------- Busca no artigo ---------- */

  const findForm = $('.find');
  const findInput = $('#busca-artigo');
  const findClear = $('.find [data-clear]');
  const results = $('#busca-resultados');
  results.removeAttribute('aria-live');
  const toc = $('.toc');
  const hasHighlights = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';

  const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const isWordChar = (c) => !!c && /[\p{L}\p{N}]/u.test(c);
  let index = null;

  function kindOf(node) {
    if (node.closest('.infobox, .sister-box')) return 'infobox';
    if (node.closest('figcaption')) return 'caption';
    if (node.closest('.mw-references-wrap, .references')) return 'reference';
    if (node.closest('.notice, .hatnote')) return 'notice';
    if (node.closest('.navbox, .collapsible, .collapsible-wrap, .portal-bar')) return 'navbox';
    return 'text';
  }

  // Cada bloco guarda o texto normalizado e, para cada caractere, o nó e a posição de origem.
  // Assim "cha" encontra "Chá" e o destaque cai exatamente sobre as letras originais.
  function buildIndex() {
    const sel = 'p, li, dd, dt, figcaption, th, td, h2, h3, h4, .notice, .hatnote, summary, .infobox-title';
    const blocks = $$(sel, body).filter((b) => !b.querySelector(sel) && !b.closest('.infobox-index'));
    return blocks.map((block) => {
      let text = '';
      let orig = '';
      const map = [];
      const origMap = [];
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) => {
          const el = n.nodeType === 1 ? n : n.parentElement;
          if (el.closest('sup.reference, .printfooter, [style*="display:none"], .Z3988')) return NodeFilter.FILTER_REJECT;
          return n.nodeType === 3 || n.tagName === 'BR' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        },
      });
      let n;
      let last = null;
      while ((n = walker.nextNode())) {
        // Quebra de linha vira espaço, para "açúcar<br>tanino" não virar "açúcartanino".
        if (n.nodeType === 1) {
          if (last) {
            orig += ' ';
            origMap.push(last);
            text += ' ';
            map.push(orig.length - 1);
          }
          continue;
        }
        const v = n.nodeValue;
        if (v.length) last = [n, v.length - 1];
        for (let i = 0; i < v.length; i++) {
          const o = orig.length;
          orig += v[i];
          origMap.push([n, i]);
          const nc = norm(v[i]);
          for (const c of nc) {
            text += c;
            map.push(o);
          }
        }
      }
      return { block, text, orig, map, origMap, kind: kindOf(block), section: sectionIdOf(block) };
    });
  }

  function findHits(query, { wholeWord = false, kinds = null } = {}) {
    if (!index) index = buildIndex();
    const q = norm(query.trim());
    if (q.length < 2) return [];
    const hits = [];
    for (const b of index) {
      if (kinds && !kinds.includes(b.kind)) continue;
      let i = b.text.indexOf(q);
      while (i !== -1) {
        const ok = !wholeWord || (!isWordChar(b.text[i - 1]) && !isWordChar(b.text[i + q.length]));
        if (ok) {
          const os = b.map[i];
          const oe = b.map[i + q.length - 1] + 1;
          hits.push({ b, os, oe });
        }
        i = b.text.indexOf(q, i + q.length);
      }
    }
    return hits;
  }

  function rangeOf(hit) {
    const r = document.createRange();
    const [sn, so] = hit.b.origMap[hit.os];
    const [en, eo] = hit.b.origMap[hit.oe - 1];
    r.setStart(sn, so);
    r.setEnd(en, eo + 1);
    return r;
  }

  let hits = [];
  let active = -1;

  function paint() {
    if (!hasHighlights) return;
    CSS.highlights.delete('busca');
    CSS.highlights.delete('busca-atual');
    if (!hits.length) return;
    CSS.highlights.set('busca', new Highlight(...hits.map(rangeOf)));
    if (active >= 0) CSS.highlights.set('busca-atual', new Highlight(rangeOf(hits[active])));
  }

  function activate(i, { focusContent = false } = {}) {
    if (!hits.length) return;
    active = (i + hits.length) % hits.length;
    const hit = hits[active];
    const closed = hit.b.block.closest('details:not([open])');
    if (closed) closed.open = true;
    paint();
    $$('.find-hit', results).forEach((b, j) => b.setAttribute('aria-current', j === active ? 'true' : 'false'));
    const doScroll = () => {
      const rect = rangeOf(hit).getBoundingClientRect();
      window.scrollTo(0, Math.max(0, window.scrollY + rect.top - window.innerHeight * 0.3));
      if (!hasHighlights) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rangeOf(hit));
      }
      if (focusContent) focusNode(hit.b.block);
      updateCurrent();
    };
    if (secDialog.open) {
      secOpener = null;
      closeDialog(secDialog);
    }
    doScroll();
  }

  function snippet(hit) {
    const o = hit.b.orig;
    const a = Math.max(0, hit.os - 50);
    const z = Math.min(o.length, hit.oe + 70);
    return (
      (a > 0 ? '… ' : '') +
      esc(o.slice(a, hit.os)) +
      '<mark>' +
      esc(o.slice(hit.os, hit.oe)) +
      '</mark>' +
      esc(o.slice(hit.oe, z)) +
      (z < o.length ? ' …' : '')
    );
  }

  function runSearch() {
    const q = findInput.value;
    findClear.hidden = !q;
    hits = q.trim().length >= 2 ? findHits(q) : [];
    active = -1;
    paint();
    results.replaceChildren();
    if (q.trim().length < 2) {
      results.hidden = true;
      toc.hidden = false;
      return;
    }
    results.hidden = false;
    toc.hidden = true;
    if (!hits.length) {
      results.append(h('p', { class: 'find-summary', role: 'status', text: fmt(S.searchNoResults, q.trim()) }));
      return;
    }
    const groups = new Map();
    hits.forEach((hit, i) => {
      if (!groups.has(hit.b.section)) groups.set(hit.b.section, []);
      groups.get(hit.b.section).push(i);
    });
    const summary =
      hits.length === 1 ? S.searchResult1 : groups.size === 1 ? fmt(S.searchResultsOneSection, hits.length) : fmt(S.searchResults, hits.length, groups.size);
    results.append(h('p', { class: 'find-summary', role: 'status', text: summary }));
    for (const [sec, list] of groups) {
      results.append(
        h(
          'section',
          { class: 'find-group' },
          h('h3', {}, `${pathOf(sec)} `, h('span', { class: 'toc-count', text: `(${list.length})` })),
          h(
            'ol',
            {},
            list.map((i) =>
              h(
                'li',
                {},
                h(
                  'button',
                  { type: 'button', class: 'find-hit', onclick: () => activate(i, { focusContent: true }) },
                  h('span', { html: snippet(hits[i]) }),
                  hits[i].b.kind !== 'text' ? h('span', { class: 'find-where', text: S.searchIn[hits[i].b.kind] }) : null,
                ),
              ),
            ),
          ),
        ),
      );
    }
  }

  let searchTimer;
  findInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runSearch, 120);
  });
  findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimer);
      if (!hits.length) runSearch();
      activate(e.shiftKey ? active - 1 : active + 1);
    } else if (e.key === 'Escape' && findInput.value) {
      e.preventDefault();
      e.stopPropagation();
      findInput.value = '';
      runSearch();
    }
  });
  findForm.addEventListener('submit', (e) => e.preventDefault());
  findClear.addEventListener('click', () => {
    findInput.value = '';
    runSearch();
    findInput.focus();
  });

  /* ---------- Referências ---------- */

  const refnote = $('#nota');
  const refTitle = $('#nota-titulo');
  const refBody = $('.refnote-body');
  let refLink = null;

  function positionRefnote() {
    if (!refnote.open || !refLink || small.matches) return;
    const r = refLink.getBoundingClientRect();
    const w = refnote.offsetWidth;
    const hgt = refnote.offsetHeight;
    const docW = document.documentElement.clientWidth;
    let left = r.left + window.scrollX - 24;
    left = Math.max(window.scrollX + 16, Math.min(left, window.scrollX + docW - w - 16));
    let top = r.bottom + window.scrollY + 8;
    if (r.bottom + hgt + 16 > window.innerHeight && r.top - hgt - 8 > topOffset()) top = r.top + window.scrollY - hgt - 8;
    refnote.style.left = `${left}px`;
    refnote.style.top = `${top}px`;
  }

  function openRef(link) {
    const sup = link.closest('sup.reference');
    const noteId = sup.dataset.note;
    const li = document.getElementById(noteId);
    if (!li) return false;
    if (refLink === link && refnote.open) {
      closeDialog(refnote);
      return true;
    }
    if (refnote.open) closeDialog(refnote);
    armRefnote();
    refLink = link;
    const num = link.textContent.replace(/[[\]]/g, '').trim();
    refTitle.textContent = fmt(S.refDialog, num);
    const text = (li.querySelector('.reference-text') || li).cloneNode(true);
    text.removeAttribute('id');
    $$('[id]', text).forEach((n) => n.removeAttribute('id'));
    const uses = $$(`sup.reference[data-note="${CSS.escape(noteId)}"]`).length;
    refBody.replaceChildren(
      ...[
        h('p', {}, ...text.childNodes),
        uses > 1 ? h('p', { class: 'note', text: fmt(S.refUsedTimes, uses) }) : null,
        h('p', { class: 'note' }, h('a', { href: `#${noteId}`, 'data-go': noteId, text: S.refGoToList })),
      ].filter(Boolean),
    );
    link.setAttribute('aria-expanded', 'true');
    // O título recebe o foco ao abrir (autofocus), para o leitor de tela anunciar a referência.
    refTitle.setAttribute('tabindex', '-1');
    refTitle.setAttribute('autofocus', '');
    if (small.matches) {
      refnote.style.top = refnote.style.left = '';
      refnote.showModal();
    } else {
      // Posiciona antes de abrir: show() move o foco, e o foco num elemento fora da tela rolaria a página.
      const r = link.getBoundingClientRect();
      refnote.style.top = `${r.bottom + window.scrollY + 8}px`;
      refnote.style.left = `${Math.max(16, r.left + window.scrollX - 24)}px`;
      refnote.show();
      positionRefnote();
    }
    refTitle.focus({ preventScroll: true });
    return true;
  }

  const armRefnote = onClosed(refnote, () => {
    if (refLink) {
      refLink.setAttribute('aria-expanded', 'false');
      if (refnote.dataset.hadFocus || refnote.contains(document.activeElement) || document.activeElement === document.body) refLink.focus({ preventScroll: true });
    }
    refLink = null;
  });

  $$('sup.reference a').forEach((a) => {
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-controls', 'nota');
    a.setAttribute('aria-haspopup', 'dialog');
  });

  body.addEventListener('click', (e) => {
    const a = e.target.closest('sup.reference a');
    if (a && openRef(a)) e.preventDefault();
  });

  refBody.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    e.preventDefault();
    closeDialog(refnote);
    $$('.is-target').forEach((n) => n.classList.remove('is-target'));
    const li = document.getElementById(go.dataset.go);
    li.classList.add('is-target');
    history.pushState(null, '', `#${go.dataset.go}`);
    scrollToNode(li, 0.2);
    focusNode(li);
  });

  // Clique fora fecha a prévia não modal.
  document.addEventListener('pointerdown', (e) => {
    if (refnote.open && !refnote.contains(e.target) && !e.target.closest('sup.reference')) closeDialog(refnote);
    if (panel.open && !small.matches && !panel.contains(e.target) && !e.target.closest('[data-panel], [data-open]')) closeDialog(panel);
  });

  /* ---------- Painéis do artigo e opções de leitura ---------- */

  const panel = $('#painel');
  const panelTitle = $('#painel-titulo');
  const panelBody = $('.panel-body');
  let panelOpener = null;
  let panelId = null;
  let dataPromise = null;
  const loadData = () =>
    (dataPromise ||= fetch('assets/cha-dados.json').then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }));

  const fallbackUrl = {};
  $$('a[data-panel]').forEach((a) => {
    fallbackUrl[a.dataset.panel] = a.href;
    a.setAttribute('role', 'button');
    a.setAttribute('aria-haspopup', 'dialog');
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-controls', 'painel');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openPanel(a.dataset.panel, a);
    });
    a.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        openPanel(a.dataset.panel, a);
      }
    });
  });

  const builders = {
    options: { title: () => S.readingOptions, build: buildOptions },
    languages: { title: (d) => fmt(S.languagesTitle, d ? d.languages.length : ''), build: buildLanguages, data: true },
    talk: { title: () => S.talk, build: buildTalk, data: true },
    history: { title: () => S.history, build: buildHistory, data: true },
    cite: { title: () => S.cite, build: buildCite },
  };

  async function openPanel(id, opener) {
    if (panel.open && panelId === id) {
      closeDialog(panel);
      return;
    }
    if (panel.open) closeDialog(panel);
    armPanel();
    const b = builders[id];
    panelId = id;
    panelOpener = opener || null;
    let data = null;
    if (b.data) {
      try {
        data = await loadData();
      } catch {
        panelTitle.textContent = b.title(null);
        panelBody.replaceChildren(
          h('p', {}, `${S.loadError} `, h('a', { href: fallbackUrl[id], text: fallbackUrl[id] })),
        );
      }
    }
    if (!b.data || data) {
      panelTitle.textContent = b.title(data);
      panelBody.replaceChildren(b.build(data));
    }
    $$('[aria-controls="painel"]').forEach((t) => t.setAttribute('aria-expanded', t === opener ? 'true' : 'false'));
    panelTitle.setAttribute('tabindex', '-1');
    panelTitle.setAttribute('autofocus', '');
    if (small.matches) panel.showModal();
    else panel.show();
    panel.scrollTop = 0;
    panelTitle.focus({ preventScroll: true });
  }

  const armPanel = onClosed(panel, () => {
    $$('[aria-controls="painel"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    if (panelOpener && (panel.dataset.hadFocus || panel.contains(document.activeElement) || document.activeElement === document.body)) panelOpener.focus();
    panelOpener = null;
    panelId = null;
  });

  // Esc fecha painéis não modais (os modais já fecham sozinhos).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (refnote.open && !small.matches) {
      closeDialog(refnote);
      e.preventDefault();
    } else if (panel.open && !small.matches) {
      closeDialog(panel);
      e.preventDefault();
    }
  });

  function radios(name, legend, options, current, onChange, hint, extraClass) {
    return h(
      'fieldset',
      { class: extraClass },
      h('legend', { text: legend }),
      h(
        'div',
        { class: `choices${Object.keys(options).length === 4 ? ' choices-4' : ''}` },
        Object.entries(options).map(([value, label]) =>
          h(
            'label',
            { class: `choice ${name === 'font' ? `swatch-${value}` : ''}` },
            h('input', {
              type: 'radio',
              name,
              value,
              checked: value === current,
              onchange: (e) => onChange(e.target.value),
            }),
            h('span', { text: label }),
          ),
        ),
      ),
      hint ? h('p', { class: 'choice-hint', text: hint }) : null,
    );
  }

  function buildOptions() {
    const sizes = ['-1', '0', '1', '2', '3'];
    const pct = { '-1': '90%', 0: '100%', 1: '112%', 2: '125%', 3: '142%' };
    const out = h('output', { 'aria-live': 'polite', text: pct[getPref('size')] });
    const step = (d) => {
      const i = Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(getPref('size')) + d));
      setPref('size', sizes[i]);
      out.textContent = pct[sizes[i]];
      down.disabled = i === 0;
      up.disabled = i === sizes.length - 1;
    };
    const down = h('button', { type: 'button', class: 'btn', 'aria-label': S.sizeDown, text: 'A−', onclick: () => step(-1) });
    const up = h('button', { type: 'button', class: 'btn', 'aria-label': S.sizeUp, text: 'A+', onclick: () => step(1) });
    down.disabled = getPref('size') === sizes[0];
    up.disabled = getPref('size') === sizes.at(-1);
    const form = h(
      'form',
      { class: 'options', onsubmit: (e) => e.preventDefault() },
      radios('theme', S.theme, S.themes, getPref('theme'), (v) => setPref('theme', v), S.themeHint),
      radios('font', S.font, S.fonts, getPref('font'), (v) => setPref('font', v), S.fontHint),
      h('fieldset', {}, h('legend', { text: S.size }), h('div', { class: 'stepper' }, down, out, up)),
      radios('leading', S.leading, S.leadings, getPref('leading'), (v) => setPref('leading', v)),
      radios('measure', S.measure, S.measures, getPref('measure'), (v) => setPref('measure', v), S.measureHint, 'only-wide'),
      h('div', { class: 'cite-actions' },
        h('button', {
          type: 'button',
          class: 'btn',
          text: S.resetOptions,
          onclick: () => {
            for (const k of Object.keys(DEFAULTS)) setPref(k, DEFAULTS[k]);
            panelBody.replaceChildren(buildOptions());
          },
        }),
      ),
      h('p', { class: 'note', text: S.optionsSaved }),
    );
    return form;
  }

  function buildLanguages(d) {
    const wrap = h('div', {});
    const input = h('input', { type: 'search', id: 'filtro-idiomas', autocomplete: 'off', spellcheck: 'false' });
    const list = h('div', {});
    const browser = [...new Set((navigator.languages || []).map((l) => l.split('-')[0].toLowerCase()))].filter((c) => c !== P.lang);
    const byName = [...d.languages].sort((a, b) => a.name.localeCompare(b.name, S.locale));

    const row = (l) => {
      const sameScript = l.script && l.script === P.script && l.bytes;
      const ratio = sameScript ? l.bytes / P.bytes : null;
      const sub = [l.name];
      if (ratio) sub.push(fmt(S.langSize, `${ratio.toLocaleString(S.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })}×`));
      return h(
        'li',
        {},
        h(
          'span',
          { class: 'row-main' },
          // "simple" é a Wikipédia em inglês simples, não um código de idioma.
          h('a', { href: l.url, hreflang: l.code === 'simple' ? 'en' : l.code, lang: l.code === 'simple' ? 'en' : l.code, text: l.autonym || l.name }),
          l.badges.length ? h('span', { class: 'tag', text: l.badges.map((b) => S.badge[b]).join(', ') }) : null,
        ),
        h('span', { class: 'row-sub', text: sub.join(' · ') }),
      );
    };
    const group = (title, items) =>
      items.length ? [h('h3', { text: title }), h('ul', { class: 'rows' }, items.map(row))] : [];

    function render() {
      const q = norm(input.value.trim());
      if (q) {
        const found = byName.filter((l) => [l.name, l.autonym, l.code, l.title].some((v) => v && norm(v).includes(q)));
        list.replaceChildren(...(found.length ? group(S.languagesAll, found) : [h('p', { role: 'status', text: S.languagesNone })]));
        return;
      }
      list.replaceChildren(
        ...group(S.languagesYours, browser.map((c) => d.languages.find((l) => l.code === c)).filter(Boolean)),
        ...group(S.languagesQuality, byName.filter((l) => l.badges.length)),
        ...group(S.languagesAll, byName),
      );
    }
    input.addEventListener('input', render);
    render();
    wrap.append(
      h('p', {}, h('label', { for: 'filtro-idiomas', class: 'find-label', text: S.languagesFilter }), input),
      list,
      h('p', { class: 'note', text: S.langSizeNote }),
    );
    return wrap;
  }

  function cleanComment(c) {
    return (c || '')
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
      .replace(/\/\*\s*(.*?)\s*\*\//g, '$1:')
      .trim();
  }

  function buildHistory(d) {
    const revs = d.revisions;
    const REVERT = ['mw-undo', 'mw-rollback', 'mw-manual-revert'];
    const items = revs.map((r, i) => {
      const older = revs[i + 1];
      const diff = older ? r.size - older.size : null;
      const isRevert = r.tags.some((t) => REVERT.includes(t));
      const reverted = r.tags.includes('mw-reverted');
      const lines = [h('span', { class: 'row-sub', text: `${r.user} · ${cleanComment(r.comment) || S.historyNoComment}` })];
      if (isRevert && older) lines.push(h('span', { class: 'row-sub', text: fmt(S.historyRevertAfter, duration(new Date(r.ts) - new Date(older.ts))) }));
      return h(
        'li',
        {},
        h(
          'span',
          { class: 'row-main' },
          h('a', { href: `https://${P.lang}.wikipedia.org/w/index.php?diff=${r.id}&oldid=${r.parent}`, text: dateShort(r.ts) }),
          h(
            'span',
            { class: 'row-side' },
            isRevert ? h('span', { class: 'tag', text: S.historyRevert }) : null,
            reverted ? h('span', { class: 'tag', text: S.historyReverted }) : null,
            diff != null ? ` ${diff > 0 ? '+' : ''}${nf.format(diff)}` : '',
          ),
        ),
        ...lines,
      );
    });
    return h(
      'div',
      {},
      h('p', { text: fmt(S.historySummary, nf.format(P.editCount), new Date(P.firstEdit).getFullYear(), nf.format(P.contributors)) }),
      h('p', { class: 'note', text: `${fmt(S.historyViews, nf.format(d.pageviews))} ${fmt(S.historyWatchers, nf.format(P.watchers))}` }),
      h('h3', { text: S.historyRecent }),
      h('ul', { class: 'rows' }, items),
      h('p', {}, h('a', { href: P.urls.history, text: S.historyFull })),
      h('p', {}, h('a', { href: P.urls.info, text: S.historyInfo })),
    );
  }

  function buildTalk(d) {
    const t = d.talk;
    return h(
      'div',
      {},
      h('p', { text: S.talkIntro }),
      h('h3', { text: `${S.talkTopics} (${t.topics.length})` }),
      t.topics.length
        ? h(
            'ul',
            { class: 'rows' },
            t.topics.map((tp) => h('li', {}, h('a', { href: `${P.urls.talk}#${encodeURIComponent(tp.anchor)}`, text: tp.title }))),
          )
        : h('p', { text: S.talkEmpty }),
      t.lastEdit ? h('p', { class: 'note', text: fmt(S.talkLast, dateLong(t.lastEdit.timestamp)) }) : null,
      h('p', {}, h('a', { href: P.urls.talk, text: S.talkOpen })),
    );
  }

  // Formatos de citação. ABNT e NP 405 seguem o modelo da página Especial:Citar da pt.wikipedia.
  // Diferenças: a data de acesso é a de hoje (lá aparece a data da revisão)
  // e os formatos internacionais não misturam inglês e português.
  function citations() {
    const rev = new Date(P.timestamp);
    const now = new Date();
    const y = rev.getFullYear();
    const url = P.urls.permanent;
    const short = (d) => `${d.getDate()} ${S.monthsShort[d.getMonth()]} ${d.getFullYear()}`;
    const long = (d) => `${d.getDate()} de ${S.months[d.getMonth()]} de ${d.getFullYear()}`;
    const iso = (d) => d.toISOString().slice(0, 10);
    const t = P.title;
    return {
      ABNT: `${t.toLocaleUpperCase(S.locale)}. In: WIKIPÉDIA, a enciclopédia livre. Flórida: Wikimedia Foundation, ${y}. Disponível em: <${url}>. Acesso em: ${short(now)}.`,
      'NP 405': `${t}. In: Wikipédia, a enciclopédia livre [Em linha]. Flórida: Wikimedia Foundation, ${y}, rev. ${long(rev)}. [Consult. ${short(now)}]. Disponível em WWW:<${url}>.`,
      APA: `${t}. (${y}, ${rev.getDate()} de ${S.months[rev.getMonth()]}). Em Wikipédia, a enciclopédia livre. Recuperado em ${long(now)}, de ${url}`,
      MLA: `“${t}.” Wikipédia, a enciclopédia livre, Wikimedia Foundation, ${short(rev)}, ${url}. Acesso em ${short(now)}.`,
      Chicago: `Colaboradores da Wikipédia. “${t}.” Wikipédia, a enciclopédia livre. Revisão de ${long(rev)}. Acesso em ${long(now)}. ${url}.`,
      BibTeX: `@misc{wikipedia_${P.revision},\n  author = {{Colaboradores da Wikipédia}},\n  title = {${t}},\n  howpublished = {Wikipédia, a enciclopédia livre},\n  year = {${y}},\n  url = {${url}},\n  note = {Revisão ${P.revision}. Acesso em ${iso(now)}}\n}`,
    };
  }

  function buildCite() {
    const formats = citations();
    let current = localStorage.getItem('formato-citacao') || 'ABNT';
    if (!formats[current]) current = 'ABNT';
    const box = h('pre', { class: 'cite-box', id: 'citacao', text: formats[current] });
    const status = h('span', { role: 'status', class: 'note' });
    const opts = Object.fromEntries(Object.keys(formats).map((k) => [k, k]));
    return h(
      'div',
      {},
      h('p', { text: fmt(S.citeIntro, P.revision, dateLong(P.timestamp)) }),
      h('div', { class: 'options' },
        radios('formato', S.citeFormat, opts, current, (v) => {
          current = v;
          box.textContent = formats[v];
          status.textContent = '';
          try {
            localStorage.setItem('formato-citacao', v);
          } catch {}
        }),
      ),
      box,
      h(
        'div',
        { class: 'cite-actions' },
        h('button', {
          type: 'button',
          class: 'btn',
          text: S.citeCopy,
          onclick: async () => {
            try {
              await navigator.clipboard.writeText(formats[current]);
            } catch {
              const r = document.createRange();
              r.selectNodeContents(box);
              getSelection().removeAllRanges();
              getSelection().addRange(r);
              document.execCommand('copy');
            }
            status.textContent = S.citeCopied;
          },
        }),
        status,
      ),
      h('h3', { text: S.citePermalink }),
      h('p', {}, h('a', { href: P.urls.permanent, text: P.urls.permanent, style: 'overflow-wrap:anywhere' })),
      h('p', {}, h('button', { type: 'button', class: 'btn', style: 'border-color:var(--rule-strong)', text: S.citePrint, onclick: () => window.print() })),
    );
  }

  /* ---------- Retomar a leitura ---------- */

  const POS_KEY = `posicao:${P.title}`;
  const readable = $$('.article-body p, .article-body li, .article-body h2, .article-body h3, .article-body h4').filter(
    (n) => !n.closest('.infobox, .navbox, .collapsible-wrap, .references, .sister-box'),
  );
  let saveTimer = null;
  function savePosition() {
    const off = topOffset() + 8;
    if (window.scrollY < 500) {
      try {
        localStorage.removeItem(POS_KEY);
      } catch {}
      return;
    }
    const i = readable.findIndex((n) => n.getBoundingClientRect().bottom > off);
    if (i < 0) return;
    try {
      localStorage.setItem(POS_KEY, JSON.stringify({ i, section: sectionIdOf(readable[i]), ts: Date.now(), rev: P.revision }));
    } catch {}
  }
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(savePosition, 800);
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && savePosition());

  function offerResume() {
    if (location.hash) return;
    let pos = null;
    try {
      pos = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
    } catch {}
    if (!pos || !readable[pos.i]) return;
    const box = $('.resume');
    const sameYear = new Date(pos.ts).getFullYear() === new Date().getFullYear();
    const label = pathOf(pos.section);
    box.replaceChildren(
      h('p', { text: fmt(S.resumeText, label, dateLong(pos.ts, !sameYear)) }),
      h('button', {
        type: 'button',
        class: 'btn btn-primary',
        text: S.resumeContinue,
        onclick: () => {
          box.hidden = true;
          scrollToNode(readable[pos.i]);
          focusNode(readable[pos.i]);
          queueUpdate();
        },
      }),
      h('button', {
        type: 'button',
        class: 'btn',
        text: S.resumeDismiss,
        onclick: () => {
          box.hidden = true;
          try {
            localStorage.removeItem(POS_KEY);
          } catch {}
          $('.article h1').setAttribute('tabindex', '-1');
          $('.article h1').focus();
        },
      }),
    );
    box.hidden = false;
  }

  /* ---------- Ficha: onde cada item aparece no texto ---------- */

  function buildInfoboxIndex() {
    const box = $('.infobox-main');
    if (!box) return;
    const seen = new Map();
    for (const td of $$('tr > td', box)) {
      const clone = td.cloneNode(true);
      $$('small, sup, .wikidata-linkback, img', clone).forEach((n) => n.remove());
      const parts = clone.innerHTML.split(/<br\s*\/?>/i).map((x) => {
        const t = document.createElement('div');
        t.innerHTML = x;
        return t.textContent;
      });
      for (const part of parts) {
        for (const item of part.split(/,\s*|\s+e\s+/)) {
          const v = item.replace(/\s+/g, ' ').trim();
          if (v.length < 2 || v.length > 40) continue;
          const k = norm(v);
          if (!seen.has(k)) seen.set(k, v);
        }
      }
    }
    if (!seen.size) return;
    const rows = [];
    for (const term of seen.values()) {
      const found = findHits(term, { wholeWord: true, kinds: ['text'] });
      const bySection = new Map();
      for (const hit of found) if (!bySection.has(hit.b.section)) bySection.set(hit.b.section, hit);
      const li = h('li', {}, h('span', { class: 'term', text: term }), ': ');
      if (!bySection.size) li.append(h('span', { class: 'none', text: S.infoboxNotInText }));
      [...bySection].forEach(([sec, hit], i) => {
        if (i) li.append(', ');
        li.append(
          h('button', {
            type: 'button',
            text: pathOf(sec),
            onclick: () => {
              hits = found;
              activate(found.indexOf(hit), { focusContent: true });
            },
          }),
        );
      });
      rows.push(li);
    }
    box.append(h('details', { class: 'infobox-index' }, h('summary', { text: S.infoboxInText }), h('ul', {}, rows)));
  }

  /* ---------- Início ---------- */

  buildInfoboxIndex();
  // Se a página abriu com uma âncora (#Cultivo) e o navegador não rolou até ela, rola agora.
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && window.scrollY < 10) scrollToNode(target);
  }
  updateCurrent();
  offerResume();
})();
