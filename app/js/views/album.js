/* =========================================================
   Álbum — momento radicchio
   O presente de fecho e a razão pela qual a app fica
   instalada. É o único sítio onde a app se permite um gesto.
   ========================================================= */

(function () {

  /* A imagem vem do arquivo do telemóvel, que é assíncrono: o HTML
     deixa a etiqueta pronta e Fotos.pintar dá-lhe o endereço. */
  function celula(x) {
    if (x.id) {
      return '<a class="grelha-fotos__celula" href="#/foto/' + encodeURIComponent(x.id) + '" aria-label="Fotografia">' +
        '<img data-foto="' + UI.h(x.id) + '" data-tamanho="mini" loading="lazy" decoding="async" alt="">' +
      '</a>';
    }
    return '<div class="grelha-fotos__celula" style="background-image:' +
      Imagens.fundo(x.semente, x.variante, 1) +
      ';background-size:cover;background-position:center"></div>';
  }

  /* ---------------------------------------------------------
     Descarregar em ficheiro único
     Os originais, sem passar por servidor nenhum: o telemóvel já
     os tem. Num computador, depois do passeio, isto é leve.
     --------------------------------------------------------- */

  function semRepetir(usados, nome) {
    if (!usados[nome]) { usados[nome] = 1; return nome; }
    const ponto = nome.lastIndexOf('.');
    const raiz = ponto > 0 ? nome.slice(0, ponto) : nome;
    const ext = ponto > 0 ? nome.slice(ponto) : '';
    usados[nome] += 1;
    return raiz + '-' + usados[nome] + ext;
  }

  function reunir(fotos, porPasta) {
    const usados = {};
    return fotos.reduce(function (corrente, f) {
      return corrente.then(function (lista) {
        return Fotos.ler(f.id).then(function (r) {
          if (!r || !r.original) return lista;
          const dia = DADOS.dia(f.dia);
          const pasta = porPasta && dia ? 'dia-' + dia.numero + '/' : '';
          /* Dentro da pasta do dia, o nome não repete o dia. */
          const nome = pasta ? UI.nomeDeFoto(f, r.tipo).replace(/^dia-\d+-?/, '') : UI.nomeDeFoto(f, r.tipo);
          lista.push({
            nome: semRepetir(usados, pasta + nome),
            blob: r.original,
            data: new Date(f.criado)
          });
          return lista;
        }).catch(function () { return lista; });
      });
    }, Promise.resolve([]));
  }

  function descarregarZip(fotos, nomeZip, porPasta) {
    const comFicheiro = fotos.filter(function (f) { return !!f.id; });
    if (!comFicheiro.length) {
      UI.abrirFolha('Nada para descarregar',
        '<p class="corpo-ui silencioso">Ainda não há fotografias guardadas neste telemóvel.</p>');
      return;
    }

    UI.abrirFolha('A preparar o ficheiro',
      '<p class="corpo-ui silencioso">' + UI.plural(comFicheiro.length, 'fotografia', 'fotografias') +
        ', em qualidade original.</p>' +
      '<p class="meta num" style="margin-top:16px" id="zip-conta">0 de ' + comFicheiro.length + '</p>');

    const conta = document.getElementById('zip-conta');
    reunir(comFicheiro, porPasta).then(function (lista) {
      return Zip.criar(lista, function (feitos, total) {
        if (conta) conta.textContent = feitos + ' de ' + total;
      });
    }).then(function (blob) {
      UI.fecharFolha();
      UI.descarregar(nomeZip, blob, 'application/zip');
    }).catch(function (e) {
      UI.abrirFolha('Ficheiro grande demais',
        '<p class="corpo-ui silencioso">São fotografias a mais para um ficheiro só. ' +
        'Descarregue dia a dia.</p>');
    });
  }

  function nomeDoPasseio() {
    return UI.talho(DADOS.evento.nome || 'passeio') || 'passeio';
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
          '<div class="grelha-fotos">' + f.map(celula).join('') + '</div>' +
          (f.some(function (x) { return !!x.id; })
            ? '<button class="botao botao--texto" style="margin-top:12px" type="button" ' +
              'data-acao="descarregarDia" data-valor="' + d.id + '">' +
              Icone('descarregar', 20) + 'Descarregar o dia</button>'
            : '') +
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
          (DADOS.evento.subtitulo ? '<p class="cert__sub">' + UI.h(DADOS.evento.subtitulo) + '</p>' : '') +
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
          UI.logo('logo--album', 'margin-top:32px') +
          '<h1 class="capa-titulo" style="margin-top:20px">' +
            (DADOS.evento.inicio ? DADOS.evento.inicio.slice(0, 4) : DADOS.evento.ano) + '</h1>' +
          '<p class="subtitulo" style="margin-top:12px">' + UI.h(DADOS.evento.subtitulo || UI.intervaloEvento()) + '</p>' +
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
    montar: function (el) { Fotos.pintar(el); },
    desmontar: function () { Fotos.libertarTodos(); },
    acoes: {
      descarregar: function () {
        descarregarZip(Estado.fotos(), nomeDoPasseio() + '-album.zip', true);
      },
      descarregarDia: function (diaId) {
        const d = DADOS.dia(diaId);
        const fotos = Estado.fotos().filter(function (f) { return f.dia === diaId; });
        descarregarZip(fotos, nomeDoPasseio() + '-dia-' + (d ? d.numero : '') + '.zip', false);
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
