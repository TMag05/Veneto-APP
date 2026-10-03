/* =========================================================
   A fronteira com o servidor
   Toda a app trata o servidor como se ele não existisse:
   escreve no telemóvel e segue. Este ficheiro é o único sítio
   que sabe que há um do outro lado.

   Tem duas metades: as contas, dos convidados e da organização,
   e as fotografias, no Storage. Nada fora deste ficheiro conhece o Firestore, o Storage ou o Auth.
   ========================================================= */

window.Nuvem = (function () {

  /* ---------------------------------------------------------
     Configuração
     Com a chave e o projeto preenchidos, as contas passam a
     viver no Firebase. Vazios, vivem num servidor simulado
     dentro deste telemóvel, com o mesmo contrato e os mesmos
     erros — é o que permite fazer a app inteira antes de haver
     projeto.
     --------------------------------------------------------- */

  const CONFIG = {
    apiKey: 'AIzaSyAA1KNq9kYIKgGJySsbk7jWRed_I8_xEZs',
    projectId: 'dolomitesgt',
    storageBucket: 'dolomitesgt.firebasestorage.app'
  };

  function simulada() { return !CONFIG.apiKey || !CONFIG.projectId; }

  /* Só no servidor simulado, e só enquanto a equipa estiver
     vazia: é o que deixa entrar a primeira pessoa da
     organização. Não é segurança — é a chave de uma casa nova.
     No Firebase a primeira entrada da equipa escreve-se à mão,
     na consola, e este código não serve para nada. */
  const CODIGO_EQUIPA = '2026';

  /* ---------------------------------------------------------
     Contas — o contrato

     O registo é aberto: quem tem o link cria conta, sem lista
     de convidados e sem aprovação. A organização vê quem se
     registou e pode apagar contas, mas nunca impede ninguém de
     entrar — uma conta apagada liberta o email para outra.

     Uma sessão é { uid, idToken, refreshToken, expira }.
     Um perfil é { uid, nome, email, modelo, funcao, papel, criado }.
     funcao é 'condutor' ou 'copiloto' — o lugar no carro.
     papel é 'convidado' ou 'organizacao'. A organização viaja
     em carros próprios: o perfil dela não tem modelo.

     criarConta({ nome, email, senha, modelo, funcao })
       → { sessao, perfil, perfilPendente }
       perfilPendente é true quando a conta ficou criada mas o
       perfil não chegou ao Firestore; volta-se a publicar
       depois, com publicarPerfil.
     entrar(email, senha)        → { sessao, perfil }
     criarContaOrganizacao({ nome, email, senha, codigo })
       → { sessao, perfil } ou { sessao, perfil, porConfirmar }
       Só para emails da equipa. O código só é pedido, e só
       serve, enquanto a equipa estiver vazia (pedeCodigo()).
       Se o email já tiver conta e a palavra-passe for a dela,
       entra como entrarOrganizacao.
     entrarOrganizacao(email, senha, nome)
       → { sessao, perfil } ou { sessao, perfil, porConfirmar }
       A porta da organização. Cada pessoa entra com o seu email
       e a sua palavra-passe, e só passa com o email na equipa e
       confirmado: tocou no link que o Firebase lhe mandou. Com
       porConfirmar, o email do link acabou de sair e a sessão
       ainda não serve — não se inicia. O perfil passa a
       organização se não o era — criado antes como convidado,
       ou apagado quando a pessoa saiu da equipa e voltou. nome
       serve só se o servidor não tiver nenhum.
     jaConfirmou(pendente)       → o mesmo, depois do link
     reenviarConfirmacao(pendente)→ manda o link outra vez; resolve
                                   com a sessão renovada
     confirmado(sessao)          → true se o email da sessão está
                                   confirmado
     naEquipa(email)             → true se o email está na equipa
     recuperar(email)            → resolve sempre, exista a conta ou não
     renovar(sessao)             → sessão nova
     publicarPerfil(sessao, p)   → grava o perfil
     contas(sessao)              → todos os perfis, para a organização
     apagarConta(sessao, uid)    → apaga o perfil e a conta

     A equipa — os emails que podem ter acesso de organização:
     equipa(sessao)              → [{ email, criado, master }]
     juntarEquipa(sessao, email) → acrescenta o email
     retirarEquipa(sessao, email)→ tira o email e apaga o acesso
                                   que houver com ele
     Acrescentar e retirar é só do master, que gere a equipa. O
     master marca-se na consola (master: true no documento da
     equipa), nunca pela app, e não se retira por ela.

     Os erros rejeitam com um Error cujo .codigo é um de:
       email-usado, email-invalido, senha-curta, credenciais,
       conta-apagada, muitas-tentativas, fora-da-equipa,
       codigo-errado, sem-rede, outro
     --------------------------------------------------------- */

  function erro(codigo) {
    const e = new Error(codigo);
    e.codigo = codigo;
    return e;
  }

  function normalizar(email) { return String(email || '').trim().toLowerCase(); }

  function emailValido(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  function perfilDe(uid, d, criado) {
    return {
      uid: uid,
      nome: String(d.nome || '').trim(),
      email: normalizar(d.email),
      modelo: d.papel === 'organizacao' ? '' : (d.modelo || ''),
      funcao: d.papel === 'organizacao' ? '' : (d.funcao === 'copiloto' ? 'copiloto' : (d.funcao === 'condutor' ? 'condutor' : '')),
      papel: d.papel === 'organizacao' ? 'organizacao' : 'convidado',
      criado: criado || Date.now()
    };
  }

  /* ---------------------------------------------------------
     Firebase, por REST
     Sem SDK: três pedidos ao Auth e um punhado ao Firestore,
     com fetch. A chave do Firebase não é segredo — é o
     identificador do projeto; quem guarda os dados são as
     regras.

     Do lado do Firebase, falta configurar:
       · Auth › Email/palavra-passe ligado. Os emails de
         recuperação e de confirmação do endereço pedem-se em
         português de Portugal (X-Firebase-Locale); os modelos
         veem-se em Auth › Modelos.
       · Regras do Firestore para contas/{uid}: cada pessoa lê e
         escreve a sua; a organização lê e apaga todas. Quem é
         da organização diz-se por equipa/{email}: um perfil só
         pode ter papel 'organizacao' se existir esse documento
         para o email do token, e só vale enquanto existir.
       · Regras para equipa/{email}: get aberto a todos — a
         entrada precisa de saber se o email é da equipa antes
         de criar a conta —; list e escrita só para a equipa. A
         primeira entrada escreve-se à mão, na consola.
       · Uma Cloud Function em contas/{uid} onDelete que apaga
         o utilizador do Auth. O telemóvel não pode apagar a
         conta de outra pessoa, e sem isto o email fica preso a
         uma conta sem perfil. Na porta da organização não faz
         falta — quem volta à equipa entra com a palavra-passe
         antiga e o perfil refaz-se (entrarOrganizacao) —, mas
         um convidado apagado continua a poder entrar.
     --------------------------------------------------------- */

  const AUTH = 'https://identitytoolkit.googleapis.com/v1/accounts:';
  const TOKEN = 'https://securetoken.googleapis.com/v1/token';

  function firestore(caminho) {
    return 'https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId +
      '/databases/(default)/documents/' + caminho;
  }

  /* Traduz as mensagens do Firebase para os códigos do contrato.
     Algumas trazem explicação depois de « : », que se ignora. */
  function traduzir(mensagem) {
    const m = String(mensagem || '').split(' ')[0];
    if (m === 'EMAIL_EXISTS') return 'email-usado';
    if (m === 'INVALID_EMAIL' || m === 'MISSING_EMAIL') return 'email-invalido';
    if (m === 'WEAK_PASSWORD' || m === 'MISSING_PASSWORD') return 'senha-curta';
    if (m === 'INVALID_LOGIN_CREDENTIALS' || m === 'EMAIL_NOT_FOUND' || m === 'INVALID_PASSWORD') return 'credenciais';
    if (m === 'USER_NOT_FOUND' || m === 'USER_DISABLED' || m === 'INVALID_REFRESH_TOKEN' || m === 'TOKEN_EXPIRED') return 'conta-apagada';
    if (m === 'TOO_MANY_ATTEMPTS_TRY_LATER') return 'muitas-tentativas';
    return 'outro';
  }

  function pedir(url, opcoes) {
    if (!navigator.onLine) return Promise.reject(erro('sem-rede'));
    return fetch(url, opcoes).catch(function () {
      throw erro('sem-rede');
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (corpo) {
        if (r.ok) return corpo;
        if (r.status === 404) throw erro('nao-existe');
        throw erro(traduzir(corpo && corpo.error && corpo.error.message));
      });
    });
  }

  /* X-Firebase-Locale escolhe a língua dos emails que o Auth manda.
     O Auth aceita-o de um browser; ao Storage não se manda. */
  function auth(acao, corpo) {
    return pedir(AUTH + acao + '?key=' + CONFIG.apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Firebase-Locale': 'pt-PT' },
      body: JSON.stringify(corpo)
    });
  }

  /* O que o Auth diz da sessão vem no próprio token: é aí que as
     regras o leem, e um token renovado traz o estado de agora. */
  function reivindicacoes(sessao) {
    try {
      const b = sessao.idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(b));
    } catch (e) { return {}; }
  }

  function comSessao(sessao, metodo, corpo) {
    const o = { method: metodo, headers: { Authorization: 'Bearer ' + sessao.idToken } };
    if (corpo) {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(corpo);
    }
    return o;
  }

  /* O Auth responde em camelCase e o serviço de tokens em
     snake_case; a sessão é a mesma. */
  function sessaoDe(r) {
    return {
      uid: r.localId || r.user_id,
      idToken: r.idToken || r.id_token,
      refreshToken: r.refreshToken || r.refresh_token,
      expira: Date.now() + Number(r.expiresIn || r.expires_in || 3600) * 1000
    };
  }

  /* O Firestore guarda cada campo com o seu tipo por extenso. */
  function paraDocumento(p) {
    return { fields: {
      nome: { stringValue: p.nome },
      email: { stringValue: p.email },
      modelo: { stringValue: p.modelo },
      funcao: { stringValue: p.funcao || '' },
      papel: { stringValue: p.papel || 'convidado' },
      criado: { integerValue: String(p.criado) }
    } };
  }

  function deDocumento(doc) {
    const f = doc.fields || {};
    function t(k) { return f[k] ? (f[k].stringValue || '') : ''; }
    return {
      uid: doc.name.split('/').pop(),
      nome: t('nome'), email: t('email'), modelo: t('modelo'), funcao: t('funcao'),
      papel: t('papel') === 'organizacao' ? 'organizacao' : 'convidado',
      criado: f.criado ? Number(f.criado.integerValue) : 0
    };
  }

  const firebase = {
    /* O nome fica também no Auth: é de onde volta, se o perfil se
       perder. */
    criarConta: function (d) {
      return auth('signUp', { email: normalizar(d.email), password: d.senha, displayName: String(d.nome || '').trim(), returnSecureToken: true })
        .then(function (r) {
          const sessao = sessaoDe(r);
          const perfil = perfilDe(sessao.uid, d);
          return firebase.publicarPerfil(sessao, perfil)
            .then(function () { return { sessao: sessao, perfil: perfil, perfilPendente: false }; })
            .catch(function () { return { sessao: sessao, perfil: perfil, perfilPendente: true }; });
        });
    },

    /* Pergunta-se primeiro se o email é da equipa: criar a conta
       e só depois descobrir que não é deixaria uma conta órfã. O
       perfil não se grava aqui: as regras só o deixam gravar
       depois de o email estar confirmado. */
    criarContaOrganizacao: function (d) {
      return firebase.naEquipa(normalizar(d.email)).then(function (sim) {
        if (!sim) throw erro('fora-da-equipa');
        return auth('signUp', { email: normalizar(d.email), password: d.senha, displayName: String(d.nome || '').trim(), returnSecureToken: true });
      }).then(function (r) {
        const sessao = sessaoDe(r);
        return { sessao: sessao, perfil: perfilDe(sessao.uid, Object.assign({}, d, { papel: 'organizacao' })) };
      });
    },

    entrar: function (email, senha) {
      return auth('signInWithPassword', { email: normalizar(email), password: senha, returnSecureToken: true })
        .then(function (r) {
          const sessao = sessaoDe(r);
          return pedir(firestore('contas/' + sessao.uid), comSessao(sessao, 'GET'))
            .then(deDocumento)
            .catch(function () { return perfilDe(sessao.uid, { email: email, nome: r.displayName }); })
            .then(function (perfil) { return { sessao: sessao, perfil: perfil }; });
        });
    },

    /* O perfil guardado, ou null se não houver. */
    perfil: function (sessao) {
      return pedir(firestore('contas/' + sessao.uid), comSessao(sessao, 'GET'))
        .then(deDocumento)
        .catch(function (e) { if (e.codigo === 'nao-existe') return null; throw e; });
    },

    confirmado: function (sessao) { return reivindicacoes(sessao).email_verified === true; },

    /* O Firebase manda ao endereço da conta um link que o confirma. */
    pedirConfirmacao: function (sessao) {
      return auth('sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: sessao.idToken });
    },

    recuperar: function (email) {
      return auth('sendOobCode', { requestType: 'PASSWORD_RESET', email: normalizar(email) })
        .catch(function (e) {
          /* Não se diz se o email tem conta: só a rede e o excesso
             de tentativas chegam ao ecrã. */
          if (e.codigo === 'sem-rede' || e.codigo === 'muitas-tentativas') throw e;
        });
    },

    renovar: function (sessao) {
      return pedir(TOKEN + '?key=' + CONFIG.apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(sessao.refreshToken)
      }).then(sessaoDe);
    },

    publicarPerfil: function (sessao, perfil) {
      return pedir(firestore('contas/' + sessao.uid), comSessao(sessao, 'PATCH', paraDocumento(perfil)));
    },

    contas: function (sessao) {
      return pedir(firestore('contas?pageSize=300'), comSessao(sessao, 'GET')).then(function (r) {
        return (r.documents || []).map(deDocumento);
      });
    },

    /* Apagar um acesso leva também o cartão da lista de participantes. */
    apagarConta: function (sessao, uid) {
      return pedir(firestore('contas/' + uid), comSessao(sessao, 'DELETE'))
        .catch(function (e) { if (e.codigo !== 'nao-existe') throw e; })
        .then(function () {
          return pedir(firestore('participantes/' + uid), comSessao(sessao, 'DELETE'))
            .catch(function () { /* não tinha cartão */ });
        });
    },

    pedeCodigo: function () { return false; },

    equipa: function (sessao) {
      return pedir(firestore('equipa?pageSize=100'), comSessao(sessao, 'GET')).then(function (r) {
        return (r.documents || []).map(function (doc) {
          const f = doc.fields || {};
          return {
            email: f.email ? f.email.stringValue : decodeURIComponent(doc.name.split('/').pop()),
            criado: f.criado ? Number(f.criado.integerValue) : 0,
            master: !!(f.master && f.master.booleanValue)
          };
        });
      });
    },

    juntarEquipa: function (sessao, email) {
      return pedir(firestore('equipa/' + encodeURIComponent(email)), comSessao(sessao, 'PATCH', { fields: {
        email: { stringValue: email },
        criado: { integerValue: String(Date.now()) }
      } }));
    },

    retirarEquipa: function (sessao, email) {
      return pedir(firestore('equipa/' + encodeURIComponent(email)), comSessao(sessao, 'DELETE'))
        .catch(function (e) { if (e.codigo !== 'nao-existe') throw e; })
        .then(function () { return firebase.contas(sessao); })
        .then(function (lista) {
          const c = lista.find(function (x) { return x.email === email; });
          if (c) return firebase.apagarConta(sessao, c.uid);
        });
    },

    /* Um email de cada vez, sem sessão: a lista inteira só a
       equipa a lê. */
    naEquipa: function (email) {
      return pedir(firestore('equipa/' + encodeURIComponent(email)) + '?key=' + CONFIG.apiKey, { method: 'GET' })
        .then(function () { return true; })
        .catch(function (e) { if (e.codigo === 'nao-existe') return false; throw e; });
    },

    /* As regras só deixam escrever o papel com o email na equipa. Um
       convidado que passa a organização sai da lista de quem vai: a
       organização viaja em carros próprios. */
    tornarOrganizacao: function (sessao, perfil) {
      return firebase.publicarPerfil(sessao, perfil).then(function () {
        return pedir(firestore('participantes/' + sessao.uid), comSessao(sessao, 'DELETE'))
          .catch(function () { /* não tinha cartão */ });
      });
    }
  };

  /* ---------------------------------------------------------
     O servidor simulado
     Guarda as contas numa chave própria do localStorage, longe
     do estado do convidado, e responde com o atraso e os erros
     que o Firebase daria. A palavra-passe nunca fica escrita:
     guarda-se o SHA-256 dela com um sal.

     Tudo o que aqui vive é deste browser. A organização vê as
     contas criadas nele, e mais nenhumas — é uma simulação,
     não uma partilha.
     --------------------------------------------------------- */

  const CHAVE_SIMULADA = 'veneto.servidor-simulado.v1';

  function lerSimulado() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE_SIMULADA));
      if (s && s.contas && s.tokens) { s.equipa = s.equipa || {}; return s; }
    } catch (e) { /* recomeça-se vazio */ }
    return { contas: {}, tokens: {}, equipa: {} };
  }

  function gravarSimulado(s) {
    try { localStorage.setItem(CHAVE_SIMULADA, JSON.stringify(s)); } catch (e) { /* quota */ }
  }

  function aleatorio(n) {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  /* A mesma conta de impressão das fotografias, que já sabe fazer
     SHA-256 onde não há crypto.subtle. */
  function resumo(sal, senha) {
    return Fotos.impressao(new Blob([sal + ':' + senha]));
  }

  /* O tempo de ida e volta de uma rede de telemóvel. */
  function demora() {
    return new Promise(function (resolver) {
      setTimeout(resolver, 350 + Math.random() * 350);
    });
  }

  function novaSessao(s, uid) {
    const refreshToken = aleatorio(24);
    s.tokens[refreshToken] = uid;
    return { uid: uid, idToken: aleatorio(16), refreshToken: refreshToken, expira: Date.now() + 3600 * 1000 };
  }

  function semSegredos(c) {
    return { uid: c.uid, nome: c.nome, email: c.email, modelo: c.modelo, funcao: c.funcao || '',
      papel: c.papel === 'organizacao' ? 'organizacao' : 'convidado', criado: c.criado };
  }

  /* Como as regras: só o master acrescenta e retira. */
  function masterSimulado(s, sessao) {
    const c = s.contas[sessao.uid];
    return !!(c && s.equipa[c.email] && s.equipa[c.email].master);
  }

  function porEmail(s, email) {
    const alvo = normalizar(email);
    return Object.keys(s.contas).map(function (k) { return s.contas[k]; })
      .find(function (c) { return c.email === alvo; }) || null;
  }

  const simulado = {
    criarConta: function (d) {
      return demora().then(function () {
        const s = lerSimulado();
        if (porEmail(s, d.email)) throw erro('email-usado');
        const uid = 'u' + aleatorio(10);
        const sal = aleatorio(8);
        return resumo(sal, d.senha).then(function (h) {
          const perfil = perfilDe(uid, d);
          s.contas[uid] = Object.assign({ sal: sal, senha: h }, perfil);
          const sessao = novaSessao(s, uid);
          gravarSimulado(s);
          return { sessao: sessao, perfil: perfil, perfilPendente: false };
        });
      });
    },

    /* A primeira pessoa da equipa entra com o código e fica master;
       as outras têm de lá estar antes, acrescentadas por ela. */
    criarContaOrganizacao: function (d) {
      const email = normalizar(d.email);
      const s = lerSimulado();
      const primeira = !Object.keys(s.equipa).length;
      if (!s.equipa[email]) {
        if (!primeira) return demora().then(function () { throw erro('fora-da-equipa'); });
        if (String(d.codigo || '').trim() !== CODIGO_EQUIPA) return demora().then(function () { throw erro('codigo-errado'); });
      }
      return simulado.criarConta(Object.assign({}, d, { papel: 'organizacao' })).then(function (r) {
        const t = lerSimulado();
        t.equipa[email] = t.equipa[email] || { email: email, criado: Date.now(), master: primeira };
        gravarSimulado(t);
        return r;
      });
    },

    entrar: function (email, senha) {
      return demora().then(function () {
        const s = lerSimulado();
        const c = porEmail(s, email);
        if (!c) throw erro('credenciais');
        return resumo(c.sal, senha).then(function (h) {
          if (h !== c.senha) throw erro('credenciais');
          const sessao = novaSessao(s, c.uid);
          gravarSimulado(s);
          return { sessao: sessao, perfil: semSegredos(c) };
        });
      });
    },

    /* Sem servidor não sai email nenhum. O ecrã de entrada sabe-o
       e diz o que fazer em vez disso. */
    recuperar: function () { return demora(); },

    renovar: function (sessao) {
      return demora().then(function () {
        const s = lerSimulado();
        const uid = s.tokens[sessao.refreshToken];
        if (!uid || !s.contas[uid]) throw erro('conta-apagada');
        return Object.assign({}, sessao, { idToken: aleatorio(16), expira: Date.now() + 3600 * 1000 });
      });
    },

    publicarPerfil: function (sessao, perfil) {
      return demora().then(function () {
        const s = lerSimulado();
        const c = s.contas[sessao.uid];
        if (!c) throw erro('conta-apagada');
        Object.assign(c, { nome: perfil.nome, modelo: perfil.modelo, funcao: perfil.funcao || '' });
        gravarSimulado(s);
      });
    },

    contas: function () {
      return demora().then(function () {
        const s = lerSimulado();
        return Object.keys(s.contas).map(function (k) { return semSegredos(s.contas[k]); });
      });
    },

    apagarConta: function (sessao, uid) {
      return demora().then(function () {
        const s = lerSimulado();
        delete s.contas[uid];
        Object.keys(s.tokens).forEach(function (t) { if (s.tokens[t] === uid) delete s.tokens[t]; });
        gravarSimulado(s);
      });
    },

    pedeCodigo: function () { return !Object.keys(lerSimulado().equipa).length; },

    equipa: function () {
      return demora().then(function () {
        const s = lerSimulado();
        return Object.keys(s.equipa).map(function (k) { return s.equipa[k]; });
      });
    },

    juntarEquipa: function (sessao, email) {
      return demora().then(function () {
        const s = lerSimulado();
        if (!masterSimulado(s, sessao)) throw erro('outro');
        s.equipa[email] = s.equipa[email] || { email: email, criado: Date.now(), master: false };
        gravarSimulado(s);
      });
    },

    retirarEquipa: function (sessao, email) {
      return demora().then(function () {
        const s = lerSimulado();
        if (!masterSimulado(s, sessao) || (s.equipa[email] && s.equipa[email].master)) throw erro('outro');
        delete s.equipa[email];
        gravarSimulado(s);
        const c = porEmail(s, email);
        if (c) return simulado.apagarConta(sessao, c.uid);
      });
    },

    naEquipa: function (email) {
      return demora().then(function () { return !!lerSimulado().equipa[email]; });
    },

    perfil: function (sessao) {
      return demora().then(function () {
        const c = lerSimulado().contas[sessao.uid];
        return c ? semSegredos(c) : null;
      });
    },

    /* Sem servidor não sai email nenhum: o endereço dá-se por
       confirmado. */
    confirmado: function () { return true; },
    pedirConfirmacao: function () { return demora(); },

    tornarOrganizacao: function (sessao, perfil) {
      return demora().then(function () {
        const s = lerSimulado();
        const c = s.contas[sessao.uid];
        if (!c) throw erro('conta-apagada');
        if (!s.equipa[c.email]) throw erro('fora-da-equipa');
        Object.assign(c, { nome: perfil.nome, modelo: '', funcao: '', papel: 'organizacao' });
        gravarSimulado(s);
      });
    }
  };

  function servidor() { return simulada() ? simulado : firebase; }

  /* A validação corre antes de qualquer pedido, nos dois servidores. */
  function criarConta(d) {
    if (!emailValido(normalizar(d.email))) return Promise.reject(erro('email-invalido'));
    if (String(d.senha || '').length < 6) return Promise.reject(erro('senha-curta'));
    return servidor().criarConta(d);
  }

  function entrar(email, senha) {
    if (!emailValido(normalizar(email))) return Promise.reject(erro('email-invalido'));
    if (!senha) return Promise.reject(erro('credenciais'));
    return servidor().entrar(email, senha);
  }

  /* Um email da equipa que já tem conta é de um acesso de convidado,
     ou de quem saiu da equipa e voltou. Com a palavra-passe dessa
     conta é a mesma pessoa, e entra; com outra, o ecrã pede que
     entre. */
  function criarContaOrganizacao(d) {
    const e = normalizar(d.email);
    if (!emailValido(e)) return Promise.reject(erro('email-invalido'));
    if (String(d.senha || '').length < 6) return Promise.reject(erro('senha-curta'));
    return servidor().criarContaOrganizacao(d).then(function (r) {
      return abrirOrganizacao(r.sessao, e, d.nome).then(pedirSeFaltar);
    }, function (x) {
      if (x.codigo !== 'email-usado') throw x;
      return entrarOrganizacao(e, d.senha, d.nome).catch(function (x2) {
        throw x2.codigo === 'credenciais' ? erro('email-usado') : x2;
      });
    });
  }

  function entrarOrganizacao(email, senha, nome) {
    const e = normalizar(email);
    return entrar(e, senha).then(function (r) {
      return abrirOrganizacao(r.sessao, e, r.perfil.nome || nome);
    }).then(pedirSeFaltar);
  }

  /* A porta da organização pergunta sempre à equipa: é a equipa que
     diz quem entra, não o perfil — que pode ter ficado para trás, ou
     nunca ter sido de organização. E cada pessoa prova que o email é
     seu antes de passar: as regras não lhe dão nada até lá. */
  function abrirOrganizacao(sessao, email, nome) {
    return servidor().naEquipa(email).then(function (sim) {
      if (!sim) throw erro('fora-da-equipa');
      const provisorio = perfilDe(sessao.uid, { nome: nome, email: email, papel: 'organizacao' });
      if (!servidor().confirmado(sessao)) return { sessao: sessao, perfil: provisorio, porConfirmar: true };
      return servidor().perfil(sessao).then(function (p) {
        if (p && p.papel === 'organizacao') return { sessao: sessao, perfil: p };
        const perfil = perfilDe(sessao.uid,
          { nome: (p && p.nome) || nome, email: email, papel: 'organizacao' }, p && p.criado);
        return servidor().tornarOrganizacao(sessao, perfil).then(function () {
          return { sessao: sessao, perfil: perfil };
        });
      });
    });
  }

  /* O link sai ao criar e ao entrar, nunca ao perguntar se já foi
     tocado. Se não sair, o ecrã tem «Enviar outra vez». */
  function pedirSeFaltar(r) {
    if (!r.porConfirmar) return r;
    return servidor().pedirConfirmacao(r.sessao).then(function () { return r; }, function () { return r; });
  }

  /* Depois do link: o token renova-se, e o novo já diz que o email
     está confirmado. */
  function jaConfirmou(pendente) {
    return servidor().renovar(pendente.sessao).then(function (sessao) {
      return abrirOrganizacao(sessao, pendente.perfil.email, pendente.perfil.nome);
    });
  }

  function emailDaEquipa(sessao, email) {
    const e = normalizar(email);
    if (!emailValido(e)) return Promise.reject(erro('email-invalido'));
    return servidor().juntarEquipa(sessao, e);
  }

  function recuperar(email) {
    if (!emailValido(normalizar(email))) return Promise.reject(erro('email-invalido'));
    return servidor().recuperar(email);
  }

  /* ---------------------------------------------------------
     Fotografias — o contrato

     ligada()
       true quando há projeto configurado, sessão iniciada e o
       envio implementado. Enquanto for false, a fila não tenta
       enviar nada e nenhuma fotografia passa a 'enviado'.

     enviarFoto(registo, meta)
       registo — { id, original, mini, vista, tipo, largura, altura }
                 tal como está guardado em Fotos.
       meta    — { id, dia, poi, autorId, sha, criado }

       Sobe os três tamanhos em paralelo, assim que houver
       qualquer rede — não esperar por Wi-Fi, não consultar
       navigator.connection. Os caminhos são os de
       Fotos.caminho(dia, autorId, sha, tamanho), com 'mini',
       'vista' e 'original'; o original sobe tal como veio da
       câmara, sem reprocessar, mesmo que seja HEIC. Num vídeo, o
       original é o vídeo, com a extensão dele, e a miniatura e a
       vista são uma imagem de perto do início.

       Metadados de cada objeto:
         Cache-Control: public, max-age=31536000, immutable
         contentType:   o tipo do ficheiro

       Depois dos três confirmarem — e só depois — escreve o
       documento em fotos/{id} e resolve com
       { caminhoMini, caminhoVista, caminhoOriginal }.
       Qualquer falha rejeita: a fotografia fica pendente e a
       fila volta a tentar.

     apagarFoto(meta)
       Apaga os três objetos do Storage e o documento do
       Firestore. Nunca um sem o outro.

     fotosDoDia(dia, limite, depoisDe)
       Consulta paginada — where dia == X, limit N. Nunca um
       ouvinte na coleção inteira, nunca list() no bucket.
       Resolve com uma lista de metadados.
     --------------------------------------------------------- */

  /* ---------------------------------------------------------
     Fotografias
     --------------------------------------------------------- */

  function valorFirestore(v) {
    if (typeof v === 'string') return { stringValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (v === null || v === undefined) return { nullValue: null };
    return { stringValue: String(v) };
  }

  function paraDocFoto(f) {
    const fields = {};
    Object.keys(f).forEach(function (k) {
      if (f[k] !== undefined) fields[k] = valorFirestore(f[k]);
    });
    return { fields: fields };
  }

  function deDocFoto(doc) {
    const f = doc.fields || {};
    const res = { id: doc.name.split('/').pop() };
    Object.keys(f).forEach(function (k) {
      const val = f[k];
      if (val.stringValue !== undefined) res[k] = val.stringValue;
      else if (val.integerValue !== undefined) res[k] = Number(val.integerValue);
      else if (val.doubleValue !== undefined) res[k] = val.doubleValue;
      else if (val.booleanValue !== undefined) res[k] = val.booleanValue;
    });
    return res;
  }

  function obterSessao() {
    if (window.Estado && window.Estado.sessaoValida) {
      return window.Estado.sessaoValida();
    }
    const s = window.Estado && window.Estado.get ? window.Estado.get().sessao : null;
    if (s) return Promise.resolve(s);
    return Promise.reject(erro('sem-sessao'));
  }

  function storageUrl(caminho) {
    return 'https://firebasestorage.googleapis.com/v0/b/' + CONFIG.storageBucket +
      '/o?uploadType=media&name=' + encodeURIComponent(caminho);
  }

  /* Só os cabeçalhos que o Storage aceita de um browser: Content-Type
     e Authorization. Um Cache-Control aqui fazia o browser bloquear o
     pedido antes de sair (CORS), e nenhuma fotografia subia
     (28.09.2026). */
  function subirObjeto(caminho, blob, tipo, sessao) {
    if (!blob) return Promise.reject(erro('sem-ficheiro'));
    const headers = {
      'Content-Type': tipo || blob.type || 'image/jpeg'
    };
    if (sessao && sessao.idToken) headers['Authorization'] = 'Bearer ' + sessao.idToken;
    return pedir(storageUrl(caminho), {
      method: 'POST',
      headers: headers,
      body: blob
    });
  }

  function apagarObjeto(caminho, sessao) {
    const headers = {};
    if (sessao && sessao.idToken) headers['Authorization'] = 'Bearer ' + sessao.idToken;
    return fetch('https://firebasestorage.googleapis.com/v0/b/' + CONFIG.storageBucket +
      '/o/' + encodeURIComponent(caminho), {
      method: 'DELETE',
      headers: headers
    }).catch(function () { /* ignora se já não existe */ });
  }

  /* O original de um vídeo leva a extensão dele; o de uma fotografia
     fica .jpg, como sempre foi, mesmo quando é HEIC. */
  function extOriginal(f) {
    return Fotos.ehVideo(f) ? Fotos.extensao(f.tipo) : 'jpg';
  }

  function enviarFoto(registo, meta) {
    if (simulada()) return Promise.reject(erro('sem-servidor'));
    return obterSessao().then(function (sessao) {
      const autorId = meta.autorId || sessao.uid;
      const cMini = Fotos.caminho(meta.dia, autorId, meta.sha, 'mini');
      const cVista = Fotos.caminho(meta.dia, autorId, meta.sha, 'vista');
      const cOrig = Fotos.caminho(meta.dia, autorId, meta.sha, 'original', extOriginal(registo));

      const pMini = subirObjeto(cMini, registo.mini, 'image/jpeg', sessao);
      const pVista = subirObjeto(cVista, registo.vista || registo.mini, 'image/jpeg', sessao);
      const pOrig = subirObjeto(cOrig, registo.original, registo.tipo || 'image/jpeg', sessao);

      return Promise.all([pMini, pVista, pOrig]).then(function () {
        const dadosFoto = {
          id: meta.id,
          dia: meta.dia || '',
          poi: meta.poi || '',
          autorId: autorId,
          /* Quem a tirou vai com ela — o nome, o carro, o lugar no carro
             e se é da organização: as regras só deixam cada um ler o
             próprio perfil, e a Galeria do grupo precisa de o dizer. */
          autorNome: meta.autorNome || '',
          autorModelo: meta.autorModelo || '',
          autorFuncao: meta.autorFuncao || '',
          autorPapel: meta.autorPapel || '',
          /* A hora a que chegou ao servidor, pelo relógio do telemóvel,
             que a rede acerta. É por ela que os outros telemóveis pedem
             só as novas — a do disparo não serve: uma fotografia tirada
             sem rede às dez pode subir às duas. */
          enviado: Date.now(),
          sha: meta.sha || '',
          criado: meta.criado || Date.now(),
          tipo: registo.tipo || 'image/jpeg',
          largura: registo.largura || 0,
          altura: registo.altura || 0,
          /* Num vídeo, os segundos; numa fotografia, zero. */
          duracao: Fotos.ehVideo(registo) ? Math.round((registo.duracao || 0) * 10) / 10 : 0,
          caminhoMini: cMini,
          caminhoVista: cVista,
          caminhoOriginal: cOrig
        };
        return pedir(firestore('fotos/' + meta.id), comSessao(sessao, 'PATCH', paraDocFoto(dadosFoto)))
          .catch(function (e) {
            /* O registo só se cria, nunca se reescreve. Se uma tentativa
               anterior o gravou e a resposta se perdeu, a repetição é
               recusada — e a fotografia ficaria pendente para sempre.
               Se ele já lá está, com este ficheiro, está enviada. */
            return pedir(firestore('fotos/' + meta.id), comSessao(sessao, 'GET')).then(function (doc) {
              if (deDocFoto(doc).sha !== dadosFoto.sha) throw e;
            }, function () { throw e; });
          })
          .then(function () {
            return {
              caminhoMini: cMini,
              caminhoVista: cVista,
              caminhoOriginal: cOrig
            };
          });
      });
    });
  }

  function apagarFoto(meta) {
    if (simulada()) return Promise.reject(erro('sem-servidor'));
    return obterSessao().then(function (sessao) {
      const autorId = meta.autorId || sessao.uid;
      const cMini = meta.caminhoMini || Fotos.caminho(meta.dia, autorId, meta.sha, 'mini');
      const cVista = meta.caminhoVista || Fotos.caminho(meta.dia, autorId, meta.sha, 'vista');
      const cOrig = meta.caminhoOriginal || Fotos.caminho(meta.dia, autorId, meta.sha, 'original', extOriginal(meta));

      const p1 = apagarObjeto(cMini, sessao);
      const p2 = apagarObjeto(cVista, sessao);
      const p3 = apagarObjeto(cOrig, sessao);
      const pDoc = pedir(firestore('fotos/' + meta.id), comSessao(sessao, 'DELETE'))
        .catch(function (e) { if (e.codigo !== 'nao-existe') throw e; });

      return Promise.all([p1, p2, p3, pDoc]);
    });
  }

  function fotosDoDia(dia, limite) {
    if (simulada()) return Promise.reject(erro('sem-servidor'));
    return obterSessao().then(function (sessao) {
      const query = {
        structuredQuery: {
          from: [{ collectionId: 'fotos' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'dia' },
              op: 'EQUAL',
              value: { stringValue: String(dia || '') }
            }
          },
          orderBy: [{ field: { fieldPath: 'criado' }, direction: 'DESCENDING' }],
          limit: limite || 50
        }
      };
      return pedir('https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId +
        '/databases/(default)/documents:runQuery', comSessao(sessao, 'POST', query))
        .then(function (linhas) {
          return (linhas || [])
            .filter(function (l) { return l.document; })
            .map(function (l) { return deDocFoto(l.document); });
        });
    });
  }

  /* As fotografias do grupo.
     desde: sem valor, a coleção inteira, página a página — é a leitura
     que apanha também as que foram apagadas. Com valor, só as que
     chegaram ao servidor depois disso, por ordem de chegada. */
  function fotosDoGrupo(desde) {
    if (simulada()) return Promise.reject(erro('sem-servidor'));
    return obterSessao().then(function (sessao) {
      const todas = [];
      const PAGINA = 300;

      if (!desde) {
        return (function pagina(marca) {
          return pedir(firestore('fotos?pageSize=' + PAGINA + (marca ? '&pageToken=' + encodeURIComponent(marca) : '')),
            comSessao(sessao, 'GET')).then(function (r) {
              (r.documents || []).forEach(function (d) { todas.push(deDocFoto(d)); });
              return r.nextPageToken ? pagina(r.nextPageToken) : todas;
            });
        })('');
      }

      return (function lote(depois) {
        const query = {
          structuredQuery: {
            from: [{ collectionId: 'fotos' }],
            where: { fieldFilter: { field: { fieldPath: 'enviado' }, op: 'GREATER_THAN', value: { integerValue: String(depois) } } },
            orderBy: [{ field: { fieldPath: 'enviado' }, direction: 'ASCENDING' }],
            limit: PAGINA
          }
        };
        return pedir('https://firestore.googleapis.com/v1/projects/' + CONFIG.projectId +
          '/databases/(default)/documents:runQuery', comSessao(sessao, 'POST', query)).then(function (linhas) {
            const novas = (linhas || []).filter(function (l) { return l.document; }).map(function (l) { return deDocFoto(l.document); });
            novas.forEach(function (f) { todas.push(f); });
            return novas.length === PAGINA ? lote(novas[novas.length - 1].enviado) : todas;
          });
      })(desde);
    });
  }

  /* ---------------------------------------------------------
     Participantes — o cartão público de cada convidado
     O perfil (contas/{uid}) tem o email e só o próprio e a
     organização o leem. Para a lista de quem vai, cada convidado
     publica ao lado um cartão só com o nome, o carro e o lugar no
     carro, que qualquer pessoa com sessão pode ler (28.09.2026).
     A organização não publica: viaja em carros próprios.
     --------------------------------------------------------- */

  function publicarParticipante(sessao, c) {
    if (simulada()) return Promise.reject(erro('sem-servidor'));
    return pedir(firestore('participantes/' + sessao.uid), comSessao(sessao, 'PATCH', { fields: {
      nome: { stringValue: c.nome || '' },
      modelo: { stringValue: c.modelo || '' },
      funcao: { stringValue: c.funcao || '' },
      atualizado: { integerValue: String(Date.now()) }
    } }));
  }

  function participantes() {
    if (simulada()) return Promise.reject(erro('sem-servidor'));
    return obterSessao().then(function (sessao) {
      const todos = [];
      return (function pagina(marca) {
        return pedir(firestore('participantes?pageSize=300' + (marca ? '&pageToken=' + encodeURIComponent(marca) : '')),
          comSessao(sessao, 'GET')).then(function (r) {
            (r.documents || []).forEach(function (d) {
              const f = d.fields || {};
              function t(k) { return f[k] ? (f[k].stringValue || '') : ''; }
              todos.push({ uid: d.name.split('/').pop(), nome: t('nome'), modelo: t('modelo'), funcao: t('funcao') });
            });
            return r.nextPageToken ? pagina(r.nextPageToken) : todos;
          });
      })('');
    });
  }

  /* Uma fotografia do grupo ainda existe? A leitura é pública, e por
     isso não precisa de sessão. */
  function fotoExiste(id) {
    if (simulada() || !id) return Promise.reject(erro('sem-servidor'));
    return pedir(firestore('fotos/' + encodeURIComponent(id)) + '?key=' + CONFIG.apiKey + '&mask.fieldPaths=id')
      .then(function () { return true; })
      .catch(function (e) { if (e.codigo === 'nao-existe') return false; throw e; });
  }

  /* O endereço público de um objeto, para um <img>. As regras deixam
     ler as fotografias sem sessão. */
  function enderecoFoto(caminho) {
    if (simulada() || !caminho) return '';
    return 'https://firebasestorage.googleapis.com/v0/b/' + CONFIG.storageBucket + '/o/' +
      encodeURIComponent(caminho) + '?alt=media';
  }

  /* Um dos três tamanhos de uma fotografia do grupo, do Storage, para
     guardar no telemóvel. Precisa do CORS do bucket para o domínio da
     app (docs/firebase/cors.json, aplicado a 03.10.2026); sem ele, o
     browser recusa a resposta. A leitura é pública, e o pedido vai sem
     sessão nem cabeçalhos: é um pedido simples, sem a pergunta prévia
     do CORS, que na montanha era mais uma ida e volta por imagem.
     Uma falha com rede pode ser o CORS ou a rede: durante uns minutos
     não se pedem miniaturas nem vistas — mostram-se pelo endereço
     direto. O original pede-se sempre, porque é quem o guarda que o
     pede, e uma falha da rede não o pode deixar sem ele.
       opcoes.original            — o pedido é de quem o guarda
       opcoes.progresso(lidos, total), em bytes */
  const PAUSA_SEM_CORS = 5 * 60 * 1000;
  let semCorsAte = 0;
  function descarregarFoto(caminho, opcoes) {
    const o = opcoes || {};
    if (simulada() || !caminho) return Promise.reject(erro('sem-servidor'));
    if (!navigator.onLine) return Promise.reject(erro('sem-rede'));
    if (!o.original && Date.now() < semCorsAte) return Promise.reject(erro('sem-cors'));
    return fetch(enderecoFoto(caminho)).catch(function () {
      if (navigator.onLine) semCorsAte = Date.now() + PAUSA_SEM_CORS;
      throw erro(navigator.onLine ? 'sem-cors' : 'sem-rede');
    }).then(function (r) {
      if (r.status === 404) throw erro('nao-existe');
      if (!r.ok) throw erro('servidor');
      return o.progresso ? lerAosBocados(r, o.progresso) : r.blob();
    });
  }

  /* O corpo da resposta aos bocados, para se dizer quanto falta: o
     original de um vídeo são dezenas de megabytes. Cada 8 MB passam a
     Blob, para o telemóvel não juntar o ficheiro inteiro em memória
     antes de o entregar. */
  const BOCADO = 8 * 1024 * 1024;
  function lerAosBocados(r, progresso) {
    if (!r.body || !r.body.getReader) return r.blob();
    const total = parseInt(r.headers.get('Content-Length'), 10) || 0;
    const tipo = r.headers.get('Content-Type') || '';
    const leitor = r.body.getReader();
    const blobs = [];
    let pedaco = [];
    let noPedaco = 0;
    let lidos = 0;
    function fecharPedaco() {
      if (pedaco.length) blobs.push(new Blob(pedaco));
      pedaco = [];
      noPedaco = 0;
    }
    return (function passo() {
      return leitor.read().then(function (x) {
        if (x.done) { fecharPedaco(); return new Blob(blobs, { type: tipo }); }
        pedaco.push(x.value);
        noPedaco += x.value.length;
        lidos += x.value.length;
        if (noPedaco >= BOCADO) fecharPedaco();
        progresso(lidos, total);
        return passo();
      });
    })();
  }

  function ligada() {
    return !simulada() && !!CONFIG.storageBucket && !!(window.Estado && window.Estado.get && window.Estado.get().sessao);
  }

  return {
    simulada: simulada,

    criarConta: criarConta,
    criarContaOrganizacao: criarContaOrganizacao,
    pedeCodigo: function () { return servidor().pedeCodigo(); },
    entrar: entrar,
    entrarOrganizacao: entrarOrganizacao,
    jaConfirmou: jaConfirmou,
    reenviarConfirmacao: function (pendente) {
      return servidor().renovar(pendente.sessao).then(function (sessao) {
        return servidor().pedirConfirmacao(sessao).then(function () { return sessao; });
      });
    },
    confirmado: function (sessao) { return servidor().confirmado(sessao); },
    naEquipa: function (email) { return servidor().naEquipa(normalizar(email)); },
    recuperar: recuperar,
    renovar: function (sessao) { return servidor().renovar(sessao); },
    publicarPerfil: function (sessao, perfil) { return servidor().publicarPerfil(sessao, perfil); },
    contas: function (sessao) { return servidor().contas(sessao); },
    apagarConta: function (sessao, uid) { return servidor().apagarConta(sessao, uid); },
    equipa: function (sessao) { return servidor().equipa(sessao); },
    juntarEquipa: emailDaEquipa,
    retirarEquipa: function (sessao, email) { return servidor().retirarEquipa(sessao, normalizar(email)); },

    ligada: ligada,
    enviarFoto: enviarFoto,
    apagarFoto: apagarFoto,
    fotosDoDia: fotosDoDia,
    fotosDoGrupo: fotosDoGrupo,
    publicarParticipante: publicarParticipante,
    participantes: participantes,
    descarregarFoto: descarregarFoto,
    enderecoFoto: enderecoFoto,
    fotoExiste: fotoExiste
  };
})();
