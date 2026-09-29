// Idioma do site orbly.chat: mesmo seletor do app (globo + "Language" e a lista
// com cada idioma escrito nele mesmo). Padrao: ingles, pra quem nunca escolheu
// (nao detecta pelo navegador). A escolha fica salva no aparelho (orbly-lang).
//
// Portugues e ingles ja estao escritos nas paginas (<span lang="pt"> / <span lang="en">,
// <article lang="pt"> / <article lang="en">). Os outros 20 idiomas vem de i18n/<codigo>.json:
//  - pagina inicial: chave = o texto em ingles do <span lang="en">
//  - FAQ: chave = data-t do elemento (faq.q1, faq.a1, ...)
//  - Termos e Privacidade ficam em ingles com uma linha ("notice") no idioma da pessoa
(function () {
  var LANGS = [
    { code: 'en', name: 'English', locale: 'en' },
    { code: 'pt', name: 'Português (Brasil)', locale: 'pt-BR' },
    { code: 'es', name: 'Español', locale: 'es' },
    { code: 'zh-Hans', name: '中文（简体）', locale: 'zh-CN' },
    { code: 'zh-Hant', name: '中文（繁體）', locale: 'zh-TW' },
    { code: 'ko', name: '한국어', locale: 'ko' },
    { code: 'ja', name: '日本語', locale: 'ja' },
    { code: 'fr', name: 'Français', locale: 'fr' },
    { code: 'de', name: 'Deutsch', locale: 'de' },
    { code: 'it', name: 'Italiano', locale: 'it' },
    { code: 'ru', name: 'Русский', locale: 'ru' },
    { code: 'uk', name: 'Українська', locale: 'uk' },
    { code: 'pl', name: 'Polski', locale: 'pl' },
    { code: 'nl', name: 'Nederlands', locale: 'nl' },
    { code: 'tr', name: 'Türkçe', locale: 'tr' },
    { code: 'ar', name: 'العربية', locale: 'ar', dir: 'rtl' },
    { code: 'hi', name: 'हिन्दी', locale: 'hi' },
    { code: 'bn', name: 'বাংলা', locale: 'bn' },
    { code: 'id', name: 'Bahasa Indonesia', locale: 'id' },
    { code: 'vi', name: 'Tiếng Việt', locale: 'vi' },
    { code: 'th', name: 'ไทย', locale: 'th' },
    { code: 'fil', name: 'Filipino', locale: 'fil' }
  ];
  var GLOBE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';

  var root = document.getElementById('root');
  var dicts = {};
  var current = 'en';
  var listeners = [];

  function info(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }
  function t(key) {
    var d = dicts[current];
    return (d && d[key]) || null;
  }

  // Aplica o dicionario de um idioma "extra" (nem pt nem en) por cima do ingles
  function applyDict(d) {
    var nodes = document.querySelectorAll('span[lang="en"]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
      var key = el.getAttribute('data-en');
      el.innerHTML = (d && d[key]) || key;
    }
    var keyed = document.querySelectorAll('[data-t]');
    for (var j = 0; j < keyed.length; j++) {
      var k = keyed[j];
      if (!k.hasAttribute('data-en')) k.setAttribute('data-en', k.innerHTML);
      var v = d && d[k.getAttribute('data-t')];
      k.innerHTML = v || k.getAttribute('data-en');
    }
    var arts = document.querySelectorAll('article[lang="en"][data-legal]');
    for (var a = 0; a < arts.length; a++) {
      var old = arts[a].querySelector('.lang-notice');
      if (old) old.parentNode.removeChild(old);
      if (d && d.notice) {
        var p = document.createElement('p');
        p.className = 'lang-notice';
        p.textContent = d.notice;
        arts[a].insertBefore(p, arts[a].firstChild);
      }
    }
  }

  function render() {
    var l = info(current);
    var isBase = current === 'pt' || current === 'en';
    root.setAttribute('data-lang', isBase ? current : 'en');
    document.documentElement.lang = l.locale;
    document.documentElement.dir = l.dir || 'ltr';
    applyDict(isBase ? null : dicts[current]);
    var btnName = document.querySelector('.lang-button .lang-current');
    if (btnName) btnName.textContent = '· ' + l.name;
    var opts = document.querySelectorAll('.lang-option');
    for (var i = 0; i < opts.length; i++) {
      var on = opts[i].getAttribute('data-lang') === current;
      opts[i].className = 'lang-option' + (on ? ' active' : '');
      opts[i].setAttribute('aria-selected', String(on));
      opts[i].querySelector('.lang-gem').innerHTML = on ? CHECK : '';
    }
    for (var c = 0; c < listeners.length; c++) listeners[c](current);
  }

  function setLang(code) {
    if (!info(code) || info(code).code !== code) code = 'en';
    current = code;
    try { localStorage.setItem('orbly-lang', code); } catch (e) {}
    if (code === 'pt' || code === 'en' || dicts[code]) { render(); return; }
    render(); // mostra ingles enquanto o arquivo do idioma carrega
    fetch('/i18n/' + code + '.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) { dicts[code] = d; if (current === code) render(); } })
      .catch(function () {});
  }

  // Monta o seletor no lugar dos botoes PT/EN
  function build() {
    var holder = document.querySelector('.langs');
    if (!holder) return;
    holder.className = 'lang-picker';
    holder.removeAttribute('role');
    holder.setAttribute('aria-label', 'Language');
    var html = '<button type="button" class="lang-button" aria-haspopup="listbox" aria-expanded="false">' + GLOBE + '<span>Language</span><span class="lang-current muted"></span></button>';
    html += '<div class="lang-menu" role="listbox" aria-label="Language" hidden>';
    for (var i = 0; i < LANGS.length; i++) {
      var l = LANGS[i];
      html += '<button type="button" role="option" class="lang-option" data-lang="' + l.code + '" lang="' + l.locale + '" dir="' + (l.dir || 'ltr') + '"><span class="lang-gem" aria-hidden="true"></span><span>' + l.name + '</span></button>';
    }
    html += '</div>';
    holder.innerHTML = html;
    var btn = holder.querySelector('.lang-button');
    var menu = holder.querySelector('.lang-menu');
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      var opt = e.target.closest('.lang-option');
      if (!opt) return;
      setLang(opt.getAttribute('data-lang'));
      close();
    });
    document.addEventListener('mousedown', function (e) { if (!holder.contains(e.target)) close(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  build();
  var asked = (new URLSearchParams(location.search).get('lang') || '');
  var saved = null;
  try { saved = localStorage.getItem('orbly-lang'); } catch (e) {}
  var first = info(asked).code === asked ? asked : (saved && info(saved).code === saved ? saved : 'en');
  setLang(first);

  window.OrblyI18n = {
    get lang() { return current; },
    t: t,
    setLang: setLang,
    onChange: function (cb) { listeners.push(cb); },
    LANGS: LANGS
  };
})();
