# 3. Arquitetura de informação

> Atualização da versão 2: o diagrama da estrutura e a linha da ficha foram atualizados. A navegação de seções deixou de ser lateral. Ver [11-versao-2-editorial.md](11-versao-2-editorial.md).

## Quatro camadas de navegação

Separei tudo o que a página oferece pelo alcance de cada coisa. Essa separação decidiu onde cada elemento mora na tela.

| Camada | Pergunta do leitor | O que responde |
| --- | --- | --- |
| Dentro do artigo | Onde estou? Onde fala de X? | Seções, busca no artigo, referências, retomar leitura |
| Sobre o artigo | Posso confiar neste texto? | Avisos dos editores, histórico, discussão, idiomas, citar |
| Entre artigos | De onde vim? Vale abrir este link? | Fora do escopo deste protótipo, que tem uma página só (ver [10-limitacoes.md](10-limitacoes.md)) |
| Wikipédia | Quero outra coisa | Busca na Wikipédia, página principal, doar, entrar |

A camada de dentro do artigo é a mais usada e fica sempre ao alcance, fixa na tela. A camada sobre o artigo fica no cabeçalho do artigo e se repete no fim dele. A camada da Wikipédia fica na barra do topo, que é a única coisa que não muda de artigo para artigo.

## Estrutura da página

```
barra do topo         Buscar na Wikipédia · marca (depois do título: título e seção atual) · Opções de leitura · Entrar · Doar
                      (aviso: protótipo conceitual, não é um site da Wikimedia)
                      linha de progresso da leitura

painel de seções      Buscar neste artigo
                      Seções (com a atual marcada)

artigo
  cabeçalho           Você parou em [seção], se houver uma leitura anterior
                      Título
                      Descrição curta (Wikidata)
                      Escrito por N colaboradores em N edições desde [ano]
                      Tempo de leitura · data da última edição
                      Idiomas (217) · Discussão (2) · Histórico · Citar ... Seções e busca · Editar
                      Imagem de abertura (a imagem principal da ficha)
  corpo               nota de desambiguação, aviso de fontes, texto da introdução, ficha
                      "Neste artigo" (sumário)
                      seções na ordem do artigo
  fim do artigo       Referências · Ligações externas · Caixas de navegação
  rodapé do artigo    Categorias · Atribuição e licença · Revisão · Mais ferramentas na Wikipédia

painéis               Opções de leitura · Idiomas · Discussão · Histórico · Citar
                      Prévia de referência
```

## De onde veio cada coisa do Vector 2022

