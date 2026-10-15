# 5. Sistema visual

Todos os valores estão como variáveis CSS no começo de `src/site.css`. Esta página explica por que cada um existe.

## Cor

A linguagem visual vem do Notion e do Linear: neutros quentes, linhas finas em vez de caixas, hover em cinza e um azul só para o que é clicável. Cada tema tem onze cores, escolhidas em pares e verificadas por `scripts/contrast.mjs`.

| Token | Uso | Claro | Papel | Escuro |
| --- | --- | --- | --- | --- |
| `--bg` | Fundo da página e dos painéis | #ffffff | #f6f1e7 | #161617 |
| `--bg-2` | Superfícies: avisos, retomada, hover do sumário | #f7f6f3 | #eee7d8 | #1e1e20 |
| `--hover` | Item atual do sumário, botão pressionado, escolha marcada | #f0efec | #e8e0cf | #27272a |
| `--text` | Texto | #37352f | #33291f | #ececed |
| `--text-2` | Texto secundário: metadados, legendas, rótulos | #6b6964 | #675b4c | #a0a0a6 |
| `--rule` | Linhas divisórias, que não carregam informação | #ebeae6 | #e2d9c7 | #2b2b2e |
| `--rule-strong` | Bordas de campos e botões | #8f8c85 | #8b7d69 | #74747b |
| `--accent` | Links e anel de foco | #1d5fc4 | #24508f | #7fa9f5 |
| `--visited` | Links já visitados | #6a4fb3 | #5a4686 | #b8a8ee |
| `--mark` e `--mark-current` | Destaque da busca e do resultado atual | #fff0a6 / #ffd84d | #f2d57a / #e2ae3d | #4a3c10 / #6b520c |

O texto do tema claro é #37352f, o marrom-acinzentado que o Notion usa no lugar do preto, e o fundo de superfície é #f7f6f3, o cinza quente da barra lateral do Notion. No escuro, #161617 com texto #ececed segue o caminho do Linear: fundo quase preto, sem azul de fundo e sem branco puro.

### Uma cor de destaque

