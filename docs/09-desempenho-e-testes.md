# 9. Desempenho e testes

## Peso da página

| Arquivo | Tamanho | Comprimido | Quando carrega |
| --- | --- | --- | --- |
| `index.html` (artigo inteiro e interface) | 101,4 KB | 25,1 KB | Sempre |
| `site.css` | 36,5 KB | 8,4 KB | Sempre |
| `site.js` | 38,8 KB | 12,0 KB | Sempre, depois do HTML (`defer`) |
| `cha-dados.json` (idiomas, histórico, discussão) | 39,5 KB | 10,4 KB | Só quando o leitor abre Idiomas, Histórico ou Discussão |
| Fontes opcionais: Inter 48 KB, Literata 79 KB, Source Serif 4 103 KB, Atkinson Hyperlegible Next 48 KB | já comprimidas | | Só quando o leitor escolhe a fonte |
| Imagens | as mesmas do artigo | | Quando se aproximam da tela |

Primeira visita, sem contar imagens: 45,5 KB comprimidos em 3 requisições. A página atual do Vector 2022 transfere cerca de 54 KB de HTML e 178 KB de outros recursos em 37 requisições (ver [auditoria](01-auditoria.md#desempenho-medido)).

O orçamento definido no começo era 60 KB de HTML, 15 KB de CSS e 20 KB de JavaScript, comprimidos. Os três ficaram abaixo.

As decisões que mais pesaram:

- O texto chega no HTML. O JavaScript carrega com `defer`, depois que a página já pode ser lida.
- Nenhuma fonte baixada por padrão ([D04](registro-de-decisoes.md#d04-fontes-do-sistema-por-padrão) e [D19](registro-de-decisoes.md#d19-fonte-sans-do-sistema-como-padrão)).
- Os dados dos painéis ficam num arquivo separado. A lista de 217 idiomas é a maior parte dele, e a maioria dos leitores nunca abre o seletor de idiomas.
- O build tira do HTML do Parsoid os atributos internos (`data-mw`, `about`, `typeof`, ids sem uso). Isso compensou o peso de toda a interface: o HTML do Parsoid tem 121 KB e a página final, com a interface, tem 98,6 KB.
- As imagens usam as larguras padronizadas da Wikimedia (330 e 500 px) e o navegador escolhe pela largura disponível. No celular, uma figura pesa o mesmo que no Minerva.
- Nenhum script de terceiros e nenhuma biblioteca.

## Testes feitos

Todos no Chromium do navegador integrado ao app, no Mac.

| Teste | Como | Resultado |
| --- | --- | --- |
| Caracteres por linha | Script que agrupa os caracteres de cada parágrafo pela linha em que caem, aplicado aos 21 parágrafos longos | 55, 65 e 76 nas três larguras; 65 nas três famílias tipográficas (ver [04](04-tipografia-e-layout.md#a-medida-da-linha)) |
| Larguras de tela | 320, 375, 768, 1280 e 1440 px | Sem rolagem horizontal em nenhuma, inclusive a 320 px com texto em 142% |
| Acessibilidade automática | axe-core 4.10.2, regras WCAG 2.0, 2.1 e 2.2 A e AA | 0 violações nos três temas, nos cinco painéis, na prévia de referência e na busca (ver [07](07-acessibilidade.md#como-foi-verificado)) |
| Contraste | `scripts/contrast.mjs` | Todos os pares acima do mínimo depois de um ajuste no tema escuro (ver [05](05-sistema-visual.md#contraste-medido)) |
| Teclado | Tab, Enter, Esc e Shift+Enter nas funções principais | Links de pular aparecem no primeiro Tab; painéis e prévia abrem, recebem o foco e devolvem o foco ao fechar |
| Funcionalidades | Busca com e sem acento, salto pelo sumário, prévia de referência, painéis, citação, retomada | Funcionando no computador, no tablet e no celular |

## Problemas encontrados e corrigidos

Registro aqui os erros que os testes pegaram, porque eles mostram onde o desenho dependia de detalhes de implementação.

1. A ficha não mudava de lugar. O código procurava "o primeiro parágrafo da introdução" e encontrava a nota de desambiguação, que também é um parágrafo.
2. A caixa "Outros projetos", em Ligações externas, tinha a mesma classe da ficha no HTML original e herdava a regra de flutuar na margem duas vezes, estourando a largura da página.
3. Os links da legenda da ficha quebravam um por linha, por causa de uma regra que deveria valer só para o link da imagem.
4. Ao abrir a prévia de referência, a página rolava até o fim. O `<dialog>` move o foco para o primeiro botão assim que abre, e ele ainda estava na posição padrão, no fim da página. Agora a prévia é posicionada antes de abrir.
5. O cabeçalho dos painéis ficava atrás da barra do topo quando a página estava no início. Os painéis passaram a ocupar a altura toda.
6. Referências citadas uma vez só mostravam a palavra "null" na prévia.
7. Nos trechos de resultado da busca, itens da ficha separados por quebra de linha apareciam colados ("açúcartaninoágua").
8. Abrir a página com uma âncora (`#Cultivo`) às vezes não rolava até a seção.
9. O destaque do resultado atual da busca no tema escuro tinha contraste de 3,84:1.
10. Com o painel do navegador oculto, o evento `close` do `<dialog>` era adiado, e o botão que abriu o painel continuava marcado como aberto. A limpeza ao fechar passou a ser imediata, sem depender do evento. A seção atual também passou a ser atualizada na hora depois de um salto, sem esperar o próximo quadro.

## O que não foi testado

- Tempo de carregamento em conexão lenta simulada. Os números acima são de peso, não de tempo.
- Leitores de tela reais (VoiceOver, NVDA, TalkBack). O axe verifica estrutura e nomes, mas não substitui ouvir a página.
- Firefox e Safari. Usei recursos recentes com alternativa: a CSS Custom Highlight API (sem ela, o resultado atual fica selecionado), `text-wrap: pretty` e `color-mix` (sem eles, só o acabamento muda).
- O caminho sem JavaScript foi construído e conferido no código, mas não visualmente num navegador com JavaScript desligado.
- Testes com leitores. É a lacuna mais importante; um roteiro está em [10-limitacoes.md](10-limitacoes.md).
