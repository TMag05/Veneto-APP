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

  function botaoCopiar() {
    return '<button class="botao botao--secundario botao--largo" type="button" data-acao="copiarLink">Copiar o link</button>';
  }

  /* Depois de instalar, no iPhone, a app do ícone começa do zero. */
  function depoisIphone() {
    return Estado.get().autenticado
      ? 'Depois, abra a app pelo ícone e entre com o email e a palavra-passe do seu acesso.'
      : 'Depois, abra a app pelo ícone e crie aí o seu acesso.';
  }

  const CORPOS = {
    'ios-safari': function () {
      return passos([
        ['Toque em Partilhar ' + partilhar, 'Na barra do Safari, em baixo. Se não o vir, toque primeiro em ··· ao lado do endereço.'],
        ['Escolha «Adicionar ao ecrã principal»', 'Desça na lista, se for preciso. Se aparecer «Abrir como app web», deixe-o ligado.'],
        ['Toque em «Adicionar»', 'A montanha do passeio fica ao lado das outras apps.']
      ]) + '<p class="meta" style="margin-top:24px">' + depoisIphone() + '</p>';
    },
    'ios-chrome': function () {
      return passos([
        ['Toque em Partilhar ' + partilhar, 'Na barra do endereço do Chrome, à direita.'],
        ['Escolha «Adicionar ao ecrã principal»', 'Desça na lista, se for preciso. Se a opção não aparecer, abra o link no Safari.'],
        ['Toque em «Adicionar»', 'A montanha do passeio fica ao lado das outras apps.']
      ]) + '<p class="meta" style="margin-top:24px">' + depoisIphone() + '</p>';
    },
    'ios-outro': function () {
      return '<p class="corpo-ui">Este browser não põe apps no ecrã principal. Abra o link no Safari ou no Chrome, e siga os passos que lá aparecem.</p>' +
        '<div style="margin-top:24px">' + botaoCopiar() + '</div>' +
        '<p class="meta" style="margin-top:12px">Se chegou pelo WhatsApp ou pelo Instagram, o menu ··· deste ecrã tem também «Abrir no Safari».</p>';
    },
    'android-pedido': function () {
      return '<p class="corpo-ui">Um toque, e o telemóvel pede para confirmar.</p>' +
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
      return '<p class="corpo-ui">Este browser não põe apps no ecrã principal. Abra o link no Chrome, e siga os passos que lá aparecem.</p>' +
        '<div style="margin-top:24px">' + botaoCopiar() + '</div>' +
        '<p class="meta" style="margin-top:12px">Se chegou pelo WhatsApp, o menu ⋮ deste ecrã tem também «Abrir no Chrome».</p>';
    },
    'computador': function () {
      return '<p class="corpo-ui">A app vive no telemóvel. Abra este link lá, no Safari ou no Chrome.</p>' +
        '<div style="margin-top:24px">' + botaoCopiar() + '</div>';
    },
    'instalada': function () {
      return '<p class="corpo-ui">A app já está no ecrã principal. É por lá que abre sem rede.</p>';
    }
  };

  Vistas.instalar = {
    nav: 'mais',
    /* Abre-se antes de haver acesso: é o que a entrada sugere no iPhone. */
    semNav: function () { return !Estado.get().autenticado; },
    cabecalho: function () {
      return { voltar: Estado.get().autenticado ? '#/mais' : '#/entrar', titulo: 'Ecrã principal' };
    },
    html: function () {
      const o = instalou ? 'instalada' : onde();
      return '<div class="capa">' +
          UI.foto({ semente: 'instalar', variante: 'poente' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="titulo-editorial">No ecrã principal</h1>' +
            '<p class="subtitulo" style="margin-top:8px">Abre como as outras apps, sem rede e sem o browser à volta.</p>' +
          '</div>' +
        '</div>' +
        '<div class="faixa" style="margin-top:32px">' + CORPOS[o]() + '</div>';
    },
    acoes: {
      instalar: pedir,
      copiarLink: copiar
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
