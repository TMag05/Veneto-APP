/* =========================================================
   Mais e definições
   ========================================================= */

(function () {

  /* A versão que está de facto carregada, lida do endereço do próprio
     script — é o ?v= de index.html. Serve para confirmar, num telemóvel,
     que chegou a última publicação. */
  function versao() {
    const s = document.querySelector('script[src*="js/app.js"]');
    const m = s && s.src.match(/[?&]v=(\d+)/);
    return m ? m[1] : '';
  }

  Vistas.mais = {
    nav: 'mais',
    semCabecalho: true,
    acoes: {
      tema: function (t) { Estado.definir({ tema: t === 'claro' ? 'claro' : 'escuro' }); },
      instalar: function () { Instalar.pedir(); },
      sair: function () {
        const porta = Estado.ehOrganizacao() ? 'a porta da organização, no fim da entrada' : 'a entrada';
        UI.abrirFolha('Terminar sessão',
          '<p class="corpo-ui silencioso">Para voltar a entrar, use ' + porta + ', com o email e a palavra-passe.</p>' +
          '<button class="botao botao--principal botao--largo" style="margin-top:24px" type="button" id="btn-sair">Terminar sessão</button>');
        document.getElementById('btn-sair').addEventListener('click', function () {
          UI.fecharFolha();
          Estado.terminarSessao();
        });
      }
    },
    html: function () {
      const e = Estado.get();
      const fase = Estado.fase();
      const carro = Estado.meuCarro();
      const eu = Estado.euParticipante();
      const org = Estado.ehOrganizacao();
      /* A organização viaja em carros próprios: não há carro por escolher. */
      const doCarro = org ? 'Organização' : (carro ? Silhuetas.modelo(carro.modelo).nome : 'Carro por escolher');

      return '<div class="capa">' +
          UI.foto({ dataUrl: eu && eu.foto, semente: e.perfil.nome || 'convidado', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">' + UI.h(e.perfil.nome || 'Convidado') + '</h1>' +
            '<p class="subtitulo" style="margin-top:8px">' + UI.h(doCarro) + '</p>' +
          '</div>' +
        '</div>' +

        /* A equipa usa a app como os convidados; daqui passa à
           organização quando for preciso alterar alguma coisa. */
        (org
          ? '<div class="faixa" style="margin-top:32px">' +
              '<div class="lista">' +
                UI.linhaLista({ titulo: 'Modo organização', nota: 'Alterar o itinerário, as pessoas e os contactos', icone: 'oficina', href: '#/org/itinerario' }) +
              '</div>' +
            '</div>'
          : '') +

        '<div class="faixa" style="margin-top:32px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Durante o passeio</h2></div>' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Contactos', nota: 'Equipa, assistência, emergência', icone: 'telefone', href: '#/contactos' }) +
            UI.linhaLista({ titulo: 'Hotéis e restaurantes', nota: 'Telefones e moradas', icone: 'utensilios', href: '#/hoteis' }) +
            UI.linhaLista({ titulo: 'Participantes', nota: DADOS.carros.length + ' carros', icone: 'pessoas', href: '#/participantes' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">O meu</h2></div>' +
          '<div class="lista">' +
            (org ? '' : UI.linhaLista({ titulo: 'O meu carro', nota: doCarro, icone: 'carro', href: '#/carro' })) +
            UI.linhaLista({ titulo: 'Perfil', nota: e.perfil.email, icone: 'pessoas', href: '#/perfil' }) +
            UI.linhaLista({ titulo: 'O que levar', nota: 'Documentos e chaves', icone: 'documento', href: '#/preparacao' }) +
            UI.linhaLista({ titulo: 'Arquivo', nota: 'Álbum e roadbook', icone: 'galeria', href: '#/arquivo' }) +
          '</div>' +
        '</div>' +

        /* Fica sempre: instalada, é o tutorial para mostrar a quem
           não conseguiu à primeira. */
        '<div class="faixa">' +
          '<div class="lista">' + Instalar.linha(Instalar.instalada()
            ? 'Os passos, para mostrar a quem precisar'
            : 'Abre sem rede, como as outras apps') + '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Aspeto</h2></div>' +
          '<div class="escolhas">' +
            ['escuro', 'claro'].map(function (t) {
              return '<button class="escolha" type="button" data-acao="tema" data-valor="' + t + '" ' +
                'aria-pressed="' + ((e.tema || 'escuro') === t ? 'true' : 'false') + '">' +
                (t === 'escuro' ? 'Escuro' : 'Claro') + '</button>';
            }).join('') +
          '</div>' +
          '<p class="meta" style="margin-top:12px">O claro lê-se melhor ao sol; o escuro, à noite.</p>' +
        '</div>' +

        '<div class="faixa">' +
          '<a class="botao botao--rosso botao--largo" href="#/sos">' + Icone('alerta', 20) + 'Assistência imediata</a>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Definições', nota: 'Sobre a app', icone: 'definicoes', href: '#/definicoes' }) +
            UI.linhaLista({ titulo: 'Terminar sessão', nota: e.perfil.email, icone: 'fechar', acao: 'sair' }) +
          '</div>' +
          '<p class="meta num" style="margin-top:24px">' + UI.h(DADOS.evento.nome || 'Passeio') + ' · versão ' + versao() +
            (fase === 'pre' ? ' · pré-evento' : (fase === 'pos' ? ' · pós-evento' : '')) + '</p>' +
        '</div>';
    }
  };

  /* ---------------------------------------------------------
     Definições
     --------------------------------------------------------- */

  Vistas.definicoes = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Definições', tituloSempre: true },
    html: function () {
      return '<div class="capa">' +
          UI.foto({ semente: 'definicoes', variante: 'noite' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="titulo-editorial">Definições</h1>' +
          '</div>' +
        '</div>' +

        /* A organização entra pela sua porta, no fim da entrada;
           daqui só se volta à área dela. */
        (Estado.ehOrganizacao()
          ? '<div class="faixa" style="margin-top:24px">' +
              '<div class="lista">' +
                UI.linhaLista({ titulo: 'Modo organização', nota: 'Sessão iniciada', icone: 'oficina', href: '#/org/itinerario' }) +
              '</div>' +
            '</div>'
          : '') +

        '<div class="faixa" style="margin-top:' + (Estado.ehOrganizacao() ? '48' : '24') + 'px">' +
          '<h2 class="etiqueta">Sobre</h2>' +
          '<p class="corpo-editorial" style="margin-top:12px">Aplicação do passeio Aston Martin' +
            (DADOS.evento.nome ? ' — ' + UI.h(DADOS.evento.nome) : '') + '.</p>' +
          '<p class="meta" style="margin-top:12px">Funciona sem rede. O programa do dia fica no telemóvel desde manhã.</p>' +
        '</div>';
    }
  };

})();
