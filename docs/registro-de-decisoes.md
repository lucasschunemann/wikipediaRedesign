# Registro de decisões

Cada entrada tem o problema, as alternativas, a escolha e o motivo. As entradas estão na ordem em que as decisões foram tomadas. Quando uma decisão foi revista, a entrada original continua aqui e a revisão aparece como uma entrada nova que aponta para ela.

---

## D01. Usar o HTML do Parsoid como fonte do conteúdo

Problema: O protótipo precisa do artigo inteiro, com referências, infobox, imagens e caixas de navegação, numa forma que dê para transformar sem perder nada.

Alternativas: Copiar o HTML renderizado da página (com a interface do Vector junto). Usar o wikitexto e renderizar por conta própria. Usar o HTML do Parsoid pela API REST.

Escolha: HTML do Parsoid (`/api/rest_v1/page/html/Chá`).

Por quê: É o mesmo HTML que a pt.wikipedia já usa para mostrar a página: o rodapé do artigo diz "A página foi renderizada com Parsoid". Ele marca a estrutura de forma explícita: cada seção vem num `<section>`, cada referência tem tipo e identificador, cada imagem é uma `<figure>`. Renderizar wikitexto por conta própria exigiria reimplementar as predefinições, e o resultado não seria o artigo real. Isso também deixa a proposta mais realista: um redesign que consome o HTML que a Wikimedia já produz pode ser adotado sem mudar o motor de renderização.

---

## D02. Congelar o artigo numa revisão

Problema: O artigo muda. Se o site buscasse o conteúdo a cada visita, a documentação poderia descrever algo que não existe mais.

Alternativas: Buscar na hora pelo navegador. Buscar no build e guardar.

Escolha: O script `scripts/fetch.mjs` baixa a revisão 73198638 e os metadados para `data/cha/`. O build lê só desses arquivos.

Por quê: A documentação cita números do artigo (12 citações, 3 avisos, 531 edições) e eles precisam bater com o que o site mostra. Também deixa o build reproduzível sem rede. A desvantagem é que o histórico e a discussão mostrados no protótipo são de 15 de outubro de 2026. Na Wikipédia real esses dados viriam do servidor a cada visita.

---

## D03. Stack sem framework

Problema: Escolher como construir o site.

Alternativas: Um framework de componentes (React, Svelte) com renderização no servidor. Um gerador de site estático. HTML, CSS e JavaScript sem framework, com um script de build em Node.

Escolha: HTML, CSS e JavaScript sem framework. O build em Node usa `linkedom` para transformar o HTML do artigo. O CSS e o JavaScript são um arquivo cada, servidos como foram escritos. Cheguei a instalar o `esbuild` para minificar e removi: os dois arquivos já ficaram abaixo do orçamento comprimidos, e código legível no navegador ajuda quem for estudar o protótipo.

Por quê: A restrição de conexão ruim pesa mais que a conveniência. O artigo precisa estar no HTML entregue pelo servidor e ser legível antes de qualquer script. Um framework traria um runtime de dezenas de KB para gerenciar uma página que é, na maior parte, texto estático. As partes interativas (painéis, busca, prévias) são independentes entre si e cabem em módulos pequenos. A Wikipédia real usa uma abordagem parecida: HTML do servidor e JavaScript que melhora a página depois.

---

## D04. Fontes do sistema por padrão

Problema: A tipografia é o centro do redesign, e uma fonte desenhada para leitura longa daria mais controle. Mas a página precisa carregar rápido e funcionar em centenas de idiomas.

Alternativas: Fonte web para o texto (Source Serif 4 ou Literata, cerca de 70 KB para regular e itálico só no alfabeto latino). Fontes do sistema. Fontes do sistema por padrão e fontes web só quando o leitor escolhe.

Escolha: Fontes do sistema para as opções serifada e sem serifa. A opção de legibilidade usa Atkinson Hyperlegible Next, que só é baixada se o leitor escolher essa opção.

