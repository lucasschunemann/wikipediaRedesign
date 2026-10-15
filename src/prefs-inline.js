// Roda no <head>, antes da primeira pintura, para a página não piscar com o tema errado.
(function () {
  var d = document.documentElement;
  d.className = 'js';
  try {
    var p = JSON.parse(localStorage.getItem('leitura') || '{}');
    for (var k in p) d.setAttribute('data-' + k, p[k]);
  } catch (e) {}
})();