| No Vector 2022 | No redesign | Por quê |
| --- | --- | --- |
| Menu principal (☰) | Fora da página de leitura. A marca leva à página principal | O menu tem 17 links para a comunidade de editores. Não ajuda quem está lendo um artigo |
| Busca | Barra do topo, igual | É a forma principal de chegar a um artigo |
| Doar, Criar conta, Iniciar sessão | Doar e Entrar na barra do topo. Criar conta fica dentro de Entrar | A Wikipédia vive de doações, então o link fica visível. Criar conta é um passo de quem já decidiu entrar |
| Conteúdos (índice) | Bloco "Neste artigo" no texto e painel "Seções e busca", com a busca no artigo junto | Buscar e navegar respondem à mesma pergunta: onde está o que procuro |
| Abas Artigo e Discussão | Discussão no cabeçalho, com o número de tópicos | Uma aba sem informação não diz se vale a pena clicar |
| Ler, Editar, Ver histórico | Histórico e Editar no cabeçalho. "Ler" some porque é o estado da página | |
| Ferramentas (⋮, 18 itens) | Citar vai para o cabeçalho. Link permanente e imprimir ficam no painel Citar. Informação da página fica no painel Histórico. O resto vai para "Mais ferramentas na Wikipédia" | Separar o que o leitor usa do que o editor usa |
| 217 idiomas | Idiomas, no cabeçalho, com painel próprio | Mesmo lugar, mais critério para escolher (ver [06-funcionalidades.md](06-funcionalidades.md#idiomas)) |
| Aparência | Opções de leitura, na barra do topo | É uma preferência do leitor e vale para todos os artigos, então mora na camada da Wikipédia |
| Avisos de manutenção | No mesmo lugar do artigo, em formato compacto | Princípio 1: o aviso fica onde o editor colocou |
| Infobox | Bloco na coluna, depois do primeiro parágrafo. A imagem principal vai para a abertura do artigo | Princípio 2: nada flutua na coluna de texto |
| Referências | Prévia ao clicar, lista no fim com o nome da seção de cada citação | Ver [06-funcionalidades.md](06-funcionalidades.md#referências) |
| Categorias e rodapé | Rodapé do artigo, com a atribuição completa | |

## Hierarquia das ações no cabeçalho

O cabeçalho do artigo tem cinco ações. Considerei três arranjos.

O primeiro repetia o Vector: abas à esquerda (Artigo, Discussão) e à direita (Ler, Editar, Histórico), mais um menu. É familiar para quem já usa a Wikipédia, mas abas sugerem páginas irmãs do mesmo peso, e Discussão não é uma versão alternativa do artigo.

O segundo agrupava tudo em um menu "Sobre este artigo". Reduz o ruído, mas repete o problema P4: o que está num menu não é visto.

O terceiro, escolhido, é uma linha de botões de texto, na ordem de uso estimado para quem lê: Idiomas, Discussão, Histórico, Citar, Editar. Cada um mostra um dado quando ele existe ("Idiomas 217", "Discussão 2"), porque o número ajuda a decidir se vale abrir. Editar vem por último e é o único que sai do protótipo: leva ao editor da Wikipédia.

A linha quebra em duas quando não cabe. Isso importa para outros idiomas: em alemão, "Versionsgeschichte" ocupa quase o dobro de "Histórico".

## Nomes

Os rótulos dizem o que acontece. Algumas escolhas:

"Seções" em vez de "Conteúdos" ou "Índice". "Conteúdos" é o termo atual, mas soa como tradução literal. "Índice" no português do Brasil costuma ser o índice remissivo, no fim do livro; o que a Wikipédia tem é um sumário. "Sumário", por outro lado, soa formal e é pouco usado em Portugal. "Seções" é literal nas duas variantes.

"Opções de leitura" em vez de "Aparência". Aparência descreve o efeito, opções de leitura descreve para que serve.

"Buscar neste artigo" e "Buscar na Wikipédia" sempre com o complemento, porque as duas buscas convivem na mesma tela.

## Fluxos principais

Cheguei pelo buscador e quero um dado específico. Leio o título e a descrição curta para confirmar que estou no artigo certo. Abro "Seções e busca" (no celular, tocando na barra inferior) e digito "Açores". Os resultados aparecem agrupados por seção: um em Cultivo, três em Açores. Escolho um e a página vai até o trecho, que fica destacado.

Estou lendo no celular e fui interrompido. Dois dias depois volto ao artigo. No topo aparece "Você parou em Variedades, em 13 de outubro" e um botão "Continuar". A página não rola sozinha: quem decide é o leitor.

Quero verificar uma afirmação. Toco em "[6]" no fim de uma frase de Variedades. A referência abre logo abaixo da frase, com o link para a fonte e a informação de que ela é citada três vezes no artigo. Fecho com Esc ou tocando fora, e estou no mesmo ponto.

Vou usar o artigo num trabalho. Abro Citar, escolho ABNT e copio. A citação traz o link permanente para esta revisão e a data de hoje como data de acesso.

Quero saber onde o artigo fala de cafeína. Abro "Onde estes itens aparecem no texto", no pé da ficha, e vejo que cafeína aparece em Cultura do chá, Substitutos do chá e Preparação. Também vejo que "tea leaves", "steeping" e "boiling" não aparecem no texto: são rótulos do Wikidata sem tradução.
