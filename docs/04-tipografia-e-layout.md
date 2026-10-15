# 4. Tipografia e layout

## A medida da linha

O problema P1 da auditoria (linhas de 64 a 121 caracteres no mesmo artigo) decidiu a regra mais importante do projeto: a coluna de texto tem largura fixa e nada flutua dentro dela.

A largura é definida em `ch`, a unidade que acompanha a largura dos caracteres da fonte em uso. Comecei com 62ch e medi no navegador, com o mesmo script da auditoria, quantos caracteres cabiam por linha nos 21 parágrafos longos do artigo. Deu 73, acima do que eu queria. Ajustei as três opções até chegar nestes números:

| Opção | Valor | Caracteres por linha (média) | Faixa medida |
| --- | --- | --- | --- |
| Estreita | 47ch | 55 | 52 a 59 |
| Média (padrão) | 55ch | 65 | 61 a 68 |
| Larga | 64ch | 76 | 66 a 80 |

A variação dentro de cada opção vem das palavras longas que não cabem no fim da linha, não do layout. Compare com 64 a 121 na página atual.

O `ch` não resolve tudo. Com o mesmo valor de 55ch, a fonte sem serifa ficou com 72 caracteres por linha e a fonte de legibilidade com 60, porque a proporção entre o "0" (que define o `ch`) e as outras letras muda de uma família para outra. Acrescentei um fator de correção por família (0,9 para a sem serifa e 1,08 para a de legibilidade). Depois disso as três famílias deram 65 caracteres por linha.

No celular a coluna ocupa a tela, com 16 px de margem de cada lado. A 375 px de largura ficam 42 caracteres por linha, e a 320 px ficam 35. É menos que o ideal para computador, mas é o que cabe com um corpo de 17 px, e reduzir o corpo para ganhar caracteres seria pior.

## Família tipográfica

Três opções, como pedido: serifada, sem serifa e uma pensada para legibilidade.

### Serifada (padrão)

`Charter, Sitka Text, Cambria, Georgia, Noto Serif, DejaVu Serif, serif`

Todas são fontes que já vêm instaladas. Charter está no Mac e no iOS, Sitka Text no Windows (a Microsoft a desenhou com testes de legibilidade em tela), Georgia em quase tudo, Noto Serif no Android.

Considerei duas fontes web, Source Serif 4 e Literata, ambas desenhadas para leitura longa. Com regular e itálico, só para o alfabeto latino, seriam cerca de 70 KB a mais. Descartei por três motivos. Em 2G, 70 KB são mais de dois segundos. A fonte cobriria latim, cirílico e grego, então um artigo em árabe, hindi ou japonês misturaria fontes na mesma página. E as serifadas de sistema dos quatro sistemas principais já são boas para tela. O preço é que a página não fica idêntica em todo aparelho; no Mac ela usa Charter e no Windows, Sitka. Aceitei isso porque a medida em `ch` mantém o número de caracteres por linha estável entre fontes.

A serifada é o padrão por dois motivos. O primeiro é separar o texto do artigo da interface: tudo o que é do artigo usa a fonte de leitura, e tudo o que é interface (barras, botões, painéis, ficha, referências) usa a sem serifa do sistema. Assim o leitor sabe, sem pensar, o que é conteúdo e o que é ferramenta. O segundo é continuidade: os títulos da Wikipédia já são serifados há mais de dez anos. As pesquisas comparando serifa e sem serifa em tela não mostram vencedor claro, e por isso a escolha fica com o leitor.

### Sem serifa

`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Noto Sans, Ubuntu, Helvetica Neue, Arial, sans-serif`

É a mesma pilha da interface. Evitei a palavra-chave `system-ui` porque no Windows em chinês ou japonês ela pode escolher uma fonte de interface CJK também para o texto latino.

### Legibilidade

Atkinson Hyperlegible Next, do Braille Institute (licença OFL), com 2% a mais de espaço entre letras e 8% entre palavras. É a única fonte baixada, e só quando o leitor a escolhe: são 48 KB (34 KB do arquivo variável e 14 KB do itálico, só o alfabeto latino). O rótulo do botão no painel de opções não usa essa fonte de propósito, porque desenhar o rótulo nela já baixaria o arquivo.

Considerei OpenDyslexic, que é a fonte mais conhecida para dislexia. Descartei porque os estudos não encontram ganho de velocidade nem de precisão de leitura com ela (Wery e Diliberto, 2017, com OpenDyslexic; Kuster e colegas, 2018, com a Dyslexie). O que tem mais evidência a favor é aumentar o espaço entre letras (Zorzi e colegas, 2012). Atkinson Hyperlegible diferencia as letras que se confundem com facilidade (I, l e 1; O e 0) e tem bom espaçamento próprio, e o espaço extra entre letras e palavras vem do CSS.

O nome da opção é "Legibilidade", não "Dislexia", porque ela também ajuda quem tem baixa visão e porque não quero prometer um efeito que a pesquisa não confirma.

## Escala e hierarquia

O corpo do texto tem 17 px no celular e 18 px a partir de 768 px, sempre em `rem`, para respeitar o tamanho de fonte que o leitor escolheu no navegador. As opções de tamanho multiplicam esse valor (90%, 100%, 112%, 125% e 142%).

| Elemento | Tamanho | Peso | Espaço |
| --- | --- | --- | --- |
| Título do artigo | 36 a 48 px, conforme a largura | regular | |
| Seção (h2) | 1,6 vez o corpo | regular | 2,2 linhas acima, 0,55 abaixo |
| Subseção (h3) | 1,22 vez o corpo | negrito | 1,8 acima, 0,5 abaixo |
| Subsubseção (h4) | igual ao corpo | negrito | 1,6 acima, 0,4 abaixo |
| Corpo | 17 ou 18 px | regular | 0,9 linha entre parágrafos |
| Interface | 15 px | regular | |
| Legendas, ficha, notas | 14 px | regular | |

