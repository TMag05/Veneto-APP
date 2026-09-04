/* =========================================================
   Mapa — base monocromática, carros a cores reais
   Sem tracking contínuo: em web app o iOS deixa de reportar
   posição com o ecrã bloqueado. A presença vem dos check-ins.
   O enquadramento é o do dia escolhido, não o da região.
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

  function px(E, poi) { return (poi.lng - E.lngMin) / (E.lngMax - E.lngMin) * (L - 2 * PAD) + PAD; }
  function py(E, poi) { return (E.latMax - poi.lat) / (E.latMax - E.latMin) * (E.A - 2 * PAD) + PAD; }

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
      const visitado = Estado.chegou(id);
      return '<rect x="' + (x - 7).toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" width="14" height="14" ' +
        'fill="' + (visitado ? 'var(--verde)' : 'var(--calce)') + '" stroke="var(--inchiostro)" stroke-width="2"/>';
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

  /* Etiquetas e carros vão por cima, em HTML, para respeitarem
     a escala tipográfica em vez de escalarem com o SVG. */
  function sobreposicao(E, dia) {
    const vistos = {};
    const pontos = [];

    dia.etapas.forEach(function (id) {
      if (vistos[id]) return;
      vistos[id] = true;
      const p = POIS[id];
      if (!p) return;
      pontos.push({ id: id, poi: p, x: px(E, p), y: py(E, p), carros: UI.carrosEm(id) });
    });

    /* As etiquetas empilham-se por linhas até não se tocarem.
       Numa serra, meia dúzia de passos cabem em poucos quilómetros:
       sem isto, os nomes escrevem-se uns por cima dos outros. */
    const LINHA = 19;
    const colocadas = [];
    pontos.sort(function (a, b) { return a.y - b.y || a.x - b.x; });

    /* Os carros sobem a partir do próprio ponto — para fora do sítio
       onde estão, não para dentro. Reserva-se esse espaço antes de
       colocar etiquetas, para a de uma paragem vizinha não lhe cair
       em cima. */
    const CARRO_L = 40 / 335 * L;
    pontos.forEach(function (q) {
      if (!q.carros.length) return;
      const n = q.carros.length;
      const altura = 10 + (n > 1 ? 23 : 14) + (n > 2 ? 15 : 0);
      const linhas = Math.ceil(altura / LINHA);
      for (let k = 1; k <= linhas; k++) {
        colocadas.push({ x0: q.x - CARRO_L / 2, x1: q.x + CARRO_L / 2, y: q.y, linha: -k });
      }
    });

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

      const carros = q.carros;
      if (carros.length) {
        s += '<div class="mapa-carros" style="left:' + esq.toFixed(2) + '%;top:' + topo.toFixed(2) + '%">' +
          carros.slice(0, 2).map(function (c, i) {
            return '<div class="mapa-carro" style="margin-top:' + (i ? -5 : 0) + 'px">' + Silhuetas.svg(c.modelo, c.cor, { rodas: false }) + '</div>';
          }).join('') +
          (carros.length > 2 ? '<span class="meta num mapa-carros__mais">+' + (carros.length - 2) + '</span>' : '') +
        '</div>';
      }
    });

    return s;
  }

  /* Quando vários carros marcam chegada ao mesmo sítio, isso é
     notícia — e uma manchete lê-se antes de qualquer lista. */
  function manchete(dia) {
    let melhor = null;
    const vistos = {};
    dia.etapas.forEach(function (id) {
      if (vistos[id]) return;
      vistos[id] = true;
      const n = UI.carrosEm(id).length;
      if (n >= 2 && (!melhor || n > melhor.n)) melhor = { id: id, n: n };
    });
    if (!melhor) return '';
    const poi = POIS[melhor.id];
    return '<div class="faixa" style="padding-top:24px">' +
      '<a class="manchete" href="#/poi/' + melhor.id + '">' +
        '<span class="manchete__texto">' + UI.plural(melhor.n, 'carro já', 'carros já') + ' ' +
          (poi.tipo === 'estrada' ? 'no' : 'em') + ' ' + UI.h(poi.nome) + '.</span>' +
      '</a>' +
    '</div>';
  }

  function presenca(dia) {
    const grupos = [];
    dia.etapas.forEach(function (id) {
      if (grupos.some(function (g) { return g.id === id; })) return;
      const carros = UI.carrosEm(id);
      if (carros.length) grupos.push({ id: id, carros: carros });
    });
    if (!grupos.length) return '';

    return '<div class="faixa">' +
      '<div class="seccao-cabecalho"><h2 class="etiqueta">Onde está o grupo</h2>' +
        '<span class="meta num">' + DADOS.carros.length + ' carros</span></div>' +
      grupos.reverse().map(function (g) {
        return '<div style="padding:16px 0;border-bottom:1px solid var(--pietra)">' +
          '<div class="par par--espalhado">' +
            '<a class="titulo-ui" href="#/poi/' + g.id + '" style="color:inherit">' + UI.h(POIS[g.id].nome) + '</a>' +
            '<span class="meta num">' + UI.plural(g.carros.length, 'carro', 'carros') + '</span>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">' +
            g.carros.map(function (c) {
              return '<div style="width:56px" title="' + UI.h(c.perfis.join(' e ')) + '">' + Silhuetas.svg(c.modelo, c.cor, { rodas: false }) + '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  let diaVisivel = null;

  Vistas.mapa = {
    nav: 'mapa',
    cabecalho: { titulo: 'Mapa' },
    html: function () {
      const capa = '<div class="capa">' +
          UI.foto({ semente: 'mapa', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto"><h1 class="capa-titulo">Mapa</h1></div>' +
        '</div>';

      const dia = DADOS.dia(diaVisivel) || Estado.diaAtivo();
      if (!dia) {
        return capa + '<div class="faixa" style="margin-top:24px"><div class="selado">' +
          '<div class="selado__icone">' + Icone('mapa', 24) + '</div>' +
          '<p class="corpo-editorial">O percurso ainda não está publicado.</p>' +
        '</div></div>';
      }
      diaVisivel = dia.id;
      const E = enquadrar(dia);

      return capa + manchete(dia) +
        '<div class="faixa" style="padding-top:16px;padding-bottom:16px">' +
          '<div class="escolhas">' + DADOS.dias.map(function (d) {
            return '<button class="escolha" type="button" data-acao="dia" data-valor="' + d.id + '" ' +
              'aria-pressed="' + (d.id === dia.id ? 'true' : 'false') + '">Dia ' + d.numero + '</button>';
          }).join('') + '</div>' +
        '</div>' +

        '<div class="mapa-moldura">' + svgMapa(E, dia) + sobreposicao(E, dia) + '</div>' +

        '<div class="mapa-legenda">' +
          '<span class="mapa-legenda__item"><span style="width:12px;height:12px;background:var(--verde);display:block"></span>' +
            '<span class="meta">visitado</span></span>' +
          '<span class="mapa-legenda__item"><span style="width:12px;height:12px;background:var(--calce);border:1.5px solid var(--inchiostro);display:block"></span>' +
            '<span class="meta">por visitar</span></span>' +
          '<span class="mapa-legenda__item"><span style="width:18px;height:0;border-top:3px solid var(--verde);display:block"></span>' +
            '<span class="meta">percurso</span></span>' +
        '</div>' +

        '<div class="faixa" style="margin-top:32px">' +
          '<h1 class="titulo-poi">' + UI.h(dia.titulo || 'Etapa ' + dia.numero) + '</h1>' +
          (dia.subtitulo ? '<p class="subtitulo" style="margin-top:6px">' + UI.h(dia.subtitulo) + '</p>' : '') +
          (dia.distancia ? '<p class="meta num" style="margin-top:12px">' + dia.distancia + ' km · ' + UI.h(dia.duracao) + '</p>' : '') +
          '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/roadbook/' + dia.id + '">Abrir o roadbook deste dia</a>' +
        '</div>' +

        presenca(dia) +

        '<div class="faixa">' +
          UI.linhaLista({ titulo: 'Lista de participantes', nota: DADOS.carros.length + ' carros', icone: 'pessoas', href: '#/participantes' }) +
        '</div>';
    },
    acoes: {
      dia: function (id) { diaVisivel = id; App.repintar(); }
    }
  };

  Vistas.participantes = {
    nav: 'mapa',
    cabecalho: { voltar: '#/mapa', titulo: 'Participantes', tituloSempre: true },
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
            '<div class="presenca-linha__carro">' + Silhuetas.svg(c.modelo, c.cor, { rodas: false }) + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div class="titulo-ui">' + UI.h(c.perfis.join(' e ')) + '</div>' +
              '<div class="meta">' + UI.h(Silhuetas.modelo(c.modelo).nome) + ' · ' + UI.h(Silhuetas.cor(c.cor).nome) + '</div>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>' +
      '</div>';
    }
  };
})();
