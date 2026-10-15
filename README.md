# Redesign de leitura da Wikipédia: Chá

Protótipo conceitual da página de artigo da Wikipédia, feito com o artigo [Chá](https://pt.wikipedia.org/wiki/Ch%C3%A1) da Wikipédia em português. A documentação do processo está em [docs/](docs/README.md).

## Ver o site

O site pronto está em `site/`. Qualquer servidor de arquivos estáticos serve:

```bash
python3 -m http.server 4173 -d site
```

Depois abra http://localhost:4173.

## Reconstruir

Precisa de Node 20 ou mais recente.

```bash
npm install
```

```bash
npm run build
```

O build lê só `data/cha/`, então funciona sem rede. Para baixar o artigo e os metadados de novo (o artigo pode ter mudado):

```bash
npm run fetch
```

Para recalcular a tabela de contraste dos temas:

```bash
npm run contrast
```

## Publicar na Vercel

O `vercel.json` já define tudo: a Vercel instala as dependências, roda `npm run build` (que usa só os dados em `data/cha/`, sem rede) e publica a pasta `site/`. Todas as respostas levam o cabeçalho `X-Robots-Tag: noindex`, para o protótipo não aparecer em buscadores.

Pelo GitHub: suba o repositório e importe o projeto na Vercel, sem mudar nenhuma configuração.

Pela linha de comando, na raiz do projeto:

```bash
npx vercel --prod
```

## Estrutura

```
data/cha/            artigo (HTML do Parsoid) e metadados da revisão 73198638
scripts/fetch.mjs    baixa artigo, histórico, discussão e idiomas pela API da Wikipédia
scripts/transform.mjs transforma o HTML do Parsoid sem alterar o texto
scripts/build.mjs    monta site/index.html e copia CSS, JS e fontes
scripts/contrast.mjs calcula o contraste das cores de cada tema
src/site.css         tokens, layout e componentes
src/site.js          sumário, busca, referências, painéis, preferências, retomada
src/prefs-inline.js  aplica as preferências antes da primeira pintura
src/strings/pt.mjs   todos os textos de interface
src/fonts/           Atkinson Hyperlegible Next (só baixada se o leitor escolher)
site/                resultado do build
docs/                documentação do processo
```

Sem framework e sem dependências no navegador. A única dependência de desenvolvimento é `linkedom`, para manipular o HTML no build. CSS e JavaScript são servidos como foram escritos, sem empacotador.

## Licenças

O conteúdo do artigo é da Wikipédia em português, sob [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br). As imagens têm licenças próprias no Wikimedia Commons. A fonte Atkinson Hyperlegible Next está sob a SIL Open Font License (`src/fonts/OFL.txt`). Wikipédia é uma marca registrada da Wikimedia Foundation; este projeto não tem relação com ela.
