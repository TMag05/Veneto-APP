/* =========================================================
   POI — uma página com história, não um pin
   A história desbloqueia à chegada. Cria o ritual de abrir a
   app em cada paragem, que é onde está o conteúdo.
   ========================================================= */

(function () {

  function quemEstaAqui(poiId) {
    return UI.carrosEm(poiId);
  }

  function horaChegada(poiId) {
    const t = Estado.get().chegadas[poiId];
    if (!t) return '';
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* A página de um sítio. Aberta a partir de um bloco do Hoje, leva
     por cima o momento que lá acontece (extra.momento) e, no fim, o
     que vem a seguir (extra.seguinte). */
  function paginaPoi(id, extra) {
    const p = { id: id };
    const poi = POIS[p.id];
    if (!poi) return '<div class="faixa"><p class="corpo-editorial">Ponto de interesse não encontrado.</p></div>';
    const x = extra || {};

    const chegou = Estado.chegou(p.id);
    const aqui = quemEstaAqui(p.id);
    const fotos = Estado.fotos().filter(function (f) { return f.poi === p.id; }).slice(0, 6);

    let historia;
    if (chegou) {
      historia = '<div class="faixa revelado">' +
        poi.historia.map(function (t) { return '<p class="corpo-editorial">' + UI.h(t) + '</p>'; }).join('') +
      '</div>';
    } else if (poi.historia.length) {
      /* Uma promessa, não uma barreira: a fotografia do sítio por
         baixo, a primeira linha entrevista, e o convite. */
      const primeiro = poi.historia[0];
      historia = '<div class="faixa">' +
        '<div class="promessa" style="background-image:' + UI.imagemDe(poi.imagem, 1.4) + '">' +
          '<div class="promessa__veu"></div>' +
          '<div class="promessa__corpo">' +
            '<p class="promessa__excerto">' + UI.h(primeiro.slice(0, 74).replace(/\s\S*$/, '')) + '…</p>' +
            '<p class="promessa__linha">A história deste sítio abre-se quando lá chegar.</p>' +
          '</div>' +
        '</div>' +
        '<button class="botao botao--principal botao--largo" style="margin-top:16px" type="button" data-acao="chegar" data-valor="' + p.id + '">Marcar chegada</button>' +
      '</div>';
    } else {
      historia = '<div class="faixa">' +
        '<button class="botao botao--principal botao--largo" type="button" data-acao="chegar" data-valor="' + p.id + '">Marcar chegada</button>' +
      '</div>';
    }

    return '' +
      UI.foto(poi.imagem, 'foto--32 foto--sangrada') +

      '<div class="poi-cabecalho">' +
        '<h1 class="titulo-poi">' + UI.h(poi.nome) + '</h1>' +
        '<p class="subtitulo" style="margin-top:6px">' + UI.h(poi.subtitulo) + '</p>' +
        '<div class="poi-meta">' +
          '<span class="meta">' + UI.h(poi.local) + '</span>' +
          (poi.altitude && String(poi.local).indexOf(String(poi.altitude)) < 0
            ? '<span class="meta num">' + poi.altitude + ' m</span>' : '') +
          (chegou ? '<span class="meta num">chegada às ' + horaChegada(p.id) + '</span>' : '') +
        '</div>' +
      '</div>' +

      (x.momento || '') +

      historia +

      (poi.nota ? '<div class="faixa"><div class="cartao">' +
        '<p class="etiqueta">Nota prática</p>' +
        '<p class="corpo-ui" style="margin-top:8px">' + UI.h(poi.nota) + '</p>' +
      '</div></div>' : '') +

      (aqui.length ? '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">Já aqui</h2>' +
          '<span class="meta num">' + aqui.length + '</span></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
          aqui.slice(0, 12).map(function (c) {
            return '<div style="width:64px">' + Silhuetas.svg(c.modelo, c.cor) + '</div>';
          }).join('') +
        '</div>' +
      '</div>' : '') +

      (fotos.length ? '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">Fotografias daqui</h2></div>' +
        '<div class="grelha-fotos">' + fotos.map(function (f) {
          return '<div class="grelha-fotos__celula" style="background-image:' +
            (f.dataUrl ? "url('" + f.dataUrl + "')" : Imagens.fundo(f.semente, f.variante, 1)) +
            ';background-size:cover;background-position:center"></div>';
        }).join('') + '</div>' +
      '</div>' : '') +

      (x.seguinte || '') +

      '<div class="barra-inferior">' +
        '<a class="botao botao--secundario" href="' + UI.linkLocal(p.id) + '" target="_blank" rel="noopener">' +
          Icone('externo', 20) + 'Abrir no Google Maps</a>' +
      '</div>';
  }

  const acoes = {
    chegar: function (poiId) {
      Estado.marcarChegada(poiId);
    }
  };

  Vistas.poi = {
    nav: 'roadbook',
    cabecalho: function (p) {
      const poi = POIS[p.id];
      return {
        voltar: '#/roadbook',
        titulo: poi ? poi.nome : 'Ponto de interesse',
        linha: false,
        acao: { acao: 'partilhar', icone: 'partilhar', rotulo: 'Partilhar' }
      };
    },
    html: function (p) { return paginaPoi(p.id); },
    acoes: acoes
  };

  /* ---------------------------------------------------------
     Um momento do dia — o destino de cada bloco do Hoje
     Só esse momento e o sítio onde acontece. Com paragem, é a
     página dela com o momento por cima; sem paragem (a partida,
     o jantar livre), é o momento sozinho.
     --------------------------------------------------------- */

  Vistas.momento = {
    nav: 'hoje',
    cabecalho: function (p) {
      const x = Programa.momentoEm(p.dia, p.n);
      const poi = x && x.m.poi ? POIS[x.m.poi] : null;
      return {
        voltar: '#/hoje',
        titulo: poi ? poi.nome : (x ? x.m.titulo : 'Momento'),
        linha: false,
        acao: { acao: 'partilhar', icone: 'partilhar', rotulo: 'Partilhar' }
      };
    },
    html: function (p) {
      const x = Programa.momentoEm(p.dia, p.n);
      if (!x) return '<div class="faixa"><p class="corpo-editorial">Momento não encontrado.</p></div>';

      if (x.m.poi && POIS[x.m.poi]) {
        return paginaPoi(x.m.poi, {
          momento: '<div class="faixa"><div class="cartao">' +
            Programa.corpoMomento(x.dia, x.m, x.i, undefined, 'h2') +
          '</div></div>',
          seguinte: Programa.seguinteHtml(x.dia, x.i)
        });
      }

      /* Sem paragem: a capa é o próprio momento; por baixo, só o que a
         capa não diz — a alteração e a nota. */
      const m = x.m;
      const detalhe =
        (m.alterado ? '<p class="corpo-ui">' + UI.distintivo('Alterado', 'rosso') + ' Era às ' +
          UI.h(m.alterado.antes.replace(':', 'h')) + '. ' + UI.h(m.alterado.razao) + '.</p>' : '') +
        (m.nota ? '<p class="corpo-editorial"' + (m.alterado ? ' style="margin-top:12px"' : '') + '>' + UI.h(m.nota) + '</p>' : '');
      return '<div class="capa">' +
          UI.foto(Programa.imagemDoMomento(x.dia, x.i), 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<p class="capa__data num">' + UI.h(UI.horario(m)) + '</p>' +
            '<h1 class="capa-titulo">' + UI.h(m.titulo) + '</h1>' +
            (m.local ? '<p class="subtitulo" style="margin-top:8px">' + UI.h(m.local) + '</p>' : '') +
          '</div>' +
        '</div>' +
        (detalhe ? '<div class="faixa" style="margin-top:24px">' + detalhe + '</div>' : '') +
        '<div style="margin-top:24px">' + Programa.seguinteHtml(x.dia, x.i) + '</div>';
    },
    acoes: acoes
  };
})();
