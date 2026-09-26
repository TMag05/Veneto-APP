/* =========================================================
   Entrada — #/entrar
   Um só link, partilhado no grupo do WhatsApp. Na primeira vez
   o convidado cria o seu acesso: nome, email, palavra-passe e o
   carro em que viaja. Nas seguintes, a sessão está no telemóvel
   e a app abre sem perguntar nada, com ou sem rede.

   O registo é aberto: não há lista, aprovação nem data de
   fecho. Quem fala com o servidor é Nuvem; este ecrã só pede,
   espera e diz o que aconteceu.

   A organização entra pela mesma forma, noutra porta —
   #/organizacao, com um botão discreto no fim desta. Sem a
   pergunta do carro: viaja em carros próprios. Só entra quem
   tiver o email na equipa.
   ========================================================= */

(function () {

function fabrica(org) {
  /* 'criar' | 'entrar' | 'recuperar' | 'recuperado' */
  let modo = null;
  let rascunho = null;
  let aEnviar = false;
  let mensagem = '';
  let senhaVisivel = false;

  const MENSAGENS = {
    'email-usado': 'Já existe um acesso com este email. Entre com a palavra-passe.',
    'email-invalido': 'Este email parece incompleto.',
    'senha-curta': 'A palavra-passe precisa de pelo menos seis caracteres.',
    'credenciais': 'O email ou a palavra-passe não estão certos.',
    'muitas-tentativas': 'Muitas tentativas seguidas. Tente de novo daqui a uns minutos.',
    'sem-rede': 'Sem ligação. É preciso rede só desta vez; depois, a app funciona sem ela.',
    'conta-apagada': 'Este acesso deixou de existir. Crie outro para continuar.',
    'fora-da-equipa': 'Este email não está na equipa da organização. Peça a quem já entrou que o acrescente.',
    'codigo-errado': 'O código da organização não está certo.',
    'outro': 'Não foi possível agora. Tente de novo dentro de momentos.'
  };

  /* Na app instalada no ecrã principal, quem chega quase sempre já
     criou o acesso no browser: no iPhone os dois não partilham a
     sessão. Abre-se logo em «Entrar». */
  function instalada() {
    return window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }

  function preparar() {
    if (rascunho) return;
    const e = Estado.get();
    rascunho = { nome: e.perfil.nome || '', email: e.perfil.email || '', senha: '', modelo: e.perfil.modelo || '', codigo: '' };
    /* A equipa é pequena e cria o acesso uma vez: quem volta a
       esta porta quase sempre já o tem. */
    modo = org || (instalada() && !e.aviso) ? 'entrar' : 'criar';
    mensagem = e.aviso ? MENSAGENS[e.aviso] || '' : '';
    aEnviar = false;
  }

  function html() {
    preparar();
    return '<div class="entrada">' +
      '<div>' +
        UI.logo('logo--entrada') +
        (DADOS.evento.subtitulo
          ? '<p class="subtitulo" style="margin-top:22px">' + UI.h(DADOS.evento.subtitulo) + '</p>' : '') +
        '<p class="meta num" style="margin-top:8px">' + UI.intervaloEvento() +
          (DADOS.dias.length ? ' · ' + UI.plural(DADOS.dias.length, 'dia', 'dias') : '') + '</p>' +
      '</div>' +

      ({ criar: formCriar, entrar: formEntrar, recuperar: formRecuperar, recuperado: recuperado })[modo]() +

      /* A outra porta, no fim e em texto: quem não é da equipa
         não tem de dar por ela. */
      '<a class="botao botao--texto entrada__porta" href="' + (org ? '#/entrar' : '#/organizacao') + '">' +
        (org ? 'Entrada dos convidados' : 'Organização') + '</a>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     Peças
     --------------------------------------------------------- */

  function cabeca(titulo, nota) {
    return '<div>' +
      '<h1 class="titulo-ui">' + titulo + '</h1>' +
      (nota ? '<p class="meta" style="margin-top:4px">' + nota + '</p>' : '') +
    '</div>';
  }

  function campoEmail() {
    return '<label class="campo">' +
      '<span class="campo__rotulo">Email</span>' +
      '<input class="campo__entrada" name="email" type="email" autocomplete="username" inputmode="email" ' +
        'autocapitalize="off" spellcheck="false" required value="' + UI.h(rascunho.email) + '" placeholder="nome@exemplo.pt">' +
    '</label>';
  }

  /* autocomplete new-password / current-password é o que faz o
     iPhone oferecer-se para guardar a palavra-passe no Porta-chaves,
     e para a pôr sozinho na app instalada. */
  function campoSenha(nova) {
    return '<div class="campo">' +
      '<label class="campo__rotulo" for="entrada-senha">Palavra-passe</label>' +
      '<span class="campo-senha">' +
        '<input class="campo__entrada" id="entrada-senha" name="senha" type="' + (senhaVisivel ? 'text' : 'password') + '" ' +
          'autocomplete="' + (nova ? 'new-password' : 'current-password') + '" ' +
          'autocapitalize="off" spellcheck="false" required value="' + UI.h(rascunho.senha) + '"' +
          (nova ? ' minlength="6" aria-describedby="nota-senha"' : '') + '>' +
        '<button class="botao--texto campo-senha__ver" type="button" data-acao="verSenha" ' +
          'aria-pressed="' + (senhaVisivel ? 'true' : 'false') + '">' + (senhaVisivel ? 'Esconder' : 'Mostrar') + '</button>' +
      '</span>' +
      (nova ? '<span class="meta campo__nota" id="nota-senha">Pelo menos seis caracteres.</span>' : '') +
    '</div>';
  }

  /* role="alert" faz o leitor de ecrã dizê-la assim que aparece. */
  function aviso() {
    return mensagem ? '<p class="corpo-ui entrada__aviso" role="alert">' + UI.h(mensagem) + '</p>' : '';
  }

  function principal(rotulo, aEnviarRotulo) {
    return '<button class="botao botao--principal botao--largo" type="submit"' + (aEnviar ? ' disabled' : '') + '>' +
      (aEnviar ? aEnviarRotulo : rotulo) + '</button>';
  }

  function trocar(para, rotulo) {
    return '<button class="botao botao--texto" type="button" data-acao="modo" data-valor="' + para + '" style="width:100%">' +
      rotulo + '</button>';
  }

  /* ---------------------------------------------------------
     Os quatro momentos
     --------------------------------------------------------- */

  function formCriar() {
    if (org) return formCriarOrg();
    return '<form id="form-entrada" class="pilha-3" novalidate>' +
      cabeca('Criar acesso') +
      '<label class="campo">' +
        '<span class="campo__rotulo">Nome</span>' +
        '<input class="campo__entrada" name="nome" autocomplete="name" required value="' + UI.h(rascunho.nome) + '" placeholder="Nome próprio e apelido">' +
      '</label>' +
      campoEmail() +
      campoSenha(true) +
      '<div>' +
        '<h2 class="etiqueta">Qual é o seu Aston Martin?</h2>' +
        '<div style="margin-top:24px">' + UI.escolhaCarro(rascunho.modelo) + '</div>' +
      '</div>' +
      aviso() +
      principal('Criar acesso', 'A criar o acesso') +
      trocar('entrar', 'Já tenho acesso') +
    '</form>';
  }

  function formCriarOrg() {
    const codigo = Nuvem.pedeCodigo();
    return '<form id="form-entrada" class="pilha-3" novalidate>' +
      cabeca('Criar acesso da organização', codigo
        ? 'É a primeira conta da equipa. As seguintes acrescentam-se lá dentro, em Pessoas.'
        : 'O email tem de estar na equipa.') +
      '<label class="campo">' +
        '<span class="campo__rotulo">Nome</span>' +
        '<input class="campo__entrada" name="nome" autocomplete="name" required value="' + UI.h(rascunho.nome) + '" placeholder="Nome próprio e apelido">' +
      '</label>' +
      campoEmail() +
      campoSenha(true) +
      (codigo
        ? '<label class="campo">' +
            '<span class="campo__rotulo">Código da organização</span>' +
            '<input class="campo__entrada" name="codigo" inputmode="numeric" autocomplete="off" required value="' + UI.h(rascunho.codigo) + '">' +
          '</label>'
        : '') +
      aviso() +
      principal('Criar acesso', 'A criar o acesso') +
      trocar('entrar', 'Já tenho acesso') +
    '</form>';
  }

  function formEntrar() {
    return '<form id="form-entrada" class="pilha-3" novalidate>' +
      (org
        ? cabeca('Organização', 'Com o email e a palavra-passe da equipa.')
        : cabeca('Entrar', 'Com o email e a palavra-passe do seu acesso.')) +
      campoEmail() +
      campoSenha(false) +
      aviso() +
      principal('Entrar', 'A entrar') +
      trocar('recuperar', 'Esqueci-me da palavra-passe') +
      trocar('criar', 'Primeira vez? Criar acesso') +
    '</form>';
  }

  /* Sem servidor não sai email nenhum, e o ecrã não o promete. */
  function formRecuperar() {
    if (Nuvem.simulada()) {
      return '<div class="pilha-3">' +
        cabeca('Recuperar a palavra-passe',
          'A app ainda não está ligada ao servidor e não pode enviar email. ' +
          (org
            ? 'Peça a outra pessoa da equipa que retire o seu email e o volte a acrescentar, e crie outro acesso.'
            : 'Peça à organização que apague o seu acesso, e crie outro com o mesmo email.')) +
        trocar('entrar', 'Voltar a entrar') +
      '</div>';
    }
    return '<form id="form-entrada" class="pilha-3" novalidate>' +
      cabeca('Recuperar a palavra-passe', 'Enviamos um email para escolher outra.') +
      campoEmail() +
      aviso() +
      principal('Enviar', 'A enviar') +
      trocar('entrar', 'Voltar a entrar') +
    '</form>';
  }

  function recuperado() {
    return '<div class="pilha-3">' +
      cabeca('Veja o seu email',
        'Se houver um acesso com ' + UI.h(rascunho.email.trim()) + ', a mensagem chega dentro de minutos. ' +
        'Pode estar no lixo eletrónico.') +
      trocar('entrar', 'Voltar a entrar') +
    '</div>';
  }

  /* ---------------------------------------------------------
     Envio
     --------------------------------------------------------- */

  function falhou(e) {
    aEnviar = false;
    const codigo = (e && e.codigo) || 'outro';
    mensagem = MENSAGENS[codigo] || MENSAGENS.outro;
    if (codigo === 'email-usado') { modo = 'entrar'; rascunho.senha = ''; }
    App.repintar();
  }

  /* A sessão fica no telemóvel; a app sai sozinha da entrada. */
  function entrou(r) {
    rascunho = null;
    mensagem = '';
    Estado.iniciarSessao(r);
  }

  /* O que se pode dizer sem perguntar ao servidor. */
  function validar() {
    if (modo === 'criar' && !rascunho.nome.trim()) return 'Falta o nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rascunho.email.trim())) return MENSAGENS['email-invalido'];
    if (modo === 'criar' && rascunho.senha.length < 6) return MENSAGENS['senha-curta'];
    if (modo === 'entrar' && !rascunho.senha) return 'Falta a palavra-passe.';
    if (modo === 'criar' && !org && !rascunho.modelo) return 'Escolha o modelo do carro.';
    if (modo === 'criar' && org && Nuvem.pedeCodigo() && !rascunho.codigo.trim()) return 'Falta o código da organização.';
    return '';
  }

  function enviar() {
    if (aEnviar) return;
    mensagem = validar();
    if (mensagem) { App.repintar(); return; }

    aEnviar = true;
    App.repintar();

    const email = rascunho.email.trim();
    if (modo === 'criar' && org) {
      Nuvem.criarContaOrganizacao({ nome: rascunho.nome.trim(), email: email, senha: rascunho.senha, codigo: rascunho.codigo })
        .then(entrou, falhou);
    } else if (modo === 'entrar' && org) {
      /* Um acesso de convidado não abre esta porta. */
      Nuvem.entrar(email, rascunho.senha).then(function (r) {
        if (r.perfil.papel !== 'organizacao') throw Object.assign(new Error('fora-da-equipa'), { codigo: 'fora-da-equipa' });
        entrou(r);
      }).catch(falhou);
    } else if (modo === 'criar') {
      Nuvem.criarConta({ nome: rascunho.nome.trim(), email: email, senha: rascunho.senha, modelo: rascunho.modelo })
        .then(entrou, falhou);
    } else if (modo === 'entrar') {
      Nuvem.entrar(email, rascunho.senha).then(entrou, falhou);
    } else if (modo === 'recuperar') {
      Nuvem.recuperar(email).then(function () {
        aEnviar = false;
        modo = 'recuperado';
        App.repintar();
      }, falhou);
    }
  }

  function montar(el) {
    const f = el.querySelector('#form-entrada');
    if (!f) return;
    /* O que se escreve fica no rascunho: tocar num modelo
       repinta o ecrã, e nada do que já estava escrito se perde. */
    f.addEventListener('input', function (e) {
      if (e.target.name && Object.prototype.hasOwnProperty.call(rascunho, e.target.name)) {
        rascunho[e.target.name] = e.target.value;
      }
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      enviar();
    });
  }

  return {
    semNav: true,
    semCabecalho: true,
    html: html,
    montar: montar,
    acoes: {
      modo: function (valor) {
        modo = valor;
        mensagem = '';
        rascunho.senha = '';
        App.repintar();
      },
      modelo: function (valor) { rascunho.modelo = valor; App.repintar(); },
      /* Troca-se no próprio campo, sem repintar: o teclado fica aberto. */
      verSenha: function (valor, botao) {
        senhaVisivel = !senhaVisivel;
        const campo = botao.parentNode.querySelector('input');
        campo.type = senhaVisivel ? 'text' : 'password';
        botao.textContent = senhaVisivel ? 'Esconder' : 'Mostrar';
        botao.setAttribute('aria-pressed', senhaVisivel ? 'true' : 'false');
      }
    }
  };
}

Vistas.entrada = fabrica(false);
Vistas.entradaOrg = fabrica(true);

})();
