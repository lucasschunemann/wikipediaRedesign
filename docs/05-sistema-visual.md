# 5. Sistema visual

Todos os valores estão como variáveis CSS no começo de `src/site.css`. Esta página explica por que cada um existe.

## Cor

Cada tema tem nove cores. Elas foram escolhidas em pares: cada cor de texto foi testada contra cada fundo em que aparece.

| Token | Uso | Claro | Papel | Escuro |
| --- | --- | --- | --- | --- |
| `--bg` | Fundo da página e dos painéis | #ffffff | #f4efe5 | #191919 |
| `--bg-2` | Superfícies: avisos, botão sob o cursor, retomar leitura | #f5f4f1 | #ebe4d6 | #232322 |
| `--text` | Texto | #24221e | #2f271d | #e3e0da |
| `--text-2` | Texto secundário: metadados, legendas, rótulos | #625e57 | #64584a | #a8a39a |
| `--rule` | Linhas divisórias, que não carregam informação | #e5e2dc | #dcd2c1 | #34332f |
| `--rule-strong` | Bordas de campos e botões | #8c877e | #8b7d69 | #7d786f |
| `--accent` | Links e anel de foco | #2756a8 | #29538f | #8fb5f2 |
| `--visited` | Links já visitados | #5b4b97 | #5a4686 | #b7a4ea |
| `--mark` e `--mark-current` | Destaque da busca e do resultado atual | #fde68a / #f6bf3c | #f2d57a / #e2ae3d | #4a3c10 / #6b520c |

### Uma cor de destaque

