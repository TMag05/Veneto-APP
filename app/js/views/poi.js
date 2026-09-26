/* =========================================================
   POI — uma página com história, não um pin
   A história abre à hora a que o programa chega ao sítio. O grupo
   anda em caravana: a hora do itinerário sabe onde toda a gente
   está, e o ritual de abrir a app em cada paragem mantém-se sem
   ninguém ter de carregar em nada.
   ========================================================= */

(function () {

  /* O que fazer depois de parar ali. Vive no alto da página porque é
     o momento em que o convidado abre mesmo o telemóvel. O que a
     organização não preencheu não desenha nada — nem rótulo, nem
     espaço reservado. */
  function aChegada(poi) {
    const c = poi.chegada || {};
    const linhas = [
      ['Estacionamento', c.estacionamento, false],
      ['Quem recebe', c.recebe, false],
      ['Casas de banho', c.wc, false],
      ['Voltar aos carros', c.regresso ? c.regresso.replace(':', 'h') : '', true]
    ].filter(function (l) { return !!l[1]; });

    if (!linhas.length && !c.nota) return '';

    return '<div class="faixa"><div class="cartao">' +
      '<p class="etiqueta">À chegada</p>' +
      (linhas.length ? '<div class="chegada-lista">' + linhas.map(function (l) {
        return '<div class="chegada-linha">' +
          '<span class="chegada-linha__rot">' + UI.h(l[0]) + '</span>' +
          '<span class="chegada-linha__val' + (l[2] ? ' num' : '') + '">' + UI.h(l[1]) + '</span>' +
        '</div>';
      }).join('') + '</div>' : '') +
      (c.nota ? '<p class="corpo-ui' + (linhas.length ? ' silencioso" style="margin-top:16px"' : '"') + '>' + UI.h(c.nota) + '</p>' : '') +
    '</div></div>';
  }

  /* A página de um sítio. Aberta a partir de um bloco do Hoje, leva
     por cima o momento que lá acontece (extra.momento) e, no fim, o
     que vem a seguir (extra.seguinte). */
  function paginaPoi(id, extra) {
    const p = { id: id };
    const poi = POIS[p.id];
    if (!poi) return '<div class="faixa"><p class="corpo-editorial">Ponto de interesse não encontrado.</p></div>';
    const x = extra || {};

    /* A história abre à hora a que o programa lá chega. */
    const aberto = Programa.abertoAgora(p.id);

    let historia;
    if (aberto) {
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
            '<p class="promessa__linha">A história deste sítio abre-se quando lá chegarmos.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else {
      historia = '';
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
        '</div>' +
      '</div>' +

      (x.momento || '') +

      aChegada(poi) +

      historia +

      (poi.nota ? '<div class="faixa"><div class="cartao">' +
        '<p class="etiqueta">Nota prática</p>' +
        '<p class="corpo-ui" style="margin-top:8px">' + UI.h(poi.nota) + '</p>' +
      '</div></div>' : '') +

      (x.seguinte || '') +

      /* Rede de segurança para quem se separe da caravana, não o CTA
         do ecrã — por isso vive no fim, em linha, e não numa barra
         permanente por cima do texto. */
      '<div class="faixa" style="margin-top:32px">' +
        '<a class="botao botao--texto" href="' + UI.linkLocal(p.id) + '" target="_blank" rel="noopener">' +
          Icone('externo', 20) + 'Abrir no Google Maps</a>' +
      '</div>' +

      (x.editar || editar('#/org/paragem/' + p.id, 'Editar esta paragem'));
  }

  /* Para a organização, a caminho de uma alteração de última hora:
     do que o convidado vê direto ao sítio onde se muda. */
  function editar(href, rotulo, icone) {
    if (!Estado.ehOrganizacao()) return '';
    return '<div class="faixa">' +
      '<a class="botao botao--texto" href="' + href + '">' + Icone(icone || 'pin', 20) + rotulo + '</a>' +
    '</div>';
  }

  Vistas.poi = {
    nav: 'roadbook',
    cabecalho: function (p) {
      const poi = POIS[p.id];
      return {
        voltar: '#/roadbook',
        titulo: poi ? poi.nome : 'Ponto de interesse',
        linha: false
      };
    },
    html: function (p) { return paginaPoi(p.id); }
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
        linha: false
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
          seguinte: Programa.seguinteHtml(x.dia, x.i),
          editar: editar('#/org/etapa/' + x.dia.id + '/' + x.i, 'Editar a hora e o local', 'relogio') +
            editar('#/org/paragem/' + x.m.poi, 'Editar esta paragem')
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
        '<div style="margin-top:24px">' + Programa.seguinteHtml(x.dia, x.i) + '</div>' +
        editar('#/org/etapa/' + x.dia.id + '/' + x.i, 'Editar a hora e o local', 'relogio');
    }
  };
})();
