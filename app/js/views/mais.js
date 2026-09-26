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
      tema: function (t) { Estado.definir({ tema: t === 'claro' ? 'claro' : 'escuro' }); }
    },
    html: function () {
      const e = Estado.get();
      const fase = Estado.fase();
      const carro = Estado.meuCarro();
      const eu = Estado.euParticipante();

      return '<div class="capa">' +
          UI.foto({ dataUrl: eu && eu.foto, semente: e.perfil.nome || 'convidado', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">' + UI.h(e.perfil.nome || 'Convidado') + '</h1>' +
            '<p class="subtitulo" style="margin-top:8px">' +
              (carro ? UI.h(Silhuetas.modelo(carro.modelo).nome) : 'Carro por escolher') + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:32px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Durante o passeio</h2></div>' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Concierge', nota: 'Pedidos à equipa', icone: 'mensagem', href: '#/concierge' }) +
            UI.linhaLista({ titulo: 'Contactos', nota: 'Organização, assistência, hotel', icone: 'telefone', href: '#/contactos' }) +
            UI.linhaLista({ titulo: 'Participantes', nota: DADOS.carros.length + ' carros', icone: 'pessoas', href: '#/participantes' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">O meu</h2></div>' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'O meu carro', nota: carro ? Silhuetas.modelo(carro.modelo).nome + ' · ' + Silhuetas.cor(carro.cor).nome : 'Carro por escolher', icone: 'carro', href: '#/carro' }) +
            UI.linhaLista({ titulo: 'Perfil', nota: e.perfil.email, icone: 'pessoas', href: '#/perfil' }) +
            UI.linhaLista({ titulo: 'O que levar', nota: UI.plural(DADOS.levar.length, 'item', 'itens'), icone: 'documento', href: '#/preparacao' }) +
            UI.linhaLista({ titulo: 'Arquivo', nota: 'Álbum e roadbook', icone: 'galeria', href: '#/arquivo' }) +
          '</div>' +
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
            (Estado.ehOrganizacao()
              ? UI.linhaLista({ titulo: 'Área da organização', nota: 'Itinerário, pessoas, contactos', icone: 'oficina', href: '#/org/itinerario' })
              : '') +
            UI.linhaLista({ titulo: 'Definições', nota: 'Organização e aspeto', icone: 'definicoes', href: '#/definicoes' }) +
          '</div>' +
          '<p class="meta num" style="margin-top:24px">' + UI.h(DADOS.evento.nome || 'Passeio') + ' · versão ' + versao() +
            (fase === 'pre' ? ' · pré-evento' : (fase === 'pos' ? ' · pós-evento' : '')) + '</p>' +
        '</div>';
    }
  };

  /* ---------------------------------------------------------
     Definições
     --------------------------------------------------------- */

  /* Provisório: um código partilhado. Não é segurança — é uma
     porta. A segurança vem com contas no servidor. */
  const CODIGO_ORGANIZACAO = '2026';

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

        '<div class="faixa" style="margin-top:24px">' +
          '<h2 class="etiqueta">Organização</h2>' +
          '<p class="corpo-ui silencioso" style="margin-top:8px">Quem organiza o passeio entra aqui para criar o itinerário, registar participantes e gerir contactos.</p>' +
          '<div class="lista" style="margin-top:16px">' +
            (Estado.ehOrganizacao()
              ? UI.linhaLista({ titulo: 'Abrir a área da organização', nota: 'Sessão iniciada', icone: 'oficina', href: '#/org/itinerario' })
              : UI.linhaLista({ titulo: 'Entrar na área da organização', nota: 'Requer código', icone: 'selado', acao: 'entrarOrg' })) +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:48px">' +
          '<h2 class="etiqueta">Sobre</h2>' +
          '<p class="corpo-editorial" style="margin-top:12px">Aplicação do passeio Aston Martin' +
            (DADOS.evento.nome ? ' — ' + UI.h(DADOS.evento.nome) : '') + '.</p>' +
          '<p class="meta" style="margin-top:12px">Funciona sem rede. O programa do dia fica no telemóvel desde manhã.</p>' +
        '</div>';
    },
    acoes: {
      /* Porta de entrada provisória. Com servidor passa a ser conta
         própria, com registo de quem alterou o quê. */
      entrarOrg: function () {
        UI.abrirFolha('Área da organização',
          '<p class="corpo-ui silencioso">Reservada à equipa que organiza o passeio. Os dados de carta e apólice dos participantes só existem aqui.</p>' +
          '<div style="margin-top:24px">' +
            UI.campo({ rotulo: 'Código', nome: 'codigo', valor: '', placeholder: '••••' }) +
          '</div>' +
          '<button class="botao botao--principal botao--largo" style="margin-top:24px" type="button" id="btn-org">Entrar</button>' +
          '<p class="meta" style="margin-top:16px" id="msg-org"></p>');

        document.getElementById('btn-org').addEventListener('click', function () {
          const v = document.querySelector('#folha [data-campo="codigo"]').value.trim();
          if (v !== CODIGO_ORGANIZACAO) {
            document.getElementById('msg-org').textContent = 'Código incorreto.';
            return;
          }
          UI.fecharFolha();
          Estado.definir({ papel: 'organizacao' });
          App.ir('#/org/itinerario');
        });
      }
    }
  };

})();
