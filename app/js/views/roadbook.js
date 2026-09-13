/* =========================================================
   Roadbook — cada dia é um capítulo
   O Hoje diz o que vai acontecer e a que horas, e cada bloco abre
   a página desse momento. O roadbook é o dia inteiro de uma vez,
   para ler antes ou depois: cada momento com a sua secção e
   endereço próprio (#/roadbook/dia/n) — a paragem, a nota, o ritmo
   desde a paragem anterior.

   Há batedores e o grupo segue em caravana: a distância entre
   paragens é ritmo, não instrução. O Google Maps fica no fim,
   como recurso para quem se afastar — sempre um troço de cada
   vez, nunca o dia inteiro, que o Maps trocaria a estrada
   escolhida pela mais rápida.
   ========================================================= */

(function () {

  function cartaoDia(d) {
    const troços = Math.max((d.etapas || []).length - 1, 0);
    const paragens = (d.etapas || []).length;
    return '<a class="cartao-dia" href="#/roadbook/' + d.id + '">' +
      UI.foto(d.imagem, 'cartao-dia__foto') +
      '<span class="cartao-dia__corpo">' +
        '<span class="etiqueta" style="display:block">Dia ' + d.numero +
          (d.data ? ' · ' + UI.dataCurta(d.data) : '') + '</span>' +
        '<span class="cartao-dia__titulo">' + UI.h(d.titulo || 'Etapa ' + d.numero) + '</span>' +
        (d.resumo ? '<span class="cartao-dia__resumo">' + UI.h(d.resumo) + '</span>' : '') +
        '<span class="cartao-dia__meta">' +
          UI.plural(paragens, 'paragem', 'paragens') +
          (troços ? ' · ' + UI.plural(troços, 'troço', 'troços') : '') +
        '</span>' +
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
            '<p class="capa__data">Dia ' + dia.numero + (dia.data ? ' · ' + UI.dataCurta(dia.data) : '') + '</p>' +
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
        '</div></div>' : '') +

        recurso(dia);
    },
    /* Vindo de um bloco do Hoje, o capítulo abre nesse momento. Só à
       chegada: um repintar não deve arrancar o convidado de onde está. */
    montar: function (el, p, chegada) {
      if (!chegada || p.momento === undefined) return;
      const alvo = el.querySelector('#momento-' + p.momento);
      if (alvo) alvo.scrollIntoView({ block: 'start' });
    },
    acoes: {
      gpx: function (diaId) {
        const dia = DADOS.dia(diaId);
        if (!dia) return;
        UI.descarregar('veneto-dia-' + dia.numero + '.gpx', UI.gpx(dia), 'application/gpx+xml');
      }
    }
  };

  /* Distância e tempo entre duas paragens, como dado ambiente. */
  function ritmo(deId, paraId) {
    const t = UI.troco(deId, paraId);
    return '<p class="ritmo num">' + t.km + ' km · ' + UI.duracao(t.min) + '</p>';
  }

  /* A paragem de um momento, em cartão: fotografia, subtítulo, e o
     caminho para a história. */
  function cartaoLocal(id) {
    const p = POIS[id];
    const chegou = Estado.chegou(id);
    const meta = [
      p.local,
      p.altitude && String(p.local).indexOf(String(p.altitude)) < 0 ? p.altitude + ' m' : null,
      chegou ? 'visitado' : null
    ].filter(Boolean).join(' · ');
    const convite = p.historia && p.historia.length
      ? (chegou ? 'Ler a história' : 'A história abre-se à chegada')
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

  /* Um momento, com tudo o que o bloco do Hoje não diz. */
  function capitulo(dia, m, i, est, alvo) {
    const poi = m.poi && POIS[m.poi] ? POIS[m.poi] : null;
    return '<section class="capitulo" id="momento-' + i + '" data-estado="' + est + '"' +
        (alvo ? ' data-alvo="sim"' : '') + '>' +
      Programa.corpoMomento(dia, m, i, est === 'agora' ? 'Agora' : undefined) +
      (poi && poi.tipo !== 'logistica' ? cartaoLocal(m.poi) : '') +
    '</section>';
  }

  /* O que vai acontecer, momento a momento, com o detalhe de cada um.
     Só com paragens, é a ordem das paragens. Entre duas, o ritmo. */
  function sequencia(dia, alvo) {
    if (dia.momentos.length) {
      const eHoje = Estado.chave(Estado.agora()) === dia.data;
      const atual = eHoje ? Programa.indiceAtual(dia) : -1;
      return '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">O dia</h2>' +
          (dia.distancia ? '<span class="meta num">' + dia.distancia + ' km</span>' : '') + '</div>' +
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
        '<div class="seccao-cabecalho"><h2 class="etiqueta">As paragens</h2>' +
          (dia.distancia ? '<span class="meta num">' + dia.distancia + ' km</span>' : '') + '</div>' +
        dia.etapas.map(function (id, i) {
          const poi = POIS[id];
          if (!poi) return '';
          const anterior = i > 0 ? dia.etapas[i - 1] : null;
          const visitado = Estado.chegou(id);
          return '<div class="etapa" data-visitado="' + (visitado ? 'sim' : 'nao') + '">' +
              '<div class="etapa__marca"></div>' +
              '<div class="etapa__conteudo">' +
                (anterior && POIS[anterior] ? ritmo(anterior, id) : '') +
                '<a href="#/poi/' + id + '" style="color:inherit;display:block">' +
                  '<h3 class="etapa__titulo">' + UI.h(poi.nome) + '</h3>' +
                  '<div class="etapa__meta">' +
                    '<span class="meta">' + UI.h(poi.local) + '</span>' +
                    (visitado ? '<span class="meta">visitado</span>' : '') +
                  '</div>' +
                '</a>' +
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

  /* Rede de segurança, não a razão de ser do ecrã. Um link por troço,
     para quem se atrasar ou se separar da caravana. */
  function recurso(dia) {
    if (dia.etapas.length < 2) return '';
    const troços = [];
    for (let i = 0; i < dia.etapas.length - 1; i++) {
      const de = POIS[dia.etapas[i]];
      const para = POIS[dia.etapas[i + 1]];
      if (!de || !para) continue;
      const t = UI.troco(dia.etapas[i], dia.etapas[i + 1]);
      troços.push(UI.linhaLista({
        titulo: de.nome + ' → ' + para.nome,
        nota: t.km + ' km · ' + UI.duracao(t.min),
        href: UI.linkMaps(dia.etapas[i], dia.etapas[i + 1]),
        externo: true
      }));
    }
    if (!troços.length) return '';

    return '<div class="faixa">' +
      '<div class="seccao-cabecalho"><h2 class="etiqueta">Se se afastar da caravana</h2></div>' +
      '<p class="corpo-ui silencioso">Os batedores levam o grupo. Estes troços abrem-se um a um no Google Maps, para quem se atrasar ou se separar.</p>' +
      '<div class="lista" style="margin-top:16px">' + troços.join('') + '</div>' +
      '<button class="botao botao--secundario botao--largo" style="margin-top:16px" type="button" data-acao="gpx" data-valor="' + dia.id + '">' +
        Icone('descarregar', 20) + 'Descarregar GPX do dia</button>' +
    '</div>';
  }
})();
