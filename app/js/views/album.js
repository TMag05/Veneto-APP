/* =========================================================
   Álbum — momento radicchio
   O presente de fecho e a razão pela qual a app fica
   instalada. É o único sítio onde a app se permite um gesto.
   ========================================================= */

(function () {

  /* Guardar na galeria do telemóvel as que se escolherem, a radicchio,
     que é a cor do álbum. O .zip saiu a 03.10.2026: num telemóvel não
     se abre em lado nenhum. */
  const selecao = Guardar.selecao({ botao: 'botao--radicchio' });

  /* A imagem vem do arquivo do telemóvel, que é assíncrono: o HTML
     deixa a etiqueta pronta e Fotos.pintar dá-lhe o endereço. */
  function celula(x) {
    if (x.id) {
      const video = Fotos.ehVideo(x);
      const rotulo = video ? 'Vídeo' : 'Fotografia';
      const dentro = '<img data-foto="' + UI.h(x.id) + '" data-tamanho="mini" loading="lazy" decoding="async" alt="">' +
        (video ? UI.marcaVideo(x) : '');
      /* A escolher, um toque escolhe em vez de abrir. */
      if (selecao.ativa()) return selecao.celula(x, dentro, rotulo);
      return '<a class="grelha-fotos__celula" href="#/foto/' + encodeURIComponent(x.id) + '" aria-label="' + rotulo + '">' +
        dentro + '</a>';
    }
    return '<div class="grelha-fotos__celula" style="background-image:' +
      Imagens.fundo(x.semente, x.variante, 1) +
      ';background-size:cover;background-position:center"></div>';
  }

  Vistas.album = {
    nav: 'galeria',
    cabecalho: { voltar: '#/galeria', titulo: 'Álbum' },
    html: function () {
      const disponivel = Estado.fase() === 'pos' || Estado.get().album;
      const fotos = Estado.fotos();

      if (!disponivel) {
        return '<div class="faixa" style="padding-top:24px">' +
          '<div class="selado">' +
            '<div class="selado__icone">' + Icone('selado', 24) + '</div>' +
            '<p class="corpo-editorial">O álbum abre-se no último dia, ao fim do jantar.</p>' +
            '<p class="meta" style="margin-top:12px">' + UI.contagemGaleria(fotos) + ' até agora.</p>' +
          '</div>' +
        '</div>';
      }

      const porDia = DADOS.dias.map(function (d) {
        const f = fotos.filter(function (x) { return x.dia === d.id; });
        if (!f.length) return '';
        return '<div class="faixa">' +
          '<div class="seccao-cabecalho">' +
            '<h2 class="titulo-editorial">' + UI.h(d.titulo || UI.rotuloDia(d)) + '</h2>' +
            '<span class="meta num">' + f.length + '</span>' +
          '</div>' +
          (d.data ? '<p class="meta" style="margin-bottom:16px">' + UI.dataLonga(d.data) + '</p>' : '') +
          '<div class="grelha-fotos grelha-fotos--radicchio">' + f.map(celula).join('') + '</div>' +
        '</div>';
      }).join('');

      const kms = DADOS.dias.reduce(function (t, d) { return t + (d.distancia || 0); }, 0);
      const carro = Estado.meuCarro();
      const eu = Estado.euParticipante();
      const edicao = String(DADOS.evento.inicio || '').slice(0, 4) + '/' +
        String(carro ? carro.equipa : '—').padStart(2, '0');

      function linhaCert(rot, val) {
        if (!val) return '';
        return '<div class="cert__linha">' +
          '<span class="cert__rot">' + UI.h(rot) + '</span>' +
          '<span class="cert__val num">' + UI.h(val) + '</span>' +
        '</div>';
      }

      const certidao = '<div class="faixa" style="padding-top:32px">' +
        '<div class="cert">' +
          '<p class="cert__olho">Registo do percurso</p>' +
          '<h2 class="cert__titulo">' + UI.h(DADOS.evento.nome || 'Passeio') + '</h2>' +
          (DADOS.evento.subtitulo ? '<p class="cert__sub">' + UI.h(DADOS.evento.subtitulo) + '</p>' : '') +
          '<p class="cert__sub">' + UI.intervaloEvento() + '</p>' +

          '<div class="cert__corpo">' +
            linhaCert('Quilómetros', kms + ' km') +
            linhaCert('Etapas', String(DADOS.dias.length)) +
            (carro ? linhaCert('Viatura', Silhuetas.modelo(carro.modelo).nome) : '') +
            (carro && carro.matricula ? linhaCert('Matrícula', carro.matricula) : '') +
            linhaCert('Edição', edicao) +
          '</div>' +

          (carro ? '<div class="cert__carro">' + Silhuetas.svg(carro.modelo) + '</div>' : '') +

          (carro && carro.perfis.length
            ? '<div class="cert__nomes">' +
                carro.perfis.map(function (n) { return '<span>' + UI.h(n) + '</span>'; }).join('') +
              '</div>'
            : (eu ? '<div class="cert__nomes"><span>' + UI.h(DADOS.nomeCompleto(eu)) + '</span></div>' : '')) +

          '<p class="cert__assinatura">Aston Martin</p>' +
        '</div>' +
      '</div>';

      return '<div class="album-capa">' +
          '<p class="assinatura-am" style="color:inherit;opacity:0.8">Aston Martin</p>' +
          UI.logo('logo--album', 'margin-top:32px') +
          '<h1 class="capa-titulo" style="margin-top:20px">' +
            (DADOS.evento.inicio ? DADOS.evento.inicio.slice(0, 4) : DADOS.evento.ano) + '</h1>' +
          '<p class="subtitulo" style="margin-top:12px">' + UI.h(DADOS.evento.subtitulo || UI.intervaloEvento()) + '</p>' +
        '</div>' +

        certidao +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">' +
            (fotos.some(function (f) { return Fotos.ehVideo(f); }) ? 'Fotografias e vídeos' : 'Fotografias') + '</h2>' +
            '<span class="meta num">' + fotos.length + '</span></div>' +
          (fotos.some(function (f) { return !!f.id; })
            ? selecao.topo('Para guardar na galeria do telemóvel, em qualidade original.')
            : '') +
        '</div>' +

        porDia +

        '<div class="faixa">' +
          '<p class="corpo-editorial italico silencioso">Até para o ano.</p>' +
        '</div>' +

        (selecao.ativa() ? selecao.barra() : '');
    },
    montar: function (el) { Fotos.pintar(el); },
    desmontar: function () { Fotos.libertarTodos(); selecao.limpar(); },
    acoes: selecao.acoes
  };

  Vistas.arquivo = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Arquivo', tituloSempre: true },
    html: function () {
      return '<div class="faixa" style="padding-top:24px">' +
        '<h1 class="titulo-editorial">Arquivo</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">Fica no telemóvel depois do passeio.</p>' +
        '<div class="lista" style="margin-top:24px">' +
          UI.linhaLista({ titulo: 'Álbum do passeio', nota: UI.contagemGaleria(Estado.fotos()), icone: 'galeria', href: '#/album' }) +
          UI.linhaLista({ titulo: 'Roadbook completo', nota: UI.plural(DADOS.dias.length, 'percurso', 'percursos'), icone: 'roadbook', href: '#/roadbook' }) +
          UI.linhaLista({ titulo: 'O que levar', nota: 'A lista da bagagem', icone: 'documento', href: '#/preparacao' }) +
        '</div>' +
      '</div>';
    }
  };
})();
