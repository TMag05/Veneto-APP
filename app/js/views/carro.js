/* =========================================================
   O carro e o perfil
   A identidade na app começa no carro — o que o convidado
   escolheu ao criar o acesso. Havendo ficha da organização com
   o mesmo email, é dela que vêm a matrícula e quem viaja junto.
   ========================================================= */

(function () {

  /* O carro troca-se aqui mesmo, sem folha por cima. */
  let aTrocar = false;

  function escolha(carro) {
    return '<div class="faixa">' +
      '<div class="cartao">' +
        UI.escolhaCarro(carro ? carro.modelo : '') +
        (carro ? '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="fecharTroca">Feito</button>' : '') +
      '</div>' +
    '</div>';
  }

  Vistas.carro = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'O meu carro' },
    desmontar: function () { aTrocar = false; },
    html: function () {
      const carro = Estado.meuCarro();
      const eu = Estado.euParticipante();

      if (!carro) {
        return '<div class="capa">' +
            UI.foto({ semente: 'sem-carro', variante: 'paisagem' }, 'foto--32 capa__imagem') +
            '<div class="capa__texto">' +
              '<h1 class="capa-titulo">O meu carro</h1>' +
              '<p class="subtitulo" style="margin-top:8px">Escolha o modelo.</p>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:24px">' + escolha(null) + '</div>';
      }

      const outros = carro.perfis.filter(function (n) {
        return n !== Estado.get().perfil.nome && (!eu || n !== DADOS.nomeCompleto(eu));
      });

      return '<div class="capa">' +
          UI.foto({ semente: carro.modelo || 'carro', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="capa-titulo">' + UI.h(Silhuetas.modelo(carro.modelo).nome) + '</h1>' +
            (carro.matricula ? '<p class="subtitulo" style="margin-top:8px">' + UI.h(carro.matricula) + '</p>' : '') +
          '</div>' +
        '</div>' +

        '<div class="faixa" style="margin-top:8px">' +
          '<div style="max-width:280px;margin:0 auto">' + Silhuetas.svg(carro.modelo) + '</div>' +
          '<p class="meta" style="margin-top:16px">' +
            'Nas fotografias do grupo, é o carro que identifica quem as tirou.' + '</p>' +
        '</div>' +

        (outros.length
          ? '<div class="faixa">' +
              '<div class="seccao-cabecalho"><h2 class="etiqueta">Viaja também neste carro</h2>' +
                (carro.equipa ? '<span class="meta num">' + UI.h(carro.equipa) + '</span>' : '') + '</div>' +
              '<div class="lista">' +
                outros.map(function (nome) {
                  return UI.linhaLista({ titulo: nome, icone: 'pessoas', acao: 'nada' });
                }).join('') +
              '</div>' +
            '</div>'
          : '') +

        (aTrocar
          ? escolha(carro)
          : '<div class="faixa">' +
              '<div class="cartao">' +
                '<p class="etiqueta">Algum dado incorreto?</p>' +
                '<p class="corpo-ui" style="margin-top:8px">O modelo troca-se aqui. ' +
                  (carro.matricula ? 'A matrícula é registada pela organização.' : 'A matrícula não é pedida.') + '</p>' +
                '<button class="botao botao--texto" type="button" data-acao="trocar">Trocar modelo &rsaquo;</button>' +
              '</div>' +
            '</div>');
    },
    acoes: {
      nada: function () { /* linhas de leitura */ },
      trocar: function () { aTrocar = true; App.repintar(); },
      fecharTroca: function () { aTrocar = false; App.repintar(); },
      modelo: function (id) { Estado.atualizarPerfil({ modelo: id }); }
    }
  };

  /* ---------------------------------------------------------
     Perfil — nome e contacto. Nada mais.
     --------------------------------------------------------- */

  Vistas.perfil = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'Perfil', tituloSempre: true },
    html: function () {
      const p = Estado.get().perfil;
      const ficha = Estado.euParticipante();

      return '<div class="capa">' +
          UI.foto({ dataUrl: ficha && ficha.foto, semente: p.nome || 'perfil', variante: 'paisagem' }, 'foto--32 capa__imagem') +
          '<div class="capa__texto">' +
            '<h1 class="titulo-editorial">Perfil</h1>' +
            '<p class="corpo-ui silencioso" style="margin-top:8px">Nome e contacto. Nada mais.</p>' +
          '</div>' +
        '</div>' +
          '<form id="form-perfil" class="pilha-2 faixa" style="margin-top:24px">' +
            '<label class="campo"><span class="campo__rotulo">Nome</span>' +
              '<input class="campo__entrada" name="nome" value="' + UI.h(p.nome) + '" autocomplete="name"></label>' +
            '<label class="campo"><span class="campo__rotulo">Email</span>' +
              '<input class="campo__entrada" name="email" type="email" value="' + UI.h(p.email) + '" readonly aria-describedby="nota-email">' +
              '<span class="meta campo__nota" id="nota-email">É o email com que entra na app.</span></label>' +
            '<label class="campo"><span class="campo__rotulo">Telemóvel</span>' +
              '<input class="campo__entrada" name="telefone" type="tel" value="' + UI.h(p.telefone) + '" autocomplete="tel" placeholder="+351"></label>' +
            '<button class="botao botao--principal botao--largo" type="submit">Guardar</button>' +
          '</form>' +
          '<div class="faixa">' +
          (ficha
            ? '<p class="meta">Ficha da organização: ' + UI.h(DADOS.nomeCompleto(ficha)) +
                ', carro ' + UI.h(ficha.equipa || '—') + '.</p>'
            : '') +
          '</div>';
    },
    montar: function (el) {
      const f = el.querySelector('#form-perfil');
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        Estado.atualizarPerfil({ nome: f.nome.value.trim() || Estado.get().perfil.nome, telefone: f.telefone.value.trim() });
        App.voltar('#/mais');
      });
    }
  };
})();
