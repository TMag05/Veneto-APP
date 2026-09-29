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
   tiver o email na equipa. Antes de tudo, a porta pede a
   palavra-passe da organização (28.09.2026).
   ========================================================= */

(function () {

/* ---------------------------------------------------------
   A palavra-passe da porta da organização
   Guarda-se só a impressão dela — o SHA-256 de um prefixo do
   projeto com a palavra-passe —, nunca o texto. É uma barreira à
   porta, não a segurança: essa está nas regras do Firestore, que
   só deixam criar conta de organização a um email da equipa e não
   deixam ninguém mudar o próprio papel. Aberta, fica aberta até se
   fechar a app; cinco enganos seguidos fecham-na um minuto.
   --------------------------------------------------------- */

const PORTA = 'a17ac94d17ae1463663e170f39c014759c3d6fb06dd3f6df10a6f677ff3d74da';
const CHAVE_PORTA = 'veneto.porta-organizacao';
/* Os enganos e o fecho guardam-se na sessão: recarregar a página
   não os apaga. */
function lerTentativas() {
  try { return JSON.parse(sessionStorage.getItem(CHAVE_PORTA + '.tentativas')) || { enganos: 0, ate: 0 }; }
  catch (e) { return { enganos: 0, ate: 0 }; }
}
function gravarTentativas(t) {
  try { sessionStorage.setItem(CHAVE_PORTA + '.tentativas', JSON.stringify(t)); } catch (e) { /* fica em memória */ }
}

function portaAberta() {
  try { return sessionStorage.getItem(CHAVE_PORTA) === PORTA; } catch (e) { return false; }
}

function abrirPorta() {
  try { sessionStorage.setItem(CHAVE_PORTA, PORTA); } catch (e) { /* sem sessão guardada: pede-se outra vez */ }
}

function confere(texto) {
  return Fotos.impressao(new Blob(['dolomitesgt:' + texto])).then(function (h) { return h === PORTA; });
}

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
  function instalada() { return Instalar.instalada(); }

  /* Fora do ecrã principal, a primeira coisa a fazer é pô-la lá. No
     iPhone é antes de criar o acesso: a app do ícone não vê a sessão
     do browser, e o acesso teria de ser feito duas vezes. */
  function convite() {
    if (org || !Instalar.noTelemovel() || (modo !== 'criar' && modo !== 'entrar')) return '';
    return Instalar.destaque(
      modo === 'criar' ? 'Antes de criar o acesso' : 'Antes de entrar',
      Instalar.noIphone()
        ? (modo === 'criar' ? 'No iPhone, o acesso fica na app instalada.' : 'No iPhone, a sessão fica na app instalada.')
        : 'Abre pelo ícone, como as outras apps.');
  }

  function preparar() {
    if (rascunho) return;
    const e = Estado.get();
    rascunho = { nome: e.perfil.nome || '', email: e.perfil.email || '', senha: '', modelo: e.perfil.modelo || '', funcao: e.perfil.funcao || '', codigo: '', porta: '' };
    /* A equipa é pequena e cria o acesso uma vez: quem volta a
       esta porta quase sempre já o tem. Mas antes, a palavra-passe
       da porta. */
    modo = org && !portaAberta() ? 'porta'
      : org || (instalada() && !e.aviso) ? 'entrar' : 'criar';
    mensagem = e.aviso ? MENSAGENS[e.aviso] || '' : '';
    aEnviar = false;
  }

  function html() {
    preparar();
    const claro = Estado.get().tema === 'claro';
    return '<div class="entrada">' +
      /* O tema escolhe-se já aqui: quem abre a app ao sol não tem de
         entrar primeiro para a conseguir ler. O símbolo é o do tema
         em uso, no traço dos punções da barra, e a palavra ao lado
         diz para que serve (28.09.2026). */
      '<button class="entrada__tema" type="button" data-acao="tema" ' +
        'aria-label="' + (claro ? 'Tema claro. Mudar para o escuro' : 'Tema escuro. Mudar para o claro') + '">' +
        '<span class="etiqueta">Tema</span>' + PUNCOES.svg(claro ? 'sol' : 'lua', 26) + '</button>' +
      '<div>' +
        /* O logótipo é sempre claro sobre escuro: no tema claro,
           assenta numa chapa escura, como uma capa. */
        '<div class="entrada__chapa"><div class="entrada__chapa-fundo material-escuro">' +
          UI.logo('logo--entrada') +
        '</div></div>' +
        (DADOS.evento.subtitulo
          ? '<p class="subtitulo" style="margin-top:22px">' + UI.h(DADOS.evento.subtitulo) + '</p>' : '') +
        '<p class="meta num" style="margin-top:8px">' + UI.intervaloEvento() +
          (DADOS.dias.length ? ' · ' + UI.plural(DADOS.dias.length, 'dia', 'dias') : '') + '</p>' +
      '</div>' +

      '<div class="pilha-3">' + convite() +
        ({ porta: formPorta, criar: formCriar, entrar: formEntrar, recuperar: formRecuperar, recuperado: recuperado })[modo]() +
      '</div>' +

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
     Os momentos
     --------------------------------------------------------- */

  /* A porta da organização: a palavra-passe da equipa, antes de
     entrar ou de criar o acesso. */
  function formPorta() {
    return '<form id="form-entrada" class="pilha-3" novalidate>' +
      cabeca('Organização', 'Esta entrada é só para a equipa.') +
      '<div class="campo">' +
        '<label class="campo__rotulo" for="entrada-porta">Palavra-passe da organização</label>' +
        '<span class="campo-senha">' +
          '<input class="campo__entrada" id="entrada-porta" name="porta" type="' + (senhaVisivel ? 'text' : 'password') + '" ' +
            'autocomplete="off" autocapitalize="off" spellcheck="false" required value="' + UI.h(rascunho.porta) + '">' +
          '<button class="botao--texto campo-senha__ver" type="button" data-acao="verSenha" ' +
            'aria-pressed="' + (senhaVisivel ? 'true' : 'false') + '">' + (senhaVisivel ? 'Esconder' : 'Mostrar') + '</button>' +
        '</span>' +
      '</div>' +
      aviso() +
      principal('Continuar', 'A verificar') +
    '</form>';
  }

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
      '<div>' +
        '<h2 class="etiqueta">Viaja como</h2>' +
        '<div style="margin-top:24px">' + UI.escolhaFuncao(rascunho.funcao) + '</div>' +
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
    if (modo === 'porta') {
      if (Date.now() < lerTentativas().ate) return 'Demasiadas tentativas. Espere um minuto e tente de novo.';
      return rascunho.porta ? '' : 'Falta a palavra-passe da organização.';
    }
    if (modo === 'criar' && !rascunho.nome.trim()) return 'Falta o nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rascunho.email.trim())) return MENSAGENS['email-invalido'];
    if (modo === 'criar' && rascunho.senha.length < 6) return MENSAGENS['senha-curta'];
    if (modo === 'entrar' && !rascunho.senha) return 'Falta a palavra-passe.';
    if (modo === 'criar' && !org && !rascunho.modelo) return 'Escolha o modelo do carro.';
    if (modo === 'criar' && !org && !rascunho.funcao) return 'Escolha se viaja como piloto ou co-piloto.';
    if (modo === 'criar' && org && Nuvem.pedeCodigo() && !rascunho.codigo.trim()) return 'Falta o código da organização.';
    return '';
  }

  function enviar() {
    if (aEnviar) return;
    mensagem = validar();
    if (mensagem) { App.repintar(); return; }

    aEnviar = true;
    App.repintar();

    if (modo === 'porta') {
      confere(rascunho.porta).then(function (certa) {
        aEnviar = false;
        rascunho.porta = '';
        const t = lerTentativas();
        if (certa) {
          gravarTentativas({ enganos: 0, ate: 0 });
          abrirPorta();
          modo = 'entrar';
          mensagem = '';
        } else {
          t.enganos++;
          if (t.enganos >= 5) { t.enganos = 0; t.ate = Date.now() + 60 * 1000; }
          gravarTentativas(t);
          mensagem = 'A palavra-passe da organização não está certa.';
        }
        App.repintar();
      }, function () { falhou(); });
      return;
    }

    const email = rascunho.email.trim();
    if (modo === 'criar' && org) {
      Nuvem.criarContaOrganizacao({ nome: rascunho.nome.trim(), email: email, senha: rascunho.senha, codigo: rascunho.codigo })
        .then(entrou, falhou);
    } else if (modo === 'entrar' && org) {
      /* Quem abre esta porta é a equipa, não o acesso: um email fora
         dela não passa, e um da equipa passa mesmo que o acesso tenha
         sido de convidado. */
      Nuvem.entrarOrganizacao(email, rascunho.senha, rascunho.nome.trim()).then(entrou, falhou);
    } else if (modo === 'criar') {
      Nuvem.criarConta({ nome: rascunho.nome.trim(), email: email, senha: rascunho.senha, modelo: rascunho.modelo, funcao: rascunho.funcao })
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
      instalar: function () { Instalar.pedir(); },
      tema: function () {
        Estado.definir({ tema: Estado.get().tema === 'claro' ? 'escuro' : 'claro' });
      },
      modo: function (valor) {
        if (org && !portaAberta()) return;
        modo = valor;
        mensagem = '';
        rascunho.senha = '';
        App.repintar();
      },
      /* Escolher o que faltava tira o aviso que o pedia. */
      modelo: function (valor) { rascunho.modelo = valor; mensagem = ''; App.repintar(); },
      funcao: function (valor) { rascunho.funcao = valor; mensagem = ''; App.repintar(); },
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