O azul é a única cor com significado. Ele marca o que é clicável no texto (links) e onde está o foco do teclado. O azul do Notion para links (#2383e2) tem só 4,0:1 sobre o branco e não passa para texto, então usei #1d5fc4, que dá 6,0:1.

O roxo dos links visitados não conta como segunda cor: é um estado do link. Num artigo com 306 links, saber quais já foram abertos ajuda quem pesquisa.

Os links vermelhos da Wikipédia (artigos que ainda não existem) perderam o vermelho. Viraram texto secundário com sublinhado pontilhado, e o título do link diz "página ainda não existe".

O amarelo da busca é a outra exceção. Ele é a convenção de marca-texto e só aparece enquanto há uma busca ativa.

### Sublinhado dos links

Sublinhado de 1 px, em 32% de opacidade da cor do link, afastado 0,2em da letra, que escurece ao passar o mouse. É o mesmo tratamento do Notion e mantém a distinção dos links sem depender só da cor.

### Tema papel

Fundo #f6f1e7 e texto #33291f: 12,6:1 de contraste, abaixo do tema claro, mas sem o brilho do branco puro. Pensado para leituras longas.

### Tema escuro

O fundo não é preto puro e o texto não é branco puro. As imagens ficam com 88% do brilho, para uma foto clara não ofuscar o texto ao redor.

O tema automático segue `prefers-color-scheme`. Com `prefers-contrast: more`, o texto secundário passa a usar a cor do texto principal e as linhas ficam mais escuras.

### Contraste medido

Calculado por `scripts/contrast.mjs`, que lê as cores direto do CSS.

| Par | Mínimo | Claro | Papel | Escuro |
| --- | --- | --- | --- | --- |
| Texto sobre fundo | 4,5:1 | 12,26:1 | 12,62:1 | 15,32:1 |
| Texto secundário sobre fundo | 4,5:1 | 5,48:1 | 5,87:1 | 6,95:1 |
| Texto secundário sobre superfície (avisos) | 4,5:1 | 5,07:1 | 5,37:1 | 6,40:1 |
| Link sobre fundo | 4,5:1 | 6,02:1 | 7,12:1 | 7,66:1 |
| Link sobre superfície | 4,5:1 | 5,57:1 | 6,51:1 | 7,05:1 |
| Link visitado sobre fundo | 4,5:1 | 6,21:1 | 7,03:1 | 8,50:1 |
| Texto sobre destaque da busca | 4,5:1 | 10,67:1 | 9,86:1 | 9,15:1 |
| Texto sobre destaque atual | 4,5:1 | 8,86:1 | 7,01:1 | 6,27:1 |
| Borda de campo e botão sobre fundo | 3:1 | 3,36:1 | 3,56:1 | 3,90:1 |
| Anel de foco sobre fundo | 3:1 | 6,02:1 | 7,12:1 | 7,66:1 |

Todos os pares passam. Na versão anterior, o destaque do resultado atual no tema escuro tinha 3,84:1; o script acusou e escureci os dois tons de amarelo, e a nova paleta manteve o ajuste.

## Tipo

| Token | Valor |
| --- | --- |
| `--font-system-sans` | -apple-system, Segoe UI Variable Text, Segoe UI, Roboto, Noto Sans, Ubuntu, Helvetica Neue, Arial, sans-serif |
| `--font-system-serif` | Charter, Sitka Text, Cambria, Georgia, Noto Serif, DejaVu Serif, serif |
| `--font-text` | Sistema (padrão). Serifada, Inter, Literata, Source Serif 4 ou Atkinson, conforme a escolha |
| `--font-ui` | Sempre a sans do sistema, exceto em Legibilidade |
| `--title-weight` / `--heading-weight` | 700 e 600 (600 e 600 nas serifadas) |
| `--text-size` | 1,0625rem no celular, 1,125rem a partir de 48em, vezes a escala escolhida |
| `--leading` | 1,65 (opções: 1,45 e 1,85) |
| `--measure-chars` e `--measure-k` | 55 (opções: 47 e 64) vezes o fator da fonte, em `ch` |
| `--ui-size` / `--ui-small` | 0,9375rem / 0,875rem |

Os motivos estão em [04-tipografia-e-layout.md](04-tipografia-e-layout.md).

## Espaço

Uma escala de oito passos em múltiplos de 4 px: 4, 8, 12, 16, 24, 32, 48 e 64. Dentro do texto do artigo os espaços são em `em`, para crescerem junto com o tamanho escolhido pelo leitor; na interface são em `rem`.

## Forma

Cantos de 6 px em botões, campos e avisos, e de 10 px em imagens e na prévia de referência. Os painéis que sobem da base no celular têm 12 px em cima, para se lerem como uma folha sobre a página.

Linhas de 1 px em vez de caixas: o item atual do sumário é um fundo cinza arredondado (como a barra lateral do Notion), os botões do cabeçalho têm um contorno fino e o resto separa por espaço.

A única sombra do sistema é a da prévia de referência, uma borda de 1 px mais um desfoque de 24 px a 12% de opacidade (a 50% no tema escuro). É o único elemento que flutua sobre o texto, e sem a sombra a borda dele se confundiria com as linhas do parágrafo embaixo. Os painéis laterais não têm sombra: uma linha de 1 px os separa da página.

## Movimento

A única transição é uma mudança de cor de 100 ms, linear, em fundo, texto e borda de botões, itens do sumário, ferramentas do cabeçalho e escolhas das opções. Nada se desloca, cresce, desliza ou aparece. Com `prefers-reduced-motion: reduce` nem isso. Painéis, prévias e saltos para seções acontecem de uma vez. Revisão da decisão anterior, de nenhuma animação: ver [D18 no registro](registro-de-decisoes.md#d18-acabamento-visual-no-padrão-notion-e-linear).

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

Nenhum gradiente, vidro, brilho ou imagem de capa. Nenhum card: os parágrafos do artigo não ficam dentro de caixas, e a ficha é só texto com linhas divisórias.
