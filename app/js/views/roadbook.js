/* =========================================================
   Roadbook — cada dia é um capítulo
   O Hoje diz o que vai acontecer e a que horas, e cada bloco abre
   a página desse momento. O roadbook é o dia inteiro de uma vez,
   para ler antes ou depois: cada momento com a sua secção e
   endereço próprio (#/roadbook/dia/n) — a paragem e a nota.

   Há batedores e o grupo segue em caravana: a app não traça
   percurso. Cada paragem leva a sua localização, no Google Maps
   ou no Waze. Decisão de 27.09.2026, que tirou a distância entre
   paragens, os links por troço e o GPX.
   ========================================================= */

(function () {

  function cartaoDia(d) {
    const paragens = (d.etapas || []).length;
    return '<a class="cartao-dia" href="#/roadbook/' + d.id + '">' +
      UI.foto(d.imagem, 'cartao-dia__foto') +
      '<span class="cartao-dia__corpo">' +
        '<span class="etiqueta" style="display:block">' +
          UI.h([d.etiqueta, d.data ? UI.dataCurta(d.data) : ''].filter(Boolean).join(' · ')) + '</span>' +
        '<span class="cartao-dia__titulo">' + UI.h(d.titulo || 'Etapa ' + d.numero) + '</span>' +
        (d.resumo ? '<span class="cartao-dia__resumo">' + UI.h(d.resumo) + '</span>' : '') +
        (paragens ? '<span class="cartao-dia__meta">' + UI.plural(paragens, 'paragem', 'paragens') + '</span>' : '') +
      '</span>' +
    '</a>';
  }

  Vistas.roadbook = {
    nav: 'roadbook',
    semCabecalho: true,
    html: function () {
      /* O roadbook abre com uma estrada: a primeira paragem de estrada
         com fotografia; sem nenhuma, a primeira fotografia do passeio;
         sem nenhuma, o desenho. */
      const temFoto = function (i) { return i && (i.foto || i.dataUrl); };
      const estrada = Object.keys(POIS).map(function (id) { return POIS[id]; })
        .find(function (p) { return p.tipo === 'estrada' && temFoto(p.imagem); });
      const foto = estrada ? estrada.imagem
        : DADOS.dias.map(function (d) { return d.imagem; }).find(temFoto);
      const capa = '<div class="capa">' +
          UI.foto(foto || { semente: 'roadbook', variante: 'paisagem' }, 'foto--32 capa__imagem') +
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
        '<div style="display:flex;flex-direction:column;gap:14px;padding:16px">' +
          DADOS.dias.map(cartaoDia).join('') +
        '</div>';
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

      const alojamento = dia.hotel ? DADOS.local(dia.hotel) : null;

      return '<div class="capa">' +
          UI.foto(dia.imagem, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<p class="capa__data">' + UI.h([dia.etiqueta, dia.data ? UI.dataCurta(dia.data) : ''].filter(Boolean).join(' · ')) + '</p>' +
            '<h1 class="capa-titulo">' + UI.h(dia.titulo || 'Etapa ' + dia.numero) + '</h1>' +
            (dia.subtitulo ? '<p class="subtitulo" style="margin-top:8px">' + UI.h(dia.subtitulo) + '</p>' : '') +
          '</div>' +
        '</div>' +

        (dia.resumo ? '<div class="faixa">' +
          '<p class="corpo-editorial">' + UI.h(dia.resumo) + '</p>' +
        '</div>' : '') +

        sequencia(dia, p.momento) +

        (alojamento ? '<div class="faixa"><div class="cartao">' +
          '<p class="etiqueta">Alojamento</p>' +
          '<p class="titulo-ui" style="margin-top:8px">' + UI.h(alojamento.nome) + '</p>' +
          (alojamento.morada ? '<p class="corpo-ui silencioso" style="margin-top:4px">' + UI.h(alojamento.morada) + '</p>' : '') +
          (alojamento.telefone ? '<a class="botao botao--texto" href="tel:' + alojamento.telefone.replace(/\s/g, '') + '">' +
            UI.h(alojamento.telefone) + '</a>' : '') +
        '</div></div>' : '');
    },
    /* Vindo de um bloco do Hoje, o capítulo abre nesse momento. Só à
       chegada: um repintar não deve arrancar o convidado de onde está. */
    montar: function (el, p, chegada) {
      if (!chegada || p.momento === undefined) return;
      const alvo = el.querySelector('#momento-' + p.momento);
      if (alvo) alvo.scrollIntoView({ block: 'start' });
    }
  };

  /* A paragem de um momento, em cartão: fotografia, subtítulo, e o
     caminho para a história. */
  function cartaoLocal(id) {
    const p = POIS[id];
    const aberto = Programa.abertoAgora(id);
    const meta = [
      p.local,
      p.altitude && String(p.local).indexOf(String(p.altitude)) < 0 ? p.altitude + ' m' : null
    ].filter(Boolean).join(' · ');
    const convite = p.historia && p.historia.length
      ? (aberto ? 'Ler a história' : 'A história abre-se lá')
      : 'Ver a paragem';

    return '<a class="cartao-dia capitulo__paragem" href="#/poi/' + id + '">' +
      UI.foto(p.imagem, 'cartao-dia__foto') +
      '<span class="cartao-dia__corpo">' +
        '<span class="cartao-dia__titulo">' + UI.h(p.nome) + '</span>' +
        (p.subtitulo ? '<span class="cartao-dia__resumo">' + UI.h(p.subtitulo) + '</span>' : '') +
        (meta ? '<span class="cartao-dia__meta num">' + UI.h(meta) + '</span>' : '') +
        '<span class="capitulo__convite">' + convite + Icone('seta', 16) + '</span>' +
      '</span>' +
    '</a>';
  }

  /* Um momento, com tudo o que o bloco do Hoje não diz, e onde fica. */
  function capitulo(dia, m, i, est, alvo) {
    const poi = m.poi && POIS[m.poi] ? POIS[m.poi] : null;
    return '<section class="capitulo" id="momento-' + i + '" data-estado="' + est + '"' +
        (alvo ? ' data-alvo="sim"' : '') + '>' +
      Programa.corpoMomento(dia, m, i, est === 'agora' ? 'Agora' : undefined) +
      (poi && poi.tipo !== 'logistica' ? cartaoLocal(m.poi) : '') +
      /* Dois momentos seguidos no mesmo sítio — a chegada ao hotel e
         o jantar lá — levam a localização uma vez só. */
      (poi && Programa.poiAnterior(dia.momentos, i) !== m.poi ? UI.atalhosLocal(m.poi) : '') +
    '</section>';
  }

  /* O que vai acontecer, momento a momento, com o detalhe de cada um.
     Só com paragens, é a ordem das paragens. */
  function sequencia(dia, alvo) {
    if (dia.momentos.length) {
      const eHoje = Estado.chave(Estado.agora()) === dia.data;
      const atual = eHoje ? Programa.indiceAtual(dia) : -1;
      return '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">O dia</h2></div>' +
        dia.momentos.map(function (m, i) {
          let est = 'futuro';
          if (eHoje) {
            if (atual < 0 || i < atual) est = 'passado';
            else if (i === atual) est = UI.horaAgora() >= UI.minutos(m.hora) ? 'agora' : 'futuro';
          }
          return capitulo(dia, m, i, est, String(i) === String(alvo));
        }).join('') +
      '</div>';
    }

    if (dia.etapas.length) {
      return '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">As paragens</h2></div>' +
        dia.etapas.map(function (id) {
          const poi = POIS[id];
          if (!poi) return '';
          return '<div class="etapa">' +
              '<div class="etapa__marca"></div>' +
              '<div class="etapa__conteudo">' +
                '<a href="#/poi/' + id + '" style="color:inherit;display:block">' +
                  '<h3 class="etapa__titulo">' + UI.h(poi.nome) + '</h3>' +
                  '<div class="etapa__meta">' +
                    '<span class="meta">' + UI.h(poi.local) + '</span>' +
                  '</div>' +
                '</a>' +
                UI.atalhosLocal(id) +
              '</div>' +
            '</div>';
        }).join('') +
      '</div>';
    }

    return '<div class="faixa"><div class="selado">' +
      '<div class="selado__icone">' + Icone('pin', 24) + '</div>' +
      '<p class="corpo-editorial">O programa desta etapa ainda não está publicado.</p>' +
    '</div></div>';
  }
})();
