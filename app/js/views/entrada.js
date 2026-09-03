/* =========================================================
   Entrada — sem palavras-passe
   Código por email. A app não guarda credenciais.
   ========================================================= */

Vistas.entrada = (function () {
  let passo = 'identificacao';
  let rascunho = { nome: '', email: '' };

  function html() {
    return '<div class="entrada">' +
      '<div>' +
        '<p class="assinatura-am">Aston Martin</p>' +
      '</div>' +

      '<div>' +
        '<h1 class="capa-titulo">' + UI.h(DADOS.evento.nome || 'Passeio') + '.' +
          (DADOS.dias.length ? '<br>' + UI.plural(DADOS.dias.length, 'dia', 'dias') + '.' : '') + '</h1>' +
        '<p class="subtitulo" style="margin-top:12px">' + UI.intervaloEvento() + '</p>' +
      '</div>' +

      (passo === 'identificacao' ? formIdentificacao() : formCodigo()) +
    '</div>';
  }

  function formIdentificacao() {
    return '<form id="form-entrada" class="pilha-3" novalidate>' +
      '<label class="campo">' +
        '<span class="campo__rotulo">Nome</span>' +
        '<input class="campo__entrada" name="nome" autocomplete="name" required value="' + UI.h(rascunho.nome) + '" placeholder="Nome próprio e apelido">' +
      '</label>' +
      '<label class="campo">' +
        '<span class="campo__rotulo">Email</span>' +
        '<input class="campo__entrada" name="email" type="email" autocomplete="email" inputmode="email" required value="' + UI.h(rascunho.email) + '" placeholder="nome@exemplo.pt">' +
      '</label>' +
      '<button class="botao botao--principal botao--largo" type="submit">Receber código</button>' +
      '<p class="meta" style="text-align:center">O código chega por email e por mensagem. Não há palavra-passe.</p>' +
    '</form>';
  }

  function formCodigo() {
    return '<form id="form-codigo" class="pilha-3" novalidate>' +
      '<div>' +
        '<p class="campo__rotulo">Código enviado para</p>' +
        '<p class="corpo-ui">' + UI.h(rascunho.email) + '</p>' +
      '</div>' +
      '<div class="codigo-campos">' +
        '<input inputmode="numeric" maxlength="1" aria-label="Dígito 1">' +
        '<input inputmode="numeric" maxlength="1" aria-label="Dígito 2">' +
        '<input inputmode="numeric" maxlength="1" aria-label="Dígito 3">' +
        '<input inputmode="numeric" maxlength="1" aria-label="Dígito 4">' +
        '<input inputmode="numeric" maxlength="1" aria-label="Dígito 5">' +
        '<input inputmode="numeric" maxlength="1" aria-label="Dígito 6">' +
      '</div>' +
      '<button class="botao botao--principal botao--largo" type="submit">Entrar</button>' +
      '<button class="botao botao--texto" type="button" data-acao="recuar" style="width:100%">Corrigir o email</button>' +
    '</form>';
  }

  function montar(el) {
    const fi = el.querySelector('#form-entrada');
    if (fi) {
      fi.addEventListener('submit', function (e) {
        e.preventDefault();
        rascunho.nome = fi.nome.value.trim();
        rascunho.email = fi.email.value.trim();
        if (!rascunho.nome || !rascunho.email) return;
        passo = 'codigo';
        App.repintar();
      });
    }

    const fc = el.querySelector('#form-codigo');
    if (fc) {
      const campos = Array.prototype.slice.call(fc.querySelectorAll('.codigo-campos input'));
      campos[0].focus();
      campos.forEach(function (c, i) {
        c.addEventListener('input', function () {
          c.value = c.value.replace(/\D/g, '');
          if (c.value && campos[i + 1]) campos[i + 1].focus();
        });
        c.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !c.value && campos[i - 1]) campos[i - 1].focus();
        });
      });
      fc.addEventListener('submit', function (e) {
        e.preventDefault();
        /* Qualquer código é aceite nesta versão de demonstração.
           A ficha do convidado é a que a organização criou: procura-se
           pelo email e é dela que vem o carro. */
        const ficha = Estado.associarPorEmail(rascunho.email);
        Estado.definir({
          autenticado: true,
          participanteId: ficha ? ficha.id : '',
          perfil: {
            nome: ficha ? DADOS.nomeCompleto(ficha) : rascunho.nome,
            email: rascunho.email,
            telefone: ficha ? (ficha.telefone || '') : ''
          }
        });
      });
    }
  }

  return {
    semNav: true,
    semCabecalho: true,
    html: html,
    montar: montar,
    acoes: {
      recuar: function () { passo = 'identificacao'; App.repintar(); }
    }
  };
})();
