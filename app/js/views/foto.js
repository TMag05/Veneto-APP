/* =========================================================
   Uma fotografia, em ecrã inteiro — #/foto/id
   Como a galeria do iPhone (30.09.2026): a fotografia ocupa o
   ecrã; desliza-se para o lado para a anterior e a seguinte, pela
   ordem e com o filtro da grelha; dois dedos ou dois toques
   ampliam; deslizar para baixo fecha, para cima mostra quem a
   tirou. Um toque esconde ou mostra as barras — escondidas, o
   fundo fica negro. O endereço acompanha a fotografia à vista,
   sem encher o histórico: voltar leva sempre à grelha.
   O que se descarrega é o ficheiro de origem, nunca a redução.
   ========================================================= */

(function () {

  const INTERVALO = 24;      /* o espaço entre fotografias ao deslizar */
  const MAXIMO = 5;          /* a maior ampliação */
  const DUPLO = 2.5;         /* a ampliação de dois toques */
  const TEMPO_TOQUE = 280;   /* dois toques dentro disto são um duplo */
  const MOVIMENTO = 200;     /* ms, o movimento discreto do manifesto */

  let lista = [];
  let i = 0;
  let idBase = '';
  let idVisivel = '';
  let raiz = null;
  let desligar = null;

  function listaAtual() {
    return (Vistas.galeria && Vistas.galeria.lista) ? Vistas.galeria.lista() : Estado.fotos();
  }

  /* Quem a tirou: o nome, o carro e o lugar no carro. O carro só se
     desenha quando se sabe qual é — a organização viaja em carros
     próprios, e não se inventa um Aston Martin a ninguém. */
  function autorDe(f) {
    if (f.propria) {
      const p = Estado.get().perfil;
      const carro = Estado.meuCarro();
      return { nome: Estado.eu().nome, modelo: carro ? carro.modelo : '', funcao: p.funcao || '', organizacao: p.papel === 'organizacao' };
    }
    if (f.autor === 'organizacao') return { nome: DADOS.evento.nome || 'Do passeio', semCarro: true };
    /* Do grupo: quem a tirou vem com a fotografia. */
    if (f.autor === 'grupo') {
      return { nome: f.autorNome || 'Do grupo', modelo: f.autorModelo || '', funcao: f.autorFuncao || '', organizacao: f.autorPapel === 'organizacao' };
    }
    const p = DADOS.participante(f.autor);
    return p ? { nome: DADOS.nomeCompleto(p), modelo: p.modelo, funcao: p.funcao || '' } : { nome: 'Do grupo' };
  }

  /* O carro a traço e, ao lado, o piloto ou o co-piloto; por baixo, o
     nome, o carro e o lugar em palavras, e o dia e a hora. */
  function autorHtml(a, linha) {
    const funcao = Silhuetas.funcao(a.funcao);
    const figuras = (a.modelo ? '<span class="foto-autor__carro">' + Silhuetas.svg(a.modelo) + '</span>' : '') +
      (funcao ? '<span class="foto-autor__lugar">' + Silhuetas.lugar(a.funcao) + '</span>' : '');
    const quem = [a.modelo ? Silhuetas.modelo(a.modelo).nome : '', funcao ? funcao.nome : '', a.organizacao ? 'Organização' : '']
      .filter(Boolean).join(' · ');
    return '<div class="foto-autor">' +
      (figuras && !a.semCarro ? '<div class="foto-autor__figuras">' + figuras + '</div>' : '') +
      '<p class="titulo-ui">' + UI.h(a.nome) + '</p>' +
      (quem ? '<p class="meta foto-autor__quem">' + UI.h(quem) + '</p>' : '') +
      (linha ? '<p class="meta num">' + UI.h(linha) + '</p>' : '') +
    '</div>';
  }

  function deAbertura(f) { return !f.propria && f.autor === 'organizacao'; }

  function hora(t) {
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
  }

  function quando(f) {
    const poi = f.poi && POIS[f.poi] ? POIS[f.poi].nome : '';
    return [poi, UI.rotuloDia(DADOS.dia(f.dia)), f.criado ? hora(f.criado) : ''].filter(Boolean).join(' · ');
  }

  function podeApagar(f) {
    return !!f.propria || Estado.ehOrganizacao();
  }

  /* Com a lista atual, onde está a fotografia à vista. */
  function situar() {
    lista = listaAtual();
    i = lista.findIndex(function (f) { return f.id === idVisivel; });
    return i >= 0;
  }

  /* ---------------------------------------------------------
     O desenho: três folhas lado a lado — a anterior, a atual e a
     seguinte — e as duas barras por cima.
     --------------------------------------------------------- */

  function textos() {
    const f = lista[i];
    if (!f || !raiz) return;
    const a = autorDe(f);
    raiz.querySelector('.visor__quando').textContent = quando(f);
    raiz.querySelector('.visor__autor').textContent = a.nome;
    raiz.querySelector('.visor__contador').textContent = lista.length > 1 ? (i + 1) + ' de ' + lista.length : '';
    const apagar = raiz.querySelector('[data-acao="apagar"]');
    if (apagar) apagar.hidden = !podeApagar(f);
    raiz.querySelectorAll('.visor__seta').forEach(function (b) {
      b.hidden = b.dataset.valor === '-1' ? i === 0 : i === lista.length - 1;
    });
  }

  /* Cada folha tem a miniatura, que já está no telemóvel e aparece
     logo, e a vista nítida por cima quando chegar. */
  function preencher(folha, f) {
    folha.dataset.id = f ? f.id : '';
    folha.innerHTML = '';
    if (!f) return;
    const zoom = document.createElement('div');
    zoom.className = 'visor__zoom';
    const base = document.createElement('img');
    base.className = 'visor__img visor__img--base';
    base.alt = '';
    base.setAttribute('aria-hidden', 'true');
    const vista = document.createElement('img');
    vista.className = 'visor__img visor__img--vista';
    vista.alt = 'Fotografia de ' + autorDe(f).nome;
    vista.decoding = 'async';
    vista.addEventListener('load', function () { vista.dataset.pronta = 'sim'; });
    zoom.appendChild(base);
    zoom.appendChild(vista);
    folha.appendChild(zoom);
    Fotos.url(f.id, 'mini').then(function (u) { if (u && base.isConnected) base.src = u; });
    Fotos.url(f.id, 'vista').then(function (u) { if (u && vista.isConnected) vista.src = u; });
  }

  let ids = ['', '', ''];
  function montarFolhas() {
    const folhas = raiz.querySelectorAll('.visor__folha');
    [-1, 0, 1].forEach(function (d, k) {
      const f = lista[i + d] || null;
      const id = f ? f.id : '';
      /* Só se refaz a folha que mudou: as imagens já carregadas ficam. */
      if (folhas[k].dataset.id !== id || !id) preencher(folhas[k], f);
    });
    ids = [-1, 0, 1].map(function (d) { return lista[i + d] ? lista[i + d].id : ''; });
    zoom = { s: 1, x: 0, y: 0 };
    aplicarZoom(false);
    posicionar(0, false);
    textos();
  }

  /* ---------------------------------------------------------
     Deslizar entre fotografias
     --------------------------------------------------------- */

  function largura() { return raiz ? raiz.clientWidth : window.innerWidth; }
  function altura() { return raiz ? raiz.clientHeight : window.innerHeight; }

  function posicionar(dx, animar) {
    const folhas = raiz.querySelectorAll('.visor__folha');
    const passo = largura() + INTERVALO;
    folhas.forEach(function (el, k) {
      el.style.transition = animar ? 'transform ' + MOVIMENTO + 'ms cubic-bezier(0.2, 0, 0, 1)' : 'none';
      el.style.transform = 'translate3d(' + ((k - 1) * passo + dx) + 'px,0,0)';
    });
  }

  let aMudar = false;
  function mudar(delta) {
    if (aMudar || !lista[i + delta]) { posicionar(0, true); return; }
    aMudar = true;
    posicionar(-delta * (largura() + INTERVALO), true);
    setTimeout(function () {
      const antigos = ids.slice();
      i += delta;
      idVisivel = lista[i].id;
      /* As folhas rodam: a que ficou à vista passa para o meio sem
         voltar a carregar a imagem. */
      const folhas = Array.prototype.slice.call(raiz.querySelectorAll('.visor__folha'));
      const trilho = raiz.querySelector('.visor__trilho');
      if (delta > 0) trilho.appendChild(folhas[0]); else trilho.insertBefore(folhas[2], folhas[0]);
      montarFolhas();
      /* O endereço acompanha, sem entrada nova no histórico. */
      history.replaceState(history.state, '', '#/foto/' + encodeURIComponent(idVisivel));
      /* Os endereços das que saíram de perto devolvem-se. */
      antigos.forEach(function (id) { if (id && ids.indexOf(id) < 0) Fotos.libertar(id); });
      aMudar = false;
    }, MOVIMENTO);
  }

  /* ---------------------------------------------------------
     Ampliar: dois dedos, ou dois toques
     --------------------------------------------------------- */

  let zoom = { s: 1, x: 0, y: 0 };

  function elZoom() {
    const f = raiz && raiz.querySelectorAll('.visor__folha')[1];
    return f ? f.querySelector('.visor__zoom') : null;
  }

  /* O tamanho da fotografia no ecrã, sem ampliação: cabe inteira. */
  function caixa() {
    const W = largura(), H = altura();
    const el = elZoom();
    const img = el && (el.querySelector('.visor__img--vista[data-pronta]') || el.querySelector('.visor__img--base'));
    const f = lista[i] || {};
    const r = (img && img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight
      : (f.largura && f.altura ? f.largura / f.altura : W / H);
    const w = Math.min(W, H * r);
    return { w: w, h: w / r, W: W, H: H };
  }

  function limitar() {
    const c = caixa();
    const mx = Math.max(0, (zoom.s * c.w - c.W) / 2);
    const my = Math.max(0, (zoom.s * c.h - c.H) / 2);
    zoom.x = Math.max(-mx, Math.min(mx, zoom.x));
    zoom.y = Math.max(-my, Math.min(my, zoom.y));
  }

  function aplicarZoom(animar) {
    const el = elZoom();
    if (!el) return;
    el.style.transition = animar ? 'transform ' + MOVIMENTO + 'ms cubic-bezier(0.2, 0, 0, 1)' : 'none';
    el.style.transform = 'translate3d(' + zoom.x + 'px,' + zoom.y + 'px,0) scale(' + zoom.s + ')';
    raiz.dataset.ampliada = zoom.s > 1.01 ? 'sim' : 'nao';
  }

  /* Dois toques: amplia no ponto tocado, ou volta ao inteiro. */
  function alternarZoom(px, py) {
    if (zoom.s > 1.01) { zoom = { s: 1, x: 0, y: 0 }; }
    else {
      const cx = px - largura() / 2, cy = py - altura() / 2;
      zoom = { s: DUPLO, x: cx * (1 - DUPLO), y: cy * (1 - DUPLO) };
      limitar();
    }
    aplicarZoom(true);
  }

  /* ---------------------------------------------------------
     As barras, e o fundo negro quando se escondem
     --------------------------------------------------------- */

  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

  function mostrarBarras(sim) {
    if (!raiz) return;
    raiz.dataset.interface = sim ? 'sim' : 'nao';
    /* Fora do iPhone, sem barras, também sai a do sistema. No iPhone
       o Safari não o permite: é a própria app que tapa tudo. */
    if (ios || !document.fullscreenEnabled) return;
    if (!sim && !document.fullscreenElement) raiz.requestFullscreen().catch(function () {});
    if (sim && document.fullscreenElement) document.exitFullscreen().catch(function () {});
  }

  function aoMudarEcraInteiro() {
    if (raiz && !document.fullscreenElement && raiz.dataset.interface === 'nao') raiz.dataset.interface = 'sim';
  }

  function fechar() {
    if (Vistas.galeria && Vistas.galeria.focar) Vistas.galeria.focar(idVisivel);
    App.voltar('#/galeria');
  }

  function info() {
    const f = lista[i];
    if (!f) return;
    UI.abrirFolha('Fotografia',
      autorHtml(autorDe(f), quando(f)) +
      '<p class="meta" style="margin-top:16px">O ficheiro de origem, como saiu da câmara, é o que se descarrega.' +
        (f.estadoEnvio === 'enviado' ? '' : ' Ainda só existe neste telemóvel.') + '</p>');
  }

  /* ---------------------------------------------------------
     Os gestos. Tudo é da app: o browser não desliza nem amplia a
     página, e cada gesto decide-se pelos primeiros píxeis.
     --------------------------------------------------------- */

  function ligarGestos(palco) {
    let modo = '';          /* '', 'lado', 'fechar', 'info', 'mover', 'pinca' */
    let ini = null;         /* o primeiro toque */
    let pinca = null;
    let ultimo = null;      /* para a velocidade */
    let toqueAnterior = null;
    let temporizador = null;
    let deToque = 0;

    function ponto(t) {
      const r = raiz.getBoundingClientRect();
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }
    function distancia(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function meio(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

    function fundoFecho(p) {
      raiz.style.setProperty('--visor-fecho', String(Math.max(0, 1 - p)));
    }

    function toque(p) {
      /* Dois toques perto um do outro: ampliar. Um só: as barras. */
      const agora = Date.now();
      if (toqueAnterior && agora - toqueAnterior.t < TEMPO_TOQUE && distancia(p, toqueAnterior) < 40) {
        clearTimeout(temporizador);
        toqueAnterior = null;
        alternarZoom(p.x, p.y);
        return;
      }
      toqueAnterior = { x: p.x, y: p.y, t: agora };
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        toqueAnterior = null;
        mostrarBarras(raiz.dataset.interface !== 'sim');
      }, TEMPO_TOQUE);
    }

    function inicio(e) {
      if (aMudar) return;
      const t = e.touches;
      if (t.length === 2) {
        const a = ponto(t[0]), b = ponto(t[1]);
        modo = 'pinca';
        pinca = { d: distancia(a, b) || 1, m: meio(a, b), s: zoom.s, x: zoom.x, y: zoom.y };
        if (ini && ini.dx) posicionar(0, true);
        return;
      }
      if (t.length !== 1) return;
      const p = ponto(t[0]);
      ini = { x: p.x, y: p.y, t: Date.now(), zx: zoom.x, zy: zoom.y, dx: 0 };
      ultimo = { x: p.x, y: p.y, t: Date.now() };
      modo = zoom.s > 1.01 ? 'mover' : '';
    }

    function movimento(e) {
      e.preventDefault();
      if (aMudar) return;
      const t = e.touches;
      if (modo === 'pinca' && t.length === 2) {
        const a = ponto(t[0]), b = ponto(t[1]);
        const m = meio(a, b);
        const s = Math.max(0.8, Math.min(MAXIMO, pinca.s * distancia(a, b) / pinca.d));
        /* O ponto da fotografia debaixo dos dedos fica debaixo deles. */
        const cx = largura() / 2, cy = altura() / 2;
        const qx = (pinca.m.x - cx - pinca.x) / pinca.s, qy = (pinca.m.y - cy - pinca.y) / pinca.s;
        zoom = { s: s, x: m.x - cx - s * qx, y: m.y - cy - s * qy };
        aplicarZoom(false);
        return;
      }
      if (!ini || t.length !== 1) return;
      const p = ponto(t[0]);
      const dx = p.x - ini.x, dy = p.y - ini.y;
      ultimo = { x: p.x, y: p.y, t: Date.now(), vx: (p.x - ultimo.x) / Math.max(1, Date.now() - ultimo.t), vy: (p.y - ultimo.y) / Math.max(1, Date.now() - ultimo.t) };

      if (modo === 'mover') {
        zoom.x = ini.zx + dx; zoom.y = ini.zy + dy;
        limitar();
        aplicarZoom(false);
        return;
      }
      if (!modo) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        modo = Math.abs(dx) > Math.abs(dy) ? 'lado' : (dy > 0 ? 'fechar' : 'info');
      }
      if (modo === 'lado') {
        /* Nas pontas, a fotografia resiste. */
        const fim = (dx > 0 && i === 0) || (dx < 0 && i === lista.length - 1);
        ini.dx = fim ? dx * 0.3 : dx;
        posicionar(ini.dx, false);
      } else if (modo === 'fechar') {
        const prog = Math.min(1, Math.max(0, dy) / (altura() * 0.5));
        zoom = { s: 1 - prog * 0.35, x: dx, y: Math.max(0, dy) };
        aplicarZoom(false);
        fundoFecho(prog);
      }
    }

    function fim(e) {
      if (aMudar) return;
      if (modo === 'pinca') {
        if (e.touches.length) return;   /* ainda há um dedo: espera-se */
        if (zoom.s < 1.01) zoom = { s: 1, x: 0, y: 0 };
        else limitar();
        aplicarZoom(true);
        modo = ''; ini = null;
        return;
      }
      if (!ini) return;
      const dx = ultimo.x - ini.x, dy = ultimo.y - ini.y;
      const rapido = Date.now() - ultimo.t < 80;
      deToque = Date.now();

      if (!modo || (modo === 'mover' && Math.abs(dx) < 8 && Math.abs(dy) < 8)) {
        if (Date.now() - ini.t < 350) toque(ultimo);
      } else if (modo === 'lado') {
        const passou = Math.abs(dx) > largura() * 0.25 || (rapido && Math.abs(ultimo.vx || 0) > 0.4);
        if (passou) mudar(dx < 0 ? 1 : -1);
        else posicionar(0, true);
      } else if (modo === 'fechar') {
        if (dy > 120 || (rapido && (ultimo.vy || 0) > 0.6)) { fechar(); }
        else { zoom = { s: 1, x: 0, y: 0 }; aplicarZoom(true); fundoFecho(0); }
      } else if (modo === 'info') {
        if (dy < -60) info();
      }
      modo = ''; ini = null;
    }

    /* No computador: um clique mostra ou esconde as barras, dois
       ampliam; as setas do teclado passam de fotografia. */
    function clique(e) {
      if (Date.now() - deToque < 700) return;
      const p = ponto(e);
      toque(p);
    }

    function tecla(e) {
      if (!document.getElementById('folha').hidden) return;
      if (e.key === 'ArrowRight') mudar(1);
      else if (e.key === 'ArrowLeft') mudar(-1);
      else if (e.key === 'Escape') fechar();
    }

    function redimensionar() {
      if (!raiz) return;
      zoom = { s: 1, x: 0, y: 0 };
      aplicarZoom(false);
      posicionar(0, false);
    }

    palco.addEventListener('touchstart', inicio, { passive: true });
    palco.addEventListener('touchmove', movimento, { passive: false });
    palco.addEventListener('touchend', fim);
    palco.addEventListener('touchcancel', fim);
    palco.addEventListener('click', clique);
    document.addEventListener('keydown', tecla);
    window.addEventListener('resize', redimensionar);
    document.addEventListener('fullscreenchange', aoMudarEcraInteiro);

    return function () {
      clearTimeout(temporizador);
      document.removeEventListener('keydown', tecla);
      window.removeEventListener('resize', redimensionar);
      document.removeEventListener('fullscreenchange', aoMudarEcraInteiro);
    };
  }

  /* ---------------------------------------------------------
     A vista
     --------------------------------------------------------- */

  function existe(p) {
    if (p.id !== idBase) { idBase = p.id; idVisivel = p.id; }
    return situar();
  }

  Vistas.foto = {
    nav: 'galeria',
    semCabecalho: function (p) { return existe(p); },
    semNav: function (p) { return existe(p); },
    cabecalho: { voltar: '#/galeria', titulo: 'Fotografia' },
    html: function (p) {
      if (!existe(p)) {
        return '<div class="faixa" style="padding-top:24px">' +
          '<p class="corpo-editorial">Esta fotografia já não está aqui.</p>' +
          '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/galeria">Voltar à galeria</a>' +
        '</div>';
      }
      return '<div class="visor" data-interface="sim" data-ampliada="nao" role="dialog" aria-label="Fotografia">' +
          '<div class="visor__fundo" aria-hidden="true"></div>' +
          '<div class="visor__palco">' +
            '<div class="visor__trilho">' +
              '<div class="visor__folha"></div><div class="visor__folha"></div><div class="visor__folha"></div>' +
            '</div>' +
          '</div>' +
          '<div class="visor__topo">' +
            '<button class="botao-icone" type="button" data-acao="fechar" aria-label="Voltar à galeria">' + Icone('voltar', 24) + '</button>' +
            '<div class="visor__titulo">' +
              '<span class="visor__quando titulo-ui num"></span>' +
              '<span class="visor__autor meta"></span>' +
            '</div>' +
            '<span class="visor__contador meta num"></span>' +
          '</div>' +
          '<div class="visor__base">' +
            '<button class="botao-icone" type="button" data-acao="descarregar" aria-label="Descarregar o original">' + Icone('descarregar', 24) + '</button>' +
            '<button class="botao-icone" type="button" data-acao="info" aria-label="Quem a tirou">' + Icone('info', 24) + '</button>' +
            '<button class="botao-icone" type="button" data-acao="apagar" aria-label="Apagar">' + Icone('apagar', 24) + '</button>' +
          '</div>' +
          '<button class="visor__seta visor__seta--anterior botao-icone" type="button" data-acao="passar" data-valor="-1" aria-label="Anterior">' + Icone('voltar', 24) + '</button>' +
          '<button class="visor__seta visor__seta--seguinte botao-icone" type="button" data-acao="passar" data-valor="1" aria-label="Seguinte">' + Icone('seta', 24) + '</button>' +
        '</div>';
    },

    montar: function (el) {
      raiz = el.querySelector('.visor');
      if (!raiz) return;
      raiz.querySelectorAll('.visor__folha').forEach(function (f) { f.dataset.id = '__'; });
      montarFolhas();
      if (desligar) desligar();
      desligar = ligarGestos(raiz.querySelector('.visor__palco'));
    },

    /* Chegam fotografias novas do grupo, ou sai uma: o visor fica
       onde está, e só as folhas e o contador acertam. */
    repintar: function () {
      if (!raiz || !raiz.isConnected) return true;
      if (!situar()) {
        lista = listaAtual();
        if (!lista.length) return true;
        idVisivel = lista[Math.min(Math.max(i, 0), lista.length - 1)].id;
        situar();
      }
      /* Com as mesmas vizinhas, nem a ampliação se perde. */
      const agora = [-1, 0, 1].map(function (d) { return lista[i + d] ? lista[i + d].id : ''; });
      if (agora.join('|') === ids.join('|')) textos();
      else montarFolhas();
      return false;
    },

    desmontar: function () {
      if (desligar) { desligar(); desligar = null; }
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      raiz = null;
      idBase = '';
      Fotos.libertarTodos();
    },

    acoes: {
      fechar: fechar,
      info: info,
      passar: function (v) { mudar(parseInt(v, 10) || 0); },

      descarregar: function () {
        const f = lista[i];
        if (!f) return;
        const id = f.id;
        /* O original: o do arquivo, ou, se for de outra pessoa, o do
           servidor. */
        Promise.all([Fotos.obter(id, 'original'), Fotos.ler(id).catch(function () { return null; })]).then(function (x) {
          const blob = x[0];
          const tipo = (x[1] && x[1].tipo) || f.tipo || (blob && blob.type) || 'image/jpeg';
          if (!blob) {
            /* Sem poder trazê-lo para aqui, abre-se o original onde está;
               o telemóvel guarda-o a partir daí. */
            const direto = navigator.onLine ? Fotos.endereco(id, 'original') : '';
            if (direto) { window.open(direto, '_blank', 'noopener'); return; }
            UI.abrirFolha('Sem ligação', '<p class="corpo-ui silencioso">O original desta fotografia está no servidor. Tente de novo com rede.</p>');
            return;
          }
          UI.descarregar(UI.nomeDeFoto(f, tipo), blob, tipo);
        });
      },

      /* Nunca ao primeiro toque. */
      apagar: function () {
        const f = lista[i];
        if (!f || !podeApagar(f)) return;
        UI.abrirFolha('Apagar a fotografia',
          '<p class="corpo-ui silencioso">' +
            (f.propria ? 'Sai do álbum do grupo e do seu telemóvel.' : 'Sai do álbum do grupo, para toda a gente.') +
          ' Não se recupera.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-apagar-foto">Apagar</button>');
        document.getElementById('btn-apagar-foto').addEventListener('click', function () {
          UI.fecharFolha();
          /* Fica à vista a seguinte, ou a anterior se era a última. */
          const vizinha = lista[i + 1] || lista[i - 1] || null;
          if (!vizinha) { fechar(); }
          else {
            idVisivel = vizinha.id;
            history.replaceState(history.state, '', '#/foto/' + encodeURIComponent(idVisivel));
          }
          /* As de abertura são conteúdo do passeio, não estado de quem
             as tirou: saem por onde entraram. */
          if (deAbertura(f)) Conteudo.removerFotoInicial(f.id);
          else Estado.apagarFoto(f.id);
        });
      }
    }
  };
})();
