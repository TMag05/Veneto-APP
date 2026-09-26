/* =========================================================
   Estradas — o retrato do que se conduz
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

    return '<div class="faixa" style="margin-top:32px">' +
        '<div class="seccao-cabecalho">' +
          '<h2 class="titulo-editorial">' + UI.h(d.titulo || 'Dia ' + d.numero) + '</h2>' +
          (d.distancia ? '<span class="meta num">' + d.distancia + ' km</span>' : '') +
        '</div>' +
        '<p class="meta">Dia ' + d.numero + (d.data ? ' · ' + UI.dataLonga(d.data) : '') + '</p>' +
      '</div>' +

      (d.etapas.length > 1
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

  Vistas.estradas = {
    nav: 'estradas',
    semCabecalho: true,
    html: function () {
      const principal = ESTRADAS.por('san-boldo');
      const capa = '<div class="capa capa--estrada">' +
          ESTRADAS.svg(principal, 'estrada--capa') +
          '<div class="capa__texto">' +
            '<p class="capa__data">' + UI.h(principal.subtitulo) + '</p>' +
            '<h1 class="capa-titulo">Etapas</h1>' +
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
          '<p class="corpo-editorial silencioso">O desenho do que se conduz, dia a dia. ' +
            'Cada traço segue a estrada real.</p>' +
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
    nav: 'estradas',
    cabecalho: function (p) {
      const e = ESTRADAS.por(p.id);
      return {
        voltar: '#/estradas',
        titulo: e ? e.nome : 'Estrada',
        linha: false,
        acao: { acao: 'partilhar', icone: 'partilhar', rotulo: 'Partilhar' }
      };
    },
    html: function (p) {
      const e = ESTRADAS.por(p.id);
      if (!e) {
        return '<div class="faixa" style="padding-top:24px">' +
          '<p class="corpo-editorial">Estrada não encontrada.</p>' +
          '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/estradas">Voltar às etapas</a>' +
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
  nav: 'estradas',
  cabecalho: { voltar: '#/estradas', titulo: 'Participantes', tituloSempre: true },
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
