/* =========================================================
   Galeria — sem likes, sem comentários, sem contagens
   A captura abre a câmara nativa para não perder HDR nem
   modo noturno. O ficheiro fica inteiro no telemóvel, tal como
   saiu da câmara, e o envio fica em fila. Os vídeos entram pelo
   mesmo caminho, até um minuto (02.10.2026).
   ========================================================= */

(function () {

  let filtro = 'todos';
  let vigia = null;
  /* A última fotografia vista no visor: a grelha volta a ela. */
  let focar = '';

  /* O nome de quem a tirou, para quem lê o ecrã. A grelha é só das
     fotografias: o carro e o lugar estão na página de cada uma. */
  function autorDe(f) {
    if (f.propria) return Estado.eu().nome;
    if (f.autor === 'organizacao') return DADOS.evento.nome || 'Do passeio';
    if (f.autor === 'grupo') return f.autorNome || 'Do grupo';
    const p = DADOS.participante(f.autor);
    return p ? p.nome : 'Do grupo';
  }

  /* A imagem vem do arquivo do telemóvel e chega depois do HTML:
     aqui fica a etiqueta, e Fotos.pintar dá-lhe o endereço. */
  function imagemDe(f, tamanho) {
    if (f.id) {
      return '<img data-foto="' + UI.h(f.id) + '" data-tamanho="' + (tamanho || 'mini') + '" ' +
        'loading="lazy" decoding="async" alt="">';
    }
    return '';
  }

  function fundoDe(f) {
    return f.id ? '' : ';background-image:' + Imagens.fundo(f.semente, f.variante, 1) +
      ';background-size:cover;background-position:center';
  }

  function celula(f) {
    const video = Fotos.ehVideo(f);
    const dentro = imagemDe(f) + (video ? UI.marcaVideo(f) : '');
    const estilo = fundoDe(f).replace(/^;/, '');
    if (!f.id) return '<div class="grelha-fotos__celula" style="' + estilo + '">' + dentro + '</div>';
    const rotulo = video
      ? 'Vídeo de ' + autorDe(f) + (f.duracao ? ', ' + UI.tempoVideo(f.duracao) : '')
      : 'Fotografia de ' + autorDe(f);
    return '<a class="grelha-fotos__celula" href="#/foto/' + encodeURIComponent(f.id) + '" ' +
      'style="' + estilo + '" aria-label="' + UI.h(rotulo) + '">' + dentro + '</a>';
  }

  /* O que não entrou, numa folha só, pela ordem do que mais importa. */
  function avisar(m, falhouVideo) {
    function folha(titulo, texto) { UI.abrirFolha(titulo, '<p class="corpo-ui silencioso">' + texto + '</p>'); }
    if (m.limite) folha('Cem fotografias neste dia', 'É o máximo por dia. Amanhã recomeça.');
    else if (m['limite-videos']) folha('Dez vídeos neste dia', 'É o máximo por dia. Amanhã recomeça.');
    else if (m.longo) folha('Vídeo longo demais', 'Os vídeos vão até um minuto. Pode encurtá-lo na galeria do telemóvel e voltar a juntá-lo.');
    else if (m.video) folha('Não foi possível abrir o vídeo', 'Este telemóvel não consegue ler o ficheiro.');
    else {
      const falhou = (m.espaco || 0) + (m.leitura || 0);
      if (!falhou) return;
      const nome = falhouVideo === falhou
        ? (falhou === 1 ? 'Um vídeo não coube' : 'Alguns vídeos não couberam')
        : (falhou === 1 ? 'Uma fotografia não coube' : 'Algumas fotografias não couberam');
      folha('Não foi possível guardar', nome + ' no telemóvel. Liberte espaço e tente de novo.');
    }
  }

  function lista() {
    const todas = Estado.fotos();
    if (filtro === 'todos') return todas;
    if (filtro === 'minhas') return todas.filter(function (f) { return f.propria; });
    return todas.filter(function (f) { return f.dia === filtro; });
  }

  Vistas.galeria = {
    nav: 'galeria',
    semCabecalho: true,
    html: function () {
      const fotos = lista();
      const fase = Estado.fase();

      const filtros = [{ id: 'todos', rotulo: 'Todas' }]
        .concat(DADOS.dias.map(function (d) { return { id: d.id, rotulo: UI.rotuloDia(d) }; }))
        .concat([{ id: 'minhas', rotulo: 'Minhas' }]);

      return '<div class="capa">' +
          UI.foto({ semente: 'galeria', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">Galeria</h1>' +
            '<p class="subtitulo" style="margin-top:8px">' + UI.contagemGaleria(Estado.fotos()) + ' do grupo.</p>' +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:24px">' +
          '<div class="escolhas">' + filtros.map(function (f) {
            return '<button class="escolha" type="button" data-acao="filtrar" data-valor="' + f.id + '" ' +
              'aria-pressed="' + (filtro === f.id ? 'true' : 'false') + '">' + f.rotulo + '</button>';
          }).join('') + '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:16px">' +
          (fotos.length
            ? '<div class="grelha-fotos">' + fotos.map(celula).join('') + '</div>'
            : '<p class="corpo-editorial silencioso">Ainda não há fotografias nem vídeos nesta seleção.</p>') +
        '</div>' +

        (fase === 'pos' ? '<div class="faixa">' +
          '<a class="botao botao--radicchio botao--largo" href="#/album">Abrir o álbum completo</a>' +
        '</div>' : '') +

        '<div class="captura barra-inferior">' +
          '<button class="botao botao--principal" type="button" data-acao="camara">' +
            Icone('camara', 20) + 'Fotografar</button>' +
          /* Filmar tem botão próprio: com a fotografia e o vídeo no mesmo
             campo, o Android abre a câmara só para fotografar. */
          '<button class="botao botao--secundario botao--fixo-estreito" type="button" data-acao="filmar" aria-label="Filmar">' +
            Icone('video', 20) + '</button>' +
          '<button class="botao botao--secundario botao--fixo-estreito" type="button" data-acao="ficheiro" aria-label="Escolher da galeria do telemóvel">' +
            Icone('juntar', 20) + '</button>' +
          '<input type="file" id="ent-camara" accept="image/*" capture="environment">' +
          '<input type="file" id="ent-filmar" accept="video/*" capture="environment">' +
          '<input type="file" id="ent-ficheiro" accept="image/*,video/*" multiple>' +
        '</div>';
    },

    montar: function (el, p, chegada) {
      Fotos.pintar(el);
      /* De volta do visor, a grelha abre onde está a última que se viu. */
      if (chegada && focar) {
        const alvo = el.querySelector('[href="#/foto/' + encodeURIComponent(focar) + '"]');
        if (alvo) alvo.scrollIntoView({ block: 'center' });
        focar = '';
      }
      /* O que está na grelha já foi visto: o número do separador apaga-se. */
      Estado.marcarGrupoVisto();
      /* À chegada, pede as novas do grupo; aberta, volta a pedir de
         cinco em cinco segundos — a fotografia de um é de todos no
         momento em que é tirada. As que chegam repintam a grelha. */
      if (chegada) {
        Estado.sincronizarGrupo(true);
        if (!vigia) vigia = setInterval(function () { Estado.sincronizarGrupo(); }, 5 * 1000);
      }

      ['ent-camara', 'ent-filmar', 'ent-ficheiro'].forEach(function (id) {
        const ent = el.querySelector('#' + id);
        if (!ent) return;
        ent.addEventListener('change', function () {
          const ficheiros = Array.prototype.slice.call(ent.files || []);
          const diaAtivo = Estado.diaAtivo();
          const dia = diaAtivo ? diaAtivo.id : '';
          /* A fotografia guarda o dia e a hora. A paragem saiu com a
             marcação de chegada: numa caravana o dia já diz onde foi. */
          const poi = '';
          let porFazer = ficheiros.length;
          const motivos = {};
          let falhouVideo = 0;
          ficheiros.forEach(function (f) {
            Estado.juntarFoto(f, dia, poi, function (novoId, motivo) {
              if (!novoId) {
                motivos[motivo] = (motivos[motivo] || 0) + 1;
                if (motivo === 'espaco' && /^video\//.test(f.type || '')) falhouVideo++;
              }
              if (--porFazer === 0) {
                App.repintar();
                avisar(motivos, falhouVideo);
              }
            });
          });
          ent.value = '';
        });
      });
    },

    /* Os endereços temporários das imagens devolvem-se ao sair. */
    desmontar: function () {
      Fotos.libertarTodos();
      if (vigia) { clearInterval(vigia); vigia = null; }
    },

    /* O visor desliza pela mesma lista que a grelha mostra, com o
       mesmo filtro, e diz-lhe a que fotografia voltar. */
    lista: lista,
    focar: function (id) { focar = id; },

    acoes: {
      filtrar: function (id) { filtro = id; App.repintar(); },
      camara: function () { document.getElementById('ent-camara').click(); },
      filmar: function () { document.getElementById('ent-filmar').click(); },
      ficheiro: function () { document.getElementById('ent-ficheiro').click(); }
    }
  };
})();
