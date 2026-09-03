/* =========================================================
   A chegada — a primeira vez que a app se abre
   Uma vez por instalação, e só uma. É o equivalente digital
   de abrir a caixa: fotografia a toda a altura, o nome do
   convidado, as datas, e o carro dele em tamanho de objeto.
   ========================================================= */

(function () {

  Vistas.chegada = {
    semNav: true,
    semCabecalho: true,
    html: function () {
      const e = Estado.get();
      const carro = Estado.meuCarro();
      const nome = e.perfil.nome || 'Bem-vindo';
      const primeiro = nome.split(' ')[0];

      /* Uma fotografia real da primeira etapa, se existir. Se não,
         o poente — que é a hora em que a dolomia se acende. */
      const dia = DADOS.dias[0];
      const capa = (dia && dia.imagem && dia.imagem.dataUrl)
        ? dia.imagem
        : { variante: 'poente', semente: (DADOS.evento.nome || 'chegada') + '-capa' };

      return '<div class="chegada" style="background-image:' + UI.imagemDe(capa, 0.62) + '">' +
        '<div class="chegada__veu"></div>' +

        '<div class="chegada__corpo">' +
          '<p class="assinatura-am chegada__passo" style="--atraso:0.2s">Aston Martin</p>' +

          '<h1 class="capa-titulo chegada__titulo chegada__passo" style="--atraso:0.6s">' +
            UI.h(primeiro) + ',<br>' + UI.h(DADOS.evento.nome || 'o passeio') + '<br>espera por si.</h1>' +

          '<p class="chegada__data chegada__passo" style="--atraso:1.1s">' + UI.intervaloEvento() +
            (DADOS.evento.base ? ' · ' + UI.h(DADOS.evento.base) : '') + '</p>' +

          (carro
            ? '<div class="chegada__carro chegada__passo" style="--atraso:1.5s">' +
                Silhuetas.svg(carro.modelo, carro.cor) +
                '<p class="chegada__matricula num">' +
                  UI.h([Silhuetas.modelo(carro.modelo).nome, carro.matricula].filter(Boolean).join(' · ')) +
                '</p>' +
              '</div>'
            : '') +
        '</div>' +

        '<div class="chegada__fim chegada__passo" style="--atraso:2.1s">' +
          '<button class="botao botao--claro botao--largo" type="button" data-acao="entrar">Entrar</button>' +
        '</div>' +
      '</div>';
    },

    acoes: {
      entrar: function () {
        Estado.definir({ chegadaVista: true });
        App.substituir('#/hoje');
      }
    }
  };
})();
