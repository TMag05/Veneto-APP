/* =========================================================
   Fotografias de abertura
   Publicadas antes da revelação de cada dia. Não são um extra:
   são o que faz o álbum arrancar. Ninguém quer ser o primeiro a
   pôr uma fotografia num dia vazio.
   ========================================================= */

(function () {

  /* O dia que está à espera do ficheiro escolhido. */
  let diaEmCurso = '';

  function doDia(id) {
    return (DADOS.fotosIniciais || []).filter(function (f) { return f.dia === id; });
  }

  function celula(f) {
    return '<div class="grelha-fotos__celula">' +
      '<img data-foto="' + UI.h(f.id) + '" data-tamanho="mini" loading="lazy" decoding="async" alt="">' +
      '<button class="grelha-fotos__tirar" type="button" data-acao="remover" data-valor="' + UI.h(f.id) + '" ' +
        'aria-label="Remover fotografia">' + Icone('fechar', 16) + '</button>' +
    '</div>';
  }

  Vistas.orgFotos = {
    area: 'organizacao',
    nav: 'org-itinerario',
    cabecalho: { voltar: '#/org/itinerario', titulo: 'Fotografias de abertura', tituloSempre: true },
    html: function () {
      const dias = DADOS.dias;

      if (!dias.length) {
        return '<div class="faixa" style="padding-top:24px">' +
          '<p class="corpo-editorial">Ainda não há etapas. Crie o itinerário primeiro.</p>' +
        '</div>';
      }

      return '<div class="faixa" style="padding-top:24px">' +
          '<p class="corpo-ui silencioso">Uma ou duas por dia, publicadas antes de o dia abrir. ' +
            'São elas que começam o álbum.</p>' +
        '</div>' +

        dias.map(function (d) {
          const f = doDia(d.id);
          return '<div class="faixa">' +
            '<div class="seccao-cabecalho">' +
              '<h2 class="titulo-ui">Dia ' + d.numero + (d.titulo ? ' · ' + UI.h(d.titulo) : '') + '</h2>' +
              '<span class="meta num">' + f.length + '</span>' +
            '</div>' +
            (f.length ? '<div class="grelha-fotos" style="margin-bottom:12px">' + f.map(celula).join('') + '</div>' : '') +
            '<button class="botao botao--secundario botao--largo" type="button" data-acao="juntar" data-valor="' + d.id + '">' +
              Icone('juntar', 20) + (f.length ? 'Juntar mais' : 'Escolher fotografias') + '</button>' +
          '</div>';
        }).join('') +

        '<div class="faixa">' +
          '<p class="meta">Guardadas neste telemóvel em tamanho original. Sobem com o resto do itinerário.</p>' +
        '</div>' +

        '<input type="file" id="ent-foto-dia" accept="image/*" multiple style="display:none">';
    },

    montar: function (el) {
      Fotos.pintar(el);

      const ent = el.querySelector('#ent-foto-dia');
      if (!ent) return;
      ent.addEventListener('change', function () {
        const ficheiros = Array.prototype.slice.call(ent.files || []);
        const dia = diaEmCurso;
        let porFazer = ficheiros.length;
        if (!porFazer) return;

        ficheiros.forEach(function (ficheiro) {
          UI.derivadas(ficheiro, [
            { nome: 'mini', lado: 320, qualidade: 0.7 },
            { nome: 'vista', lado: 1600, qualidade: 0.85 }
          ], function (d) {
            if (!d) { if (--porFazer === 0) App.repintar(); return; }
            const id = 'a' + Date.now() + Math.floor(Math.random() * 1000);
            Fotos.impressao(ficheiro).then(function (sha) {
              return Fotos.guardar({
                id: id, original: ficheiro, mini: d.mini, vista: d.vista, sha: sha,
                tipo: ficheiro.type || 'image/jpeg', largura: d.largura, altura: d.altura, criado: Date.now()
              }).then(function () { return sha; });
            }).then(function (sha) {
              Conteudo.juntarFotoInicial({
                id: id, autor: 'organizacao', autorId: 'organizacao', dia: dia, poi: '',
                sha: sha, criado: Date.now(), largura: d.largura, altura: d.altura,
                tamanho: ficheiro.size || 0, estadoEnvio: 'pendente'
              });
            }).catch(function () { /* não coube */ })
              .then(function () { if (--porFazer === 0) App.repintar(); });
          });
        });
        ent.value = '';
      });
    },
    desmontar: function () { Fotos.libertarTodos(); },

    acoes: {
      juntar: function (diaId) {
        diaEmCurso = diaId;
        document.getElementById('ent-foto-dia').click();
      },
      remover: function (id) {
        UI.abrirFolha('Remover a fotografia',
          '<p class="corpo-ui silencioso">Sai do álbum de abertura desse dia.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-tirar-foto">Remover</button>');
        document.getElementById('btn-tirar-foto').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.removerFotoInicial(id);
          App.repintar();
        });
      }
    }
  };
})();
