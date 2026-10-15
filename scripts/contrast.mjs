// Calcula o contraste de cada par de cores usado nos três temas e imprime uma tabela em Markdown.
// Uso: node scripts/contrast.mjs
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const css = await readFile(join(import.meta.dirname, '..', 'src', 'site.css'), 'utf8');
function tokens(selector) {
  const i = css.indexOf(selector);
  const block = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}
const light = tokens(':root {');
const themes = { Claro: light, Papel: { ...light, ...tokens(":root[data-theme='paper']") }, Escuro: { ...light, ...tokens(":root[data-theme='dark']") } };

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const pairs = [
  ['text', 'bg', 'Texto sobre fundo', 4.5],
  ['text-2', 'bg', 'Texto secundário sobre fundo', 4.5],
  ['text-2', 'bg-2', 'Texto secundário sobre superfície (avisos)', 4.5],
  ['accent', 'bg', 'Link sobre fundo', 4.5],
  ['accent', 'bg-2', 'Link sobre superfície', 4.5],
  ['visited', 'bg', 'Link visitado sobre fundo', 4.5],
  ['text', 'mark', 'Texto sobre destaque da busca', 4.5],
  ['text', 'mark-current', 'Texto sobre destaque atual', 4.5],
  ['rule-strong', 'bg', 'Borda de campo e botão sobre fundo', 3],
  ['accent', 'bg', 'Anel de foco sobre fundo', 3],
];
console.log(`| Par | Mínimo | ${Object.keys(themes).join(' | ')} |`);
console.log(`| --- | --- | ${Object.keys(themes).map(() => '---').join(' | ')} |`);
for (const [a, b, label, min] of pairs) {
  const cells = Object.values(themes).map((t) => {
    const r = ratio(t[a], t[b]);
    return `${r.toFixed(2).replace('.', ',')}:1${r < min ? ' (falha)' : ''}`;
  });
  console.log(`| ${label} | ${String(min).replace('.', ',')}:1 | ${cells.join(' | ')} |`);
}
