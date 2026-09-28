/* =========================================================
   Contactos e SOS
   O concierge saiu a 27.09.2026: o serviço não existe. Fica o
   que o convidado pode mesmo usar — os números e a assistência.
   ========================================================= */

(function () {

  function lista(contactos) {
    return '<div class="lista">' + contactos.map(function (c) {
      return UI.linhaLista({
        titulo: c.nome,
        nota: [c.assistencia === 'sim' ? 'Pedidos de assistência' : c.papel, c.telefone].filter(Boolean).join(' · '),
        icone: c.icone || 'telefone',
        href: 'tel:' + String(c.telefone || '').replace(/\s/g, '')
      });
    }).join('') + '</div>';
  }

  Vistas.contactos = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Contactos', tituloSempre: true },
    html: function () {
      const equipa = DADOS.contactos.filter(function (c) { return c.grupo === 'equipa'; });
      const gerais = DADOS.contactos.filter(function (c) { return c.grupo !== 'equipa'; });

      return '<div class="capa">' +
          UI.foto({ semente: 'contactos', variante: 'noite' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="titulo-editorial">Contactos</h1>' +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:24px">' +
          (gerais.length
            ? lista(gerais)
            : (equipa.length ? '' : '<p class="corpo-editorial silencioso" style="margin-top:16px">A lista de contactos ainda não está publicada.</p>')) +
        '</div>' +

        (equipa.length ? '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Equipa Aston Martin</h2></div>' +
          lista(equipa) +
        '</div>' : '') +

        (DADOS.locais.length ? '<div class="faixa">' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Hotéis e restaurantes', nota: 'Telefones e moradas', icone: 'utensilios', href: '#/hoteis' }) +
          '</div>' +
        '</div>' : '') +

        '<div class="faixa">' +
          '<p class="meta">Guardados no telemóvel. Funcionam sem rede de dados.</p>' +
        '</div>';
    }
  };

  /* ---------------------------------------------------------
     Hotéis e restaurantes
     Um ecrã só para eles, fora dos Contactos (28.09.2026): o
     telefone da receção e a morada, que é o que se procura à
     chegada ou à noite, longe do grupo.
     --------------------------------------------------------- */

  function cartaoLocal(l) {
    return '<div style="padding:16px 0;border-bottom:1px solid var(--pietra)">' +
      '<span class="titulo-ui">' + UI.h(l.nome) + '</span>' +
      (l.notas ? '<p class="meta" style="margin-top:4px">' + UI.h(l.notas) + '</p>' : '') +
      (l.morada ? '<p class="corpo-ui silencioso" style="margin-top:6px">' + UI.h(l.morada) + '</p>' : '') +
      '<div style="display:flex;flex-wrap:wrap;gap:0 16px;margin-top:8px">' +
        (l.telefone ? '<a class="botao botao--texto" href="tel:' + l.telefone.replace(/\s/g, '') + '">' +
          Icone('telefone', 20) + ' <span class="num">' + UI.h(l.telefone) + '</span></a>' : '') +
        (l.morada ? '<a class="botao botao--texto" href="https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(l.nome + ' ' + l.morada) + '" target="_blank" rel="noopener">' +
          Icone('externo', 20) + ' Mapa</a>' : '') +
      '</div>' +
    '</div>';
  }

  Vistas.hoteis = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Hotéis e restaurantes', tituloSempre: true },
    html: function () {
      const grupos = [
        { titulo: 'Hotéis', locais: DADOS.locais.filter(function (l) { return l.tipo === 'hotel'; }) },
        { titulo: 'Restaurantes', locais: DADOS.locais.filter(function (l) { return l.tipo === 'restaurante'; }) },
        { titulo: 'Outros', locais: DADOS.locais.filter(function (l) { return l.tipo !== 'hotel' && l.tipo !== 'restaurante'; }) }
      ].filter(function (g) { return g.locais.length; });

      return '<div class="capa">' +
          UI.foto({ foto: 'assets/fotos/hotel-villa-soligo.jpg' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="titulo-editorial">Hotéis e restaurantes</h1>' +
          '</div>' +
        '</div>' +

        (grupos.length
          ? grupos.map(function (g, i) {
              return '<div class="faixa"' + (i ? '' : ' style="margin-top:24px"') + '>' +
                '<div class="seccao-cabecalho"><h2 class="etiqueta">' + g.titulo + '</h2></div>' +
                g.locais.map(cartaoLocal).join('') +
              '</div>';
            }).join('')
          : '<div class="faixa" style="margin-top:24px"><p class="corpo-editorial silencioso">A lista de hotéis e restaurantes ainda não está publicada.</p></div>') +

        '<div class="faixa">' +
          '<p class="meta">Guardados no telemóvel. Funcionam sem rede de dados.</p>' +
        '</div>';
    }
  };

  /* ---------------------------------------------------------
     Assistência
     Sem servidor, a localização não tem para onde subir — e um
     SOS que diz «enviada» sem ninguém a ter recebido é o pior erro
     que a app pode cometer. Por isso segue pelo WhatsApp da
     assistência, numa mensagem já escrita: é o convidado que carrega
     em enviar, e a entrega é a do WhatsApp. A posição pede-se ao
     abrir o ecrã, para o botão já a levar no primeiro toque. Sem
     dados móveis, a mesma mensagem segue por SMS.
     --------------------------------------------------------- */

  function hora(t) {
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  let posicao = null;      /* { lat, lng, precisao, t } */
  let semPosicao = false;  /* o telemóvel recusou ou não respondeu */
  let vigia = null;

  function contactoAssistencia() {
    /* A assistência é o contacto que a organização marcou para
       receber os pedidos; sem nenhum marcado, o do ícone de oficina. */
    return DADOS.contactos.find(function (c) { return c.assistencia === 'sim' && c.telefone; }) ||
      DADOS.contactos.find(function (c) { return c.icone === 'oficina' && c.telefone; }) || null;
  }

  /* O WhatsApp quer o número internacional só com algarismos. Um
     telemóvel português escrito sem indicativo leva o 351. */
  function numeroWhatsApp(telefone) {
    const t = String(telefone || '').trim();
    let n = t.replace(/\D/g, '');
    if (t.indexOf('+') !== 0 && n.indexOf('00') === 0) n = n.slice(2);
    else if (t.indexOf('+') !== 0 && n.length === 9 && n.charAt(0) === '9') n = '351' + n;
    return n;
  }

  function mensagem() {
    const eu = Estado.eu();
    const carro = Estado.meuCarro();
    const linhas = ['Pedido de assistência — ' + DADOS.evento.nome, eu.nome];
    if (carro) linhas.push(Silhuetas.modelo(carro.modelo).nome + (carro.matricula ? ' · ' + carro.matricula : ''));
    if (posicao) {
      linhas.push('https://www.google.com/maps/search/?api=1&query=' + posicao.lat.toFixed(6) + ',' + posicao.lng.toFixed(6));
      linhas.push('Precisão de ' + Math.round(posicao.precisao) + ' m, às ' + hora(posicao.t) + '.');
    } else {
      linhas.push('Sem localização: o telemóvel não a deu.');
    }
    return linhas.join('\n');
  }

  function linkWhatsApp(numero) {
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem());
  }

  /* «?&body=» é a forma que o iPhone e o Android leem os dois. */
  function linkSMS(telefone) {
    return 'sms:' + String(telefone).replace(/[^\d+]/g, '') + '?&body=' + encodeURIComponent(mensagem());
  }

  function estadoPosicao() {
    if (posicao) return 'A mensagem leva a sua localização, com precisão de ' + Math.round(posicao.precisao) + ' m.';
    if (semPosicao) return 'O telemóvel não deu a localização. A mensagem segue sem ela.';
    return 'A obter a localização…';
  }

  /* Muda só os links e a frase: repintar o ecrã a cada leitura do
     GPS fazia saltar o botão debaixo do dedo. */
  function atualizar(el) {
    const a = contactoAssistencia();
    if (!a) return;
    const wa = el.querySelector('[data-sos="whatsapp"]');
    const sms = el.querySelector('[data-sos="sms"]');
    const frase = el.querySelector('[data-sos="estado"]');
    if (wa) wa.href = linkWhatsApp(numeroWhatsApp(a.telefone));
    if (sms) sms.href = linkSMS(a.telefone);
    if (frase) frase.textContent = estadoPosicao();
  }

  function vigiar(el) {
    if (vigia !== null) return;
    if (!navigator.geolocation) { semPosicao = true; atualizar(el); return; }
    vigia = navigator.geolocation.watchPosition(function (pos) {
      /* Fica a leitura mais precisa, a não ser que a anterior tenha
         mais de um minuto — o carro pode ter andado. */
      if (!posicao || pos.coords.accuracy <= posicao.precisao || Date.now() - posicao.t > 60000) {
        posicao = { lat: pos.coords.latitude, lng: pos.coords.longitude, precisao: pos.coords.accuracy, t: Date.now() };
      }
      semPosicao = false;
      atualizar(document);
    }, function () {
      if (!posicao) semPosicao = true;
      atualizar(document);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }

  Vistas.sos = {
    nav: null,
    semNav: true,
    semCabecalho: true,
    html: function () {
      const assistencia = contactoAssistencia();
      const numero = assistencia ? String(assistencia.telefone || '').replace(/\s/g, '') : '';

      return '<div class="sos">' +
        '<div>' +
          '<button class="botao-icone" type="button" data-acao="voltar" data-valor="#/mais" aria-label="Voltar" style="margin-left:-10px">' +
            Icone('fechar', 24) + '</button>' +
        '</div>' +

        '<div style="margin:auto 0">' +
          '<h1 class="capa-titulo">Assistência</h1>' +
          '<p class="corpo-editorial" style="margin-top:12px;opacity:0.9">' +
            'A equipa tem um carro-oficina na estrada durante todo o passeio.</p>' +

          '<div class="pilha-2" style="margin-top:32px">' +
            (numero
              ? '<a class="botao botao--claro botao--largo" href="tel:' + numero + '">' +
                  Icone('telefone', 20) + 'Ligar a ' + UI.h(assistencia.nome || 'assistência') + '</a>' +
                '<a class="botao botao--secundario botao--largo" data-sos="whatsapp" target="_blank" rel="noopener" href="' +
                  UI.h(linkWhatsApp(numeroWhatsApp(assistencia.telefone))) + '">' +
                  Icone('pin', 20) + 'Enviar a localização por WhatsApp</a>'
              : '') +
            '<a class="botao botao--secundario botao--largo" href="tel:112">Ligar 112 — emergência médica</a>' +
          '</div>' +

          (numero
            ? '<p class="meta" style="margin-top:16px;opacity:0.9" data-sos="estado" aria-live="polite">' + UI.h(estadoPosicao()) + '</p>' +
              '<p class="meta" style="margin-top:4px;opacity:0.9">Sem dados móveis? ' +
                '<a data-sos="sms" href="' + UI.h(linkSMS(assistencia.telefone)) + '" style="text-decoration:underline">Enviar por SMS</a></p>'
            : '') +
        '</div>' +

        '<p class="meta" style="opacity:0.85">O carro-vassoura segue sempre atrás do último do grupo.</p>' +
      '</div>';
    },
    montar: function (el) {
      if (contactoAssistencia()) vigiar(el);
    },
    desmontar: function () {
      if (vigia !== null && navigator.geolocation) navigator.geolocation.clearWatch(vigia);
      vigia = null;
      posicao = null;
      semPosicao = false;
    }
  };
})();
