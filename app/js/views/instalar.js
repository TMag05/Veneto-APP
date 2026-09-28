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
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (ios) {
      if (/CriOS/.test(ua)) return 'ios-chrome';
      /* A app já instalada não diz Safari/: mostra-se o caminho do Safari. */
      if (instalada()) return 'ios-safari';
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

  function noTelemovel() { return !instalada() && onde() !== 'computador'; }
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
    if (instalada()) {
      return UI.linhaLista({ titulo: 'Como adicionar ao ecrã principal', nota: nota, icone: 'descarregar', href: '#/instalar' });
    }
    return UI.linhaLista(pedido
      ? { titulo: 'Instalar no ecrã principal', nota: nota, icone: 'descarregar', acao: 'instalar' }
      : { titulo: 'Instalar no ecrã principal', nota: nota, icone: 'descarregar', href: '#/instalar' });
  }

  /* Na entrada, fora do ecrã principal, instalar é a primeira coisa a
     fazer, e por isso leva a esfera do cobre, como o que levar no
     Hoje (28.09.2026). No Android com pedido guardado, instala logo. */
  function destaque(etiqueta, nota) {
    const dentro =
      '<span class="esfera esfera--icone" aria-hidden="true">' + Icone('descarregar', 22) + '</span>' +
      '<span class="destaque__corpo">' +
        '<span class="etiqueta destaque__etiqueta">' + etiqueta + '</span>' +
        '<span class="titulo-ui destaque__titulo">Instalar no ecrã principal</span>' +
        (nota ? '<span class="meta">' + nota + '</span>' : '') +
      '</span>' +
      '<span class="destaque__seta">' + Icone('seta', 20) + '</span>';
    return pedido
      ? '<button class="destaque destaque--botao" type="button" data-acao="instalar">' + dentro + '</button>'
      : '<a class="destaque" href="#/instalar">' + dentro + '</a>';
  }

  /* ---------------------------------------------------------
     Os passos de cada browser
     --------------------------------------------------------- */

  const partilhar = '<span class="passos__simbolo" aria-hidden="true">' + Icone('partilhar', 18) + '</span>';

  /* O botão ··· do Safari, desenhado: os três pontos em texto
     perdem-se no tamanho de leitura. */
  const reticencias = '<span class="passos__simbolo" aria-label="···">' +
    '<svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true"><circle cx="3" cy="4" r="2"/><circle cx="10" cy="4" r="2"/><circle cx="17" cy="4" r="2"/></svg></span>';

  /* Os menus do Android, desenhados como no ecrã: ⋮ do Chrome, ≡ do Samsung. */
  const menuChrome = '<span class="passos__simbolo" aria-label="⋮">' +
    '<svg width="8" height="20" viewBox="0 0 8 20" aria-hidden="true"><circle cx="4" cy="3" r="2"/><circle cx="4" cy="10" r="2"/><circle cx="4" cy="17" r="2"/></svg></span>';
  const menuSamsung = '<span class="passos__simbolo" aria-label="≡">' + Icone('mais', 18) + '</span>';

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
     Os passos todos, numa página só
     A janela de Partilhar tapa a app e, fechada, volta ao início:
     um passo de cada vez, com «Já está» entre eles, obrigava a sair
     e a voltar a cada toque (28.09.2026). Por isso a sequência lê-se
     inteira antes de começar. Cada passo é uma frase e o desenho do
     telemóvel nesse momento, com o que se toca destacado a cobre. O
     desenho é esquemático de propósito: mostra onde está o botão, não
     imita o browser — que muda de versão para versão.
     --------------------------------------------------------- */

  /* O telemóvel: 180 de largura, o ecrã útil de 50 a 210. */
  function telemovel(dentro) {
    return '<svg class="esquema" viewBox="36 0 188 320" role="img" aria-hidden="true">' +
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
    /* A folha de Partilhar do iOS 26: os contactos, as apps e uma fila
       de botões redondos, com «Ver mais» no fim. */
    verMais: function () {
      const xs = [74, 110, 146, 182];
      return telemovel(
        linhasDePagina(18, 1) +
        '<rect class="esquema__folha" x="46" y="34" width="168" height="228" rx="20"/>' +
        '<rect class="esquema__app" x="58" y="48" width="26" height="26" rx="7"/>' +
        '<rect class="esquema__linha" x="94" y="52" width="80" height="6" rx="3"/>' +
        '<rect class="esquema__linha" x="94" y="64" width="56" height="5" rx="2.5"/>' +
        xs.map(function (x) { return '<circle class="esquema__ponto-grande" cx="' + x + '" cy="106" r="13"/>'; }).join('') +
        xs.map(function (x) { return '<rect class="esquema__app" x="' + (x - 13) + '" y="134" width="26" height="26" rx="8"/>'; }).join('') +
        xs.slice(0, 3).map(function (x) {
          return '<circle class="esquema__ponto-grande" cx="' + x + '" cy="198" r="13"/>' +
            '<rect class="esquema__linha" x="' + (x - 12) + '" y="220" width="24" height="5" rx="2.5"/>';
        }).join('') +
        alvo(182, 198, 15) +
        '<g class="esquema__alvo-icone"><path d="M176 195.5l6 6 6-6"/></g>' +
        '<text class="esquema__texto esquema__texto--alvo esquema__texto--lista" x="182" y="226" text-anchor="middle">Ver mais</text>' +
        linhasDePagina(276, 2)
      );
    },
    /* A folha de Partilhar, com a linha que interessa. */
    lista: function (rotulo) {
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
        '<text class="esquema__texto esquema__texto--alvo esquema__texto--lista" x="58" y="241.5">' + (rotulo || 'Adicionar ao ecrã principal') + '</text>' +
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
    /* Chrome no Android: o menu ⋮ à direita do endereço. */
    menuChrome: function () {
      return telemovel(
        '<rect class="esquema__campo" x="56" y="22" width="124" height="24" rx="12"/>' +
        '<rect class="esquema__linha" x="70" y="31" width="70" height="6" rx="3"/>' +
        alvo(197, 34, 13) +
        '<g class="esquema__alvo-ponto">' + [27, 34, 41].map(function (y) { return '<circle cx="197" cy="' + y + '" r="2"/>'; }).join('') + '</g>' +
        linhasDePagina(64, 13)
      );
    },
    /* O menu do Chrome, aberto de cima, com a linha que interessa. */
    menuAberto: function () {
      let linhas = '';
      [36, 60, 84, 108, 156, 180].forEach(function (y) {
        linhas += '<rect class="esquema__linha" x="104" y="' + y + '" width="' + (y % 48 ? 70 : 84) + '" height="6" rx="3"/>';
      });
      return telemovel(
        linhasDePagina(30, 14) +
        '<rect class="esquema__folha" x="92" y="18" width="120" height="186" rx="14"/>' +
        linhas +
        '<rect class="esquema__alvo" x="96" y="122" width="112" height="26" rx="8"/>' +
        '<text class="esquema__texto esquema__texto--alvo" x="104" y="139">Instalar app</text>'
      );
    },
    /* A janela do Android: «Instalar» em baixo, à direita. */
    confirmarAndroid: function () {
      return telemovel(
        linhasDePagina(30, 14) +
        '<rect class="esquema__veu" x="44" y="8" width="172" height="304" rx="22"/>' +
        '<rect class="esquema__folha" x="58" y="104" width="144" height="116" rx="18"/>' +
        '<image href="assets/img/icone-180.png" x="70" y="118" width="32" height="32"/>' +
        '<text class="esquema__texto" x="110" y="132">Grand Tour</text>' +
        '<rect class="esquema__linha" x="110" y="140" width="70" height="5" rx="2.5"/>' +
        '<text class="esquema__texto esquema__texto--suave" x="104" y="200" text-anchor="middle">Cancelar</text>' +
        '<rect class="esquema__alvo" x="140" y="184" width="54" height="24" rx="12"/>' +
        '<text class="esquema__texto esquema__texto--alvo" x="167" y="200" text-anchor="middle">Instalar</text>'
      );
    },
    /* Samsung Internet: o menu ≡ na barra de baixo, à direita. */
    menuSamsung: function () {
      return telemovel(
        '<rect class="esquema__campo" x="56" y="22" width="148" height="24" rx="12"/>' +
        '<rect class="esquema__linha" x="70" y="31" width="70" height="6" rx="3"/>' +
        linhasDePagina(64, 11) +
        '<rect class="esquema__barra" x="46" y="266" width="168" height="44" rx="20"/>' +
        [68, 98, 128, 158].map(function (x) { return '<circle class="esquema__ponto" cx="' + x + '" cy="288" r="4"/>'; }).join('') +
        alvo(190, 288, 13) +
        '<g class="esquema__alvo-icone"><path d="M183 283h14M183 288h14M183 293h9"/></g>'
      );
    },
    listaSamsung: function () { return DESENHOS.lista('Adicionar página a'); },
    ecraSamsung: function () { return DESENHOS.lista('Ecrã principal'); },

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

  /* No iPhone, a app do ícone começa do zero; no Android, a sessão
     do Chrome vem com ela. */
  function ultimoPasso(android) {
    const dentro = Estado.get().autenticado;
    return ['Abra a app pelo ícone',
      android
        ? (dentro ? 'Já abre com a sua sessão.' : 'É lá que cria o seu acesso.')
        : (dentro ? 'Entre com o email e a palavra-passe do seu acesso.' : 'É lá que cria o seu acesso.'),
      'icone'];
  }

  /* Na folha de Partilhar do iOS 26, «Adicionar ao ecrã principal»
     só aparece depois de «Ver mais». Nos iPhones anteriores não há
     esse botão, e a linha está mais abaixo na lista. */
  function passosDaFolha() {
    return [
      ['Toque em «Ver mais»', 'É o último dos botões redondos. Se não o vir, desça na lista.', 'verMais'],
      ['Toque em «Adicionar ao ecrã principal»', 'Na lista que se abre por baixo.', 'lista'],
      ['Toque em «Adicionar»', 'Em cima, à direita.', 'adicionar']
    ];
  }

  /* [título, nota, desenho] — uma frase de instrução, uma de ajuda. */
  const PASSOS = {
    'ios-safari': function () {
      return [['Toque em Partilhar ' + partilhar, 'Na barra de baixo. No iOS 26, está dentro do botão ' + reticencias + '.', 'partilharSafari']]
        .concat(passosDaFolha(), [ultimoPasso()]);
    },
    'ios-chrome': function () {
      return [['Toque em Partilhar ' + partilhar, 'Em cima, à direita do endereço.', 'partilharChrome']]
        .concat(passosDaFolha(), [ultimoPasso()]);
    },
    'android-chrome': function () {
      return [
        ['Toque no menu ' + menuChrome, 'Em cima, à direita. Se o menu disser «Abrir no Chrome», toque aí primeiro.', 'menuChrome'],
        ['Toque em «Instalar app»', 'Nalguns telemóveis diz «Adicionar ao ecrã principal».', 'menuAberto'],
        ['Toque em «Instalar»', 'O telemóvel pede para confirmar.', 'confirmarAndroid'],
        ultimoPasso(true)
      ];
    },
    'android-samsung': function () {
      return [
        ['Toque no menu ' + menuSamsung, 'Na barra de baixo, à direita.', 'menuSamsung'],
        ['Toque em «Adicionar página a»', 'Desça na lista, se não estiver à vista.', 'listaSamsung'],
        ['Toque em «Ecrã principal»', 'E confirme em «Adicionar».', 'ecraSamsung'],
        ultimoPasso(true)
      ];
    }
  };

  function todosOsPassos(lista) {
    return '<h1 class="instalar__titulo">Veja os passos antes de começar</h1>' +
      '<p class="corpo-ui silencioso" style="margin-top:8px">A janela de Partilhar tapa este ecrã.</p>' +
      '<ol class="passos-lista">' + lista.map(function (p, i) {
        return '<li class="passo-linha">' +
          '<div class="passo-linha__desenho">' + DESENHOS[p[2]]() + '</div>' +
          '<div class="passo-linha__texto">' +
            '<p class="etiqueta num">Passo ' + (i + 1) + '</p>' +
            '<p class="titulo-ui">' + p[0] + '</p>' +
            '<p class="meta">' + p[1] + '</p>' +
          '</div>' +
        '</li>';
      }).join('') + '</ol>';
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
        '<div style="margin-top:24px"><button class="botao botao--principal botao--largo" type="button" data-acao="instalar">Instalar</button></div>' +
        '<button class="botao botao--texto instalar__outro" type="button" data-acao="corrigir" data-valor="android-chrome" style="margin-top:8px">Ver os passos</button>';
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
  };

  /* Quando a app se engana no telemóvel, quem o tem na mão corrige. */
  const ESCOLHAS = [
    ['ios-safari', 'iPhone, Safari'],
    ['ios-chrome', 'iPhone, Chrome'],
    ['android-chrome', 'Android, Chrome'],
    ['android-samsung', 'Samsung Internet']
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

  let forcado = '';
  let escolher = false;

  function atual() { return forcado || onde(); }

  Vistas.instalar = {
    nav: 'mais',
    /* Abre-se antes de haver acesso: é o que a entrada sugere no iPhone. */
    semNav: function () { return !Estado.get().autenticado; },
    cabecalho: function () {
      return { voltar: Estado.get().autenticado ? '#/mais' : '#/entrar', titulo: 'Ecrã principal', tituloSempre: true };
    },
    html: function () {
      const o = atual();
      /* Já instalada, os passos ficam para consulta: para mostrar a
         quem ainda não conseguiu. */
      const feito = instalou || instalada();
      return '<div class="faixa instalar">' +
        (feito
          ? '<p class="instalar__feito corpo-ui">' + Icone('verificado', 20) + '<span>Esta app já está no ecrã principal. Os passos ficam aqui, para mostrar a quem precisar.</span></p>'
          : '') +
        (PASSOS[o] ? todosOsPassos(PASSOS[o]()) : CORPOS[o]()) +
        corrigir(o) +
      '</div>';
    },
    desmontar: function () { escolher = false; },
    acoes: {
      instalar: pedir,
      copiarLink: copiar,
      escolher: function () { escolher = true; App.repintar(); },
      corrigir: function (v) { forcado = v; escolher = false; App.repintar(); }
    }
  };

  window.Instalar = {
    instalada: instalada,
    noTelemovel: noTelemovel,
    noIphone: noIphone,
    linha: linha,
    destaque: destaque,
    pedir: pedir
  };

})();
