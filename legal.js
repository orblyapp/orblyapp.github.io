// Troca de idioma das paginas de Termos/Privacidade (mesma escolha salva do site)
(function () {
  var root = document.getElementById('root');
  function setLang(l) {
    root.setAttribute('data-lang', l);
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l));
    });
    try { localStorage.setItem('orbly-lang', l); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('orbly-lang'); } catch (e) {}
  var nav = (navigator.language || 'pt').toLowerCase();
  setLang(saved || (nav.indexOf('pt') === 0 ? 'pt' : 'en'));
  document.querySelectorAll('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
  });
})();
