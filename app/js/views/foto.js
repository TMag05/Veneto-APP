/* =========================================================
   Uma fotografia, em ecrã próprio
   Tem endereço, como tudo o resto: #/foto/id. O que se
   descarrega é o ficheiro de origem, nunca a redução — é essa
   a razão de ser desta parte da app.
   ========================================================= */

(function () {

  function meta(id) {
    return Estado.fotos().find(function (f) { return f.id === id; }) || null;
  }

  function autorDe(f) {
    if (f.propria) return Estado.eu();
    if (f.autor === 'organizacao') return { nome: DADOS.evento.nome || 'Do passeio', semCarro: true };
    const p = DADOS.participante(f.autor);
    return p ? { nome: DADOS.nomeCompleto(p), modelo: p.modelo, cor: p.cor } : { nome: 'Do grupo', modelo: 'db12', cor: 'onyx' };
  }

  function deAbertura(f) { return !f.propria && f.autor === 'organizacao'; }

  function hora(t) {
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
  }

  function podeApagar(f) {
    return !!f.propria || Estado.ehOrganizacao();
  }

  Vistas.foto = {
    nav: 'galeria',
    cabecalho: { voltar: '#/galeria', titulo: 'Fotografia' },
    html: function (p) {
      const f = meta(p.id);
      if (!f) {
        return '<div class="faixa" style="padding-top:24px">' +
          '<p class="corpo-editorial">Esta fotografia já não está aqui.</p>' +
          '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/galeria">Voltar à galeria</a>' +
        '</div>';
      }

      const a = autorDe(f);
      const dia = DADOS.dia(f.dia);
      const poi = f.poi && POIS[f.poi] ? POIS[f.poi].nome : '';
      const linha = [poi, dia ? 'Dia ' + dia.numero : '', hora(f.criado)].filter(Boolean).join(' · ');

      return '<div class="foto-ecra">' +
          '<img class="foto-ecra__base" data-foto="' + UI.h(f.id) + '" data-tamanho="mini" alt="" aria-hidden="true">' +
          '<img class="foto-ecra__vista" data-foto="' + UI.h(f.id) + '" data-tamanho="vista" decoding="async" ' +
            'alt="Fotografia de ' + UI.h(a.nome) + (poi ? ', ' + UI.h(poi) : '') + '">' +
        '</div>' +

        '<div class="faixa" style="margin-top:20px">' +
          '<div class="foto-autor">' +
            (a.semCarro ? '' : '<span class="foto-autor__carro">' + Silhuetas.svg(a.modelo, a.cor, { rodas: false, titulo: a.nome }) + '</span>') +
            '<div>' +
              '<p class="titulo-ui">' + UI.h(a.nome) + '</p>' +
              (linha ? '<p class="meta num">' + UI.h(linha) + '</p>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:24px">' +
          '<button class="botao botao--radicchio botao--largo" type="button" data-acao="descarregar" data-valor="' + UI.h(f.id) + '">' +
            Icone('descarregar', 20) + 'Descarregar</button>' +
          '<p class="meta" style="margin-top:12px">O ficheiro de origem, como saiu da câmara.' +
            (f.estadoEnvio === 'enviado' ? '' : ' Ainda só existe neste telemóvel.') + '</p>' +
        '</div>' +

        (podeApagar(f)
          ? '<div class="faixa" style="margin-top:32px">' +
              '<button class="botao botao--texto botao--apagar" type="button" data-acao="apagar" data-valor="' + UI.h(f.id) + '">' +
                Icone('apagar', 20) + 'Apagar</button>' +
            '</div>'
          : '');
    },

    montar: function (el) {
      Fotos.pintar(el);
      /* A miniatura já carregada segura o lugar; a vista entra por
         cima quando chegar. */
      const v = el.querySelector('.foto-ecra__vista');
      if (v) v.addEventListener('load', function () { v.dataset.pronta = 'sim'; });
    },
    desmontar: function () { Fotos.libertarTodos(); },

    acoes: {
      descarregar: function (id) {
        const f = meta(id);
        if (!f) return;
        Fotos.ler(id).then(function (r) {
          if (!r || !r.original) return;
          UI.descarregar(UI.nomeDeFoto(f, r.tipo), r.original, r.tipo);
        });
      },

      /* Nunca ao primeiro toque. */
      apagar: function (id) {
        const f = meta(id);
        if (!f) return;
        UI.abrirFolha('Apagar a fotografia',
          '<p class="corpo-ui silencioso">' +
            (f.propria ? 'Sai do álbum do grupo e do seu telemóvel.' : 'Sai do álbum do grupo, para toda a gente.') +
          ' Não se recupera.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-apagar-foto">Apagar</button>');
        document.getElementById('btn-apagar-foto').addEventListener('click', function () {
          UI.fecharFolha();
          /* As de abertura são conteúdo do passeio, não estado de quem
             as tirou: saem por onde entraram. */
          if (deAbertura(f)) Conteudo.removerFotoInicial(id);
          else Estado.apagarFoto(id);
          App.ir('#/galeria');
        });
      }
    }
  };
})();
