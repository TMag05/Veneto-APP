/* =========================================================
   Álbum — momento radicchio
   O presente de fecho e a razão pela qual a app fica
   instalada. É o único sítio onde a app se permite um gesto.
   ========================================================= */

(function () {

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
            '<p class="meta" style="margin-top:12px">' + UI.plural(fotos.length, 'fotografia guardada', 'fotografias guardadas') + ' até agora.</p>' +
          '</div>' +
        '</div>';
      }

      const porDia = DADOS.dias.map(function (d) {
        const f = fotos.filter(function (x) { return x.dia === d.id; });
        if (!f.length) return '';
        return '<div class="faixa">' +
          '<div class="seccao-cabecalho">' +
            '<h2 class="titulo-editorial">' + UI.h(d.titulo || 'Dia ' + d.numero) + '</h2>' +
            '<span class="meta num">' + f.length + '</span>' +
          '</div>' +
          (d.data ? '<p class="meta" style="margin-bottom:16px">' + UI.dataLonga(d.data) + '</p>' : '') +
          '<div class="grelha-fotos">' + f.map(function (x) {
            return '<div class="grelha-fotos__celula" style="background-image:' +
              (x.dataUrl ? "url('" + x.dataUrl + "')" : Imagens.fundo(x.semente, x.variante, 1)) +
              ';background-size:cover;background-position:center"></div>';
          }).join('') + '</div>' +
        '</div>';
      }).join('');

      const kms = DADOS.dias.reduce(function (t, d) { return t + (d.distancia || 0); }, 0);
      const carro = Estado.meuCarro();
      const eu = Estado.euParticipante();
      const chegadas = Estado.get().chegadas;

      /* Os passos subidos, por altitude. É o que um roadbook regista. */
      const passos = Object.keys(chegadas)
        .map(function (id) { return Object.assign({ id: id }, POIS[id]); })
        .filter(function (p) { return p.nome && p.altitude; })
        .sort(function (a, b) { return b.altitude - a.altitude; });

      const maisAlto = passos[0] || null;
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
          '<p class="cert__sub">' + UI.intervaloEvento() + '</p>' +

          '<div class="cert__corpo">' +
            linhaCert('Quilómetros', kms + ' km') +
            linhaCert('Etapas', String(DADOS.dias.length)) +
            linhaCert('Paragens visitadas', String(Object.keys(chegadas).length)) +
            (maisAlto ? linhaCert('Ponto mais alto', maisAlto.altitude + ' m') : '') +
            (carro ? linhaCert('Viatura', Silhuetas.modelo(carro.modelo).nome) : '') +
            (carro && carro.matricula ? linhaCert('Matrícula', carro.matricula) : '') +
            linhaCert('Edição', edicao) +
          '</div>' +

          (maisAlto ? '<p class="cert__nota">O ponto mais alto foi ' + UI.h(maisAlto.nome) +
            ', a ' + maisAlto.altitude + ' metros.</p>' : '') +

          (carro ? '<div class="cert__carro">' + Silhuetas.svg(carro.modelo, carro.cor) + '</div>' : '') +

          (carro && carro.perfis.length
            ? '<div class="cert__nomes">' +
                carro.perfis.map(function (n) { return '<span>' + UI.h(n) + '</span>'; }).join('') +
              '</div>'
            : (eu ? '<div class="cert__nomes"><span>' + UI.h(DADOS.nomeCompleto(eu)) + '</span></div>' : '')) +

          '<p class="cert__assinatura">Aston Martin</p>' +
        '</div>' +
      '</div>';

      const passosHtml = passos.length > 1
        ? '<div class="faixa">' +
            '<div class="seccao-cabecalho"><h2 class="etiqueta">Por altitude</h2></div>' +
            '<div class="altitudes">' +
              passos.map(function (p) {
                const largura = maisAlto ? Math.max(6, Math.round(p.altitude / maisAlto.altitude * 100)) : 100;
                return '<div class="altitude">' +
                  '<span class="altitude__nome">' + UI.h(p.nome) + '</span>' +
                  '<span class="altitude__barra"><span style="width:' + largura + '%"></span></span>' +
                  '<span class="altitude__num num">' + p.altitude + ' m</span>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>'
        : '';

      return '<div class="album-capa">' +
          '<p class="assinatura-am" style="color:inherit;opacity:0.8">Aston Martin</p>' +
          '<h1 class="capa-titulo" style="margin-top:32px">' + UI.h(DADOS.evento.nome || 'Passeio') + '<br>' +
            (DADOS.evento.inicio ? DADOS.evento.inicio.slice(0, 4) : DADOS.evento.ano) + '</h1>' +
          '<p class="subtitulo" style="margin-top:12px">' + UI.intervaloEvento() + '</p>' +
        '</div>' +

        certidao +
        passosHtml +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Fotografias</h2>' +
            '<span class="meta num">' + fotos.length + '</span></div>' +
          '<button class="botao botao--radicchio botao--largo" type="button" data-acao="descarregar">' +
            Icone('descarregar', 20) + 'Descarregar o álbum</button>' +
          '<p class="meta" style="margin-top:12px">Em qualidade original. Recomenda-se rede sem fios.</p>' +
        '</div>' +

        porDia +

        '<div class="faixa">' +
          '<p class="corpo-editorial italico silencioso">Até para o ano.</p>' +
        '</div>';
    },
    acoes: {
      descarregar: function () {
        UI.abrirFolha('Descarregar o álbum',
          '<p class="corpo-ui silencioso">Na versão final, o descarregamento faz-se a partir do Storage, em ficheiro único e em qualidade original.</p>' +
          '<p class="meta" style="margin-top:16px">Nesta demonstração o ficheiro não existe.</p>');
      }
    }
  };

  Vistas.arquivo = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Arquivo', tituloSempre: true },
    html: function () {
      return '<div class="faixa" style="padding-top:24px">' +
        '<h1 class="titulo-editorial">Arquivo</h1>' +
        '<p class="corpo-ui silencioso" style="margin-top:8px">Fica no telemóvel depois do passeio.</p>' +
        '<div class="lista" style="margin-top:24px">' +
          UI.linhaLista({ titulo: 'Álbum do passeio', nota: UI.plural(Estado.fotos().length, 'fotografia', 'fotografias'), icone: 'galeria', href: '#/album' }) +
          UI.linhaLista({ titulo: 'Roadbook completo', nota: UI.plural(DADOS.dias.length, 'percurso', 'percursos'), icone: 'roadbook', href: '#/roadbook' }) +
          UI.linhaLista({ titulo: 'O que levar', nota: 'A lista da bagagem', icone: 'documento', href: '#/preparacao' }) +
        '</div>' +
      '</div>';
    }
  };
})();
