// Baixa o artigo e os metadados usados pelo protótipo e guarda tudo em data/<slug>/.
// O build lê só desses arquivos, então o site pode ser reconstruído sem rede
// e sempre a partir da mesma revisão.
//
// Uso: node scripts/fetch.mjs [titulo] [idioma]
// Padrão: Chá, pt

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const title = process.argv[2] || 'Chá';
const lang = process.argv[3] || 'pt';
const slug = process.argv[4] || 'cha';
const out = join(import.meta.dirname, '..', 'data', slug);
const UA = 'WikipediaRedesignConcept/0.1 (projeto de portfolio; sem fins comerciais)';

const rest = `https://${lang}.wikipedia.org/api/rest_v1`;
const api = `https://${lang}.wikipedia.org/w/api.php`;
const enc = encodeURIComponent(title.replaceAll(' ', '_'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, type = 'json') {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
    if (res.ok) return type === 'json' ? res.json() : res.text();
    if (attempt === 5) throw new Error(`${res.status} em ${url}`);
    // 429: respeita o Retry-After das wikis em vez de insistir.
    const wait = Number(res.headers.get('retry-after')) * 1000 || 1500 * attempt;
    await sleep(wait);
  }
}

function q(params) {
  const p = new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  return `${api}?${p}`;
}

await mkdir(out, { recursive: true });

// 1. HTML do artigo gerado pelo Parsoid. É o mesmo HTML que a pt.wikipedia
//    já usa para renderizar a página ("A página foi renderizada com Parsoid").
const html = await get(`${rest}/page/html/${enc}`, 'text');
await writeFile(join(out, 'article.html'), html);

// 2. Resumo: descrição curta (Wikidata), imagem principal, revisão.
const summary = await get(`${rest}/page/summary/${enc}`);

// 3. Informações da página, visitas dos últimos 60 dias, colaboradores, categorias visíveis.
const infoRes = await get(
  q({
    action: 'query',
    titles: title,
    prop: 'info|pageviews|contributors|categories',
    inprop: 'watchers|talkid',
    pclimit: 'max',
    clshow: '!hidden',
    cllimit: 'max',
  }),
);
const page = infoRes.query.pages[0];
const pageviews = Object.entries(page.pageviews || {}).map(([date, views]) => ({ date, views: views || 0 }));

// 4. Últimas 40 revisões, com etiquetas para identificar reversões.
const revRes = await get(
  q({
    action: 'query',
    titles: title,
    prop: 'revisions',
    rvlimit: '40',
    rvprop: 'ids|timestamp|user|comment|size|tags|flags',
  }),
);
const revisions = revRes.query.pages[0].revisions;

// Total de edições: a API não dá o número direto, então contamos em lotes de 500.
let editCount = 0;
let firstEdit = null;
let cont = {};
do {
  const r = await get(
    q({ action: 'query', titles: title, prop: 'revisions', rvlimit: 'max', rvprop: 'timestamp', rvdir: 'newer', ...cont }),
  );
  const revs = r.query.pages[0].revisions || [];
  if (!firstEdit && revs.length) firstEdit = revs[0].timestamp;
  editCount += revs.length;
  cont = r.continue || null;
} while (cont);

// 5. Página de discussão: tópicos e última edição.
const talkTitle = `${lang === 'pt' ? 'Discussão' : 'Talk'}:${title}`;
let talk = { title: talkTitle, exists: false, topics: [] };
try {
  const t = await get(q({ action: 'parse', page: talkTitle, prop: 'sections|revid' }));
  if (t.parse) {
    const tr = await get(q({ action: 'query', titles: talkTitle, prop: 'revisions', rvlimit: '1', rvprop: 'timestamp|user' }));
    talk = {
      title: talkTitle,
      exists: true,
      lastEdit: tr.query.pages[0].revisions?.[0] || null,
      topics: t.parse.sections.filter((s) => s.level === '2').map((s) => ({ title: s.line.replace(/<[^>]+>/g, ''), anchor: s.anchor })),
    };
  }
} catch {
  // Sem página de discussão.
}

