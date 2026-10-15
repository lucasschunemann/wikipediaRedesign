// Todos os textos de interface ficam aqui. O build usa este arquivo e o embute na página
// para o JavaScript. Frases com partes variáveis usam marcadores {0}, {1}...
// Os textos do artigo não passam por aqui: eles vêm do artigo.

export default {
  locale: 'pt-BR',
  months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  monthsShort: ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'],

  // Página
  siteName: 'Wikipédia',
  docTitle: '{0} · Wikipédia (protótipo de redesign)',
  skipToText: 'Ir para o texto',
  skipToSections: 'Ir para as seções',
  conceptNote: 'Protótipo de redesign feito para portfólio. Não é um site da Wikimedia.',
  conceptLink: 'Ver este artigo na Wikipédia',

  // Barra do topo
  searchWikipedia: 'Buscar na Wikipédia',
  searchButton: 'Buscar',
  donate: 'Doar',
  login: 'Entrar',
  accountNav: 'Conta e doações',
  readingOptions: 'Opções de leitura',
  readingOptionsShort: 'Aa',
  currentSection: 'Seção atual',

  // Cabeçalho do artigo
  lastEdit: 'Editado em',
  editsSince: '{0} edições desde {1}',
  readingTime: 'Cerca de {0} minutos de leitura',
  articleTools: 'Sobre este artigo',
  languages: 'Idiomas',
  talk: 'Discussão',
  history: 'Histórico',
  cite: 'Citar',
  edit: 'Editar',
  editHint: 'Abre o editor na Wikipédia',

  // Retomar leitura
  resumeText: 'Você parou em {0}, em {1}.',
  resumeContinue: 'Continuar',
  resumeDismiss: 'Dispensar',

  // Seções e busca no artigo
  sections: 'Seções',
  introduction: 'Introdução',
  searchArticle: 'Buscar neste artigo',
  searchArticleHint: 'Acentos e maiúsculas não fazem diferença.',
  clearSearch: 'Limpar',
  searchNoResults: 'Nenhum resultado para "{0}" neste artigo.',
  searchResults: '{0} resultados em {1} seções',
  searchResult1: '1 resultado em 1 seção',
  searchResultsOneSection: '{0} resultados em 1 seção',
  searchIn: {
    infobox: 'na ficha',
    caption: 'em legenda',
    reference: 'nas referências',
    notice: 'em aviso',
    navbox: 'na navegação',
  },

  // Referências
  citedIn: 'Citada em',
  and: 'e',
  citationIn: 'Citação {0} em {1}',
  refDialog: 'Referência {0}',
  refUsedTimes: 'Citada {0} vezes neste artigo.',
  refGoToList: 'Ver na lista de referências',
  close: 'Fechar',

  // Conteúdo
  infoboxLabel: 'Ficha',
  sisterProjects: 'Outros projetos Wikimedia',
  tableLabel: 'Tabela',
  imageFile: 'Arquivo da imagem: {0}',
  redlinkTitle: 'página ainda não existe',
  infoboxInText: 'Onde estes itens aparecem no texto',
  infoboxNotInText: 'não aparece no texto',

  // Opções de leitura
  theme: 'Tema',
  themes: { auto: 'Automático', light: 'Claro', paper: 'Papel', dark: 'Escuro' },
  themeHint: 'Automático segue o sistema. Papel tem fundo mais quente e menos brilho, para leituras longas.',
  font: 'Fonte',
  fonts: { serif: 'Serifada', sans: 'Sem serifa', legible: 'Legibilidade' },
  fontHint: 'Legibilidade usa a Atkinson Hyperlegible, com mais espaço entre letras e palavras. Ela só é baixada quando escolhida (cerca de 50 KB).',
  size: 'Tamanho do texto',
  sizeDown: 'Diminuir texto',
  sizeUp: 'Aumentar texto',
  leading: 'Espaço entre linhas',
  leadings: { tight: 'Menor', normal: 'Médio', loose: 'Maior' },
  measure: 'Largura da coluna',
  measures: { narrow: 'Estreita', normal: 'Média', wide: 'Larga' },
  measureHint: 'Estreita tem cerca de 55 letras por linha, média cerca de 65 e larga cerca de 75.',
  resetOptions: 'Restaurar padrão',
  optionsSaved: 'As opções ficam salvas neste navegador e valem para todos os artigos.',

  // Painéis
  loadError: 'Não foi possível carregar. Abra na Wikipédia:',

  // Idiomas
  languagesTitle: 'Este artigo em {0} idiomas',
  languagesFilter: 'Filtrar idiomas',
  languagesYours: 'Idiomas do seu navegador',
  languagesQuality: 'Reconhecidos pela comunidade',
  languagesAll: 'Todos os idiomas',
  badge: { destacado: 'destacado', bom: 'artigo bom' },
  langSize: '{0} o tamanho',
  langSizeNote:
    'O tamanho é comparado com esta versão pelo código-fonte do artigo, e só aparece para idiomas escritos no mesmo alfabeto. Os selos são dados pela comunidade de cada idioma.',
  languagesNone: 'Nenhum idioma encontrado.',

  // Histórico
  historySummary: '{0} edições desde {1}, por {2} contas e endereços IP.',
  historyRecent: 'Últimas edições',
  historyRevert: 'reversão',
  historyReverted: 'desfeita',
  historyRevertAfter: 'Desfez a edição anterior {0} depois.',
  historyNoComment: 'Sem resumo da edição.',
  historyFull: 'Histórico completo na Wikipédia',
  historyInfo: 'Informações da página',
  historyViews: '{0} visitas nos últimos 60 dias.',
  historyWatchers: '{0} pessoas recebem aviso quando a página muda.',
  units: { s: ['segundo', 'segundos'], m: ['minuto', 'minutos'], h: ['hora', 'horas'], d: ['dia', 'dias'] },

  // Discussão
  talkIntro: 'Conversas dos editores sobre como melhorar o artigo. Qualquer pessoa pode participar.',
  talkTopics: 'Tópicos',
  talkLast: 'Última edição da discussão em {0}.',
  talkOpen: 'Abrir a discussão na Wikipédia',
  talkEmpty: 'Ainda não há tópicos.',

  // Citar
  citeIntro: 'A citação aponta para a revisão {0}, de {1}. Se o artigo mudar depois, o link continua levando a este texto. A data de acesso é a de hoje.',
  citeFormat: 'Formato',
  citeCopy: 'Copiar',
  citeCopied: 'Copiado.',
  citePermalink: 'Link permanente',
  citePrint: 'Imprimir ou salvar em PDF',

  // Rodapé
  categories: 'Categorias',
  attribution:
    'Texto do artigo <a href="{1}">{0}</a> da Wikipédia em português, escrito pelos <a href="{2}">colaboradores da Wikipédia</a>.',
  licenseLine:
    'Disponível sob a licença <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br" rel="license">Creative Commons Atribuição-CompartilhaIgual 4.0</a>. As imagens têm licenças próprias, indicadas na página de cada arquivo.',
  revisionLine: 'Revisão <a href="{1}">{0}</a>, de {2}. O texto do artigo não foi alterado: mudou só a apresentação.',
  moreTools: 'Mais ferramentas na Wikipédia',
  footerConcept:
    'Protótipo conceitual de redesign de leitura, feito para portfólio. Sem relação com a Wikimedia Foundation. Wikipédia é uma marca registrada da Wikimedia Foundation.',
};

export function fmt(template, ...args) {
  return template.replace(/\{(\d)\}/g, (_, i) => args[i]);
}
