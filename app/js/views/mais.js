/* =========================================================
   Mais e definições
   ========================================================= */

(function () {

  Vistas.mais = {
    nav: 'mais',
    cabecalho: { titulo: 'Mais' },
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
              (carro ? UI.h(Silhuetas.modelo(carro.modelo).nome) : 'Sem carro associado') + '</p>' +
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
            UI.linhaLista({ titulo: 'O meu carro', nota: carro ? Silhuetas.modelo(carro.modelo).nome + ' · ' + Silhuetas.cor(carro.cor).nome : 'Sem carro associado', icone: 'carro', href: '#/carro' }) +
            UI.linhaLista({ titulo: 'Perfil', nota: e.perfil.email, icone: 'pessoas', href: '#/perfil' }) +
            UI.linhaLista({ titulo: 'O que levar', nota: UI.plural(DADOS.levar.length, 'item', 'itens'), icone: 'documento', href: '#/preparacao' }) +
            UI.linhaLista({ titulo: 'Arquivo', nota: 'Álbum e roadbook', icone: 'galeria', href: '#/arquivo' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<a class="botao botao--rosso botao--largo" href="#/sos">' + Icone('alerta', 20) + 'Assistência imediata</a>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="lista">' +
            (Estado.ehOrganizacao()
              ? UI.linhaLista({ titulo: 'Área da organização', nota: 'Itinerário, pessoas, contactos', icone: 'oficina', href: '#/org/itinerario' })
              : '') +
            UI.linhaLista({ titulo: 'Definições', nota: 'Organização, demonstração', icone: 'definicoes', href: '#/definicoes' }) +
          '</div>' +
          '<p class="meta" style="margin-top:24px">' + UI.h(DADOS.evento.nome || 'Passeio') + ' · versão de trabalho' +
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

  /* Construída a partir do itinerário que existir. */
  function fases() {
    return [{ id: 'auto', rotulo: 'Real' }, { id: 'pre', rotulo: 'Pré-evento' }]
      .concat(DADOS.dias.map(function (d) { return { id: d.id, rotulo: 'Dia ' + d.numero }; }))
      .concat([{ id: 'pos', rotulo: 'Pós-evento' }]);
  }

  Vistas.definicoes = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Definições', tituloSempre: true },
    html: function () {
      const e = Estado.get();

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

        '<div class="faixa faixa--recuada" style="margin-top:48px">' +
          '<h2 class="etiqueta">Demonstração</h2>' +
          '<p class="corpo-ui silencioso" style="margin-top:8px">Para mostrar a app fora das datas do evento. ' +
            'Não existe na versão entregue aos convidados.</p>' +

          '<h3 class="etiqueta" style="margin-top:24px">Momento</h3>' +
          '<div class="escolhas" style="margin-top:12px">' + fases().map(function (f) {
            return '<button class="escolha" type="button" data-acao="fase" data-valor="' + f.id + '" ' +
              'aria-pressed="' + (e.demoFase === f.id ? 'true' : 'false') + '">' + f.rotulo + '</button>';
          }).join('') + '</div>' +

          '<div class="lista" style="margin-top:24px">' +
            UI.linhaLista({ titulo: 'Carregar passeio de exemplo', nota: 'Quatro etapas nas Dolomitas', icone: 'juntar', acao: 'exemplo' }) +
            UI.linhaLista({ titulo: 'Repor tudo', nota: 'Apaga o conteúdo e o estado local', icone: 'fechar', acao: 'repor' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:48px">' +
          '<h2 class="etiqueta">Sobre</h2>' +
          '<p class="corpo-editorial" style="margin-top:12px">Aplicação do passeio Aston Martin' +
            (DADOS.evento.nome ? ' — ' + UI.h(DADOS.evento.nome) : '') + '. ' +
            'Identidade Pietra e Vigna, versão de trabalho.</p>' +
          '<p class="meta" style="margin-top:12px">Funciona sem rede. O conteúdo do dia é pré-carregado de manhã.</p>' +
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
      },
      fase: function (f) { Estado.definir({ demoFase: f }); },

      exemplo: function () {
        UI.abrirFolha('Carregar exemplo',
          '<p class="corpo-ui silencioso">Substitui o conteúdo atual por um passeio completo de quatro etapas nas Dolomitas, com participantes e contactos. Serve para mostrar a app; não é o roadbook real.</p>' +
          '<button class="botao botao--principal botao--largo" style="margin-top:24px" type="button" id="btn-exemplo">Carregar</button>');
        document.getElementById('btn-exemplo').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.carregarExemplo();
          Estado.definir({ demoFase: 'auto' });
          App.ir('#/hoje');
        });
      },

      repor: function () {
        UI.abrirFolha('Repor tudo',
          '<p class="corpo-ui silencioso">Apaga o itinerário, os participantes, os contactos, as chegadas e as fotografias guardadas neste telemóvel.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-repor">Repor</button>');
        document.getElementById('btn-repor').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.repor();
          Estado.reiniciar();
          location.hash = '#/entrada';
        });
      }
    }
  };

})();
