# 2. Tese e princípios

## A tese

A Wikipédia é uma biblioteca viva. O redesign parte dessa ideia e tira dela uma restrição: o texto pertence aos editores e chega ao leitor inteiro. Nada é resumido, encurtado, reordenado ou reescrito.

O que muda é tudo em volta do texto. Uma biblioteca boa não encurta os livros. Ela tem catálogo, sinalização e índice. Traduzi cada uma dessas três palavras em uma pergunta que o leitor faz e que a página tem que responder.

O catálogo responde "que livro é este?". No artigo, isso é o que se sabe sobre o texto: quando foi editado, quantas pessoas escreveram, se foi vandalizado, quais avisos os editores deixaram, em que outros idiomas existe e se essas versões são mais completas. Hoje essas informações existem, mas ficam atrás de links para páginas de editor (problemas P4 e P5 da [auditoria](01-auditoria.md)).

A sinalização responde "onde estou e para onde posso ir?". Seção atual, quanto falta, de onde vim, como volto (P3, P6 e P7).

O índice responde "onde o artigo fala de X?". Busca que entende seções, infobox que aponta para o texto (P7 e P8).

A tipografia vem antes de tudo isso. Se a linha tem 120 caracteres (P1), nenhuma funcionalidade compensa.

## Princípios

Escrevi os princípios como regras que dá para verificar, com um exemplo do artigo Chá em cada uma. Quando duas regras entraram em conflito durante o projeto, a ordem abaixo decidiu.

### 1. O conteúdo não muda, só a apresentação

Todo texto, referência, imagem, tabela e aviso do artigo aparece na ordem em que os editores colocaram. A interface pode mudar onde um elemento fica na tela e como ele se parece, mas não o que ele diz.

No Chá isso significa manter visíveis as duas marcações "carece de fontes" da seção História, manter os três avisos de manutenção e manter "tea leaves", "steeping" e "boiling" em inglês na infobox. Também significa não recolher seções por padrão no celular: seção fechada é conteúdo que o leitor não vê.

O que removi foram elementos de interface das predefinições que não carregam informação: o ícone de livro com interrogação no aviso de fontes e o ícone de desambiguação na nota do topo. O texto de cada aviso continua igual. A lista completa do que foi transformado está em [04-tipografia-e-layout.md](04-tipografia-e-layout.md#o-que-o-build-faz-com-o-html-do-artigo).

### 2. A coluna de texto tem largura fixa

Nada flutua dentro da coluna de texto. Infobox e figuras ficam na margem quando há espaço e entre parágrafos quando não há. A medida da linha fica entre 55 e 75 caracteres em qualquer tela, e quem decide onde dentro dessa faixa é o leitor.

Essa regra resolve P1 e P2 de uma vez. É também a decisão de layout que mais influenciou o resto, porque obriga a ter uma coluna de margem no computador.

### 3. O leitor sempre sabe em que seção está

Em qualquer largura de tela existe um elemento fixo que mostra a seção atual: o sumário lateral no computador, a barra superior no tablet e a barra inferior no celular. Ao tocar nele, o leitor chega ao sumário completo e à busca no artigo.

### 4. A página funciona sem JavaScript

O artigo, o sumário, os links para referências, as caixas de navegação e as opções de busca da Wikipédia funcionam só com HTML e CSS. O JavaScript acrescenta as prévias de referência, a busca no artigo, a retomada de leitura, os painéis e as preferências. Se o script não carregar, os botões de Histórico, Discussão, Citar e Idiomas viram links para as páginas equivalentes da Wikipédia.

Isso vem da restrição de conexão ruim. Em 2G, o HTML chega bem antes do JavaScript, e o leitor já pode ler.

### 5. Não pesar mais que a página atual

A página atual do Chá transfere cerca de 54 KB de HTML e 178 KB de outros recursos em 37 requisições. O redesign tem um orçamento menor que isso: HTML de até 60 KB comprimido, CSS de até 15 KB, JavaScript de até 20 KB, nenhuma fonte baixada por padrão. As imagens são as mesmas do artigo, servidas pelo mesmo servidor da Wikimedia, e carregam só quando se aproximam da tela.

O resultado ficou em 24,6 KB de HTML, 7,2 KB de CSS e 11,8 KB de JavaScript, comprimidos. O orçamento eliminou ideias boas na aparência; fontes customizadas são o exemplo principal (ver [04-tipografia-e-layout.md](04-tipografia-e-layout.md#família-tipográfica)).

### 6. Nada se move sozinho

Não há animações, transições, rolagem suave nem elementos que aparecem ou somem conforme a direção da rolagem. Um painel abre de uma vez. Um salto para uma seção acontece de uma vez.

A preferência `prefers-reduced-motion` existe, mas depende de a pessoa saber que ela existe e onde ativar no sistema. Quem tem distúrbio vestibular, enxaqueca ou dificuldade de atenção muitas vezes não sabe. Como movimento não acrescenta nada a uma tarefa de leitura, a escolha mais segura é não ter movimento para ninguém. A justificativa completa está em [07-acessibilidade.md](07-acessibilidade.md#movimento).

### 7. Uma cor de destaque, para o que é clicável

O azul é dos links e do foco de teclado. Todo o resto usa tons de cinza do tema. Seção atual, avisos e botões se diferenciam por peso, tamanho e espaço.

### 8. O layout não depende do português

A Wikipédia existe em mais de 300 idiomas. Nenhum rótulo tem largura fixa, os grupos de botões quebram linha quando não cabem, o espaçamento usa propriedades lógicas (início e fim em vez de esquerda e direita) e a largura da coluna é medida em caracteres do próprio texto, não em pixels. Todos os textos de interface estão num arquivo só (`src/strings/pt.mjs`), pronto para tradução. O que ficou sem testar está em [10-limitacoes.md](10-limitacoes.md).

### 9. Ferramentas do leitor à vista, ferramentas do editor a um passo

Idiomas, Discussão, Histórico e Citar ficam no cabeçalho do artigo, com texto e não com ícones. Editar fica ali também, porque convidar o leitor a editar faz parte do que a Wikipédia é. Ferramentas que só servem a editores (páginas afluentes, alterações relacionadas, enviar ficheiro) continuam acessíveis pelo link "Mais ferramentas na Wikipédia", no rodapé do artigo.

## O que este redesign não tenta fazer

Ele não mexe na edição, na página principal, na busca global nem nas páginas especiais. Também não usa resumos automáticos nem qualquer geração de texto. Esse último ponto vale registrar porque é uma tentação óbvia em 2026: um resumo gerado no topo do artigo resolveria "encontrar a informação rápido" para alguns leitores, mas colocaria na frente do texto dos editores um texto que nenhum editor escreveu nem pode corrigir. É o oposto da tese.