Títulos grandes ficam em peso regular porque o tamanho já os separa do texto. O negrito fica para h3 e h4, onde o tamanho sozinho não basta. O espaço acima de cada título é sempre maior que o espaço abaixo, para o título ficar visualmente preso ao texto que ele abre.

Nenhum texto tem menos de 14 px, com uma exceção: os números das chamadas de referência, que são sobrescritos por convenção. Para compensar, a área clicável de cada chamada é maior que o número (ver [07-acessibilidade.md](07-acessibilidade.md)).

A entrelinha padrão é 1,6, com opções de 1,45 e 1,8. O texto é alinhado à esquerda, sem justificação e sem hifenização automática. Justificar cria espaços irregulares entre palavras, e a hifenização atrapalha quem tem dislexia; com o texto alinhado à esquerda nenhuma das duas é necessária. Uso `text-wrap: pretty` nos parágrafos, para evitar palavras sozinhas na última linha, e `text-wrap: balance` nos títulos.

No corpo, os números usam algarismos de texto quando a fonte oferece, para datas como 1543 e 1660 não saltarem da linha. Na ficha, nas tabelas e na linha de metadados os números são alinhados e de largura fixa.

## A grade

Os pontos de quebra são em `em`, não em pixels. Se o leitor aumentar a fonte padrão do navegador, a página passa para o layout de tela menor no momento certo, em vez de espremer a coluna.

| Largura | Layout |
| --- | --- |
| Até 48em (768 px) | Uma coluna. Barra inferior fixa com a seção atual e as opções de leitura |
| 48em a 64em | Uma coluna centralizada. A barra do topo fica fixa e mostra a seção atual; o sumário abre num painel lateral |
| 64em a 78em | Sumário fixo à esquerda e coluna de texto. Ficha e figuras entre parágrafos |
| A partir de 78em (1248 px) | Sumário, coluna de texto e coluna de margem com ficha e figuras |

A coluna de margem usa uma técnica conhecida da tipografia de livros na web (o Tufte CSS a popularizou): a figura flutua à direita com uma margem negativa igual à largura da margem mais o espaço entre colunas. Ela sai inteira da coluna de texto e não encurta nenhuma linha. Como continua no lugar onde os editores a colocaram no HTML, fica ao lado do parágrafo correspondente. Se duas figuras se aproximam, a segunda desce até depois da primeira.

Abaixo de 78em as figuras ficam entre parágrafos, com no máximo 384 px de largura, alinhadas ao início da coluna. Ocupar a coluna toda deixaria fotos de 250 px do Commons ampliadas e borradas, e gastaria mais dados.

A ficha é a única peça que muda de lugar no HTML. No wikitexto ela vem antes do primeiro parágrafo por convenção de edição. Mantida ali, no celular a primeira tela seria a ficha inteira, com o texto começando abaixo da dobra (problema P2). Movi a ficha para depois do primeiro parágrafo da introdução, que é o que o Minerva já faz no celular. É uma exceção consciente ao princípio 1 e está registrada em [D08](registro-de-decisoes.md#d08-mover-a-ficha-para-depois-do-primeiro-parágrafo).

## O que o build faz com o HTML do artigo

`scripts/transform.mjs` recebe o HTML do Parsoid e devolve o HTML do artigo. Nenhuma palavra do artigo é alterada. A lista abaixo é completa.

1. Remove os `<style>` das predefinições, os `<link>` de categoria e os marcadores vazios. As categorias visíveis vêm da API e aparecem no rodapé.
2. Remove uma lista escondida (`#interProject`) que o Vector usa para montar a barra lateral. O mesmo conteúdo está visível na caixa "Outros projetos" da seção Ligações externas.
3. Remove 5 ícones decorativos: os três dos avisos de manutenção, o da nota de desambiguação e o atalho para a documentação da predefinição da ficha.
4. Reescreve links internos para apontar para a pt.wikipedia.org. Marca links vermelhos e externos com classes, sem mudar o texto.
5. Troca endereços de imagem relativos por absolutos, tira os parâmetros de rastreamento `utm_*` e gera um `srcset` com as larguras padronizadas da Wikimedia (330 e 500 px). Links de imagem sem texto alternativo recebem um nome acessível com o nome do arquivo; o `alt` continua como os editores deixaram.
6. Converte os avisos de manutenção de tabela de layout para nota (`role="note"`), com o mesmo texto. A parte "Ajude a inserir referências" fica em cor secundária.
7. Converte a nota de desambiguação em parágrafo com `role="note"`.
8. Converte a ficha em `<aside>` com rótulo, tira os estilos inline (como o fundo laranja do título) e a move para depois do primeiro parágrafo.
9. Converte as caixas de navegação e o controle de autoridade em `<details>`, fechados como no original. Funcionam sem JavaScript.
10. Tira o estilo inline das predefinições, preservando `white-space: nowrap` (que evita quebrar "século XVII").
11. Envolve tabelas de dados num contêiner com rolagem horizontal acessível por teclado. O Chá não tem tabelas de dados, mas a regra fica para outros artigos.
12. Liga cada seção ao seu título (`aria-labelledby`) e conta as palavras por seção.
13. Troca as setas "↑" das referências por "Citada em" e o nome da seção. A fonte 6, citada três vezes em Variedades, mostra "Citada em Variedades (1, 2, 3)", e cada número volta ao ponto da citação.
14. Remove os atributos internos do Parsoid (`data-mw`, `about`, `typeof` e os ids `mwXX` que ninguém usa).

O HTML do Parsoid tem 121 KB. A página final, com toda a interface, tem 98 KB, ou 24,6 KB comprimida.
