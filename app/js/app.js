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
    ['poi/:id', 'poi'],
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
    ['org/local/:id', 'orgLocal'],
    ['org/dados', 'orgDados']
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

  function navegar() {
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
    vistaAtual = r.vista;
    paramsAtuais = r.params;
    desenhar();
    elEcra.scrollTop = 0;
    window.scrollTo(0, 0);
    elEcra.focus({ preventScroll: true });
  }

  /* semNav/semCabecalho podem ser um valor fixo ou uma função do
     estado — a Hoje durante o passeio só é imersiva nessa fase. */
  function ehVerdadeiro(v) { return typeof v === 'function' ? v(paramsAtuais) : v; }

  function desenhar() {
    const vista = window.Vistas[vistaAtual];
    if (!vista) return;

    elApp.hidden = false;
    elEcra.innerHTML = vista.html(paramsAtuais) || '';
    elEcra.dataset.semNav = ehVerdadeiro(vista.semNav) ? 'sim' : 'nao';

    desenharCabecalho(vista);
    desenharNav(vista);
    desenharRede();

    if (vista.montar) vista.montar(elEcra, paramsAtuais);
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
    if (!alvo || alvo.dataset.sempre === 'sim') return;

    const texto = elEcra.querySelector('.capa__texto');
    let visivel;
    if (texto) {
      visivel = texto.getBoundingClientRect().bottom < 92;
    } else {
      visivel = (window.scrollY || document.documentElement.scrollTop) > 72;
    }
    alvo.dataset.visivel = visivel ? 'sim' : 'nao';
  }

  window.addEventListener('scroll', atualizarTituloCabecalho, { passive: true });
  window.addEventListener('hashchange', navegar);
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

  navegar();
  Estado.sincronizar();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem service worker, a app continua a funcionar */ });
    });
  }
})();
