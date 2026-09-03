/* =========================================================
   Utilitários de interface e de navegação
   ========================================================= */

window.Vistas = {};

window.UI = (function () {

  /* ---------------------------------------------------------
     Texto e datas
     --------------------------------------------------------- */

  function h(t) {
    return String(t === undefined || t === null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function dataObj(iso) { return new Date(iso + 'T00:00:00'); }

  function dataLonga(iso) {
    const d = dataObj(iso);
    return DIAS_SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  }

  function dataCurta(iso) {
    const d = dataObj(iso);
    return d.getDate() + ' de ' + MESES[d.getMonth()];
  }

  function intervaloEvento() {
    if (!DADOS.evento.inicio || !DADOS.evento.fim) return 'Datas por definir';
    const a = dataObj(DADOS.evento.inicio);
    const b = dataObj(DADOS.evento.fim);
    if (a.getMonth() === b.getMonth()) {
      return a.getDate() + '–' + b.getDate() + ' de ' + MESES[b.getMonth()] + ' de ' + b.getFullYear();
    }
    return dataCurta(DADOS.evento.inicio) + ' a ' + dataCurta(DADOS.evento.fim) + ' de ' + b.getFullYear();
  }

  function minutos(hhmm) {
    const p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function horaAgora() {
    const d = Estado.agora();
    return d.getHours() * 60 + d.getMinutes();
  }

  function plural(n, um, muitos) {
    return n + ' ' + (n === 1 ? um : muitos);
  }

  /* ---------------------------------------------------------
     Geografia — distâncias aproximadas entre POIs
     Linha reta corrigida por um fator de sinuosidade. As
     distâncias reais devem vir dos ficheiros GPX curados.
     --------------------------------------------------------- */

  function haversine(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  /* Fator por tipo de terreno: a montanha não se faz em linha reta. */
  function troco(deId, paraId) {
    const de = POIS[deId], para = POIS[paraId];
    if (!de || !para) return { km: 0, min: 0 };
    const reta = haversine(de, para);
    const montanha = de.tipo === 'estrada' || para.tipo === 'estrada';
    const fator = montanha ? 2.1 : 1.42;
    const km = Math.max(4, Math.round(reta * fator));
    const velocidade = montanha ? 34 : 52;
    return { km: km, min: Math.round((km / velocidade) * 60) };
  }

  function duracao(min) {
    if (min < 60) return min + ' min';
    const h_ = Math.floor(min / 60), m = min % 60;
    return h_ + ' h' + (m ? ' ' + String(m).padStart(2, '0') : '');
  }

  /* ---------------------------------------------------------
     Navegação por etapas
     Troços curtos para que o Google Maps não substitua a rota
     panorâmica por autoestrada. Âncoras a curar por rota.
     --------------------------------------------------------- */

  const ANCORAS = {
    'asolo>grappa': [[45.8438, 11.8382], [45.8615, 11.8092]],
    'grappa>bassano': [[45.8285, 11.7602]],
    'valdobbiadene>follina': [[45.9295, 12.0645]],
    'asolo>possagno': [[45.8218, 11.8908]],
    'maser>vicenza': [[45.7108, 11.7305]],
    'soave>valpolicella': [[45.4680, 11.0180]]
  };

  function linkMaps(deId, paraId) {
    const de = POIS[deId], para = POIS[paraId];
    if (!de || !para) return '#';
    const ancoras = ANCORAS[deId + '>' + paraId] || [];
    let url = 'https://www.google.com/maps/dir/?api=1' +
      '&origin=' + de.lat + ',' + de.lng +
      '&destination=' + para.lat + ',' + para.lng +
      '&travelmode=driving';
    if (ancoras.length) {
      url += '&waypoints=' + ancoras.map(function (a) { return a[0] + ',' + a[1]; }).join('|');
    }
    return url;
  }

  function linkLocal(poiId) {
    const p = POIS[poiId];
    if (!p) return '#';
    return 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng;
  }

  function gpx(dia) {
    const pontos = dia.etapas.map(function (id) { return Object.assign({ id: id }, POIS[id]); });
    let s = '<?xml version="1.0" encoding="UTF-8"?>\n';
    s += '<gpx version="1.1" creator="' + h(DADOS.evento.nome || 'Passeio') +
      ' — Aston Martin" xmlns="http://www.topografix.com/GPX/1/1">\n';
    s += '  <metadata><name>' + h(dia.titulo) + '</name><time>' + dia.data + 'T06:00:00Z</time></metadata>\n';
    pontos.forEach(function (p) {
      s += '  <wpt lat="' + p.lat + '" lon="' + p.lng + '"><name>' + h(p.nome) + '</name><desc>' + h(p.local) + '</desc></wpt>\n';
    });
    s += '  <rte><name>' + h('Dia ' + dia.numero + ' — ' + dia.titulo) + '</name>\n';
    pontos.forEach(function (p) {
      s += '    <rtept lat="' + p.lat + '" lon="' + p.lng + '"><name>' + h(p.nome) + '</name></rtept>\n';
    });
    s += '  </rte>\n</gpx>\n';
    return s;
  }

  function descarregar(nome, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------------------------------------------------------
     Blocos
     --------------------------------------------------------- */

  function foto(spec, classes, estilo) {
    const fundo = imagemDe(spec);
    return '<div class="foto ' + (classes || 'foto--32') + '" role="img" aria-label="Fotografia" ' +
      'style="background-image:' + fundo + ';' + (estilo || '') + '"></div>';
  }

  /* O fundo de uma imagem: fotografia real se existir, desenho se não. */
  function imagemDe(spec, proporcao) {
    if (spec && spec.dataUrl) return "url('" + spec.dataUrl + "')";
    return Imagens.fundo((spec && spec.semente) || 'v', (spec && spec.variante) || 'paisagem', proporcao || 1.5);
  }

  function distintivo(texto, variante) {
    return '<span class="distintivo' + (variante ? ' distintivo--' + variante : '') + '">' + h(texto) + '</span>';
  }

  function linhaLista(opcoes) {
    const o = opcoes || {};
    const tag = o.href ? 'a' : 'button';
    const attrs = o.href ? 'href="' + o.href + '"' + (o.externo ? ' target="_blank" rel="noopener"' : '') : 'type="button"';
    return '<' + tag + ' class="lista-linha" ' + attrs + (o.acao ? ' data-acao="' + o.acao + '"' : '') +
      (o.valor ? ' data-valor="' + h(o.valor) + '"' : '') + '>' +
      (o.icone ? '<span class="lista-linha__icone">' + Icone(o.icone, 20) + '</span>' : '') +
      '<span class="lista-linha__corpo">' +
        '<span class="titulo-ui" style="display:block">' + h(o.titulo) + '</span>' +
        (o.nota ? '<span class="meta" style="display:block;margin-top:2px">' + h(o.nota) + '</span>' : '') +
      '</span>' +
      (o.direita ? '<span class="meta num">' + h(o.direita) + '</span>' : '') +
      '<span class="lista-linha__seta">' + Icone(o.externo ? 'externo' : 'seta', 20) + '</span>' +
      '</' + tag + '>';
  }

  /* Carros presentes num POI. O meu segue os meus check-ins; os
     outros seguem o que a organização registou. */
  function carrosEm(poiId) {
    const meu = Estado.meuCarro();
    const euAqui = Estado.chegou(poiId);

    const lista = DADOS.carros.filter(function (c) {
      if (meu && c.id === meu.id) return euAqui;
      return c.chegou === poiId;
    }).map(function (c) {
      return (meu && c.id === meu.id) ? Object.assign({}, c, { proprio: true }) : c;
    });

    /* Quem não está na lista da organização aparece na mesma,
       se marcou chegada. */
    if (!meu && euAqui) {
      const e = Estado.eu();
      lista.push({ id: 'meu', modelo: e.modelo, cor: e.cor, perfis: [e.nome], proprio: true });
    }
    return lista;
  }

  /* ---------------------------------------------------------
     Campos de edição — usados na área da organização
     Gravação automática: não há botão de guardar.
     --------------------------------------------------------- */

  function campo(o) {
    const tipo = o.tipo || 'texto';
    const val = o.valor === undefined || o.valor === null ? '' : o.valor;
    let controlo;

    if (tipo === 'area') {
      controlo = '<textarea class="campo__area" data-campo="' + o.nome + '" rows="' + (o.linhas || 4) + '" ' +
        'placeholder="' + h(o.placeholder || '') + '">' + h(val) + '</textarea>';
    } else if (tipo === 'lista') {
      controlo = '<select class="campo__entrada" data-campo="' + o.nome + '">' +
        (o.opcoes || []).map(function (op) {
          const v = op.valor !== undefined ? op.valor : op;
          const r = op.rotulo !== undefined ? op.rotulo : op;
          return '<option value="' + h(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + h(r) + '</option>';
        }).join('') + '</select>';
    } else {
      const entrada = tipo === 'data' ? 'date' : (tipo === 'hora' ? 'time' : (tipo === 'tel' ? 'tel' : 'text'));
      controlo = '<input class="campo__entrada" data-campo="' + o.nome + '" type="' + entrada + '" ' +
        'value="' + h(val) + '" placeholder="' + h(o.placeholder || '') + '"' +
        (o.modo ? ' inputmode="' + o.modo + '"' : '') + '>';
    }

    return '<label class="campo' + (o.largura === 'meia' ? ' campo--meia' : '') + '">' +
      '<span class="campo__rotulo">' + h(o.rotulo) + '</span>' + controlo +
      (o.nota ? '<span class="meta campo__nota">' + h(o.nota) + '</span>' : '') +
    '</label>';
  }

  function ligarCampos(raiz, aoMudar) {
    let temporizador = null;
    raiz.querySelectorAll('[data-campo]').forEach(function (el) {
      const imediato = el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time';
      el.addEventListener(imediato ? 'change' : 'input', function () {
        const enviar = function () { aoMudar(el.dataset.campo, el.value, el); };
        if (imediato) { enviar(); return; }
        clearTimeout(temporizador);
        temporizador = setTimeout(enviar, 400);
      });
      if (!imediato) el.addEventListener('blur', function () { aoMudar(el.dataset.campo, el.value, el); });
    });
  }

  /* Reduz uma fotografia antes de a guardar. Sem isto, três fotos
     enchem o armazenamento local do telemóvel. */
  function reduzirImagem(ficheiro, maxLado, feito) {
    const leitor = new FileReader();
    leitor.onload = function () {
      const img = new Image();
      img.onload = function () {
        let l = img.width, a = img.height;
        if (Math.max(l, a) > maxLado) {
          const f = maxLado / Math.max(l, a);
          l = Math.round(l * f); a = Math.round(a * f);
        }
        const tela = document.createElement('canvas');
        tela.width = l; tela.height = a;
        tela.getContext('2d').drawImage(img, 0, 0, l, a);
        feito(tela.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { feito(null); };
      img.src = leitor.result;
    };
    leitor.onerror = function () { feito(null); };
    leitor.readAsDataURL(ficheiro);
  }

  /* Um campo de fotografia: mostra a que existe, ou convida. */
  function campoFoto(o) {
    return '<div class="campo-foto">' +
      '<button class="campo-foto__alvo" type="button" data-acao="' + o.acao + '"' +
        (o.valor ? ' style="background-image:url(\'' + o.valor + '\')"' : '') +
        ' aria-label="' + h(o.rotulo) + '">' +
        (o.valor ? '' : Icone('camara', 24)) +
      '</button>' +
      '<div class="campo-foto__texto">' +
        '<span class="campo__rotulo">' + h(o.rotulo) + '</span>' +
        '<span class="meta">' + h(o.valor ? 'Tocar para trocar' : (o.nota || 'Tocar para carregar')) + '</span>' +
        (o.valor ? '<button class="botao botao--texto" type="button" data-acao="' + o.remover + '">Remover</button>' : '') +
      '</div>' +
      '<input type="file" id="' + o.id + '" accept="image/*" style="display:none">' +
    '</div>';
  }

  /* Aceita "46.54, 12.13" ou um endereço colado do Google Maps. */
  function coordenadas(texto) {
    const t = String(texto || '');
    const padroes = [
      /@(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
      /[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
      /[?&]ll=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
      /^\s*(-?\d+\.\d+)\s*[,; ]\s*(-?\d+\.\d+)\s*$/
    ];
    for (let i = 0; i < padroes.length; i++) {
      const m = t.match(padroes[i]);
      if (m) {
        const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat: lat, lng: lng };
      }
    }
    return null;
  }

  /* ---------------------------------------------------------
     Folha inferior
     --------------------------------------------------------- */

  function abrirFolha(titulo, corpo) {
    const el = document.getElementById('folha');
    el.innerHTML = '<div class="folha__painel">' +
      '<div class="folha__cabecalho">' +
        '<h2 class="titulo-ui">' + h(titulo) + '</h2>' +
        '<button class="botao-icone" type="button" data-fechar-folha aria-label="Fechar">' + Icone('fechar', 20) + '</button>' +
      '</div>' + corpo + '</div>';
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    el.querySelector('[data-fechar-folha]').addEventListener('click', fecharFolha);
    el.addEventListener('click', function (e) { if (e.target === el) fecharFolha(); });
  }

  function fecharFolha() {
    const el = document.getElementById('folha');
    el.hidden = true;
    el.innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ---------------------------------------------------------
     Partilha de ecrã — cada ecrã tem endereço fixo
     --------------------------------------------------------- */

  function partilhar(titulo) {
    const url = location.href;
    if (navigator.share) {
      navigator.share({ title: titulo, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      abrirFolha('Endereço copiado', '<p class="corpo-ui silencioso">' + h(url) + '</p>');
    }
  }

  return {
    h: h, dataLonga: dataLonga, dataCurta: dataCurta, intervaloEvento: intervaloEvento,
    minutos: minutos, horaAgora: horaAgora, plural: plural, duracao: duracao,
    troco: troco, haversine: haversine, linkMaps: linkMaps, linkLocal: linkLocal,
    gpx: gpx, descarregar: descarregar,
    foto: foto, imagemDe: imagemDe, distintivo: distintivo, linhaLista: linhaLista, carrosEm: carrosEm,
    campo: campo, ligarCampos: ligarCampos, coordenadas: coordenadas,
    reduzirImagem: reduzirImagem, campoFoto: campoFoto,
    abrirFolha: abrirFolha, fecharFolha: fecharFolha, partilhar: partilhar,
    MESES: MESES
  };
})();
