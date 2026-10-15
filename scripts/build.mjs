// Monta site/index.html a partir de data/cha/ e copia CSS e JavaScript para site/assets/.
// Uso: node scripts/build.mjs

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { transformArticle, escapeHtml } from './transform.mjs';
import S, { fmt } from '../src/strings/pt.mjs';

const root = join(import.meta.dirname, '..');
const data = join(root, 'data', 'cha');
const out = join(root, 'site');

const html = await readFile(join(data, 'article.html'), 'utf8');
const meta = JSON.parse(await readFile(join(data, 'meta.json'), 'utf8'));
const revisions = JSON.parse(await readFile(join(data, 'revisions.json'), 'utf8'));
const talk = JSON.parse(await readFile(join(data, 'talk.json'), 'utf8'));
const languages = JSON.parse(await readFile(join(data, 'languages.json'), 'utf8'));

// Larguras das imagens por contexto: margem no computador, coluna no resto.
const imageSizes = '(min-width: 78em) 16rem, (min-width: 48em) 24rem, calc(100vw - 2rem)';

const article = transformArticle(html, { lang: meta.lang, title: meta.title, strings: S, imageSizes });

const date = (iso) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} de ${S.months[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
};
const num = (n) => n.toLocaleString(S.locale);

// Sumário. A introdução entra como primeiro item; Referências mostra a contagem.
function tocList(items, depth = 0) {
  return `<ol class="toc-list${depth ? ' toc-sub' : ''}">${items
    .map((it) => {
      const count = /^Refer/.test(it.text) ? ` <span class="toc-count">${article.stats.references}</span>` : '';
      return `<li><a href="#${escapeHtml(it.id)}" data-target="${escapeHtml(it.id)}">${escapeHtml(it.text)}${count}</a>${
        it.children.length ? tocList(it.children, depth + 1) : ''
      }</li>`;
    })
    .join('')}</ol>`;
}
const toc = tocList([{ id: 'inicio', text: S.introduction, children: [] }, ...article.toc]);

// Dados que só os painéis usam. Vão num JSON separado, baixado quando um painel abre.
const panelData = {
  revisions: revisions.slice(0, 15).map((r) => ({
    id: r.revid,
    parent: r.parentid,
    ts: r.timestamp,
    user: r.user,
    comment: r.comment,
    size: r.size,
    tags: r.tags,
  })),
  talk,
  languages: languages.map((l) => ({
    code: l.code,
    title: l.title,
    url: l.url,
    name: l.name,
    autonym: l.autonym,
    bytes: l.bytes,
    badges: l.badges,
    script: scriptOf(l.code),
  })),
  pageviews: meta.pageviews.reduce((s, p) => s + p.views, 0),
};

function scriptOf(code) {
  try {
    return new Intl.Locale(code).maximize().script || null;
  } catch {
    return null;
  }
}

// Dados que o JavaScript precisa logo no carregamento.
const pageData = {
  title: meta.title,
  lang: meta.lang,
  revision: meta.revision,
  timestamp: meta.timestamp,
  bytes: meta.bytes,
  script: scriptOf(meta.lang),
  urls: meta.urls,
  editCount: meta.editCount,
  firstEdit: meta.firstEdit,
  contributors: meta.contributors,
  watchers: meta.watchers,
};

const toolLinks = [
  { id: 'languages', label: S.languages, count: languages.length, href: `${meta.urls.wikidata}#sitelinks-wikipedia` },
  { id: 'talk', label: S.talk, count: talk.topics.length, href: meta.urls.talk },
  { id: 'history', label: S.history, href: meta.urls.history },
  { id: 'cite', label: S.cite, href: `https://${meta.lang}.wikipedia.org/w/index.php?title=Especial:Citar/${encodeURIComponent(meta.title)}&id=${meta.revision}` },
];

const prefsScript = (await readFile(join(root, 'src', 'prefs-inline.js'), 'utf8')).trim();

const page = `<!doctype html>
<html lang="${meta.lang}" dir="ltr" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fmt(S.docTitle, meta.title))}</title>
<meta name="description" content="${escapeHtml(meta.description)}">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<link rel="canonical" href="${meta.urls.page}">
<script>${prefsScript}</script>
<link rel="stylesheet" href="assets/site.css">
<script defer src="assets/site.js"></script>
</head>
<body>
<a class="skip" href="#texto">${S.skipToText}</a>
<a class="skip" href="#secoes">${S.skipToSections}</a>

<p class="concept-note">${S.conceptNote} <a href="${meta.urls.page}">${S.conceptLink}</a></p>

<header class="topbar">
  <a class="wordmark" href="https://${meta.lang}.wikipedia.org/">${S.siteName}</a>
  <button class="topbar-location" type="button" data-open="sections">
    <span class="visually-hidden">${S.currentSection}: </span><span class="topbar-section"></span>
  </button>
  <form class="global-search" role="search" action="https://${meta.lang}.wikipedia.org/w/index.php">
    <label class="visually-hidden" for="busca-wikipedia">${S.searchWikipedia}</label>
    <input id="busca-wikipedia" name="search" type="search" placeholder="${S.searchWikipedia}" autocomplete="off">
    <button class="btn" type="submit">${S.searchButton}</button>
  </form>
  <nav class="account" aria-label="${S.accountNav}">
    <a href="https://donate.wikimedia.org/?uselang=pt">${S.donate}</a>
    <a href="https://${meta.lang}.wikipedia.org/w/index.php?title=Especial:Entrar&returnto=${encodeURIComponent(meta.title)}">${S.login}</a>
  </nav>
  <button class="btn btn-options" type="button" data-open="options">${S.readingOptions}</button>
</header>

<div class="layout">
  <nav class="sections" id="secoes" aria-labelledby="secoes-titulo">
    <div class="sections-inner">
      <div class="sections-head">
        <h2 id="secoes-titulo">${S.sections}</h2>
        <button class="btn btn-close" type="button" data-close hidden>${S.close}</button>
      </div>
      <form class="find" role="search" hidden>
        <label for="busca-artigo">${S.searchArticle}</label>
        <div class="find-row">
          <input id="busca-artigo" type="search" autocomplete="off" spellcheck="false" aria-describedby="busca-artigo-dica" aria-controls="busca-resultados">
          <button class="btn" type="button" data-clear hidden>${S.clearSearch}</button>
        </div>
        <p id="busca-artigo-dica" class="hint">${S.searchArticleHint}</p>
      </form>
      <div id="busca-resultados" class="find-results" aria-live="polite" hidden></div>
      <div class="toc">${toc}</div>
    </div>
  </nav>

  <main id="texto" tabindex="-1">
    <article class="article" lang="${meta.lang}">
      <header class="article-header" id="inicio">
        <h1>${escapeHtml(meta.displayTitle)}</h1>
        ${meta.description ? `<p class="description">${escapeHtml(meta.description)}</p>` : ''}
        <p class="meta">
          <span>${S.lastEdit} <time datetime="${meta.timestamp}">${date(meta.timestamp)}</time></span>
          <span>${fmt(S.editsSince, num(meta.editCount), new Date(meta.firstEdit).getUTCFullYear())}</span>
          <span>${fmt(S.readingTime, article.stats.minutes)}</span>
        </p>
        <ul class="tools" aria-label="${S.articleTools}">
          ${toolLinks
            .map(
              (t) =>
                `<li><a class="tool" href="${t.href}" data-panel="${t.id}">${t.label}${t.count != null ? ` <span class="tool-count">${num(t.count)}</span>` : ''}</a></li>`,
            )
            .join('\n          ')}
          <li><a class="tool" href="${meta.urls.edit}" title="${S.editHint}">${S.edit}</a></li>
        </ul>
        <div class="resume" role="status" hidden></div>
      </header>
      <div class="article-body">
${article.html}
      </div>
      <footer class="article-footer">
        <p><span class="footer-label">${S.categories}:</span> ${meta.categories
          .map((c) => `<a href="https://${meta.lang}.wikipedia.org/wiki/Categoria:${encodeURIComponent(c.replaceAll(' ', '_'))}">${escapeHtml(c)}</a>`)
          .join(', ')}</p>
        <p>${fmt(S.attribution, escapeHtml(meta.title), meta.urls.page, meta.urls.history)}</p>
        <p>${S.licenseLine}</p>
        <p>${fmt(S.revisionLine, meta.revision, meta.urls.permanent, date(meta.timestamp))}</p>
        <p><a href="${meta.urls.info}">${S.moreTools}</a></p>
      </footer>
    </article>
  </main>
</div>

<footer class="site-footer">
  <nav class="account" aria-label="${S.accountNav}">
    <a href="https://donate.wikimedia.org/?uselang=pt">${S.donate}</a>
    <a href="https://${meta.lang}.wikipedia.org/w/index.php?title=Especial:Entrar&returnto=${encodeURIComponent(meta.title)}">${S.login}</a>
  </nav>
  <p>${S.footerConcept}</p>
</footer>

<div class="bottombar">
  <button class="bottombar-sections" type="button" data-open="sections">
    <span class="bottombar-label">${S.sections}</span>
    <span class="bottombar-current"></span>
  </button>
  <button class="bottombar-options" type="button" data-open="options" aria-label="${S.readingOptions}">${S.readingOptionsShort}</button>
</div>

<dialog class="sections-dialog" id="secoes-painel" aria-labelledby="secoes-titulo"></dialog>

<dialog class="panel" id="painel" aria-labelledby="painel-titulo">
  <div class="panel-head">
    <h2 id="painel-titulo"></h2>
    <button class="btn btn-close" type="button" data-close>${S.close}</button>
  </div>
  <div class="panel-body"></div>
</dialog>

<dialog class="refnote" id="nota" aria-labelledby="nota-titulo">
  <div class="refnote-head">
    <h2 id="nota-titulo"></h2>
    <button class="btn btn-close" type="button" data-close>${S.close}</button>
  </div>
  <div class="refnote-body"></div>
</dialog>

<script type="application/json" id="dados">${JSON.stringify({ page: pageData, strings: S }).replaceAll('<', '\\u003c')}</script>
</body>
</html>
`;

await mkdir(join(out, 'assets'), { recursive: true });
await writeFile(join(out, 'index.html'), page);
await writeFile(join(out, 'assets', 'cha-dados.json'), JSON.stringify(panelData));
await copyFile(join(root, 'src', 'site.css'), join(out, 'assets', 'site.css'));
await copyFile(join(root, 'src', 'site.js'), join(out, 'assets', 'site.js'));
await mkdir(join(out, 'assets', 'fonts'), { recursive: true });
for (const f of ['atkinson-next-latin.woff2', 'atkinson-next-latin-italic.woff2', 'OFL.txt']) {
  await copyFile(join(root, 'src', 'fonts', f), join(out, 'assets', 'fonts', f));
}

const report = [];
for (const f of ['index.html', 'assets/site.css', 'assets/site.js', 'assets/cha-dados.json']) {
  const buf = await readFile(join(out, f));
  report.push(`${f.padEnd(24)} ${(buf.length / 1024).toFixed(1).padStart(6)} KB   gzip ${(gzipSync(buf).length / 1024).toFixed(1).padStart(5)} KB`);
}
console.log(report.join('\n'));
console.log(article.stats, article.removed);
