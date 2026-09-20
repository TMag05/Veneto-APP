/* =========================================================
   Encaminhamento e arranque
   Cada ecrã tem um endereço fixo e partilhável — é isso que
   permite ao WhatsApp ser o sino e à app ser o arquivo.
   ========================================================= */

(function () {

  const ROTAS = [
    ['entrada', 'entrada'],
    ['chegada', 'chegada'],
    ['hoje', 'hoje'],
    ['dia/:id', 'dia'],
    ['preparacao', 'preparacao'],
    ['roadbook', 'roadbook'],
    ['roadbook/:id', 'roadbookDia'],
    ['roadbook/:id/:momento', 'roadbookDia'],
    ['poi/:id', 'poi'],
    ['momento/:dia/:n', 'momento'],
    ['mapa', 'mapa'],
    ['participantes', 'participantes'],
    ['galeria', 'galeria'],
    ['concierge', 'concierge'],
    ['contactos', 'contactos'],
    ['sos', 'sos'],
    ['carro', 'carro'],
    ['perfil', 'perfil'],
    ['album', 'album'],
    ['arquivo', 'arquivo'],
    ['mais', 'mais'],
    ['definicoes', 'definicoes'],

    ['org', 'orgInicio'],
    ['org/evento', 'orgEvento'],
    ['org/itinerario', 'orgItinerario'],
    ['org/etapa/:id', 'orgEtapa'],
    ['org/paragem/:id', 'orgParagem'],
    ['org/participantes', 'orgParticipantes'],
    ['org/participante/:id', 'orgParticipante'],
    ['org/contactos', 'orgContactos'],
    ['org/contacto/:id', 'orgContacto'],
    ['org/local/:id', 'orgLocal']
  ];

  const ABAS_CONVIDADO = [
    { rota: '#/hoje', icone: 'hoje', rotulo: 'Hoje', nav: 'hoje' },
    { rota: '#/roadbook', icone: 'roadbook', rotulo: 'Roadbook', nav: 'roadbook' },
    { rota: '#/mapa', icone: 'mapa', rotulo: 'Mapa', nav: 'mapa' },
    { rota: '#/galeria', icone: 'galeria', rotulo: 'Galeria', nav: 'galeria' },
    { rota: '#/mais', icone: 'mais', rotulo: 'Mais', nav: 'mais' }
  ];

  /* A área da organização tem a estrutura do documento: três
     separadores mais os dados do evento. */
  const ABAS_ORGANIZACAO = [
    { rota: '#/org/itinerario', icone: 'roadbook', rotulo: 'Itinerário', nav: 'org-itinerario' },
    { rota: '#/org/participantes', icone: 'pessoas', rotulo: 'Pessoas', nav: 'org-pessoas' },
    { rota: '#/org/contactos', icone: 'telefone', rotulo: 'Contactos', nav: 'org-contactos' },
    { rota: '#/org/evento', icone: 'definicoes', rotulo: 'Evento', nav: 'org-evento' }
  ];

  const elApp = document.getElementById('app');
  const elEcra = document.getElementById('ecra');
  const elCabecalho = document.getElementById('cabecalho');
  const elNav = document.getElementById('navegacao');
  const elRede = document.getElementById('estado-rede');

  let vistaAtual = null;
  let paramsAtuais = {};

  /* Profundidade no histórico. Guardada em history.state para
     sobreviver a recuar e avançar. Serve para saber se há para onde
     voltar — um deep link vindo do WhatsApp abre já na profundidade
     zero e nesse caso usa-se o ecrã-pai declarado pela vista. */
  let profundidade = -1;

  function sincronizarProfundidade() {
    const s = history.state;
    if (s && typeof s.profundidade === 'number') {
      profundidade = s.profundidade;
    } else {
      profundidade += 1;
      history.replaceState({ profundidade: profundidade }, '');
    }
  }

  /* Troca de ecrã sem acrescentar entrada ao histórico. */
  function irSubstituindo(rota) {
    history.replaceState({ profundidade: Math.max(profundidade, 0) }, '', rota);
    navegar();
  }

  function voltar(rotaPai) {
    if (profundidade > 0) { history.back(); return; }
    irSubstituindo(rotaPai && rotaPai.charAt(0) === '#' ? rotaPai : '#/hoje');
  }

  /* ---------------------------------------------------------
     Correspondência de rotas
     --------------------------------------------------------- */

  function resolver(hash) {
    const caminho = (hash || '').replace(/^#\/?/, '').replace(/\/$/, '');
    const partes = caminho ? caminho.split('/') : [];

    for (let i = 0; i < ROTAS.length; i++) {
      const modelo = ROTAS[i][0].split('/');
      if (modelo.length !== partes.length) continue;
      const params = {};
      let bate = true;
      for (let j = 0; j < modelo.length; j++) {
        if (modelo[j].charAt(0) === ':') params[modelo[j].slice(1)] = decodeURIComponent(partes[j]);
        else if (modelo[j] !== partes[j]) { bate = false; break; }
      }
      if (bate) return { vista: ROTAS[i][1], params: params };
    }
    return null;
  }

  /* ---------------------------------------------------------
     Versão nova
     Um separador aberto fica preso à versão com que foi aberto:
     mudar só o que vem depois do # não pede nada ao servidor. Ao
     voltar à app e ao mudar de ecrã, pergunta-se que versão está
     publicada; se for outra, a app recarrega-se. O ecrã e os dados
     ficam, porque vivem no endereço e no telemóvel.
     --------------------------------------------------------- */

  const versaoCarregada = (function () {
    const s = document.querySelector('script[src*="js/app.js"]');
    const m = s && s.src.match(/[?&]v=(\d+)/);
    return m ? m[1] : '';
  })();
  let ultimaVerificacao = 0;

  function verificarVersao() {
    const agora = Date.now();
    if (!versaoCarregada || !navigator.onLine || agora - ultimaVerificacao < 15000) return;
    ultimaVerificacao = agora;

    fetch('index.html', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        const m = html.match(/js\/app\.js\?v=(\d+)/);
        if (!m || m[1] === versaoCarregada) return;

        /* Com service worker, é ele que traz a versão nova; quando toma
           conta da página, recarrega-a (controllerchange, no arranque). */
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.getRegistration().then(function (reg) { if (reg) reg.update(); });
          return;
        }

        /* Sem service worker, recarrega-se — uma vez por versão, para
           nunca entrar em ciclo. */
        try {
          if (sessionStorage.getItem('veneto.versao-pedida') === m[1]) return;
          sessionStorage.setItem('veneto.versao-pedida', m[1]);
        } catch (e) { /* sem sessionStorage, tenta-se na mesma */ }
        location.reload();
      })
      .catch(function () { /* sem rede, fica a versão que há */ });
  }

  function navegar() {
    verificarVersao();

    /* #/demo/2 prepara a demonstração num só toque — ver mais.js. */
    const demo = /^#\/demo(?:\/([\w-]+))?$/.exec(location.hash);
    if (demo && window.Demonstracao) {
      Demonstracao.preparar(demo[1]);
      irSubstituindo('#/hoje');
      return;
    }

    const estado = Estado.get();

    if (!estado.autenticado && location.hash !== '#/entrada') {
      irSubstituindo('#/entrada');
      return;
    }

    let r = resolver(location.hash);
    if (!r) {
      irSubstituindo(estado.autenticado ? '#/hoje' : '#/entrada');
      return;
    }
    if (estado.autenticado && r.vista === 'entrada') {
      irSubstituindo(estado.chegadaVista ? '#/hoje' : '#/chegada');
      return;
    }
    /* A chegada acontece uma vez por instalação. */
    if (estado.autenticado && !estado.chegadaVista && r.vista !== 'chegada') {
      irSubstituindo('#/chegada');
      return;
    }
    if (estado.chegadaVista && r.vista === 'chegada') {
      irSubstituindo('#/hoje');
      return;
    }

    const vista = window.Vistas[r.vista];
    if (!vista) { irSubstituindo('#/hoje'); return; }

    /* A área da organização só existe para quem tem esse papel. */
    if (vista.area === 'organizacao' && !Estado.ehOrganizacao()) {
      irSubstituindo('#/hoje');
      return;
    }

    sincronizarProfundidade();
    /* Sair de um ecrã é o momento de devolver o que ele pediu
       emprestado — os endereços temporários das fotografias. */
    const anterior = window.Vistas[vistaAtual];
    if (anterior && anterior.desmontar && vistaAtual !== r.vista) anterior.desmontar();
    vistaAtual = r.vista;
    paramsAtuais = r.params;
    elEcra.scrollTop = 0;
    window.scrollTo(0, 0);
    desenhar(true);
    elEcra.focus({ preventScroll: true });
  }

  /* semNav/semCabecalho podem ser um valor fixo ou uma função do
     estado — a Hoje durante o passeio só é imersiva nessa fase. */
  function ehVerdadeiro(v) { return typeof v === 'function' ? v(paramsAtuais) : v; }

  /* chegada: true quando se acabou de navegar para o ecrã, false
     quando só se repinta. A vista usa-o para posicionar uma única vez. */
  function desenhar(chegada) {
    const vista = window.Vistas[vistaAtual];
    if (!vista) return;

    elApp.hidden = false;
    elEcra.innerHTML = vista.html(paramsAtuais) || '';
    elEcra.dataset.semNav = ehVerdadeiro(vista.semNav) ? 'sim' : 'nao';

    desenharCabecalho(vista);
    desenharNav(vista);
    desenharRede();

    if (vista.montar) vista.montar(elEcra, paramsAtuais, chegada === true);
    ligarAcoes();
    atualizarTituloCabecalho();
  }

  function desenharCabecalho(vista) {
    if (ehVerdadeiro(vista.semCabecalho)) { elCabecalho.hidden = true; return; }
    elCabecalho.hidden = false;
    const c = (typeof vista.cabecalho === 'function' ? vista.cabecalho(paramsAtuais) : vista.cabecalho) || {};

    const esquerda = c.voltar
      ? '<button class="botao-icone" type="button" data-acao="voltar" data-valor="' + c.voltar + '" aria-label="Voltar">' + Icone('voltar', 24) + '</button>'
      : '<span class="botao-icone" aria-hidden="true"></span>';

    let direita = '<span class="botao-icone" aria-hidden="true"></span>';
    if (c.acao) {
      direita = '<button class="botao-icone" type="button" data-acao="' + c.acao.acao + '" data-valor="' +
        UI.h(c.acao.valor || '') + '" aria-label="' + UI.h(c.acao.rotulo) + '">' + Icone(c.acao.icone, 24) + '</button>';
    }

    elCabecalho.innerHTML = esquerda +
      '<span class="cabecalho__titulo" data-sempre="' + (c.tituloSempre ? 'sim' : 'nao') + '" ' +
        'data-visivel="' + (c.tituloSempre ? 'sim' : 'nao') + '">' + UI.h(c.titulo || '') + '</span>' +
      direita;
    elCabecalho.dataset.linha = c.linha === false ? 'nao' : 'sim';
  }

  function desenharNav(vista) {
    if (ehVerdadeiro(vista.semNav)) { elNav.hidden = true; return; }
    elNav.hidden = false;
    const organizacao = vista.area === 'organizacao';
    const abas = organizacao ? ABAS_ORGANIZACAO : ABAS_CONVIDADO;
    elNav.innerHTML = abas.map(function (a) {
      const ativo = a.nav === vista.nav;
      return '<a class="nav-item" href="' + a.rota + '"' + (ativo ? ' aria-current="page"' : '') + '>' +
        (organizacao ? Icone(a.icone, 24) : IconePuncao(a.icone, ativo)) +
        '<span class="nav-item__rotulo">' + a.rotulo + '</span>' +
        '</a>';
    }).join('');
  }

  /* ---------------------------------------------------------
     Estado de rede — discreto, nunca um erro
     --------------------------------------------------------- */

  function desenharRede() {
    const vista = window.Vistas[vistaAtual] || {};
    const pend = Estado.pendentes();
    const offline = !navigator.onLine;

    if (ehVerdadeiro(vista.semNav) || (!pend && !offline)) { elRede.hidden = true; return; }

    elRede.hidden = false;
    if (offline) {
      elRede.innerHTML = Icone('semrede', 20) + '<span>Sem ligação. ' +
        (pend ? UI.plural(pend, 'ação guardada', 'ações guardadas') + ' para enviar depois' : 'O conteúdo do dia está no telemóvel') + '</span>';
    } else {
      elRede.innerHTML = Icone('sincronizar', 20) + '<span>A sincronizar ' + UI.plural(pend, 'item', 'itens') + '</span>';
    }
  }

  /* ---------------------------------------------------------
     Ações declarativas: data-acao no HTML das vistas
     --------------------------------------------------------- */

  const ACOES = {
    /* Voltar é sempre recuar no histórico. O valor só serve de
       recurso quando o ecrã foi aberto de fora, por deep link. */
    voltar: function (valor) { voltar(valor); },
    partilhar: function () {
      UI.partilhar(document.title);
    },
    ir: function (valor) { location.hash = valor; },
    externo: function (valor) { window.open(valor, '_blank', 'noopener'); }
  };

  function ligarAcoes() {
    document.querySelectorAll('[data-acao]').forEach(function (el) {
      if (el.dataset.ligado) return;
      el.dataset.ligado = '1';
      el.addEventListener('click', function (e) {
        const nome = el.dataset.acao;
        const vista = window.Vistas[vistaAtual];
        if (ACOES[nome]) { e.preventDefault(); ACOES[nome](el.dataset.valor, el); return; }
        if (vista && vista.acoes && vista.acoes[nome]) {
          e.preventDefault();
          vista.acoes[nome](el.dataset.valor, el, paramsAtuais);
        }
      });
    });
  }

  /* Título do cabeçalho aparece quando o título do ecrã sai de vista.
     Com capa a ecrã inteiro, o gatilho é o próprio título da capa a
     passar por baixo do cabeçalho — não uma distância fixa, que numa
     capa de 100dvh apareceria com o título grande ainda à vista. */
  function atualizarTituloCabecalho() {
    const alvo = elCabecalho.querySelector('.cabecalho__titulo');
    if (!alvo) return;

    /* Havendo capa, é ela que manda: o título do cabeçalho entra
       quando o da capa sai, mesmo nos ecrãs de título sempre visível —
       senão o mesmo nome aparecia duas vezes ao mesmo tempo. */
    const texto = elEcra.querySelector('.capa__texto');
    if (texto) {
      alvo.dataset.visivel = texto.getBoundingClientRect().bottom < 92 ? 'sim' : 'nao';
      return;
    }
    if (alvo.dataset.sempre === 'sim') return;
    alvo.dataset.visivel = (window.scrollY || document.documentElement.scrollTop) > 72 ? 'sim' : 'nao';
  }

  /* ---------------------------------------------------------
     Tema
     Escuro de origem, claro para se ler ao sol. A escolha é de
     quem lê e vive no estado local; a folha de tokens faz o resto,
     e a barra do browser acompanha a cor do fundo.
     --------------------------------------------------------- */

  function aplicarTema() {
    const tema = Estado.get().tema === 'claro' ? 'claro' : 'escuro';
    document.documentElement.dataset.tema = tema;
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--calce').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && cor) meta.setAttribute('content', cor);
  }

  window.addEventListener('scroll', atualizarTituloCabecalho, { passive: true });
  window.addEventListener('hashchange', navegar);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') verificarVersao();
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) verificarVersao(); });
  window.addEventListener('online', desenharRede);
  window.addEventListener('offline', desenharRede);

  /* Repintar quando o estado muda, mantendo o ecrã atual. */
  /* Uma alteração de conteúdo na área da organização repinta o
     ecrã atual — é o que faz a gravação automática parecer viva. */
  Conteudo.subscrever(function () {
    if (!vistaAtual) return;
    /* Enquanto se escreve num campo não se repinta: perder-se-ia o cursor. */
    const foco = document.activeElement;
    if (foco && foco.dataset && foco.dataset.campo !== undefined) return;
    desenhar();
  });

  Estado.subscrever(function () {
    aplicarTema();
    if (!vistaAtual) return;
    /* A entrada não deve ficar no histórico depois de autenticar. */
    if (vistaAtual === 'entrada' && Estado.get().autenticado) {
      irSubstituindo(Estado.get().chegadaVista ? '#/hoje' : '#/chegada');
      return;
    }
    desenhar();
  });

  window.App = {
    ir: function (rota) { location.hash = rota; },
    substituir: irSubstituindo,
    voltar: voltar,
    repintar: desenhar
  };

  /* ---------------------------------------------------------
     Arranque
     --------------------------------------------------------- */

  aplicarTema();
  navegar();
  Estado.sincronizar();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    /* Quando um service worker novo toma conta da página, ela ainda
       corre o código antigo: recarrega-se. Na primeira instalação não
       havia controlador, e não há nada para trocar. */
    const havia = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (havia) location.reload();
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem service worker, a app continua a funcionar */ });
    });
  }
})();
