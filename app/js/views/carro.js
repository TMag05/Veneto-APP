/* =========================================================
   O carro e o perfil
   A identidade na app começa no carro — e o carro vem da ficha
   que a organização criou. O convidado não o regista: encontra-o
   já lá quando entra, pelo email.
   ========================================================= */

(function () {

  Vistas.carro = {
    nav: 'mais',
    cabecalho: { voltar: '#/mais', titulo: 'O meu carro' },
    html: function () {
      const carro = Estado.meuCarro();
      const eu = Estado.euParticipante();

      if (!carro) {
        return '<div class="faixa" style="padding-top:24px">' +
            '<h1 class="capa-titulo">O meu carro</h1>' +
            '<p class="subtitulo" style="margin-top:8px">Ainda não está associado.</p>' +
            '<p class="corpo-editorial" style="margin-top:24px">O carro é registado pela organização, com o modelo, a cor e a matrícula. ' +
              'Se não aparece aqui, é porque o email com que entrou não coincide com o da lista.</p>' +
            '<a class="botao botao--secundario botao--largo" style="margin-top:32px" href="#/concierge">Falar com a organização</a>' +
          '</div>';
      }

      const companheiros = carro.perfis.filter(function (n) {
        return !eu || n !== DADOS.nomeCompleto(eu);
      });

      return '<div class="faixa" style="padding-top:24px">' +
          '<div style="max-width:320px;margin:0 auto">' + Silhuetas.svg(carro.modelo, carro.cor) + '</div>' +
          '<h1 class="titulo-poi" style="text-align:center;margin-top:24px">' + UI.h(Silhuetas.modelo(carro.modelo).nome) + '</h1>' +
          '<p class="subtitulo" style="text-align:center;margin-top:4px">' + UI.h(Silhuetas.cor(carro.cor).nome) + '</p>' +
          (carro.matricula ? '<p class="meta num" style="text-align:center;margin-top:8px">' + UI.h(carro.matricula) + '</p>' : '') +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Neste carro</h2>' +
            '<span class="meta num">' + UI.h(carro.equipa) + '</span></div>' +
          '<div class="lista">' +
            carro.perfis.map(function (nome) {
              const proprio = eu && nome === DADOS.nomeCompleto(eu);
              return UI.linhaLista({
                titulo: nome,
                nota: proprio ? 'Este é o seu perfil' : 'Partilha o carro consigo',
                icone: 'pessoas',
                href: proprio ? '#/perfil' : undefined,
                acao: proprio ? undefined : 'nada'
              });
            }).join('') +
          '</div>' +
          '<p class="meta" style="margin-top:16px">' +
            (companheiros.length
              ? 'No mapa mostra-se o carro. Na galeria mostra-se quem tirou a fotografia.'
              : 'No mapa mostra-se o carro, não as pessoas.') + '</p>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="cartao">' +
            '<p class="etiqueta">Algo errado?</p>' +
            '<p class="corpo-ui" style="margin-top:8px">Modelo, cor e matrícula são registados pela organização. ' +
              'Peça a correção pelo concierge.</p>' +
            '<a class="botao botao--texto" href="#/concierge">Abrir o concierge &rsaquo;</a>' +
          '</div>' +
        '</div>';
    },
    acoes: {
      nada: function () { /* linhas de leitura */ }
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

      return '<div class="faixa" style="padding-top:24px">' +
          '<h1 class="titulo-editorial">Perfil</h1>' +
          '<p class="corpo-ui silencioso" style="margin-top:8px">Nome e contacto. Nada mais.</p>' +
          '<form id="form-perfil" class="pilha-2" style="margin-top:24px">' +
            '<label class="campo"><span class="campo__rotulo">Nome</span>' +
              '<input class="campo__entrada" name="nome" value="' + UI.h(p.nome) + '" autocomplete="name"></label>' +
            '<label class="campo"><span class="campo__rotulo">Email</span>' +
              '<input class="campo__entrada" name="email" type="email" value="' + UI.h(p.email) + '" autocomplete="email"></label>' +
            '<label class="campo"><span class="campo__rotulo">Telemóvel</span>' +
              '<input class="campo__entrada" name="telefone" type="tel" value="' + UI.h(p.telefone) + '" autocomplete="tel" placeholder="+351"></label>' +
            '<button class="botao botao--principal botao--largo" type="submit">Guardar</button>' +
          '</form>' +
          (ficha
            ? '<p class="meta" style="margin-top:24px">Está associado à ficha ' + UI.h(DADOS.nomeCompleto(ficha)) +
                ', carro ' + UI.h(ficha.equipa || '—') + '.</p>'
            : '<p class="meta" style="margin-top:24px">O email não coincide com nenhuma ficha da organização, por isso não há carro associado.</p>') +
        '</div>';
    },
    montar: function (el) {
      const f = el.querySelector('#form-perfil');
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        Estado.definir({ perfil: { nome: f.nome.value.trim(), email: f.email.value.trim(), telefone: f.telefone.value.trim() } });
        Estado.enfileirar('perfil', 'Atualização do perfil');
        App.voltar('#/mais');
      });
    }
  };
})();
