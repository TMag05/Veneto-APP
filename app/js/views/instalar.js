/* =========================================================
   Instalar — #/instalar
   Nenhum browser deixa um site pôr-se sozinho no ecrã principal:
   o gesto é sempre de quem tem o telemóvel. O que a app faz é
   saber em que browser está e dizer os passos desse, e não outros.

   No Android, o Chrome deixa pedir a instalação: guarda-se o
   pedido (beforeinstallprompt) e um toque abre a janela do
   sistema. No iPhone não há pedido nenhum, em browser nenhum.

   No iPhone, a app instalada não partilha a sessão com o browser:
   quem cria o acesso no Safari tem de voltar a entrar no ícone.
   Por isso a entrada sugere instalar antes de criar o acesso.
   ========================================================= */

(function () {

  let pedido = null;
  let instalou = false;

  function instalada() {
    return window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }

  /* Onde se está, lido do navegador. O iPad diz-se Mac desde o
     iPadOS 13; distingue-se pelo ecrã tátil. */
  function onde() {
    if (instalada()) return 'instalada';
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (ios) {
      if (/CriOS/.test(ua)) return 'ios-chrome';
      /* Firefox, Edge e os browsers dentro de outras apps — Instagram,
         Facebook, LinkedIn — não têm o Safari/ no fim. */
      if (/FxiOS|EdgiOS|OPiOS|GSA\//.test(ua) || !/Safari\//.test(ua)) return 'ios-outro';
      return 'ios-safari';
    }
    if (/Android/.test(ua)) {
      if (pedido) return 'android-pedido';
      if (/; wv\)/.test(ua) || /FBAN|FBAV|Instagram/.test(ua)) return 'android-outro';
      if (/SamsungBrowser/.test(ua)) return 'android-samsung';
      if (/Chrome\//.test(ua)) return 'android-chrome';
      return 'android-outro';
    }
    return 'computador';
  }

  function noTelemovel() { const o = onde(); return o !== 'instalada' && o !== 'computador'; }
  function noIphone() { return onde().indexOf('ios-') === 0; }

  /* O Chrome só oferece a instalação depois de a página carregar,
     e às vezes nunca (já instalada, ou recusada há pouco). */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    pedido = e;
    repintar();
  });
  window.addEventListener('appinstalled', function () {
    pedido = null;
    instalou = true;
    repintar();
  });

  /* Enquanto se escreve num campo não se repinta: perder-se-ia o cursor. */
  function repintar() {
    const foco = document.activeElement;
    if (foco && /INPUT|TEXTAREA|SELECT/.test(foco.tagName)) return;
    if (window.App) App.repintar();
  }

  function pedir() {
    if (!pedido) { App.ir('#/instalar'); return; }
    const p = pedido;
    pedido = null;
    p.prompt();
    p.userChoice.then(function (r) {
      if (r.outcome === 'accepted') instalou = true;
      repintar();
    }, repintar);
  }

  /* O link de sempre, para abrir noutro browser ou noutro telemóvel. */
  function link() {
    return location.origin + location.pathname.replace(/index\.html$/, '') + '#/entrar';
  }

  function copiar(valor, botao) {
    const url = link();
    const feito = function () { botao.textContent = 'Link copiado'; };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(feito, function () { mostrarLink(botao); });
    } else {
      mostrarLink(botao);
    }
  }

  /* Sem área de transferência (http na rede local), o link fica à vista
     para se selecionar à mão. */
  function mostrarLink(botao) {
    const p = document.createElement('p');
    p.className = 'corpo-ui instalar__link';
    p.textContent = link();
    botao.replaceWith(p);
  }

  /* A entrada e o Mais mostram a mesma linha. No Android com pedido
     guardado, instala logo; nos outros casos leva aos passos. */
  function linha(nota) {
    return UI.linhaLista(pedido
      ? { titulo: 'Instalar no ecrã principal', nota: nota, icone: 'descarregar', acao: 'instalar' }
      : { titulo: 'Instalar no ecrã principal', nota: nota, icone: 'descarregar', href: '#/instalar' });
  }

  /* ---------------------------------------------------------
     Os passos de cada browser
     --------------------------------------------------------- */

  function passos(lista) {
    return '<ol class="passos">' + lista.map(function (p) {
      return '<li class="passos__passo">' +
        '<span class="passos__numero num" aria-hidden="true"></span>' +
        '<span class="passos__corpo">' +
          '<span class="titulo-ui" style="display:block">' + p[0] + '</span>' +
          (p[1] ? '<span class="corpo-ui silencioso" style="display:block;margin-top:4px">' + p[1] + '</span>' : '') +
        '</span>' +
      '</li>';
    }).join('') + '</ol>';
  }

  const partilhar = '<span class="passos__simbolo" aria-hidden="true">' + Icone('partilhar', 18) + '</span>';

  /* O botão ··· do Safari, desenhado: os três pontos em texto
     perdem-se no tamanho de leitura. */
  const reticencias = '<span class="passos__simbolo" aria-label="···">' +
    '<svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true"><circle cx="3" cy="4" r="2"/><circle cx="10" cy="4" r="2"/><circle cx="17" cy="4" r="2"/></svg></span>';

  function botaoCopiar() {
    return '<button class="botao botao--secundario botao--largo" type="button" data-acao="copiarLink">Copiar o link</button>';
  }

  /* Depois de instalar, no iPhone, a app do ícone começa do zero. */
  function depoisIphone() {
    return Estado.get().autenticado
      ? 'Depois, abra a app pelo ícone e entre com o email e a palavra-passe do seu acesso.'
      : 'Depois, abra a app pelo ícone e crie aí o seu acesso.';
  }

  /* ---------------------------------------------------------
     O iPhone, um passo de cada vez
     Cada passo é uma frase e o desenho do telemóvel nesse momento,
     com o que se toca destacado a cobre. O desenho é esquemático de
     propósito: mostra onde está o botão, não imita o browser — que
     muda de versão para versão.
     --------------------------------------------------------- */

  /* O telemóvel: 180 de largura, o ecrã útil de 50 a 210. */
  function telemovel(dentro) {
    return '<svg class="esquema" viewBox="0 0 260 320" role="img" aria-hidden="true">' +
      '<rect class="esquema__corpo" x="40" y="4" width="180" height="312" rx="26"/>' +
      dentro +
    '</svg>';
  }

  function linhasDePagina(y0, n) {
    let r = '';
    for (let i = 0; i < n; i++) {
      r += '<rect class="esquema__linha" x="58" y="' + (y0 + i * 16) + '" width="' + [144, 120, 136, 96, 128, 110][i % 6] + '" height="6" rx="3"/>';
    }
    return r;
  }

  function simboloPartilhar(cx, cy, alvo) {
    return '<g class="' + (alvo ? 'esquema__alvo-icone' : 'esquema__icone') + '" transform="translate(' + (cx - 6) + ' ' + (cy - 8) + ')">' +
      '<path d="M6 1v9M2.5 4.5L6 1l3.5 3.5M1 7v8h10V7"/></g>';
  }

  function alvo(cx, cy, r) {
    return '<circle class="esquema__alvo" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
  }

  const DESENHOS = {
    /* Safari: a barra em baixo, com Partilhar ao centro. */
    partilharSafari: function () {
      return telemovel(
        linhasDePagina(30, 12) +
        '<rect class="esquema__barra" x="46" y="250" width="168" height="60" rx="20"/>' +
        '<rect class="esquema__campo" x="58" y="258" width="144" height="18" rx="9"/>' +
        [70, 100, 160, 190].map(function (x) { return '<circle class="esquema__ponto" cx="' + x + '" cy="293" r="4"/>'; }).join('') +
        alvo(130, 293, 13) + simboloPartilhar(130, 294, true)
      );
    },
    /* Chrome: o endereço em cima, com Partilhar à direita. */
    partilharChrome: function () {
      return telemovel(
        '<rect class="esquema__campo" x="56" y="22" width="148" height="24" rx="12"/>' +
        '<rect class="esquema__linha" x="70" y="31" width="70" height="6" rx="3"/>' +
        alvo(188, 34, 14) + simboloPartilhar(188, 35, true) +
        linhasDePagina(64, 11) +
        '<rect class="esquema__barra" x="46" y="270" width="168" height="40" rx="20"/>' +
        [80, 130, 180].map(function (x) { return '<circle class="esquema__ponto" cx="' + x + '" cy="290" r="4"/>'; }).join('')
      );
    },
    /* A folha de Partilhar, com a linha que interessa. */
    lista: function () {
      let linhas = '';
      [176, 202, 254, 280].forEach(function (y) {
        linhas += '<rect class="esquema__linha-folha" x="56" y="' + y + '" width="148" height="20" rx="6"/>' +
          '<rect class="esquema__linha" x="64" y="' + (y + 7) + '" width="70" height="6" rx="3"/>';
      });
      return telemovel(
        linhasDePagina(30, 5) +
        '<rect class="esquema__folha" x="46" y="112" width="168" height="198" rx="20"/>' +
        [74, 110, 146, 182].map(function (x) { return '<circle class="esquema__ponto-grande" cx="' + x + '" cy="146" r="12"/>'; }).join('') +
        linhas +
        '<rect class="esquema__alvo" x="50" y="226" width="160" height="24" rx="8"/>' +
        '<text class="esquema__texto esquema__texto--alvo esquema__texto--lista" x="58" y="241.5">Adicionar ao ecrã principal</text>' +
        '<g class="esquema__alvo-icone" transform="translate(192 232)"><rect x="0" y="0" width="12" height="12" rx="3"/><path d="M6 3v6M3 6h6"/></g>'
      );
    },
    /* A janela de confirmação: «Adicionar» em cima, à direita. */
    adicionar: function () {
      let teclas = '';
      for (let f = 0; f < 3; f++) {
        for (let c = 0; c < 8; c++) {
          teclas += '<rect class="esquema__tecla" x="' + (54 + c * 19) + '" y="' + (220 + f * 26) + '" width="15" height="20" rx="4"/>';
        }
      }
      return telemovel(
        '<text class="esquema__texto esquema__texto--suave" x="56" y="40">Cancelar</text>' +
        '<rect class="esquema__alvo" x="146" y="24" width="64" height="24" rx="12"/>' +
        '<text class="esquema__texto esquema__texto--alvo" x="178" y="40" text-anchor="middle">Adicionar</text>' +
        '<rect class="esquema__campo" x="56" y="64" width="148" height="56" rx="12"/>' +
        '<image href="assets/img/icone-180.png" x="64" y="72" width="40" height="40" preserveAspectRatio="xMidYMid slice"/>' +
        '<text class="esquema__texto" x="114" y="90">Grand Tour</text>' +
        '<rect class="esquema__linha" x="114" y="98" width="70" height="5" rx="2.5"/>' +
        '<rect class="esquema__barra" x="46" y="210" width="168" height="100" rx="20"/>' + teclas
      );
    },
    /* O ecrã principal, com a montanha entre as outras apps. */
    icone: function () {
      let apps = '';
      for (let f = 0; f < 4; f++) {
        for (let c = 0; c < 4; c++) {
          if (f === 2 && c === 1) continue;
          apps += '<rect class="esquema__app" x="' + (60 + c * 38) + '" y="' + (40 + f * 46) + '" width="28" height="28" rx="8"/>';
        }
      }
      return telemovel(
        apps +
        '<rect class="esquema__alvo" x="89" y="125" width="42" height="42" rx="12"/>' +
        '<image href="assets/img/icone-180.png" x="98" y="132" width="28" height="28"/>' +
        '<text class="esquema__texto esquema__texto--pequeno" x="112" y="178" text-anchor="middle">Grand Tour</text>' +
        '<rect class="esquema__barra" x="52" y="262" width="156" height="42" rx="18"/>' +
        [74, 112, 150, 188].map(function (x) { return '<rect class="esquema__app" x="' + (x - 12) + '" y="271" width="24" height="24" rx="7"/>'; }).join('')
      );
    }
  };

  function ultimoPasso() {
    return Estado.get().autenticado
      ? ['Abra a app pelo ícone', 'Entre com o email e a palavra-passe do seu acesso.', 'icone']
      : ['Abra a app pelo ícone', 'É lá que cria o seu acesso.', 'icone'];
  }

  /* [título, nota, desenho] — uma frase de instrução, uma de ajuda. */
  const PASSOS = {
    'ios-safari': function () {
      return [
        ['Toque em Partilhar ' + partilhar, 'Na barra de baixo. No iOS 26, está dentro do botão ' + reticencias + '.', 'partilharSafari'],
        ['Toque em «Adicionar ao ecrã principal»', 'Desça na lista, se não estiver à vista.', 'lista'],
        ['Toque em «Adicionar»', 'Em cima, à direita.', 'adicionar'],
        ultimoPasso()
      ];
    },
    'ios-chrome': function () {
      return [
        ['Toque em Partilhar ' + partilhar, 'Ao lado do endereço, em cima. Se não o vir, toque no topo do ecrã.', 'partilharChrome'],
        ['Toque em «Adicionar ao ecrã principal»', 'Desça na lista. Se não aparecer, abra o link no Safari.', 'lista'],
        ['Toque em «Adicionar»', 'Em cima, à direita.', 'adicionar'],
        ultimoPasso()
      ];
    }
  };

  function passoAPasso(lista) {
    const i = Math.min(passo, lista.length - 1);
    const p = lista[i];
    const fim = i === lista.length - 1;
    return '<p class="etiqueta num">Passo ' + (i + 1) + ' de ' + lista.length + '</p>' +
      '<h1 class="instalar__titulo">' + p[0] + '</h1>' +
      '<p class="corpo-ui silencioso" style="margin-top:8px">' + p[1] + '</p>' +
      '<div class="instalar__desenho">' + DESENHOS[p[2]]() + '</div>' +
      '<div class="pilha-2">' +
        (fim
          ? '<button class="botao botao--principal botao--largo" type="button" data-acao="fechar">Fechar</button>'
          : '<button class="botao botao--principal botao--largo" type="button" data-acao="passo" data-valor="' + (i + 1) + '">Já está</button>') +
        (i > 0
          ? '<button class="botao botao--texto instalar__outro" type="button" data-acao="passo" data-valor="' + (i - 1) + '">Passo anterior</button>'
          : '') +
      '</div>';
  }

  /* ---------------------------------------------------------
     Os outros casos, numa página só
     --------------------------------------------------------- */

  const CORPOS = {
    'ios-outro': function () {
      return '<h1 class="instalar__titulo">Abra o link no Safari</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">Este browser não põe apps no ecrã principal. No Safari ou no Chrome, os passos aparecem aqui.</p>' +
        '<div style="margin-top:24px">' + botaoCopiar() + '</div>' +
        '<p class="meta" style="margin-top:12px">Se chegou pelo Instagram ou pelo Facebook, o menu ··· deste ecrã tem «Abrir no Safari».</p>';
    },
    'android-pedido': function () {
      return '<h1 class="instalar__titulo">Instalar no ecrã principal</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">Um toque, e o telemóvel pede para confirmar.</p>' +
        '<div style="margin-top:24px"><button class="botao botao--principal botao--largo" type="button" data-acao="instalar">Instalar</button></div>';
    },
    'android-chrome': function () {
      return passos([
        ['Toque no menu ⋮', 'No canto superior direito do Chrome. Se o menu tiver «Abrir no Chrome», toque aí primeiro.'],
        ['Escolha «Instalar app»', 'Nalguns telemóveis chama-se «Adicionar ao ecrã principal».'],
        ['Confirme em «Instalar»', 'A montanha do passeio fica ao lado das outras apps, e a sessão vem com ela.']
      ]);
    },
    'android-samsung': function () {
      return passos([
        ['Toque no menu ≡', 'Na barra de baixo, à direita.'],
        ['Escolha «Adicionar página a»', 'E depois «Ecrã principal».'],
        ['Confirme em «Adicionar»', 'A montanha do passeio fica ao lado das outras apps.']
      ]);
    },
    'android-outro': function () {
      return '<h1 class="instalar__titulo">Abra o link no Chrome</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">Este browser não põe apps no ecrã principal.</p>' +
        '<div style="margin-top:24px">' + botaoCopiar() + '</div>' +
        '<p class="meta" style="margin-top:12px">Se chegou pelo WhatsApp, o menu ⋮ deste ecrã tem «Abrir no Chrome».</p>';
    },
    'computador': function () {
      return '<h1 class="instalar__titulo">A app vive no telemóvel</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">Abra este link lá, no Safari ou no Chrome.</p>' +
        '<div style="margin-top:24px">' + botaoCopiar() + '</div>';
    },
    'instalada': function () {
      return '<h1 class="instalar__titulo">Já está no ecrã principal</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">É por lá que a app abre sem rede.</p>';
    }
  };

  /* Quando a app se engana no telemóvel, quem o tem na mão corrige. */
  const ESCOLHAS = [
    ['ios-safari', 'iPhone, Safari'],
    ['ios-chrome', 'iPhone, Chrome'],
    ['android-chrome', 'Android']
  ];

  function corrigir(o) {
    if (!escolher) {
      return '<button class="botao botao--texto instalar__outro" type="button" data-acao="escolher">Não é isto que vejo</button>';
    }
    return '<div class="instalar__escolha">' +
      '<p class="meta">Qual é o seu telemóvel?</p>' +
      '<div class="escolhas" style="margin-top:12px">' +
        ESCOLHAS.map(function (e) {
          return '<button class="escolha" type="button" data-acao="corrigir" data-valor="' + e[0] + '" ' +
            'aria-pressed="' + (e[0] === o ? 'true' : 'false') + '">' + e[1] + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  let passo = 0;
  let forcado = '';
  let escolher = false;

  function atual() {
    if (instalou) return 'instalada';
    const o = onde();
    if (o === 'instalada') return o;
    return forcado || o;
  }

  Vistas.instalar = {
    nav: 'mais',
    /* Abre-se antes de haver acesso: é o que a entrada sugere no iPhone. */
    semNav: function () { return !Estado.get().autenticado; },
    cabecalho: function () {
      return { voltar: Estado.get().autenticado ? '#/mais' : '#/entrar', titulo: 'Ecrã principal', tituloSempre: true };
    },
    html: function () {
      const o = atual();
      return '<div class="faixa instalar">' +
        (PASSOS[o] ? passoAPasso(PASSOS[o]()) : CORPOS[o]()) +
        (o === 'instalada' ? '' : corrigir(o)) +
      '</div>';
    },
    /* Cada visita começa no primeiro passo. */
    desmontar: function () { passo = 0; escolher = false; },
    acoes: {
      instalar: pedir,
      copiarLink: copiar,
      passo: function (v) { passo = Math.max(0, parseInt(v, 10) || 0); App.repintar(); },
      fechar: function () { App.voltar(Estado.get().autenticado ? '#/mais' : '#/entrar'); },
      escolher: function () { escolher = true; App.repintar(); },
      corrigir: function (v) { forcado = v; passo = 0; escolher = false; App.repintar(); }
    }
  };

  window.Instalar = {
    instalada: instalada,
    noTelemovel: noTelemovel,
    noIphone: noIphone,
    linha: linha,
    pedir: pedir
  };

})();
