# 7. Acessibilidade

A meta é WCAG 2.2 nível AA em todos os temas. Esta página diz o que foi feito, como foi verificado e o que ficou sem verificar.

## Estrutura

A página tem uma região para cada coisa: barra do topo (`header`), navegação do artigo (`nav`, rotulada "Seções"), conteúdo (`main` com um `article`) e rodapé. Os dois primeiros elementos focáveis são links para pular direto para o texto e para as seções.

Os títulos seguem a hierarquia do artigo: o título é o único `h1`, as seções são `h2`, `h3` e `h4` como os editores definiram. Cada `section` é ligada ao seu título por `aria-labelledby`, então quem navega por regiões ouve "Cultivo, região" em vez de "região".

O artigo tem `lang="pt"`. No painel de idiomas, cada link tem `lang` e `hreflang` do idioma de destino, para o leitor de tela pronunciar "Deutsch" como alemão.

Avisos dos editores e a nota de desambiguação são `role="note"`. A ficha é um `aside` com o rótulo "Ficha: Chá". As caixas de navegação são `details` e `summary` nativos, que leitores de tela anunciam como recolhíveis sem nenhum código extra.

## Teclado

Tudo funciona com teclado, na ordem em que aparece na tela.

Os botões do cabeçalho (Idiomas, Discussão, Histórico, Citar) são links para páginas da Wikipédia que o JavaScript transforma em botões: recebem `role="button"`, respondem a Enter e à barra de espaço e informam se o painel está aberto (`aria-expanded`). Sem JavaScript, continuam sendo links que funcionam.

Ao abrir um painel ou a prévia de referência, o foco vai para o título dele, para o leitor de tela anunciar o que abriu. Esc fecha, e o foco volta ao botão ou à chamada que abriu. No computador os painéis não são modais: dá para voltar ao texto com Tab ou com o mouse sem fechar o painel, o que permite ler e consultar o histórico ao mesmo tempo. No celular eles são modais (`showModal`), porque cobrem a página e o resto dela fica inerte.

Na busca, Enter vai para o próximo resultado e Shift+Enter para o anterior sem tirar o foco do campo. Clicar num resultado move o foco para o parágrafo encontrado, para o leitor de tela começar a ler dali.

Não criei atalhos de uma tecla só. A WCAG 2.1.4 exige que eles possam ser desligados, porque disparam sem querer para quem usa comando de voz ou tem tremor.

## Leitores de tela

O item atual do sumário tem `aria-current="true"`. O resumo da busca ("6 resultados em 4 seções") é anunciado por `role="status"`, assim como "Copiado." no painel Citar e o valor do tamanho do texto ao usar A− e A+. Os resultados da busca não ficam numa região viva inteira, porque seriam lidos todos de uma vez a cada letra digitada.

As imagens do artigo não têm texto alternativo; os editores não o escreveram, e isso também acontece na Wikipédia hoje. Mudar o `alt` seria mudar conteúdo. O que fiz foi dar um nome ao link de cada imagem ("Arquivo da imagem: Malaysia-tea plantation.jpg"), para o link não ser anunciado só como "link". A legenda continua sendo a descrição principal.

## Tamanho dos alvos

Todo botão tem pelo menos 36 px de altura. As chamadas de referência são números sobrescritos de uns 12 px, pequenos por convenção tipográfica. Para não exigir precisão, cada uma tem uma área clicável invisível maior que o número. Na lista da ficha, onde os links ficam empilhados linha a linha, aumentei a entrelinha para que cada link tenha pelo menos 24 px de altura (critério 2.5.8). Links dentro do texto corrido são isentos desse critério.

## Contraste

A tabela completa está em [05-sistema-visual.md](05-sistema-visual.md#contraste-medido). Todo texto passa de 4,5:1 nos três temas. Bordas de campos e botões passam de 3:1, que é o mínimo para componentes de interface (1.4.11). O anel de foco tem 2 px na cor dos links, com 2 px de folga, e passa de 6:1 em todos os temas.

## Texto e zoom

Todos os tamanhos são em `rem` e `em`, e os pontos de quebra também. Se o leitor aumenta a fonte padrão do navegador, a página inteira cresce e o layout troca para o de tela menor no momento certo. A 320 px de largura com o texto em 142%, a página não rola na horizontal (medido).

## Movimento

O movimento é mínimo e opcional. A única transição é uma mudança de cor de 100 ms, linear, ao passar o mouse ou focar em botões, itens do sumário e escolhas das opções. Nada se desloca, cresce, desliza ou aparece. Painéis abrem de uma vez, um salto para uma seção acontece de uma vez e a página nunca rola sozinha: a retomada de leitura oferece um botão "Continuar" em vez de levar o leitor até lá.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
  }
}
html { scroll-behavior: auto; }
```

Na primeira versão do projeto não havia nenhuma transição, para ninguém. A revisão visual pediu um acabamento no nível de Notion e Linear, que têm um retorno de hover. Mantive só o que não desloca nada: uma troca de cor curta é percebida como resposta do botão e não dispara os problemas que a WCAG 2.3.3 trata (movimento de interface que causa náusea, tontura ou perda de foco). Quem pede menos movimento no sistema não recebe nem isso.

O que continua valendo da regra original:

- A preferência do sistema fica em configurações que pouca gente conhece; por isso o movimento já nasce pequeno para todos.
- Ler é uma tarefa parada. Um painel que desliza ou um título que aparece com fade não acrescenta informação; só disputa a atenção com o texto.
- Animação custa processamento, e a Wikipédia precisa funcionar em aparelhos simples.
- Nenhuma animação de entrada, de rolagem ou de layout. A rolagem é sempre a do navegador.

Um efeito colateral do teste: com o painel do navegador oculto, as transições ficam congeladas no meio e o axe pode medir uma cor intermediária. Rodei a verificação com as transições desligadas para medir as cores finais.

## Preferências do sistema

O tema automático segue `prefers-color-scheme`. Com `prefers-contrast: more`, o texto secundário passa a usar a cor do texto principal e as linhas divisórias ficam mais escuras.

## Como foi verificado

Rodei o axe-core 4.10.2 no Chromium, dentro do navegador do app, com as regras de WCAG 2.0, 2.1 e 2.2 nos níveis A e AA:

| Situação | Resultado |
| --- | --- |
| Página nos temas claro, papel e escuro | 0 violações |
| Painéis Opções, Idiomas, Histórico, Discussão e Citar | 0 violações |
| Prévia de referência aberta | 0 violações |
| Busca com resultados | 0 violações |

A primeira rodada acusou três problemas, todos corrigidos: cinco links de imagem sem nome acessível, quatro links da ficha com alvo menor que 24 px e o código de idioma "simple" (Wikipédia em inglês simples), que não é um código válido e agora é marcado como `en`. Restam dois avisos no painel de idiomas, para "isv" (intereslavo) e "tok" (toki pona): são códigos usados pela Wikimedia que não estão na lista do axe.

Também conferi com teclado: o primeiro Tab mostra "Ir para o texto", os painéis abrem e fecham com Enter e Esc, e o foco volta ao botão de origem.

O que não foi verificado está em [10-limitacoes.md](10-limitacoes.md).