// 6. Outros idiomas: nome local, nome em português, URL.
const llRes = await get(
  q({ action: 'query', titles: title, prop: 'langlinks', lllimit: 'max', llprop: 'url|langname|autonym', lluselang: lang }),
);
const langlinks = llRes.query.pages[0].langlinks || [];

// 7. Selos de qualidade de cada edição (artigo destacado / bom) vêm do Wikidata.
const BADGES = { Q17437796: 'destacado', Q17437798: 'bom' };
let badges = {};
if (summary.wikibase_item) {
  const wd = await get(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${summary.wikibase_item}&props=sitelinks`,
  );
  const sl = wd.entities[summary.wikibase_item].sitelinks;
  for (const [site, v] of Object.entries(sl)) {
    if (!site.endsWith('wiki') || site === 'commonswiki' || site === 'specieswiki') continue;
    const b = (v.badges || []).map((id) => BADGES[id]).filter(Boolean);
    if (b.length) badges[site.replace(/wiki$/, '').replaceAll('_', '-')] = b;
  }
}

// 8. Tamanho do texto-fonte em cada idioma (bytes de wikitexto).
//    Serve só como indicação grosseira; ver docs/06-funcionalidades.md, "Idiomas".
async function lengthFor(l) {
  try {
    const r = await get(
      `https://${l.lang}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=info&titles=${encodeURIComponent(l.title)}`,
    );
    return r.query.pages[0].length || null;
  } catch {
    return null;
  }
}
// Reaproveita tamanhos já baixados: são ~200 wikis diferentes e a coleta é lenta de propósito.
let known = {};
try {
  const prev = JSON.parse(await readFile(join(out, 'languages.json'), 'utf8'));
  for (const l of prev) if (l.bytes) known[`${l.code}:${l.title}`] = l.bytes;
} catch {
  // Primeira coleta.
}
const languages = [];
for (const l of langlinks) {
  let bytes = known[`${l.lang}:${l.title}`] ?? null;
  if (bytes === null) {
    bytes = await lengthFor(l);
    await sleep(350);
  }
  languages.push({
    code: l.lang,
    title: l.title,
    url: l.url,
    name: l.langname,
    autonym: l.autonym,
    bytes,
    badges: badges[l.lang] || [],
  });
}
languages.sort((a, b) => a.code.localeCompare(b.code));

const meta = {
  fetchedAt: new Date().toISOString(),
  lang,
  title,
  displayTitle: summary.title,
  description: summary.description || '',
  pageId: page.pageid,
  revision: page.lastrevid,
  timestamp: summary.timestamp,
  bytes: page.length,
  watchers: page.watchers ?? null,
  contributors: (page.contributors?.length || 0) + (page.anoncontributors || 0),
  registeredContributors: page.contributors?.length || 0,
  anonContributors: page.anoncontributors || 0,
  editCount,
  firstEdit,
  pageviews,
  categories: (page.categories || []).map((c) => c.title.replace(/^[^:]+:/, '')),
  badges: badges[lang] || [],
  thumbnail: summary.thumbnail || null,
  urls: {
    page: `https://${lang}.wikipedia.org/wiki/${enc}`,
    permanent: `https://${lang}.wikipedia.org/w/index.php?title=${enc}&oldid=${page.lastrevid}`,
    history: `https://${lang}.wikipedia.org/w/index.php?title=${enc}&action=history`,
    edit: `https://${lang}.wikipedia.org/w/index.php?title=${enc}&action=edit`,
    talk: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(talkTitle.replaceAll(' ', '_'))}`,
    info: `https://${lang}.wikipedia.org/w/index.php?title=${enc}&action=info`,
    wikidata: summary.wikibase_item ? `https://www.wikidata.org/wiki/${summary.wikibase_item}` : null,
  },
};

await writeFile(join(out, 'meta.json'), JSON.stringify(meta, null, 2));
await writeFile(join(out, 'revisions.json'), JSON.stringify(revisions, null, 2));
await writeFile(join(out, 'talk.json'), JSON.stringify(talk, null, 2));
await writeFile(join(out, 'languages.json'), JSON.stringify(languages, null, 2));

console.log(
  `${title}: revisão ${meta.revision}, ${editCount} edições, ${languages.length} idiomas, ${talk.topics.length} tópicos de discussão`,
);
