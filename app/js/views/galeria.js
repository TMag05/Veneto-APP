/* =========================================================
   Galeria — sem likes, sem comentários, sem contagens
   A captura abre a câmara nativa para não perder HDR nem
   modo noturno. O envio fica em fila e nunca falha à vista.
   ========================================================= */

(function () {

  let filtro = 'todos';

  function reduzir(ficheiro, feito) {
    const leitor = new FileReader();
    leitor.onload = function () {
      const img = new Image();
      img.onload = function () {
        const max = 1600;
        let l = img.width, a = img.height;
        if (Math.max(l, a) > max) {
          const f = max / Math.max(l, a);
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
    leitor.readAsDataURL(ficheiro);
  }

  function autorDe(f) {
    if (f.propria) return Estado.eu();
    const p = DADOS.participante(f.autor);
    return p ? { nome: p.nome, modelo: p.modelo, cor: p.cor } : { nome: '', modelo: 'db12', cor: 'onyx' };
  }

  function fundoDe(f) {
    return f.dataUrl ? "url('" + f.dataUrl + "')" : Imagens.fundo(f.semente, f.variante, 1);
  }

  function celula(f, i) {
    const a = autorDe(f);
    return '<button class="grelha-fotos__celula" type="button" data-acao="abrir" data-valor="' + i + '" ' +
      'style="background-image:' + fundoDe(f) + ';background-size:cover;background-position:center" ' +
      'aria-label="Fotografia de ' + UI.h(a.nome) + '">' +
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
      ['ent-camara', 'ent-ficheiro'].forEach(function (id) {
        const ent = el.querySelector('#' + id);
        if (!ent) return;
        ent.addEventListener('change', function () {
          const ficheiros = Array.prototype.slice.call(ent.files || []);
          const diaAtivo = Estado.diaAtivo();
          const dia = diaAtivo ? diaAtivo.id : '';
          const poi = Estado.ultimaChegada();
          let porFazer = ficheiros.length;
          ficheiros.forEach(function (f) {
            reduzir(f, function (dataUrl) {
              if (dataUrl) Estado.juntarFoto(dataUrl, dia, poi);
              porFazer--;
            });
          });
          ent.value = '';
        });
      });
    },

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
          '<div class="foto foto--32" style="background-image:' + fundoDe(f) + '"></div>' +
          '<p class="meta legenda">' + UI.h([poi, dia ? 'Dia ' + dia.numero : ''].filter(Boolean).join(' · ')) + '</p>' +
          (f.propria ? '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="apagar" data-valor="' + f.id + '">Remover</button>' : '')
        );
        const btn = document.querySelector('[data-acao="apagar"]');
        if (btn) btn.addEventListener('click', function () {
          const estado = Estado.get();
          Estado.definir({ fotos: estado.fotos.filter(function (x) { return x.id !== f.id; }) });
          UI.fecharFolha();
        });
      }
    }
  };
})();
