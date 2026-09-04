/* =========================================================
   Roadbook — cada dia é um capítulo
   A navegação é feita troço a troço. Enviar o dia inteiro para
   o Google Maps faria com que este trocasse a estrada curada
   pela autoestrada mais rápida.
   ========================================================= */

(function () {

  function cartaoDia(d) {
    const troços = Math.max((d.etapas || []).length - 1, 0);
    return '<a href="#/roadbook/' + d.id + '" style="display:block;color:inherit">' +
      UI.foto(d.imagem, 'foto--32') +
      '<p class="etiqueta" style="margin-top:12px">Dia ' + d.numero +
        (d.data ? ' · ' + UI.dataCurta(d.data) : '') + '</p>' +
      '<h3 class="titulo-poi" style="margin-top:4px">' + UI.h(d.titulo || 'Etapa ' + d.numero) + '</h3>' +
      (d.resumo ? '<p class="corpo-editorial silencioso" style="margin-top:8px">' + UI.h(d.resumo) + '</p>' : '') +
      (troços ? '<p class="meta num" style="margin-top:8px">' + d.distancia + ' km · ' + UI.h(d.duracao) + ' · ' +
        UI.plural(troços, 'troço', 'troços') + '</p>' : '') +
    '</a>';
  }

  Vistas.roadbook = {
    nav: 'roadbook',
    cabecalho: { titulo: 'Roadbook' },
    html: function () {
      const capa = '<div class="capa">' +
          UI.foto({ semente: 'roadbook', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">Roadbook</h1>';

      if (!DADOS.dias.length) {
        return capa + '</div></div>' +
          '<div class="faixa" style="margin-top:24px"><div class="selado">' +
            '<div class="selado__icone">' + Icone('roadbook', 24) + '</div>' +
            '<p class="corpo-editorial">Os percursos ainda estão a ser preparados.</p>' +
          '</div></div>';
      }

      return capa +
          '<p class="subtitulo" style="margin-top:8px">' +
            UI.plural(DADOS.dias.length, 'capítulo', 'capítulos') + ', ' +
            DADOS.dias.reduce(function (t, d) { return t + (d.distancia || 0); }, 0) + ' quilómetros.</p>' +
        '</div></div>' +
        DADOS.dias.map(function (d) {
          return '<div class="faixa">' + cartaoDia(d) + '</div>';
        }).join('');
    }
  };

  Vistas.roadbookDia = {
    nav: 'roadbook',
    cabecalho: function (p) {
      const d = DADOS.dia(p.id);
      return { voltar: '#/roadbook', titulo: d ? (d.titulo || 'Etapa ' + d.numero) : 'Etapa', linha: false };
    },
    html: function (p) {
      const dia = DADOS.dia(p.id);
      if (!dia) return '<div class="faixa"><p class="corpo-editorial">Dia não encontrado.</p></div>';

      let etapas = '';
      dia.etapas.forEach(function (id, i) {
        const poi = POIS[id];
        if (!poi) return;
        const seguinte = dia.etapas[i + 1];
        const visitado = Estado.chegou(id);

        etapas += '<div class="etapa" data-visitado="' + (visitado ? 'sim' : 'nao') + '">' +
          '<div class="etapa__marca"></div>' +
          '<div class="etapa__conteudo">' +
            '<a href="#/poi/' + id + '" style="color:inherit;display:block">' +
              '<h3 class="etapa__titulo">' + UI.h(poi.nome) + '</h3>' +
              '<div class="etapa__meta">' +
                '<span class="meta">' + UI.h(poi.local) + '</span>' +
                (visitado ? '<span class="meta">visitado</span>' : '') +
              '</div>' +
            '</a>' +
            (seguinte ? troco(id, seguinte) : '') +
          '</div>' +
        '</div>';
      });

      const alojamento = dia.hotel ? DADOS.local(dia.hotel) : null;

      return '<div class="capa">' +
          UI.foto(dia.imagem, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<p class="capa__data">Dia ' + dia.numero + (dia.data ? ' · ' + UI.dataCurta(dia.data) : '') + '</p>' +
            '<h1 class="capa-titulo">' + UI.h(dia.titulo || 'Etapa ' + dia.numero) + '</h1>' +
            (dia.subtitulo ? '<p class="subtitulo" style="margin-top:8px">' + UI.h(dia.subtitulo) + '</p>' : '') +
          '</div>' +
        '</div>' +

        (dia.resumo ? '<div class="faixa">' +
          '<p class="corpo-editorial">' + UI.h(dia.resumo) + '</p>' +
        '</div>' : '') +

        (dia.etapas.length ? '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Percurso</h2>' +
            '<span class="meta num">' + dia.distancia + ' km</span></div>' +
          etapas +
        '</div>' : '<div class="faixa"><div class="selado">' +
            '<div class="selado__icone">' + Icone('pin', 24) + '</div>' +
            '<p class="corpo-editorial">As paragens desta etapa ainda não estão publicadas.</p>' +
          '</div></div>') +

        (alojamento ? '<div class="faixa"><div class="cartao">' +
          '<p class="etiqueta">Alojamento</p>' +
          '<p class="titulo-ui" style="margin-top:8px">' + UI.h(alojamento.nome) + '</p>' +
          (alojamento.morada ? '<p class="corpo-ui silencioso" style="margin-top:4px">' + UI.h(alojamento.morada) + '</p>' : '') +
          (alojamento.telefone ? '<a class="botao botao--texto" href="tel:' + alojamento.telefone.replace(/\s/g, '') + '">' +
            UI.h(alojamento.telefone) + '</a>' : '') +
        '</div></div>' : '') +

        (dia.etapas.length > 1 ? '<div class="faixa">' +
          '<button class="botao botao--secundario botao--largo" type="button" data-acao="gpx" data-valor="' + dia.id + '">' +
            Icone('descarregar', 20) + 'Descarregar GPX do dia</button>' +
          '<p class="meta" style="margin-top:12px">Para quem preferir a navegação do próprio carro. ' +
            'Os troços abrem-se um a um no Google Maps para que a estrada escolhida não seja substituída.</p>' +
        '</div>' : '');
    },
    acoes: {
      gpx: function (diaId) {
        const dia = DADOS.dia(diaId);
        if (!dia) return;
        UI.descarregar('veneto-dia-' + dia.numero + '.gpx', UI.gpx(dia), 'application/gpx+xml');
      }
    }
  };

  function troco(deId, paraId) {
    const t = UI.troco(deId, paraId);
    const para = POIS[paraId];
    return '<a class="troco" href="' + UI.linkMaps(deId, paraId) + '" target="_blank" rel="noopener">' +
      '<span class="troco__texto">' +
        '<span class="troco__titulo">Seguir para ' + UI.h(para.nome) + '</span>' +
        '<span class="meta num" style="display:block">' + t.km + ' km · ' + UI.duracao(t.min) + '</span>' +
      '</span>' +
      '<span class="troco__icone">' + Icone('externo', 20) + '</span>' +
    '</a>';
  }

  window.Troco = troco;
})();