Por quê: Detalhes em [04-tipografia-e-layout.md](04-tipografia-e-layout.md#família-tipográfica). Em resumo: 70 KB a mais em 2G são mais de dois segundos; a fonte web cobriria só latim, cirílico e grego, e artigos em árabe, hindi ou japonês misturariam fontes; e os sistemas atuais já trazem serifadas boas para tela (Charter no Mac e iOS, Sitka no Windows, Noto Serif no Android).

---

## D05. Não recolher seções no celular

Problema: O Minerva recolhe as seções para que a página caiba numa visão geral. Isso esconde subseções e tira a noção de posição (P3).

Alternativas: Manter recolhido. Recolher com `hidden="until-found"`, que deixa a busca do navegador encontrar texto escondido. Mostrar tudo aberto e oferecer sumário e busca numa barra fixa.

Escolha: Tudo aberto, com a barra inferior levando ao sumário e à busca.

Por quê: O sumário dá a mesma visão geral que as seções recolhidas, inclusive das subseções, sem esconder texto. Ler um artigo inteiro no celular deixa de exigir abrir dez seções. O custo é uma página longa, que a barra inferior compensa.

---

## D06. Coluna de texto fixa e coluna de margem

Problema: A medida da linha varia de 64 a 121 caracteres no mesmo artigo porque infobox e imagens flutuam dentro da coluna (P1).

Alternativas: Manter as imagens flutuando, mas dentro de uma coluna estreita (a variação continua, só diminui). Colocar todas as imagens entre parágrafos, na largura da coluna. Criar uma coluna de margem para infobox e figuras no computador e colocá-las entre parágrafos nas telas menores.

Escolha: Coluna de margem no computador, figuras entre parágrafos no resto.

Por quê: A medida da linha deixa de depender do conteúdo. Na margem, as figuras ficam ao lado do parágrafo em que os editores as colocaram, então a relação entre imagem e texto se mantém. Detalhes em [04-tipografia-e-layout.md](04-tipografia-e-layout.md#a-grade).

---

## D07. Sumário e busca no mesmo lugar

Problema: o leitor precisa encontrar trechos dentro do artigo, e o Ctrl+F não sabe em que seção está cada resultado.

Alternativas: interceptar o Ctrl+F; um botão de busca separado na barra do topo; um campo dentro da navegação de seções.

Escolha: o campo "Buscar neste artigo" fica em cima do sumário, e os resultados substituem o sumário enquanto há busca, agrupados por seção.

Por quê: buscar e navegar respondem à mesma pergunta. No celular, os dois ficam atrás do mesmo botão da barra inferior. Detalhes em [06-funcionalidades.md](06-funcionalidades.md#busca-no-artigo).

---

## D08. Mover a ficha para depois do primeiro parágrafo

Problema: no wikitexto a ficha vem antes do texto. No celular, isso faria a primeira tela ser a ficha inteira (problema P2).

Alternativas: manter a ordem e aceitar a primeira tela ocupada; manter a ordem no HTML e reordenar só visualmente com CSS; mover no HTML para depois do primeiro parágrafo, como o Minerva faz.

Escolha: mover no HTML.

Por quê: reordenar só com CSS faria a ordem de foco do teclado (os links da ficha) não bater com a ordem visual, o que é uma falha de acessibilidade. A ficha é um resumo do artigo, não um trecho do texto corrido, e o Minerva já faz essa mudança há anos. É a única exceção ao princípio de manter a ordem dos editores. No computador largo a ficha fica na margem, ao lado do começo de História.

---

## D09. Prévia de referência ao clicar

Problema: hoje a prévia depende do mouse, e o clique leva ao fim da página (P6).

Alternativas: notas na margem, sempre visíveis; prévia ao passar o mouse; prévia ao clicar.

Escolha: prévia ao clicar, ancorada na chamada, que fecha com Esc ou clique fora.

Por quê: o clique funciona igual com mouse, teclado e toque. As notas na margem disputariam espaço com a ficha e as figuras e não escalam para artigos com centenas de referências.

---

## D10. Um painel para todas as ferramentas

Problema: Idiomas, Discussão, Histórico, Citar e Opções de leitura precisavam de um lugar para mostrar conteúdo.

Alternativas: um componente para cada (menu suspenso, página separada, janela modal); um painel lateral comum a todas.

Escolha: o mesmo painel para todas. Lateral e não modal no computador, folha que sobe da base no celular.

Por quê: o leitor aprende uma vez onde as coisas aparecem. No computador, o painel não bloqueia o texto, então dá para ler e consultar ao mesmo tempo.

---

## D11. Retomar a leitura com uma oferta

Problema: nenhuma versão lembra onde a leitura parou (P7).

Alternativas: rolar até o ponto salvo automaticamente; oferecer a volta com um botão.

Escolha: oferecer. "Você parou em Preparação, em 13 de outubro", com Continuar e Dispensar.

Por quê: rolagem automática tira o controle do leitor e é movimento que ele não pediu. A posição é guardada pelo parágrafo e não por pixels, para continuar certa se o tamanho do texto mudar.

---

## D12. Links vermelhos sem vermelho

Problema: os 12 links para artigos inexistentes são vermelhos, uma segunda cor de destaque na página.

Alternativas: manter o vermelho; tratar como texto comum; texto secundário com sublinhado pontilhado.

Escolha: texto secundário com sublinhado pontilhado e título "página ainda não existe".

Por quê: para quem lê, o link vermelho chama mais atenção do que merece. Para quem edita, o pontilhado ainda sinaliza a falta do artigo. Tratar como texto comum esconderia que existe ali um link.

---

## D13. Nenhuma animação

Problema: decidir o papel do movimento na interface.

Alternativas: animações curtas com `prefers-reduced-motion` desligando tudo; nenhuma animação para ninguém.

Escolha: nenhuma animação, transição ou rolagem suave.

Por quê: a preferência do sistema depende de a pessoa saber que ela existe. Ler é uma tarefa parada, e movimento não acrescenta informação a ela. Detalhes em [07-acessibilidade.md](07-acessibilidade.md#movimento).

---

## D14. Atkinson Hyperlegible em vez de OpenDyslexic

Problema: a opção de fonte para dislexia ou maior legibilidade.

Alternativas: OpenDyslexic; Atkinson Hyperlegible Next; uma fonte de sistema com mais espaçamento.

Escolha: Atkinson Hyperlegible Next com 2% a mais de espaço entre letras e 8% entre palavras, com o nome "Legibilidade".

Por quê: os estudos não mostram ganho de leitura com fontes específicas para dislexia; o espaçamento tem mais evidência. Detalhes em [04-tipografia-e-layout.md](04-tipografia-e-layout.md#legibilidade).

---

## D15. Largura da coluna em `ch`, corrigida por família

Problema: com o mesmo valor em `ch`, cada fonte dava um número diferente de caracteres por linha (65, 72 e 60).

Alternativas: largura em pixels ou `rem`; `ch` puro; `ch` com um fator por família.

Escolha: `ch` com fator (1; 0,9; 1,08).

Por quê: em pixels, a medida mudaria com o tamanho do texto escolhido pelo leitor. Com o fator, as três famílias dão 65 caracteres por linha na opção média.

---

## D16. Tamanho entre idiomas só no mesmo alfabeto

Problema: mostrar quais versões do artigo são mais completas, com a única medida disponível sendo bytes de código-fonte.

Alternativas: mostrar os bytes de todas; esconder o tamanho; mostrar a proporção só para idiomas do mesmo alfabeto.

Escolha: proporção só no mesmo alfabeto, com uma nota explicando.

Por quê: em canarês cada letra ocupa três bytes, e o artigo aparecia como o maior de todos (247 KB). Entre idiomas de alfabeto latino, a proporção é um bom indicador ("3,6× o tamanho" para o inglês).

---

## D17. Reduzir o escopo para a página do Chá

Problema: o plano inicial incluía outros artigos (Camellia sinensis, para demonstrar a navegação entre artigos, e um artigo longo, para testar escala), versões de teste com textos 40% mais longos e com escrita da direita para a esquerda, prévia de links e o registro de artigos visitados. Isso multiplicava o custo do protótipo.

Alternativas: manter tudo; reduzir para uma página bem resolvida e documentar o resto como limitação.

Escolha: uma página, a do Chá.

Por quê: a tese do projeto é sobre ler um artigo, e preferi concentrar o trabalho numa página completa, testada e documentada. O que saiu está descrito em [10-limitacoes.md](10-limitacoes.md).