O azul é a única cor com significado. Ele marca o que é clicável no texto (links) e onde está o foco do teclado. Ficou próximo do azul atual da Wikipédia, um pouco mais escuro (#2756a8 contra #3366cc), para passar de 5,4:1 para 7:1 sobre o branco. Mudar a cor dos links seria trocar uma convenção que bilhões de pessoas já aprenderam por um ganho estético.

O roxo dos links visitados não conta como segunda cor: é um estado do link, e a Wikipédia o usa há mais de 20 anos. Num artigo com 306 links, saber quais já foram abertos ajuda quem pesquisa.

Os links vermelhos da Wikipédia (artigos que ainda não existem) perderam o vermelho. Viraram texto secundário com sublinhado pontilhado. O vermelho seria uma segunda cor de destaque e, para quem lê, chama mais atenção do que a informação merece. Para quem edita, o pontilhado continua indicando que ali falta um artigo, e o título do link diz "página ainda não existe".

O amarelo da busca é a outra exceção. Ele não decora: é a convenção de marca-texto, que todo leitor reconhece, e só aparece enquanto há uma busca ativa.

### Sublinhado dos links

Os links têm sublinhado de 1 px numa versão mais transparente da cor do link, afastado 0,18em da letra. Sem sublinhado, o link dependeria só da cor; o azul da Wikipédia tem 3,01:1 contra o texto, no limite do que a WCAG aceita para cor como único indicador. Com sublinhado forte, 306 links em 3.200 palavras virariam ruído. O sublinhado claro resolve as duas coisas e escurece quando o cursor passa por cima.

### Tema papel

Pensado para leituras longas. O fundo é um bege claro (#f4efe5) e o texto um marrom-escuro (#2f271d). O contraste cai de 15,9:1 (claro) para 12,8:1: ainda muito acima do mínimo, mas sem o brilho de um fundo branco puro. Considerei um sépia mais escuro, como o de leitores de livros digitais. Descartei porque um fundo mais escuro aproxima o texto secundário do mínimo de 4,5:1 e muda a aparência das fotos do artigo, que foram feitas para fundo claro.

### Tema escuro

O fundo não é preto puro e o texto não é branco puro. Texto muito claro sobre preto absoluto "vaza" para quem tem astigmatismo, e o contraste excessivo cansa em leituras longas. As imagens ficam com 88% do brilho no tema escuro, para uma foto clara não ofuscar o texto ao redor.

O tema automático segue a preferência do sistema (`prefers-color-scheme`). Quem pede mais contraste no sistema (`prefers-contrast: more`) recebe o texto secundário na mesma cor do texto principal e linhas divisórias mais fortes.

### Contraste medido

Calculado por `scripts/contrast.mjs`, que lê as cores direto do CSS.

| Par | Mínimo | Claro | Papel | Escuro |
| --- | --- | --- | --- | --- |
| Texto sobre fundo | 4,5:1 | 15,88:1 | 12,83:1 | 13,35:1 |
| Texto secundário sobre fundo | 4,5:1 | 6,45:1 | 6,03:1 | 7,01:1 |
| Texto secundário sobre superfície (avisos) | 4,5:1 | 5,86:1 | 5,47:1 | 6,27:1 |
| Link sobre fundo | 4,5:1 | 7,04:1 | 6,72:1 | 8,42:1 |
| Link sobre superfície | 4,5:1 | 6,40:1 | 6,08:1 | 7,54:1 |
| Link visitado sobre fundo | 4,5:1 | 7,25:1 | 6,90:1 | 7,96:1 |
| Texto sobre destaque da busca | 4,5:1 | 12,75:1 | 10,20:1 | 8,20:1 |
| Texto sobre destaque atual | 4,5:1 | 9,40:1 | 7,25:1 | 5,62:1 |
| Borda de campo e botão sobre fundo | 3:1 | 3,57:1 | 3,50:1 | 4,01:1 |
| Anel de foco sobre fundo | 3:1 | 7,04:1 | 6,72:1 | 8,42:1 |

Na primeira versão, o destaque do resultado atual no tema escuro tinha 3,84:1. O script acusou e escureci os dois tons de amarelo.

## Tipo

| Token | Valor |
| --- | --- |
| `--font-serif` | Charter, Sitka Text, Cambria, Georgia, Noto Serif, DejaVu Serif, serif |
| `--font-sans` | -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Noto Sans, Ubuntu, Helvetica Neue, Arial, sans-serif |
| `--font-legible` | Atkinson Hyperlegible Next, Verdana, sans-serif |
| `--text-size` | 1,0625rem no celular, 1,125rem a partir de 48em, vezes a escala escolhida |
| `--leading` | 1,6 (opções: 1,45 e 1,8) |
| `--measure-chars` | 55 (opções: 47 e 64), em `ch` |
| `--ui-size` / `--ui-small` | 0,9375rem / 0,875rem |

Os motivos estão em [04-tipografia-e-layout.md](04-tipografia-e-layout.md).

## Espaço

Uma escala de oito passos em múltiplos de 4 px: 4, 8, 12, 16, 24, 32, 48 e 64. Dentro do texto do artigo os espaços são em `em`, para crescerem junto com o tamanho escolhido pelo leitor; na interface são em `rem`.

## Forma

Cantos de 6 px em tudo o que é clicável ou é uma superfície (botões, campos, avisos). Os painéis que sobem da base da tela no celular têm 12 px nos cantos de cima, para se lerem como uma folha sobre a página.

Só existe uma sombra no sistema, pequena (até 12 px de desfoque e 6% de opacidade), e só na prévia de referência. É o único elemento que flutua sobre o texto, e sem a sombra a borda dele se confundiria com as linhas do parágrafo embaixo. Os painéis laterais não têm sombra: uma linha de 1 px os separa da página.

## Componentes

O sistema tem poucos componentes e todos se repetem.

| Componente | Onde aparece |
| --- | --- |
| Botão de texto | Fechar, Continuar, Dispensar, Copiar, Limpar, ferramentas do cabeçalho |
| Grupo de escolha | Tema, fonte, entrelinha, largura da coluna, formato de citação |
| Campo de busca | Buscar na Wikipédia, buscar neste artigo, filtrar idiomas |
| Painel | Opções de leitura, Idiomas, Discussão, Histórico, Citar e o sumário em telas menores |
| Prévia de referência | Ao clicar numa chamada de referência |
| Linha de lista | Idiomas, edições do histórico, tópicos da discussão |
| Etiqueta | "reversão", "desfeita", "artigo bom", "destacado" |
| Nota | Avisos dos editores e "Você parou em..." |

O painel é o mesmo para tudo: no computador ele abre na lateral direita e deixa o artigo visível; no celular ele sobe da base da tela e cobre até 85% da altura. Considerei um componente diferente para cada ferramenta (menu suspenso para idiomas, página separada para histórico). Ficou um só porque o leitor aprende onde as coisas aparecem uma vez e esse conhecimento vale para todas as ferramentas.

## O que não entrou

Nenhum ícone. Todos os botões dizem o que fazem em texto. A única exceção é "Aa" na barra inferior do celular, que é a convenção de leitores de livros digitais para opções de texto e tem o nome acessível "Opções de leitura".

Nenhuma animação, transição ou gradiente. Nenhum card: os parágrafos do artigo não ficam dentro de caixas, e a ficha é só texto com linhas divisórias.
