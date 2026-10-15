// Transforma o HTML do Parsoid no HTML do artigo usado pelo protótipo.
//
// Regra principal: nenhum texto do artigo é alterado, removido ou reordenado.
// O que muda é a marcação em volta: atributos internos do Parsoid saem,
// links passam a apontar para lugares que funcionam fora da Wikipédia,
// avisos e caixas de navegação ganham marcação semântica.
// Cada transformação está listada em docs/04-tipografia-e-layout.md.

import { parseHTML } from 'linkedom';

const WORDS_PER_MINUTE = 230;
const THUMB_WIDTHS = [330, 500];

// Elementos de predefinição cujo estilo inline é só aparência do Vector
// (cores de fundo, bordas, larguras fixas). Nesses, o estilo inline sai.
const CHROME = '.infobox, .navbox, .ambox, .hatnote, .navigation-box, .mw-collapsible, .sister-box';

export function transformArticle(html, ctx) {
  const { document } = parseHTML(html);
  const body = document.body;
  const lang = ctx.lang;
  const wiki = `https://${lang}.wikipedia.org`;
  const selfTitle = ctx.title.replaceAll(' ', '_');

  const removed = { decorativeIcons: 0, hiddenBlocks: 0 };

  // 1. Elementos que não aparecem na tela: estilos de predefinição, links de categoria,
  //    marcadores vazios. As categorias visíveis vêm da API (meta.json).
  for (const el of body.querySelectorAll('style, link, meta')) el.remove();
  for (const el of body.querySelectorAll('span.mw-empty-elt')) {
    if (!el.textContent.trim() && !el.querySelector('img')) el.remove();
  }
  // Lista oculta de projetos irmãos, que o Vector usa para montar a barra lateral.
  // O mesmo conteúdo está visível na caixa "Outros projetos" da seção Ligações externas.
  for (const el of body.querySelectorAll('#interProject')) {
    el.remove();
    removed.hiddenBlocks++;
  }

  // 2. Ícones decorativos de predefinições. O texto de cada aviso fica intacto.
  for (const el of body.querySelectorAll('.ambox .mbox-image, .ambox .mbox-imageright')) {
    el.remove();
    removed.decorativeIcons++;
  }
  for (const el of body.querySelectorAll('.hatnote [typeof~="mw:File"]')) {
    el.remove();
    removed.decorativeIcons++;
  }
  // Ícone "documentação da predefinição" no rodapé da infobox.
  for (const el of body.querySelectorAll('.infobox .navbar a[title="Documentação da predefinição"]')) {
    (el.closest('span[style*="float"]') || el).remove();
    removed.decorativeIcons++;
  }

  // 3. Entidades que o Parsoid embrulha em <span typeof="mw:Entity"> viram texto puro.
  for (const el of body.querySelectorAll('span[typeof="mw:Entity"]')) {
    el.replaceWith(document.createTextNode(el.textContent));
  }

  // 4. Links.
  const localPages = ctx.localPages || new Map();
  for (const a of body.querySelectorAll('a[href]')) {
    let href = a.getAttribute('href');
    const rel = a.getAttribute('rel') || '';
    if (href.startsWith('./')) {
      const raw = href.slice(2);
      const [pagePart, frag] = raw.split('#');
      const page = safeDecode(pagePart.split('?')[0]);
      if (page === selfTitle || page.replaceAll(' ', '_') === selfTitle) {
        href = frag ? `#${frag}` : '#';
      } else if (localPages.has(page.replaceAll(' ', '_')) && !a.classList.contains('new')) {
        href = localPages.get(page.replaceAll(' ', '_')) + (frag ? `#${frag}` : '');
        a.classList.add('local');
      } else {
        href = `${wiki}/wiki/${pagePart}${frag ? `#${frag}` : ''}`;
        if (pagePart.includes('?')) href = `${wiki}/w/index.php?title=${pagePart.replace('?', '&')}`;
      }
      if (rel.includes('mw:WikiLink') && !a.classList.contains('new')) a.classList.add('wikilink');
    } else if (href.startsWith('//')) {
      href = `https:${href}`;
    }
    if (a.classList.contains('new')) {
      a.classList.add('redlink');
      a.setAttribute('title', `${a.getAttribute('title') || ''} (${ctx.strings.redlinkTitle})`.trim());
    }
    if (rel.includes('mw:ExtLink')) a.classList.add('ext');
    a.setAttribute('href', href);
    a.removeAttribute('rel');
    if (rel.includes('nofollow')) a.setAttribute('rel', 'nofollow');
    a.removeAttribute('data-mw-original-href');
    a.classList.remove('mw-redirect', 'mw-file-description', 'external', 'text', 'extiw', 'mw-selflink-fragment');
  }

  // 5. Imagens: endereço absoluto, sem parâmetros de rastreamento, e um srcset
  //    com larguras padronizadas da Wikimedia (330 e 500 px) para caber na coluna.
  for (const img of body.querySelectorAll('img')) {
    const src = cleanImageUrl(img.getAttribute('src'));
    img.setAttribute('src', src);
    const fileWidth = Number(img.getAttribute('data-file-width'));
    const isThumb = !!img.closest('figure, .infobox-image, .infobox .image');
    if (isThumb && /\/\d+px-/.test(src) && fileWidth) {
      const set = THUMB_WIDTHS.filter((w) => w < fileWidth).map((w) => `${src.replace(/\/\d+px-/, `/${w}px-`)} ${w}w`);
      if (fileWidth <= THUMB_WIDTHS.at(-1)) {
        const original = src.replace('/thumb/', '/').replace(/\/\d+px-[^/]+$/, '');
        set.push(`${original} ${fileWidth}w`);
      }
      img.setAttribute('srcset', set.join(', '));
      img.setAttribute('sizes', ctx.imageSizes);
    } else if (img.hasAttribute('srcset')) {
      img.setAttribute(
        'srcset',
        img
          .getAttribute('srcset')
          .split(',')
          .map((part) => {
            const [u, d] = part.trim().split(/\s+/);
            return `${cleanImageUrl(u)} ${d || ''}`.trim();
          })
          .join(', '),
      );
    }
    for (const attr of ['resource', 'data-file-width', 'data-file-height', 'data-file-type', 'class', 'style']) {
      img.removeAttribute(attr);
    }
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  }

  // Links de imagem sem texto alternativo ficariam sem nome para leitores de tela.
  // O alt continua como os editores deixaram; o nome vai no link, a partir do arquivo.
  for (const a of body.querySelectorAll('a')) {
    const img = a.querySelector('img');
    if (!img || a.textContent.trim() || img.getAttribute('alt')) continue;
    const file = safeDecode((a.getAttribute('href') || '').split('/').pop()).replace(/^[^:]+:/, '').replaceAll('_', ' ');
    if (file) a.setAttribute('aria-label', ctx.strings.imageFile.replace('{0}', file));
  }

  // 6. Avisos de manutenção (ambox): de tabela de layout para nota.
  for (const box of body.querySelectorAll('table.ambox')) {
    const text = box.querySelector('.mbox-text-span') || box.querySelector('.mbox-text');
    const note = document.createElement('div');
    note.className = 'notice';
    note.setAttribute('role', 'note');
    note.innerHTML = text ? text.innerHTML : box.textContent;
    for (const h of note.querySelectorAll('.hide-when-compact')) h.className = 'notice-help';
    box.replaceWith(note);
  }

  // 7. Nota de desambiguação no topo.
  for (const h of body.querySelectorAll('div.hatnote')) {
    const p = document.createElement('p');
    p.className = 'hatnote';
    p.setAttribute('role', 'note');
    p.innerHTML = h.innerHTML.trim().replace(/^(&#160;|&nbsp;|\u00a0|\s)+/, '');
    h.replaceWith(p);
  }

  // 8. Infobox principal: título, figura e tabela de dados viram uma <aside>.
  //    Caixas pequenas com a mesma classe (como "Outros projetos") ficam como caixas secundárias.
  let infoboxCount = 0;
  for (const box of body.querySelectorAll('div.infobox, table.infobox')) {
    const isSister = /Outros projetos|Other projects/i.test(box.textContent.slice(0, 80));
    const aside = document.createElement('aside');
    if (isSister) {
      aside.className = 'sister-box';
      aside.setAttribute('aria-label', ctx.strings.sisterProjects);
      const inner = box.cloneNode(true);
      inner.classList.remove('infobox');
      aside.append(inner);
      box.replaceWith(aside);
      continue;
    }
    infoboxCount++;
    aside.className = infoboxCount === 1 ? 'infobox infobox-main' : 'infobox';
    const titleEl = box.querySelector('.topo, caption, .infobox-title, .infobox-above');
    const titleText = titleEl ? titleEl.textContent.trim() : ctx.title;
    aside.setAttribute('aria-label', `${ctx.strings.infoboxLabel}: ${titleText}`);
    aside.innerHTML = box.outerHTML;
    const inner = aside.firstElementChild;
    inner.classList.remove('infobox');
    inner.classList.add('infobox-body');
    const topo = aside.querySelector('.topo');
    if (topo) {
      const p = document.createElement('p');
      p.className = 'infobox-title';
      p.textContent = topo.textContent.trim();
      topo.replaceWith(p);
    }
    for (const imgBox of aside.querySelectorAll('div.image')) {
      const fig = document.createElement('figure');
      fig.className = 'infobox-image';
      const cap = imgBox.parentElement?.querySelector(':scope > p.caption');
      fig.innerHTML = imgBox.innerHTML;
      if (cap) {
        const fc = document.createElement('figcaption');
        fc.innerHTML = cap.innerHTML;
        fig.append(fc);
        cap.remove();
      }
      imgBox.replaceWith(fig);
    }
    for (const nav of aside.querySelectorAll('p.navbar')) nav.className = 'infobox-edit';
    box.replaceWith(aside);
  }

  // A infobox principal passa para depois do primeiro parágrafo da introdução,
  // como o Minerva já faz no celular. No wikitexto ela vem antes do texto por convenção
  // de edição, não por ordem de leitura. Sem isso, no celular a primeira tela seria
  // a ficha inteira e o texto começaria abaixo da dobra (problema P2 da auditoria).
  const mainBox = body.querySelector('aside.infobox-main');
  const leadSection = mainBox?.closest('section');
  const firstPara = leadSection && [...leadSection.querySelectorAll(':scope > p:not(.hatnote)')].find((p) => p.textContent.trim().length > 40);
  if (mainBox && firstPara) {
    const kids = [...leadSection.children];
    if (kids.indexOf(mainBox) < kids.indexOf(firstPara)) firstPara.after(mainBox);
  }

  // 9. Figuras.
  for (const fig of body.querySelectorAll('figure')) {
    if (fig.classList.contains('infobox-image')) continue;
    fig.className = 'figure';
  }

  // 10. Blocos recolhíveis (caixas de navegação, controle de autoridade) viram <details>.
  //     Funciona sem JavaScript e é anunciado corretamente por leitores de tela.
  for (const nav of body.querySelectorAll('div.navbox')) {
    const table = nav.querySelector('table');
    if (!table) continue;
    const titleCell = table.querySelector('.navbox-title');
    if (!titleCell) continue; // Caixas sem título (como as de controle de autoridade) ficam como estão.
    const collapsed = table.classList.contains('collapsed');
    const details = document.createElement('details');
    details.className = 'navbox';
    if (!collapsed) details.setAttribute('open', '');
    const summary = document.createElement('summary');
    const vde = titleCell.querySelector('.navbar');
    if (vde) vde.remove();
    summary.innerHTML = titleCell.textContent.trim();
    details.append(summary);
    titleCell.closest('tr').remove();
    const content = document.createElement('div');
    content.className = 'navbox-content';
    content.append(table);
    if (vde) {
      vde.className = 'navbox-tools';
      content.append(vde);
    }
    details.append(content);
    nav.replaceWith(details);
  }
  for (const col of body.querySelectorAll('div.mw-collapsible')) {
    const head = col.querySelector(':scope > .NavHead');
    const content = col.querySelector(':scope > .mw-collapsible-content');
    if (!head || !content) continue;
    const details = document.createElement('details');
    details.className = 'collapsible';
    if (!col.classList.contains('mw-collapsed')) details.setAttribute('open', '');
    const summary = document.createElement('summary');
    summary.textContent = head.textContent.trim();
    details.append(summary);
    const div = document.createElement('div');
    div.className = 'collapsible-content';
    div.innerHTML = content.innerHTML;
    details.append(div);
    const wrapper = col.parentElement;
    col.replaceWith(details);
    // A predefinição envolve o bloco numa div com borda; a borda sai com o estilo inline.
    if (wrapper && wrapper.getAttribute('style')) wrapper.classList.add('collapsible-wrap');
  }
  for (const ul of body.querySelectorAll('ul.navigation-box')) ul.className = 'portal-bar';

  // 11. Marcação "carece de fontes": mantém o texto e o título explicativo.
  for (const sup of body.querySelectorAll('sup')) {
    if (sup.classList.contains('reference')) continue;
    if (/carece\s+de\s+fontes|citation needed/i.test(sup.textContent)) sup.classList.add('cn');
  }

  // 12. Estilos inline de predefinições saem; o resto do conteúdo mantém os seus.
  for (const el of body.querySelectorAll(CHROME)) {
    for (const node of [el, ...el.querySelectorAll('[style]')]) cleanChromeStyle(node);
  }
  for (const el of body.querySelectorAll('.collapsible-wrap, .portal-bar, .portal-bar [style]')) cleanChromeStyle(el);
  // Elementos escondidos por estilo inline (display:none) continuam escondidos;
  // não há o que mostrar neles além de metadados.

  // 13. Tabelas de dados ganham um contêiner com rolagem horizontal acessível por teclado.
  for (const table of body.querySelectorAll('table')) {
    if (table.closest('.infobox, .navbox, .sister-box, .collapsible')) continue;
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('tabindex', '0');
    const caption = table.querySelector('caption');
    wrap.setAttribute('aria-label', caption ? caption.textContent.trim() : ctx.strings.tableLabel);
    table.replaceWith(wrap);
    wrap.append(table);
  }

  // 14. Seções e títulos.
  const headings = [...body.querySelectorAll('h2, h3, h4, h5, h6')];
  const toc = [];
  const stack = [{ level: 1, children: toc }];
  for (const h of headings) {
    const level = Number(h.tagName[1]);
    const id = h.getAttribute('id');
    h.removeAttribute('data-mw-wikitext');
    const section = h.closest('section');
    if (section) {
      section.setAttribute('aria-labelledby', id);
      section.dataset.heading = id;
    }
    const item = { id, text: h.textContent.trim(), level, words: 0, children: [] };
    while (stack.at(-1).level >= level) stack.pop();
    stack.at(-1).children.push(item);
    stack.push(item);
  }
  const lead = body.querySelector('section[data-mw-section-id="0"]');
  if (lead) {
    lead.classList.add('lead');
    lead.setAttribute('aria-label', ctx.strings.introduction);
  }

  // Contagem de palavras por seção (só o texto da própria seção, sem subseções).
  const wordsBySection = new Map();
  let totalWords = 0;
  for (const block of body.querySelectorAll('p, li, dd, dt, blockquote, figcaption')) {
    if (block.closest('.infobox, .navbox, .sister-box, .collapsible, .mw-references-wrap, .notice, .hatnote, .portal-bar, .references')) continue;
    if (block.parentElement?.closest('li, blockquote')) continue;
    const n = countWords(block.textContent);
    totalWords += n;
    const sec = block.closest('section');
    const key = sec?.dataset.heading || 'lead';
    wordsBySection.set(key, (wordsBySection.get(key) || 0) + n);
  }
  (function fill(items) {
    for (const it of items) {
      fill(it.children);
      it.ownWords = wordsBySection.get(it.id) || 0;
      it.words = it.ownWords + it.children.reduce((s, c) => s + c.words, 0);
    }
  })(toc);

  // 15. Referências.
  const refUses = new Map(); // id da nota -> [{ refId, section }]
  for (const sup of body.querySelectorAll('sup.reference')) {
    const a = sup.querySelector('a');
    const noteId = a?.getAttribute('href')?.replace(/^#/, '');
    if (!noteId) continue;
    sup.dataset.note = noteId;
    const sec = sup.closest('section');
    const sectionTitle = sec?.dataset.heading
      ? body.querySelector(`[id="${cssEscape(sec.dataset.heading)}"]`)?.textContent.trim()
      : ctx.strings.introduction;
    if (!refUses.has(noteId)) refUses.set(noteId, []);
    refUses.get(noteId).push({ refId: sup.id, section: sectionTitle, sectionId: sec?.dataset.heading || '' });
  }
  for (const li of body.querySelectorAll('ol.mw-references > li')) {
    const uses = refUses.get(li.id) || [];
    const back = li.querySelector('.mw-cite-backlink');
    if (back) back.remove();
    li.removeAttribute('about');
    if (!uses.length) continue;
    const groups = [];
    for (const u of uses) {
      const g = groups.find((x) => x.section === u.section);
      if (g) g.items.push(u);
      else groups.push({ section: u.section, items: [u] });
    }
    const parts = groups.map((g) => {
      if (g.items.length === 1) return `<a href="#${g.items[0].refId}" class="backlink">${escapeHtml(g.section)}</a>`;
      const nums = g.items
        .map(
          (u, i) =>
            `<a href="#${u.refId}" class="backlink" aria-label="${escapeHtml(ctx.strings.citationIn.replace('{0}', i + 1).replace('{1}', g.section))}">${i + 1}</a>`,
        )
        .join(', ');
      return `${escapeHtml(g.section)} (${nums})`;
    });
    const span = document.createElement('span');
    span.className = 'ref-uses';
    span.innerHTML = `${escapeHtml(ctx.strings.citedIn)} ${listJoin(parts, ctx.strings.and)}`;
    li.append(span);
  }

  // 16. Limpeza de atributos internos do Parsoid. Ids só ficam quando alguém aponta para eles.
  const referenced = new Set();
  for (const a of body.querySelectorAll('a[href^="#"]')) referenced.add(safeDecode(a.getAttribute('href').slice(1)));
  for (const el of body.querySelectorAll('*')) {
    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-mw') || name.startsWith('data-parsoid') || name === 'about' || name === 'typeof' || name === 'resource' || name === 'prefix') {
        el.removeAttribute(name);
      }
    }
    if (el.tagName === 'SECTION') el.removeAttribute('data-mw-section-id');
    const id = el.getAttribute('id');
    if (id && /^mw[\w-]{1,6}$/.test(id) && !referenced.has(id)) el.removeAttribute('id');
    if (el.getAttribute('class') === '') el.removeAttribute('class');
  }

  const contentHTML = body.innerHTML.replace(/\n{3,}/g, '\n\n');

  return {
    html: contentHTML,
    toc,
    stats: {
      words: totalWords,
      minutes: Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE)),
      references: body.querySelectorAll('ol.mw-references > li').length,
      citations: body.querySelectorAll('sup.reference').length,
      notices: body.querySelectorAll('.notice').length,
      figures: body.querySelectorAll('figure.figure').length,
      redlinks: body.querySelectorAll('a.redlink').length,
      leadWords: wordsBySection.get('lead') || 0,
    },
    removed,
  };
}

function cleanImageUrl(u) {
  if (!u) return u;
  if (u.startsWith('//')) u = `https:${u}`;
  return u.replace(/\?utm_[^ ]*$/, '').replace(/\?utm_source=[^ "]*/, '');
}

function cleanChromeStyle(el) {
  const style = el.getAttribute('style');
  if (!style) return;
  if (/display\s*:\s*none/i.test(style)) return;
  if (/white-space\s*:\s*nowrap/i.test(style)) el.classList.add('nowrap');
  el.removeAttribute('style');
}

function countWords(text) {
  const m = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return m ? m.length : 0;
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function cssEscape(s) {
  return s.replace(/["\\]/g, '\\$&');
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function listJoin(parts, and) {
  if (parts.length < 2) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} ${and} ${parts.at(-1)}`;
}
