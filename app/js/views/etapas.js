/* =========================================================
   Etapas — o retrato do que se conduz
   Não é um mapa de navegação: é o desenho do percurso de cada
   dia e o traçado das estradas que lhe dão nome. O grupo anda em
   caravana, atrás dos batedores — aqui não há nada para validar,
   só para ver. O enquadramento é o do dia, não o da região.
   ========================================================= */

(function () {

  const L = 1000;
  const PAD = 90;

  /* Caixa envolvente do dia, com folga, mantendo a proporção real. */
  function enquadrar(dia) {
    let latMin = 90, latMax = -90, lngMin = 180, lngMax = -180;
    let n = 0;
    dia.etapas.forEach(function (id) {
      const p = POIS[id];
      if (!p || !p.lat || !p.lng) return;
      n++;
      latMin = Math.min(latMin, p.lat); latMax = Math.max(latMax, p.lat);
      lngMin = Math.min(lngMin, p.lng); lngMax = Math.max(lngMax, p.lng);
    });

    /* Sem coordenadas não há caixa: assume-se um enquadramento neutro. */
    if (!n) { latMin = latMax = 46.54; lngMin = lngMax = 12.13; }

    const folgaLat = Math.max((latMax - latMin) * 0.18, 0.02);
    const folgaLng = Math.max((lngMax - lngMin) * 0.18, 0.03);
    latMin -= folgaLat; latMax += folgaLat;
    lngMin -= folgaLng; lngMax += folgaLng;

    const kmLng = (lngMax - lngMin) * 111 * Math.cos((latMax + latMin) / 2 * Math.PI / 180);
    const kmLat = (latMax - latMin) * 111;
    let A = Math.round((L - 2 * PAD) * (kmLat / kmLng) + 2 * PAD);
    A = Math.max(720, Math.min(1100, A));

    return { latMin: latMin, latMax: latMax, lngMin: lngMin, lngMax: lngMax, A: A };
  }

  /* A folga vem da caixa: o percurso traçado grava a sua. */
  function px(E, poi) { const f = E.pad || PAD; return (poi.lng - E.lngMin) / (E.lngMax - E.lngMin) * (L - 2 * f) + f; }
  function py(E, poi) { const f = E.pad || PAD; return (E.latMax - poi.lat) / (E.latMax - E.latMin) * (E.A - 2 * f) + f; }

  /* Curvas de nível sugeridas — textura, não cartografia. */
  function relevo(E, semente) {
    let s = '<g stroke="var(--pietra)" fill="none" stroke-width="1.5" opacity="0.55">';
    for (let i = 0; i < 9; i++) {
      const y = (E.A / 9) * i + 30;
      let d = 'M -20 ' + y.toFixed(0);
      for (let x = 1; x <= 8; x++) {
        const xx = -20 + x * (L + 40) / 8;
        const yy = y + Math.sin(x * 0.9 + i * 1.3 + semente) * (14 + i);
        d += ' Q ' + (xx - (L + 40) / 16).toFixed(0) + ' ' + (yy - 22).toFixed(0) + ' ' + xx.toFixed(0) + ' ' + yy.toFixed(0);
      }
      s += '<path d="' + d + '"/>';
    }
    return s + '</g>';
  }

  function rota(E, dia) {
    const pontos = dia.etapas.map(function (id) { return POIS[id]; }).filter(Boolean);
    if (pontos.length < 2) return '';
    const d = pontos.map(function (p, i) {
      return (i ? 'L ' : 'M ') + px(E, p).toFixed(1) + ' ' + py(E, p).toFixed(1);
    }).join(' ');
    return '<path d="' + d + '" fill="none" stroke="var(--verde)" stroke-width="3.5" ' +
      'stroke-linejoin="round" stroke-linecap="square"/>';
  }

  function marcadores(E, dia) {
    const vistos = {};
    return dia.etapas.map(function (id) {
      if (vistos[id]) return '';
      vistos[id] = true;
      const p = POIS[id];
      if (!p) return '';
      const x = px(E, p), y = py(E, p);
      return '<rect x="' + (x - 7).toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" width="14" height="14" ' +
        'fill="var(--verde)" stroke="#0D0F11" stroke-width="2"/>';
    }).join('');
  }

  function svgMapa(E, dia) {
    return '<svg viewBox="0 0 ' + L + ' ' + E.A + '" xmlns="http://www.w3.org/2000/svg" role="img" ' +
      'aria-label="Percurso do dia ' + dia.numero + ', ' + UI.h(dia.titulo) + '">' +
      '<rect width="' + L + '" height="' + E.A + '" fill="var(--intonaco)"/>' +
      relevo(E, dia.numero * 2.1) +
      rota(E, dia) +
      marcadores(E, dia) +
    '</svg>';
  }

  /* As etiquetas vão por cima, em HTML, para respeitarem a escala
     tipográfica em vez de escalarem com o SVG. */
  function sobreposicao(E, dia) {
    const vistos = {};
    const pontos = [];

    dia.etapas.forEach(function (id) {
      if (vistos[id]) return;
      vistos[id] = true;
      const p = POIS[id];
      if (!p) return;
      pontos.push({ id: id, poi: p, x: px(E, p), y: py(E, p) });
    });

    /* As etiquetas empilham-se por linhas até não se tocarem.
       Numa serra, meia dúzia de passos cabem em poucos quilómetros:
       sem isto, os nomes escrevem-se uns por cima dos outros. */
    const LINHA = 19;
    const colocadas = [];
    pontos.sort(function (a, b) { return a.y - b.y || a.x - b.x; });

    pontos.forEach(function (q) {
      /* Largura estimada da etiqueta, em unidades do viewBox. */
      const larguraX = q.poi.nome.length * 7 / 335 * L;
      const esq = q.x / L * 100;
      const alinha = esq < 26 ? 0 : (esq > 74 ? 1 : 0.5);
      const x0 = q.x - larguraX * alinha;
      const x1 = x0 + larguraX;

      let linha = 0;
      while (linha < 6) {
        const choque = colocadas.some(function (c) {
          const dy = Math.abs((q.y - c.y) / E.A * 335 + (linha - c.linha) * LINHA);
          return dy < LINHA && x1 > c.x0 && x0 < c.x1;
        });
        if (!choque) break;
        linha++;
      }

      q.linha = linha;
      q.alinhamento = esq < 26 ? 'translate(0,0)' : (esq > 74 ? 'translate(-100%,0)' : 'translate(-50%,0)');
      colocadas.push({ x0: x0, x1: x1, y: q.y, linha: linha });
    });

    let s = '';
    pontos.forEach(function (q) {
      const esq = q.x / L * 100;
      const topo = q.y / E.A * 100;
      const desvio = 10 + q.linha * LINHA;

      s += '<a href="#/poi/' + q.id + '" class="mapa-etiqueta" ' +
        'style="left:' + esq.toFixed(2) + '%;top:calc(' + topo.toFixed(2) + '% + ' + desvio + 'px);transform:' + q.alinhamento + '">' +
        '<span class="mapa-etiqueta__nome">' + UI.h(q.poi.nome) + '</span>' +
      '</a>';
    });

    return s;
  }

  /* ---------------------------------------------------------
     O retrato de um dia com percurso traçado
     Em cima, a estrada vista de cima; em baixo, a mesma estrada
     vista de lado, com as altitudes à direita. Um traço só, na
     tinta das estradas, sobre a chapa que não muda de tema. O
     que ainda é dedução vai a tracejado.
     --------------------------------------------------------- */

  function caixaDe(P) {
    const c = P.caixa;
    const A = Number(P.viewBox.split(' ')[3]);
    return { latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, A: A, pad: PERCURSOS.FOLGA };
  }

  function planta(E, P, dia) {
    const tracos = P.tracos.map(function (t) {
      return '<path class="estrada__traco' + (t.estado === 'provavel' ? ' estrada__traco--provavel' : '') + '" d="' + t.d + '"/>';
    }).join('');
    const vistos = {};
    const pontos = dia.etapas.map(function (id) {
      if (vistos[id] || !POIS[id]) return '';
      vistos[id] = true;
      return '<circle class="etapa-ponto" cx="' + px(E, POIS[id]).toFixed(1) + '" cy="' + py(E, POIS[id]).toFixed(1) + '" r="14"/>';
    }).join('');
    return '<div class="etapa-planta">' +
      '<svg viewBox="' + P.viewBox + '" xmlns="http://www.w3.org/2000/svg" role="img" ' +
        'aria-label="Percurso do dia ' + dia.numero + ', ' + UI.h(dia.titulo) + ', ' + Math.round(P.km) + ' km">' +
        tracos + pontos +
      '</svg>' +
      sobreposicao(E, dia) +
    '</div>';
  }

  /* O perfil tem a sua própria escala: 1000 de largura pelos
     quilómetros do dia, 300 de altura pelos metros. As etiquetas vão
     em HTML, por cima, como as do mapa. */
  const PW = 1000, PH = 300;

  function escalaPerfil(P) {
    const kmTotal = (P.perfil.length - 1) * P.passo;
    const alto = Math.max.apply(null, P.perfil.concat(P.picos.map(function (p) { return p.altitude; })));
    /* Folga por cima do ponto mais alto, para o nome dele caber. */
    const topo = Math.max(500, Math.ceil(alto * 1.3 / 500) * 500);
    return {
      kmTotal: kmTotal, topo: topo,
      x: function (km) { return km / kmTotal * PW; },
      y: function (m) { return PH - m / topo * PH; }
    };
  }

  function caminhoPerfil(P, S, de, ate) {
    const pts = [];
    P.perfil.forEach(function (m, i) {
      const km = i * P.passo;
      if (km < de - 1e-6 || km > ate + 1e-6) return;
      pts.push(S.x(km).toFixed(1) + ' ' + S.y(m).toFixed(1));
    });
    return pts.length > 1 ? 'M ' + pts.join(' L ') : '';
  }

  function perfil(P, dia) {
    const S = escalaPerfil(P);
    const corte = P.provavelDesde == null ? S.kmTotal : P.provavelDesde;

    let grelha = '', eixo = '';
    for (let m = 500; m < S.topo; m += 500) {
      const y = S.y(m);
      grelha += '<line class="etapa-grelha" x1="0" x2="' + PW + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>';
      eixo += '<span class="perfil-eixo num" style="top:' + (y / PH * 100).toFixed(2) + '%">' + m + ' m</span>';
    }

    const certo = caminhoPerfil(P, S, 0, corte);
    const provavel = corte < S.kmTotal ? caminhoPerfil(P, S, corte, S.kmTotal) : '';

    /* Os pontos altos, pelo quilómetro. Dois perto um do outro — o
       Rolle e o Valles ficam a treze quilómetros — afastam-se: o
       primeiro acaba no seu ponto, o segundo começa no dele. */
    const PERTO = 30; /* largura estimada de uma etiqueta, em % */
    const lista = P.picos.slice().sort(function (a, b) { return a.km - b.km; }).map(function (p) {
      const esq = S.x(p.km) / PW * 100;
      /* O ponto assenta na linha — o modelo de terreno alisa os topos —
         e a etiqueta diz a altitude oficial. */
      const terreno = P.perfil[Math.round(p.km / P.passo)];
      return { p: p, esq: esq, topo: S.y(terreno) / PH * 100, alinha: esq < 20 ? 'inicio' : (esq > 80 ? 'fim' : 'meio') };
    });
    for (let i = 1; i < lista.length; i++) {
      const a = lista[i - 1], b = lista[i];
      /* Só chocam se também estiverem à mesma altura. */
      if (b.esq - a.esq < PERTO && Math.abs(b.topo - a.topo) < 22) {
        if (a.esq >= 20) a.alinha = 'fim';
        b.alinha = 'inicio';
      }
    }
    const picos = lista.map(function (q) {
      const pos = 'left:' + q.esq.toFixed(2) + '%;top:' + q.topo.toFixed(2) + '%';
      return '<span class="perfil-ponto" style="' + pos + '"></span>' +
        '<span class="perfil-pico perfil-pico--' + q.alinha + '" style="' + pos + '">' +
          '<span class="perfil-pico__nome">' + UI.h(q.p.nome) + '</span>' +
          '<span class="perfil-pico__alt num">' + q.p.altitude + ' m</span>' +
        '</span>';
    }).join('');

    const maisAlto = P.picos.slice().sort(function (a, b) { return b.altitude - a.altitude; })[0];
    const rotulo = 'Perfil de altitude do dia ' + dia.numero + ', ' + Math.round(S.kmTotal) + ' km' +
      (maisAlto ? '. Ponto mais alto: ' + maisAlto.nome + ', ' + maisAlto.altitude + ' m' : '');

    return '<div class="etapa-perfil" data-perfil="' + dia.numero + '">' +
      '<div class="etapa-perfil__area">' +
        '<svg viewBox="0 0 ' + PW + ' ' + PH + '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + UI.h(rotulo) + '">' +
          grelha +
          (certo ? '<path class="estrada__traco" d="' + certo + '"/>' : '') +
          (provavel ? '<path class="estrada__traco estrada__traco--provavel" d="' + provavel + '"/>' : '') +
        '</svg>' +
        picos +
        '<span class="perfil-cursor" hidden></span>' +
      '</div>' +
      '<div class="etapa-perfil__eixo">' + eixo + '</div>' +
      '<div class="etapa-perfil__km num"><span>0 km</span><span class="perfil-leitura" aria-live="polite"></span><span>' + Math.round(S.kmTotal) + ' km</span></div>' +
    '</div>';
  }

  function retrato(P, dia) {
    const E = caixaDe(P);
    const temPerfil = P.picos.length > 0;
    return '<div class="etapa-retrato">' +
      planta(E, P, dia) +
      (temPerfil ? perfil(P, dia) : '') +
    '</div>' +
    (P.provavelDesde != null
      ? '<p class="meta faixa" style="margin-top:var(--esp-1)">A tracejado, a parte do percurso que ainda está por confirmar com a organização.</p>'
      : '');
  }

  /* Tocar ou arrastar sobre o perfil lê o quilómetro e a altitude. */
  function ligarPerfil(el) {
    const n = Number(el.getAttribute('data-perfil'));
    const P = PERCURSOS.DIAS[n];
    if (!P) return;
    const area = el.querySelector('.etapa-perfil__area');
    const cursor = el.querySelector('.perfil-cursor');
    const leitura = el.querySelector('.perfil-leitura');
    const S = escalaPerfil(P);

    function ler(ev) {
      const r = area.getBoundingClientRect();
      const f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const i = Math.round(f * (P.perfil.length - 1));
      const m = P.perfil[i];
      cursor.hidden = false;
      cursor.style.left = (f * 100).toFixed(2) + '%';
      cursor.style.top = (S.y(m) / PH * 100).toFixed(2) + '%';
      leitura.textContent = 'km ' + Math.round(i * P.passo) + ' · ' + m + ' m';
    }
    function largar() { cursor.hidden = true; leitura.textContent = ''; }

    area.addEventListener('pointerdown', ler);
    area.addEventListener('pointermove', ler);
    area.addEventListener('pointerleave', largar);
    area.addEventListener('pointercancel', largar);
  }

  /* ---------------------------------------------------------
     A sequência de um dia
     --------------------------------------------------------- */

  /* As paragens pela ordem do programa, sem repetir a mesma duas
     vezes seguidas — o hotel de onde se sai e para onde se volta. */
  function ordemDoDia(d) {
    const base = d.momentos.length
      ? d.momentos.map(function (m) { return m.poi; })
      : d.etapas;
    const fora = [];
    base.forEach(function (id) {
      if (!id || !POIS[id]) return;
      if (fora[fora.length - 1] === id) return;
      fora.push(id);
    });
    return fora;
  }

  function resumoDe(e) {
    const x = e.dados || {};
    return [
      x.comprimento,
      x.curvas ? x.curvas + ' curvas' : '',
      x.tuneis ? x.tuneis + ' túneis' : '',
      x.inclinacao
    ].filter(Boolean).join(' · ');
  }

  function entradaEstrada(e) {
    if (!ESTRADAS.desenhavel(e)) {
      return UI.linhaLista({
        titulo: e.nome,
        nota: [e.subtitulo, 'traçado por confirmar'].filter(Boolean).join(' · '),
        icone: 'bussola',
        href: '#/estrada/' + e.id
      });
    }
    const resumo = resumoDe(e);
    return '<a class="estrada-cartao" href="#/estrada/' + e.id + '">' +
      ESTRADAS.svg(e, 'estrada--lista') +
      '<span class="estrada-cartao__corpo">' +
        '<span class="cartao-dia__titulo">' + UI.h(e.nome) + '</span>' +
        (e.subtitulo ? '<span class="cartao-dia__resumo">' + UI.h(e.subtitulo) + '</span>' : '') +
        (resumo ? '<span class="cartao-dia__meta num">' + UI.h(resumo) + '</span>' : '') +
      '</span>' +
    '</a>';
  }

  function entradaParagem(id) {
    const p = POIS[id];
    return UI.linhaLista({ titulo: p.nome, nota: p.local, icone: 'pin', href: '#/poi/' + id });
  }

  /* Um dia: o desenho do percurso, e por baixo as paragens pela
     ordem do programa com as estradas no sítio onde se fazem. */
  function seccaoDia(d) {
    const E = enquadrar(d);
    const linhas = [];

    ordemDoDia(d).forEach(function (id) {
      const estrada = ESTRADAS.paraParagem(d.numero, id);
      /* Quando a paragem é a própria estrada, uma entrada chega. */
      if (estrada && POIS[id].tipo === 'estrada') { linhas.push(entradaEstrada(estrada)); return; }
      if (estrada) linhas.push(entradaEstrada(estrada));
      linhas.push(entradaParagem(id));
    });

    /* As que não conduzem a paragem nenhuma ficam no fim do dia. */
    ESTRADAS.soltas(d.numero).forEach(function (e) { linhas.push(entradaEstrada(e)); });

    const P = PERCURSOS.para(d);

    return '<div class="faixa" style="margin-top:32px">' +
        '<div class="seccao-cabecalho">' +
          '<h2 class="titulo-editorial">' + UI.h(d.titulo || 'Dia ' + d.numero) + '</h2>' +
          (d.distancia ? '<span class="meta num">' + d.distancia + ' km</span>' : '') +
        '</div>' +
        '<p class="meta">Dia ' + d.numero + (d.data ? ' · ' + UI.dataLonga(d.data) : '') + '</p>' +
      '</div>' +

      (P ? retrato(P, d)
        : d.etapas.length > 1
          ? '<div class="mapa-moldura">' + svgMapa(E, d) + sobreposicao(E, d) + '</div>'
          : '') +

      '<div class="faixa" style="margin-top:16px">' +
        '<div class="lista">' + linhas.join('') + '</div>' +
        '<a class="botao botao--texto" style="width:100%" href="#/roadbook/' + d.id + '">Abrir o roadbook deste dia &rsaquo;</a>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     O separador
     --------------------------------------------------------- */

  /* A abertura do separador diz o passeio em números: quilómetros,
     dias ao volante e o ponto mais alto. Lidos do itinerário, para
     não mentirem quando a organização o mudar. */
  const EXTENSO = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete'];

  function aoVolante() {
    return DADOS.dias.filter(function (d) { return d.distancia > 0; });
  }

  function pontoMaisAlto() {
    let alto = null;
    aoVolante().forEach(function (d) {
      const P = PERCURSOS.para(d);
      (P ? P.picos : []).forEach(function (p) { if (!alto || p.altitude > alto.altitude) alto = p; });
    });
    return alto;
  }

  function doAlto(alto) {
    return alto.altitude + '\u00A0m ' + (/^Cima\b/.test(alto.nome) ? 'da ' : 'do ') + alto.nome;
  }

  /* O subtítulo da capa: uma linha, como a dos outros separadores. */
  function subtituloDaCapa() {
    const alto = pontoMaisAlto();
    if (alto) return 'Até aos ' + doAlto(alto) + '.';
    return 'A estrada de cada dia, vista de cima.';
  }

  function resumoDoPasseio() {
    const dias0 = aoVolante();
    const km = dias0.reduce(function (t, d) { return t + d.distancia; }, 0);
    const alto = pontoMaisAlto();
    if (!dias0.length) return 'O percurso de cada dia, pela estrada real.';
    const n = dias0.length;
    const dias = (EXTENSO[n] || n) + (n === 1 ? ' dia' : ' dias');
    return km + '\u00A0km em ' + dias + ' ao volante' +
      (alto ? ', até aos ' + doAlto(alto) : '') + '. ' +
      'Cada dia tem a estrada vista de cima e, por baixo, as subidas e as altitudes.';
  }

  Vistas.etapas = {
    nav: 'etapas',
    semCabecalho: true,
    montar: function (el) {
      Array.prototype.forEach.call(el.querySelectorAll('[data-perfil]'), ligarPerfil);
    },
    html: function () {
      /* A capa é a ilustração do San Boldo: os tornantes e os túneis
         da Strada dei 100 Giorni, em relevo de papel. */
      const capa = '<div class="capa capa--ilustracao">' +
          UI.foto({ foto: 'assets/fotos/san-boldo-ilustracao.jpg' }, 'capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">Etapas</h1>' +
            '<p class="subtitulo" style="margin-top:8px">' + UI.h(subtituloDaCapa()) + '</p>' +
          '</div>' +
        '</div>';

      if (!DADOS.dias.length) {
        return capa + '<div class="faixa" style="margin-top:24px"><div class="selado">' +
          '<div class="selado__icone">' + Icone('bussola', 24) + '</div>' +
          '<p class="corpo-editorial">O percurso ainda não está publicado.</p>' +
        '</div></div>';
      }

      return capa +
        '<div class="faixa" style="margin-top:24px">' +
          '<p class="corpo-editorial silencioso">' + UI.h(resumoDoPasseio()) + '</p>' +
        '</div>' +
        DADOS.dias.map(seccaoDia).join('') +
        '<div class="faixa" style="margin-top:32px">' +
          UI.linhaLista({ titulo: 'Lista de participantes', nota: DADOS.carros.length + ' carros', icone: 'pessoas', href: '#/participantes' }) +
        '</div>';
    }
  };

  /* ---------------------------------------------------------
     Uma estrada, em ecrã próprio
     O traço em grande, os números e a nota. Mais nada.
     --------------------------------------------------------- */

  function linhaDado(rotulo, valor) {
    if (!valor) return '';
    return '<div class="estrada-dado">' +
      '<span class="estrada-dado__rot">' + UI.h(rotulo) + '</span>' +
      '<span class="estrada-dado__val num">' + UI.h(valor) + '</span>' +
    '</div>';
  }

  Vistas.estrada = {
    nav: 'etapas',
    cabecalho: function (p) {
      const e = ESTRADAS.por(p.id);
      return {
        voltar: '#/etapas',
        titulo: e ? e.nome : 'Estrada',
        linha: false
      };
    },
    html: function (p) {
      const e = ESTRADAS.por(p.id);
      if (!e) {
        return '<div class="faixa" style="padding-top:24px">' +
          '<p class="corpo-editorial">Estrada não encontrada.</p>' +
          '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/etapas">Voltar às etapas</a>' +
        '</div>';
      }

      const x = e.dados || {};
      const n = e.dias.slice();
      const dias = n.length > 1
        ? 'nos dias ' + n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1]
        : 'no dia ' + n[0];

      return (ESTRADAS.desenhavel(e)
        ? '<div class="faixa" style="padding-top:16px">' + ESTRADAS.svg(e, 'estrada--grande') + '</div>'
        : '') +

        '<div class="faixa" style="margin-top:24px">' +
          '<h1 class="titulo-poi">' + UI.h(e.nome) + '</h1>' +
          (e.subtitulo ? '<p class="subtitulo" style="margin-top:6px">' + UI.h(e.subtitulo) + '</p>' : '') +
          '<p class="meta" style="margin-top:12px">Percorre-se ' + UI.h(dias) + '.</p>' +
        '</div>' +

        (Object.keys(x).length
          ? '<div class="faixa"><div class="estrada-dados">' +
              linhaDado('Comprimento', x.comprimento) +
              linhaDado('Desnível', x.desnivel) +
              linhaDado('Inclinação', x.inclinacao) +
              linhaDado('Curvas', x.curvas ? String(x.curvas) : '') +
              linhaDado('Túneis', x.tuneis ? String(x.tuneis) : '') +
            '</div></div>'
          : '') +

        (e.nota ? '<div class="faixa"><p class="corpo-editorial">' + UI.h(e.nota) + '</p></div>' : '') +

        (ESTRADAS.desenhavel(e)
          ? ''
          : '<div class="faixa"><p class="meta">O traçado desta estrada ainda não está confirmado.</p></div>');
    }
  };

  Vistas.participantes = {
  nav: 'etapas',
  cabecalho: { voltar: '#/etapas', titulo: 'Participantes', tituloSempre: true },
  html: function () {
    const capa = '<div class="capa">' +
      UI.foto({ semente: 'participantes', variante: 'paisagem' }, 'foto--32 capa__imagem') +
      '<div class="capa__texto"><h1 class="titulo-editorial">Participantes</h1>';

    if (!DADOS.carros.length) {
      return capa +
        '<p class="corpo-editorial silencioso" style="margin-top:8px">A lista ainda não está fechada.</p>' +
      '</div></div>';
    }
    return capa +
      '<p class="corpo-editorial silencioso" style="margin-top:8px">' +
        UI.plural(DADOS.carros.length, 'carro', 'carros') + ', ' +
        UI.plural(DADOS.participantes.length, 'lugar', 'lugares') + '.</p>' +
      '</div></div>' +
      '<div class="faixa" style="margin-top:24px">' + DADOS.carros.map(function (c) {
        return '<div class="presenca-linha">' +
          '<div class="presenca-linha__carro">' + Silhuetas.svg(c.modelo, { rodas: false }) + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="titulo-ui">' + UI.h(c.perfis.join(' e ')) + '</div>' +
            '<div class="meta">' + UI.h(Silhuetas.modelo(c.modelo).nome) + '</div>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>' +
    '</div>';
  }
};
})();
