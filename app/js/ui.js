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
     Linha reta corrigida por um fator de sinuosidade. Só servem
     para medir o dia quando não há percurso gravado.
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
    /* Dois momentos no mesmo sítio — o Sacrario e o Rifugio Bassano,
       o hotel e o seu terraço — não são um troço. */
    if (reta < 0.5) return { km: 0, min: 0 };
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
     A localização de cada paragem
     O grupo segue os batedores; a app não traça percurso. Cada
     paragem abre-se no Google Maps, só o sítio. Decisão de
     27.09.2026, que tirou os links por troço e o GPX. O Waze saiu a
     02.10.2026: os caminhos que propunha não eram os melhores, e
     uma nota pede o Google Maps a quem o usaria por hábito.
     --------------------------------------------------------- */

  /* Com «pesquisa», procura-se pelo nome: é o que vale enquanto as
     coordenadas de um sítio forem aproximadas. */
  function linkLocal(poiId) {
    const p = POIS[poiId];
    if (!p) return '#';
    if (p.pesquisa) return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.pesquisa);
    return 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng;
  }

  function temLocal(poiId) {
    const p = POIS[poiId];
    return !!p && (!!p.pesquisa || (!!p.lat && !!p.lng));
  }

  /* O atalho para o Google Maps. Sem coordenadas nem nome, nada. */
  function atalhosLocal(poiId) {
    if (!temLocal(poiId)) return '';
    return '<div class="atalhos-local">' +
      '<a class="botao botao--texto" href="' + linkLocal(poiId) + '" target="_blank" rel="noopener">' +
        Icone('externo', 20) + 'Google Maps</a>' +
    '</div>';
  }

  /* Uma vez por ecrã, e não ao lado de cada atalho: no roadbook
     repetir-se-ia em cada momento do dia. */
  function notaMaps() {
    return '<p class="corpo-ui silencioso nota-maps">' +
      'Para ir até uma paragem, use o Google Maps. O Waze propõe caminhos que não são os melhores.</p>';
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

  /* O iPhone, e o iPad, que desde o iPadOS 13 se diz Mac: é por ele
     que se guarda na galeria pela folha de Partilhar (js/guardar.js). */
  const iphone = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

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
    /* Fotografia do sítio, servida com a app (assets/fotos/). */
    if (spec && spec.foto) return "url('" + spec.foto + "')";
    /* Gráfico de logística, desenhado com as cores de tokens.css. */
    if (spec && spec.grafico) return Imagens.fundoGrafico(spec.grafico);
    return Imagens.fundo((spec && spec.semente) || 'v', (spec && spec.variante) || 'paisagem', proporcao || 1.5);
  }

  /* O logótipo do passeio, claro, sobre o escuro. A cor não se toca:
     é a marca. O nome vive na imagem — o texto alternativo repete-o
     para quem ouve o ecrã. */
  function logo(classes, estilo) {
    return '<img class="logo ' + (classes || '') + '" src="assets/img/logo.png" ' +
      'width="900" height="900" alt="' + h((window.DADOS && DADOS.evento.nome) || 'Dolomites Grand Tour') + '"' +
      (estilo ? ' style="' + estilo + '"' : '') + '>';
  }

  /* A hora de um momento, como se lê: início e fim, só o fim
     («até às 10:00»), só o início, ou ainda por confirmar. */
  /* A hora que o convidado vê. Com «horaOculta», nenhuma: a hora
     fica só para o relógio da app. Sem hora, nada — não se escreve
     «a confirmar». */
  function horario(m) {
    if (m.horaOculta) return '';
    if (m.hora && m.fim) return m.hora + ' – ' + m.fim;
    if (m.hora) return m.hora;
    if (m.fim) return 'Até às ' + m.fim;
    return '';
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

  /* ---------------------------------------------------------
     Escolha do carro — o modelo
     A mesma grelha na criação da conta, no carro do convidado e
     na ficha da organização. Os botões levam data-acao="modelo";
     quem os mostra decide o que fazer.
     --------------------------------------------------------- */

  /* A escolha não passa só por cor: a opção escolhida leva borda
     de acento e um visto, e o nome do modelo repete-se por baixo. */
  function escolhaCarro(modelo) {
    const escolhido = Silhuetas.MODELOS.find(function (m) { return m.id === modelo; });
    return '<h3 class="etiqueta">Modelo</h3>' +
      '<div class="silhueta-grelha" style="margin-top:12px">' + Silhuetas.MODELOS.map(function (m) {
        const sim = m.id === modelo;
        return '<button class="silhueta-opcao" type="button" data-acao="modelo" data-valor="' + m.id + '" ' +
          'aria-pressed="' + (sim ? 'true' : 'false') + '">' +
          (sim ? '<span class="silhueta-opcao__marca">' + Icone('verificado', 20) + '</span>' : '') +
          Silhuetas.svg(m.id) +
          '<span class="silhueta-opcao__nome">' + h(m.nome) + '</span></button>';
      }).join('') + '</div>' +
      '<p class="corpo-ui silhueta-escolha" aria-live="polite">' +
        (escolhido ? 'Escolhido: ' + h(escolhido.nome) : 'Toque no modelo do seu carro.') + '</p>';
  }

  /* Piloto ou co-piloto: o mesmo cartão da escolha do carro, com
     o habitáculo desenhado e a pessoa no seu lugar. */
  function escolhaFuncao(valor) {
    const escolhida = Silhuetas.funcao(valor);
    return '<div class="silhueta-grelha">' + Silhuetas.FUNCOES.map(function (f) {
        const sim = f.id === valor;
        return '<button class="silhueta-opcao" type="button" data-acao="funcao" data-valor="' + f.id + '" ' +
          'aria-pressed="' + (sim ? 'true' : 'false') + '">' +
          (sim ? '<span class="silhueta-opcao__marca">' + Icone('verificado', 20) + '</span>' : '') +
          Silhuetas.lugar(f.id) +
          '<span class="silhueta-opcao__nome">' + h(f.nome) + '</span></button>';
      }).join('') + '</div>' +
      '<p class="corpo-ui silhueta-escolha" aria-live="polite">' +
        (escolhida ? 'Escolhido: ' + h(escolhida.nome) : 'Toque no seu lugar no carro.') + '</p>';
  }

  /* Um nome reduzido a letras, números e hífenes. Serve de
     identificador e de nome de ficheiro. */
  function talho(t) {
    return String(t || '').toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
  }

  /* dia-3-passo-di-san-boldo-14h32.jpg — o nome que a câmara dá não
     diz nada a ninguém daqui a um ano. */
  /* Como se chama um dia: «Dia 1» nos dias de estrada, o título nos
     de logística (a chegada, a partida). */
  function rotuloDia(d) {
    return d ? (d.etiqueta || d.titulo || '') : '';
  }

  /* O nome de um dia em ficheiros e pastas: dia-1, chegada. */
  function pastaDia(d) {
    if (!d) return '';
    return d.ordem ? 'dia-' + d.ordem : (talho(d.titulo) || 'dia');
  }

  function nomeDeFoto(f, tipo) {
    const dia = DADOS.dia(f.dia);
    const poi = f.poi && POIS[f.poi] ? POIS[f.poi].nome : '';
    const d = new Date(f.criado);
    const hora = String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
    const partes = [pastaDia(dia), talho(poi), hora].filter(Boolean);
    return partes.join('-') + '.' + Fotos.extensao(tipo);
  }

  /* O que há na galeria, em palavras: «12 fotografias», ou «12
     fotografias e 2 vídeos» quando os há. */
  function contagemGaleria(lista) {
    const videos = lista.filter(function (f) { return Fotos.ehVideo(f); }).length;
    const fotos = lista.length - videos;
    const nVideos = plural(videos, 'vídeo', 'vídeos');
    if (!videos) return plural(fotos, 'fotografia', 'fotografias');
    return fotos ? plural(fotos, 'fotografia', 'fotografias') + ' e ' + nVideos : nVideos;
  }

  /* A duração de um vídeo como se lê num relógio: 0:42, 1:05. */
  function tempoVideo(segundos) {
    const s = Math.max(0, Math.round(segundos || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /* Na grelha, um vídeo distingue-se pelo sinal de tocar e pela
     duração, numa pastilha no canto — não só por um ícone. */
  function marcaVideo(f) {
    return '<span class="grelha-fotos__video num" aria-hidden="true">' + Icone('tocar', 14) +
      (f.duracao ? tempoVideo(f.duracao) : '') + '</span>';
  }

  /* ---------------------------------------------------------
     Fotografias: uma leitura, vários tamanhos
     --------------------------------------------------------- */

  /* Abre o ficheiro uma vez só e devolve-o pronto a desenhar, já
     com a orientação da câmara aplicada — sem isto as verticais do
     iPhone saem deitadas na miniatura. createImageBitmap faz as duas
     coisas; onde não existe, a etiqueta <img> também já roda sozinha.
     Um HEIC só abre onde o sistema o sabe ler, que é o iPhone; o
     ficheiro de origem sobe na mesma, tal como veio. */
  function abrirImagem(ficheiro, feito) {
    if (window.createImageBitmap) {
      let p = null;
      try { p = createImageBitmap(ficheiro, { imageOrientation: 'from-image' }); } catch (e) { p = null; }
      if (p && p.then) {
        p.then(function (bm) { feito(bm, bm.width, bm.height); })
         .catch(function () { porEtiqueta(ficheiro, feito); });
        return;
      }
    }
    porEtiqueta(ficheiro, feito);
  }

  function porEtiqueta(ficheiro, feito) {
    const endereco = URL.createObjectURL(ficheiro);
    const img = new Image();
    img.onload = function () { feito(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(endereco); };
    img.onerror = function () { URL.revokeObjectURL(endereco); feito(null); };
    img.src = endereco;
  }

  function fecharImagem(fonte) { if (fonte && fonte.close) fonte.close(); }

  /* Desenha a fotografia já reduzida. O que vai para a tela é sempre
     o tamanho pequeno, nunca a fotografia inteira: a tela do Safari
     não passa dos ~16,7 megapixels e uma fotografia de iPhone passa. */
  function escalar(fonte, largura, altura, maxLado, qualidade, comoBlob, feito) {
    let l = largura, a = altura;
    if (Math.max(l, a) > maxLado) {
      const f = maxLado / Math.max(l, a);
      l = Math.max(1, Math.round(l * f)); a = Math.max(1, Math.round(a * f));
    }
    const tela = document.createElement('canvas');
    tela.width = l; tela.height = a;
    tela.getContext('2d').drawImage(fonte, 0, 0, l, a);
    if (comoBlob) tela.toBlob(function (b) { feito(b); }, 'image/jpeg', qualidade);
    else feito(tela.toDataURL('image/jpeg', qualidade));
  }

  /* pedidos: [{ nome, lado, qualidade, blob }]. Devolve um objeto com
     um campo por pedido, mais a largura e a altura de origem. */
  function derivadas(ficheiro, pedidos, feito) {
    abrirImagem(ficheiro, function (fonte, largura, altura) {
      if (!fonte) { feito(null); return; }
      const saida = { largura: largura, altura: altura };
      let porFazer = pedidos.length;
      if (!porFazer) { fecharImagem(fonte); feito(saida); return; }
      pedidos.forEach(function (p) {
        escalar(fonte, largura, altura, p.lado, p.qualidade || 0.82, p.blob !== false, function (r) {
          saida[p.nome] = r;
          if (--porFazer === 0) { fecharImagem(fonte); feito(saida); }
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Vídeos: a duração, o tamanho e uma imagem para a grelha
     --------------------------------------------------------- */

  /* Abre o vídeo sem o mostrar, lê a duração e o tamanho, e tira uma
     imagem de meio segundo depois do início — a primeira costuma sair
     escura, com a câmara ainda a acertar a luz. É essa imagem que a
     grelha e o visor mostram enquanto o vídeo não toca.
     O iPhone nem sempre desenha uma imagem só por se pedir aquele
     ponto do vídeo: se a tela ficar vazia, toca-o sem som, dentro da
     página, e tira-a do primeiro instante a tocar. Se nem assim, a
     imagem é uma superfície lisa, na cor das células da grelha.
     Devolve null só se o vídeo nem abrir. */
  function derivadasVideo(ficheiro, pedidos, feito) {
    const endereco = URL.createObjectURL(ficheiro);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');

    let acabou = false;
    let meta = null;
    let aTocar = false;
    const limite = setTimeout(function () { meta ? lisa() : terminar(null); }, 15000);

    function terminar(saida) {
      if (acabou) return;
      acabou = true;
      clearTimeout(limite);
      v.pause();
      v.removeAttribute('src');
      v.load();
      URL.revokeObjectURL(endereco);
      feito(saida);
    }

    /* Uma tela de 8 por 8 diz se o vídeo já tem imagem: sem ela, o que
       se desenha é transparente. */
    function temImagem() {
      try {
        const t = document.createElement('canvas');
        t.width = 8; t.height = 8;
        const c = t.getContext('2d');
        c.drawImage(v, 0, 0, 8, 8);
        const px = c.getImageData(0, 0, 8, 8).data;
        for (let i = 3; i < px.length; i += 4) if (px[i] > 0) return true;
      } catch (e) { /* sem tela */ }
      return false;
    }

    function desenhar(fonte) {
      const saida = Object.assign({}, meta);
      let porFazer = pedidos.length;
      if (!porFazer) { terminar(saida); return; }
      pedidos.forEach(function (p) {
        escalar(fonte, meta.largura, meta.altura, p.lado, p.qualidade || 0.82, true, function (r) {
          saida[p.nome] = r;
          if (--porFazer === 0) terminar(saida);
        });
      });
    }

    function lisa() {
      if (acabou) return;
      const t = document.createElement('canvas');
      t.width = meta.largura; t.height = meta.altura;
      const c = t.getContext('2d');
      c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--intonaco').trim();
      c.fillRect(0, 0, t.width, t.height);
      desenhar(t);
    }

    function tocar() {
      if (aTocar) { lisa(); return; }
      aTocar = true;
      v.addEventListener('timeupdate', function quando() {
        if (v.currentTime <= 0) return;
        v.removeEventListener('timeupdate', quando);
        v.pause();
        if (temImagem()) desenhar(v); else lisa();
      });
      const p = v.play();
      if (p && p.catch) p.catch(lisa);
    }

    v.addEventListener('loadedmetadata', function () {
      const largura = v.videoWidth || 1600, altura = v.videoHeight || 900;
      meta = { largura: largura, altura: altura, duracao: isFinite(v.duration) ? v.duration : 0 };
      v.currentTime = meta.duracao ? Math.min(0.5, meta.duracao / 3) : 0;
    });
    v.addEventListener('seeked', function () {
      if (acabou || aTocar) return;
      if (temImagem()) desenhar(v); else tocar();
    });
    v.addEventListener('error', function () { meta ? lisa() : terminar(null); });
    v.src = endereco;
    /* Há Safaris que nem a duração leem de um vídeo que não está a
       tocar: ao fim de três segundos sem ela, toca-se sem som. */
    setTimeout(function () {
      if (meta || acabou) return;
      const p = v.play();
      if (p && p.catch) p.catch(function () { /* fica para o limite */ });
    }, 3000);
  }

  /* Reduz uma fotografia a uma dataUrl. É o que os campos de
     fotografia da organização guardam — imagens pequenas, dentro
     do conteúdo. As do passeio seguem por derivadas(). */
  function reduzirImagem(ficheiro, maxLado, feito) {
    derivadas(ficheiro, [{ nome: 'r', lado: maxLado, qualidade: 0.82, blob: false }], function (d) {
      feito(d ? d.r : null);
    });
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

  return {
    h: h, dataLonga: dataLonga, dataCurta: dataCurta, intervaloEvento: intervaloEvento,
    minutos: minutos, horaAgora: horaAgora, plural: plural, duracao: duracao,
    rotuloDia: rotuloDia, pastaDia: pastaDia, troco: troco, haversine: haversine, linkLocal: linkLocal, temLocal: temLocal, atalhosLocal: atalhosLocal, notaMaps: notaMaps,
    descarregar: descarregar, iphone: iphone,
    foto: foto, imagemDe: imagemDe, logo: logo, horario: horario, distintivo: distintivo, linhaLista: linhaLista,
    campo: campo, ligarCampos: ligarCampos, coordenadas: coordenadas, escolhaCarro: escolhaCarro, escolhaFuncao: escolhaFuncao,
    reduzirImagem: reduzirImagem, derivadas: derivadas, derivadasVideo: derivadasVideo, campoFoto: campoFoto, talho: talho, nomeDeFoto: nomeDeFoto,
    contagemGaleria: contagemGaleria, tempoVideo: tempoVideo, marcaVideo: marcaVideo,
    abrirFolha: abrirFolha, fecharFolha: fecharFolha,
    MESES: MESES
  };
})();
