# 10. Limitações

## Uma página só

O protótipo mostra um artigo. Isso deixou de fora a frente "não se perder ao navegar entre vários artigos". A ideia que eu seguiria tem duas partes. A primeira já existe na Wikipédia: a prévia de página ao passar o mouse sobre um link, que evita abrir um artigo só para descobrir o que ele é. A segunda é nova: um registro dos artigos abertos naquela aba, com o parágrafo onde o leitor estava em cada um, e um "Voltar para Chá" no topo do artigo seguinte que leva de volta ao parágrafo, não ao topo. Para demonstrar isso seriam necessários vários artigos construídos com o mesmo sistema, e esse custo ficou fora do escopo.

Também por isso, o desenho não foi testado com:

- um artigo longo, com centenas de referências e dezenas de seções (a versão inglesa, "Tea", seria o teste natural);
- tabelas de dados, que o Chá não tem;
- escrita da direita para a esquerda, como árabe e hebraico;
- outros alfabetos e textos de interface traduzidos.

O código foi escrito pensando nesses casos (propriedades lógicas no CSS, largura em `ch`, textos de interface num arquivo só, tabelas com rolagem própria), mas nada disso foi verificado.

## Dados congelados

O artigo, o histórico, a discussão e os idiomas são da revisão 73198638, baixados em 15 de outubro de 2026. Na Wikipédia real esses dados viriam do servidor a cada visita. O painel de histórico, por exemplo, mostra as edições até essa data.

## Fontes diferentes em cada sistema

A calibração da largura da coluna (65 caracteres por linha) foi feita com Charter, no Mac. No Windows a fonte seria Sitka Text ou Georgia, e no Android Noto Serif. A medida em `ch` acompanha a largura de cada fonte, então o número deve ficar próximo, mas não foi medido.

## O que o desenho não resolve

Problemas de conteúdo continuam lá, de propósito. A ficha mostra "tea leaves", "steeping" e "boiling" sem tradução, repete a mesma lista em "Técnicas" e "Material", e nenhuma imagem do artigo tem texto alternativo. A interface deixa alguns desses problemas mais visíveis (a lista "Onde estes itens aparecem no texto" mostra que três itens não aparecem no texto), mas corrigir é trabalho de editor.

Estilos inline que os editores colocam no conteúdo, como células de tabela coloridas, continuam como estão. No tema escuro eles podem ficar ilegíveis. A própria Wikipédia enfrenta esse problema no modo escuro dela. O Chá não tem esse caso.

Imagens com fundo transparente (mapas, diagramas) podem sumir no tema escuro. Também não é o caso do Chá.

A comparação de tamanho entre idiomas usa bytes de código-fonte, que incluem marcação e predefinições. É uma indicação grosseira, e por isso só aparece entre idiomas do mesmo alfabeto.

A busca no artigo ignora acentos e maiúsculas e encontra pedaços de palavra ("folha" encontra "folhas"), mas não encontra sinônimos. A lista da ficha exige a palavra inteira, então não ligaria "folha" a "folhas".

As preferências e a posição de leitura ficam no navegador. Não acompanham o leitor em outro aparelho.

## O que faltou verificar

Leitores de tela reais, Firefox e Safari, aparelhos reais, conexão lenta simulada e o modo de alto contraste do Windows (ver [09-desempenho-e-testes.md](09-desempenho-e-testes.md#o-que-não-foi-testado)).

O mais importante que faltou foi testar com leitores. Um roteiro curto, com cinco ou seis pessoas, já diria muito:

1. "Descubra quanto chá os Açores produzem por ano." Mede se a busca e o sumário são encontrados e entendidos.
2. "Verifique de onde vem a informação de que o chá branco é o mais raro." Mede o uso da prévia de referência.
3. "Você vai usar este artigo num trabalho. Cite-o em ABNT." Mede se Citar é encontrado.
4. "Leia até a metade, feche a aba e volte." Mede se a oferta de retomada é percebida e se incomoda.
5. "Deixe a leitura mais confortável para ler à noite." Mede as opções de leitura.
6. "Este artigo é confiável?" Pergunta aberta, para ver se o leitor usa avisos, histórico e discussão.

## Marca

O protótipo usa o nome Wikipédia só para identificar o assunto do redesign. A página diz no topo e no rodapé que não é um site da Wikimedia, aponta o endereço canônico para o artigo real e pede aos buscadores para não indexá-la (`noindex`). Não usa o logotipo.
