/* =========================================================
   Galeria — sem likes, sem comentários, sem contagens
   A captura abre a câmara nativa para não perder HDR nem
   modo noturno. O ficheiro fica inteiro no telemóvel, tal como
   saiu da câmara, e o envio fica em fila.
   ========================================================= */

(function () {

  let filtro = 'todos';

  function autorDe(f) {
    if (f.propria) return Estado.eu();
    const p = DADOS.participante(f.autor);
    return p ? { nome: p.nome, modelo: p.modelo, cor: p.cor } : { nome: '', modelo: 'db12', cor: 'onyx' };
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

  function celula(f, i) {
    const a = autorDe(f);
    return '<button class="grelha-fotos__celula" type="button" data-acao="abrir" data-valor="' + i + '" ' +
      'style="' + fundoDe(f).replace(/^;/, '') + '" ' +
      'aria-label="Fotografia de ' + UI.h(a.nome) + '">' +
      imagemDe(f) +
      '<span class="grelha-fotos__autor">' + Silhuetas.svg(a.modelo, a.cor, { rodas: false, titulo: a.nome }) + '</span>' +
    '</button>';
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
        .concat(DADOS.dias.map(function (d) { return { id: d.id, rotulo: 'Dia ' + d.numero }; }))
        .concat([{ id: 'minhas', rotulo: 'Minhas' }]);

      return '<div class="capa">' +
          UI.foto({ semente: 'galeria', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">Galeria</h1>' +
            '<p class="subtitulo" style="margin-top:8px">' + UI.plural(Estado.fotos().length, 'fotografia', 'fotografias') + ' do grupo.</p>' +
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
            : '<p class="corpo-editorial silencioso">Ainda não há fotografias nesta seleção.</p>') +
        '</div>' +

        (fase === 'pos' ? '<div class="faixa">' +
          '<a class="botao botao--radicchio botao--largo" href="#/album">Abrir o álbum completo</a>' +
        '</div>' : '') +

        '<div class="captura barra-inferior">' +
          '<button class="botao botao--principal" type="button" data-acao="camara">' +
            Icone('camara', 20) + 'Fotografar</button>' +
          '<button class="botao botao--secundario botao--fixo-estreito" type="button" data-acao="ficheiro" aria-label="Escolher da galeria do telemóvel">' +
            Icone('juntar', 20) + '</button>' +
          '<input type="file" id="ent-camara" accept="image/*" capture="environment">' +
          '<input type="file" id="ent-ficheiro" accept="image/*" multiple>' +
        '</div>';
    },

    montar: function (el) {
      Fotos.pintar(el);

      ['ent-camara', 'ent-ficheiro'].forEach(function (id) {
        const ent = el.querySelector('#' + id);
        if (!ent) return;
        ent.addEventListener('change', function () {
          const ficheiros = Array.prototype.slice.call(ent.files || []);
          const diaAtivo = Estado.diaAtivo();
          const dia = diaAtivo ? diaAtivo.id : '';
          const poi = Estado.ultimaChegada();
          let porFazer = ficheiros.length;
          let falhou = 0, noLimite = 0;
          ficheiros.forEach(function (f) {
            Estado.juntarFoto(f, dia, poi, function (novoId, motivo) {
              if (!novoId) { if (motivo === 'limite') noLimite++; else falhou++; }
              if (--porFazer === 0) {
                App.repintar();
                if (noLimite) UI.abrirFolha('Chega por hoje',
                  '<p class="corpo-ui silencioso">São cem fotografias neste dia, o máximo. Amanhã recomeça.</p>');
                else if (falhou) UI.abrirFolha('Não foi possível guardar',
                  '<p class="corpo-ui silencioso">' + (falhou === 1 ? 'Uma fotografia não coube' : 'Algumas fotografias não couberam') +
                  ' no telemóvel. Liberte espaço e tente de novo.</p>');
              }
            });
          });
          ent.value = '';
        });
      });
    },

    /* Os endereços temporários das imagens devolvem-se ao sair. */
    desmontar: function () { Fotos.libertarTodos(); },

    acoes: {
      filtrar: function (id) { filtro = id; App.repintar(); },
      camara: function () { document.getElementById('ent-camara').click(); },
      ficheiro: function () { document.getElementById('ent-ficheiro').click(); },
      abrir: function (i) {
        const f = lista()[parseInt(i, 10)];
        if (!f) return;
        const a = autorDe(f);
        const poi = f.poi && POIS[f.poi] ? POIS[f.poi].nome : '';
        const dia = DADOS.dia(f.dia);
        UI.abrirFolha(a.nome,
          '<div class="foto foto--32" style="' + fundoDe(f).replace(/^;/, '') + '">' + imagemDe(f, 'original') + '</div>' +
          '<p class="meta legenda">' + UI.h([poi, dia ? 'Dia ' + dia.numero : ''].filter(Boolean).join(' · ')) + '</p>' +
          (f.propria ? '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="apagar" data-valor="' + f.id + '">Remover</button>' : '')
        );
        Fotos.pintar(document.getElementById('folha'));
        const btn = document.querySelector('[data-acao="apagar"]');
        if (btn) btn.addEventListener('click', function () {
          Estado.apagarFoto(f.id);
          UI.fecharFolha();
          App.repintar();
        });
      }
    }
  };
})();
