/* =========================================================
   Concierge, contactos e SOS
   Um campo de texto livre. Sem menus, sem categorias.
   ========================================================= */

(function () {

  function hora(t) {
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  Vistas.concierge = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Concierge' },
    html: function () {
      const pedidos = Estado.get().pedidos.slice().reverse();

      const c = DADOS.concierge;

      return '<div class="faixa" style="padding-top:24px">' +
          (c.nome
            ? '<div class="pessoa">' +
                '<span class="pessoa__foto"' + (c.foto ? ' style="background-image:url(\'' + c.foto + '\')"' : '') + '>' +
                  (c.foto ? '' : Icone('pessoas', 24)) + '</span>' +
                '<span class="pessoa__texto">' +
                  '<span class="pessoa__nome">' + UI.h(c.nome) + '</span>' +
                  '<span class="meta">' + UI.h(c.papel || 'Concierge do passeio') + '</span>' +
                '</span>' +
              '</div>' +
              (c.promessa ? '<p class="promessa-tempo">' + UI.h(c.promessa) + '</p>' : '')
            : '<h1 class="capa-titulo">Concierge</h1>' +
              '<p class="subtitulo" style="margin-top:8px">Escreva o que precisa. A equipa responde.</p>') +
        '</div>' +

        '<div class="faixa" style="margin-top:32px">' +
          '<form id="form-pedido">' +
            '<label class="campo">' +
              '<span class="campo__rotulo">Pedido</span>' +
              '<textarea class="campo__area" name="texto" placeholder="' + UI.h('Uma mesa para dois esta noite' + (DADOS.evento.base ? ' em ' + DADOS.evento.base : '') + ', por volta das 21h00.') + '"></textarea>' +
            '</label>' +
            '<button class="botao botao--principal botao--largo" style="margin-top:16px" type="submit">Enviar</button>' +
          '</form>' +
        '</div>' +

        (pedidos.length ? '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Pedidos</h2></div>' +
          pedidos.map(function (p) {
            return '<div style="padding:16px 0;border-bottom:1px solid var(--pietra)">' +
              '<div class="par par--espalhado">' +
                '<span class="meta num">' + hora(p.criado) + '</span>' +
                UI.distintivo(p.estado === 'respondido' ? 'Respondido' : 'Entregue', p.estado === 'respondido' ? 'verde' : null) +
              '</div>' +
              '<p class="corpo-editorial" style="margin-top:8px">' + UI.h(p.texto) + '</p>' +
              (p.resposta ? '<p class="corpo-ui silencioso" style="margin-top:8px">' + UI.h(p.resposta) + '</p>' : '') +
            '</div>';
          }).join('') +
        '</div>' : '') +

        '<div class="faixa">' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Contactos', nota: 'Organização, assistência, hotel', icone: 'telefone', href: '#/contactos' }) +
            UI.linhaLista({ titulo: 'Assistência imediata', nota: 'Avaria, acidente, urgência', icone: 'alerta', href: '#/sos' }) +
          '</div>' +
        '</div>';
    },
    montar: function (el) {
      const f = el.querySelector('#form-pedido');
      if (!f) return;
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        const t = f.texto.value.trim();
        if (!t) return;
        Estado.pedir(t);
        f.texto.value = '';
      });
    }
  };

  Vistas.contactos = {
    nav: 'mais',
    cabecalho: { voltar: '#/concierge', titulo: 'Contactos', tituloSempre: true },
    html: function () {
      const locais = DADOS.locais;

      return '<div class="faixa" style="padding-top:24px">' +
          '<h1 class="titulo-editorial">Contactos</h1>' +
          (DADOS.contactos.length
            ? '<div class="lista" style="margin-top:24px">' +
              DADOS.contactos.map(function (c) {
                return UI.linhaLista({
                  titulo: c.nome,
                  nota: [c.papel, c.telefone].filter(Boolean).join(' · '),
                  icone: c.icone || 'telefone',
                  href: 'tel:' + String(c.telefone || '').replace(/\s/g, '')
                });
              }).join('') + '</div>'
            : '<p class="corpo-editorial silencioso" style="margin-top:16px">A lista de contactos ainda não está publicada.</p>') +
        '</div>' +

        (locais.length ? '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Hotéis e restaurantes</h2></div>' +
          locais.map(function (l) {
            return '<div style="padding:16px 0;border-bottom:1px solid var(--pietra)">' +
              '<div class="par par--espalhado">' +
                '<span class="titulo-ui">' + UI.h(l.nome) + '</span>' +
                UI.distintivo(l.tipo === 'restaurante' ? 'Restaurante' : (l.tipo === 'hotel' ? 'Hotel' : 'Local')) +
              '</div>' +
              (l.morada ? '<p class="corpo-ui silencioso" style="margin-top:6px">' + UI.h(l.morada) + '</p>' : '') +
              (l.notas ? '<p class="meta" style="margin-top:4px">' + UI.h(l.notas) + '</p>' : '') +
              '<div style="display:flex;gap:16px;margin-top:8px">' +
                (l.telefone ? '<a class="botao botao--texto" href="tel:' + l.telefone.replace(/\s/g, '') + '">' +
                  Icone('telefone', 20) + ' ' + UI.h(l.telefone) + '</a>' : '') +
                (l.morada ? '<a class="botao botao--texto" href="https://www.google.com/maps/search/?api=1&query=' +
                  encodeURIComponent(l.nome + ' ' + l.morada) + '" target="_blank" rel="noopener">' +
                  Icone('externo', 20) + ' Mapa</a>' : '') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' : '') +

        '<div class="faixa">' +
          '<p class="meta">Guardados no telemóvel. Funcionam sem rede de dados.</p>' +
        '</div>';
    }
  };

  let localizacao = null;

  Vistas.sos = {
    nav: null,
    semNav: true,
    semCabecalho: true,
    html: function () {
      /* A assistência é o contacto marcado como oficina; se não
         houver, usa-se o primeiro da lista. */
      const assistencia = DADOS.contactos.find(function (c) { return c.icone === 'oficina'; }) ||
        DADOS.contactos.find(function (c) { return c.telefone && c.telefone !== '112'; }) || null;
      const numero = assistencia ? String(assistencia.telefone || '').replace(/\s/g, '') : '';

      return '<div class="sos">' +
        '<div>' +
          '<button class="botao-icone" type="button" data-acao="voltar" data-valor="#/mais" aria-label="Voltar" style="margin-left:-10px">' +
            Icone('fechar', 24) + '</button>' +
        '</div>' +

        '<div style="margin:auto 0">' +
          '<h1 class="capa-titulo">Assistência</h1>' +
          '<p class="corpo-editorial" style="margin-top:12px;opacity:0.9">' +
            'A equipa tem um carro-oficina em estrada durante todo o passeio.</p>' +

          '<div class="pilha-2" style="margin-top:32px">' +
            (numero
              ? '<a class="botao botao--claro botao--largo" href="tel:' + numero + '">' +
                  Icone('telefone', 20) + 'Ligar a ' + UI.h(assistencia.nome || 'assistência') + '</a>'
              : '') +
            '<button class="botao botao--secundario botao--largo" type="button" data-acao="localizar">' +
              Icone('pin', 20) + (localizacao ? 'Localização enviada' : 'Enviar a minha localização') + '</button>' +
            '<a class="botao botao--secundario botao--largo" href="tel:112">Ligar 112 — emergência médica</a>' +
          '</div>' +

          (localizacao ? '<p class="meta num" style="margin-top:16px;opacity:0.9">' +
            localizacao.lat.toFixed(5) + ', ' + localizacao.lng.toFixed(5) + ' · enviada às ' + hora(localizacao.t) + '</p>' : '') +
        '</div>' +

        '<p class="meta" style="opacity:0.85">O carro-vassoura segue sempre atrás do último do grupo.</p>' +
      '</div>';
    },
    acoes: {
      localizar: function () {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(function (pos) {
          localizacao = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
          Estado.enfileirar('sos', 'Localização enviada à assistência');
          App.repintar();
        }, function () {
          localizacao = { lat: 0, lng: 0, t: Date.now() };
          Estado.enfileirar('sos', 'Pedido de assistência sem localização');
          App.repintar();
        }, { enableHighAccuracy: true, timeout: 8000 });
      }
    }
  };
})();
