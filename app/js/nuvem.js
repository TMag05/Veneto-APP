/* =========================================================
   A fronteira com o servidor
   Toda a app trata o servidor como se ele não existisse:
   escreve no telemóvel e segue. Este ficheiro é o único sítio
   que sabe que há um do outro lado.

   Tem duas metades: as contas, dos convidados e da organização,
   que já funcionam, e as fotografias, que esperam pelo
   Storage. Nada fora deste ficheiro conhece o Firestore, o Storage ou o Auth.
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
    apiKey: '',
    projectId: ''
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
     Um perfil é { uid, nome, email, modelo, papel, criado }.
     papel é 'convidado' ou 'organizacao'. A organização viaja
     em carros próprios: o perfil dela não tem modelo.

     criarConta({ nome, email, senha, modelo })
       → { sessao, perfil, perfilPendente }
       perfilPendente é true quando a conta ficou criada mas o
       perfil não chegou ao Firestore; volta-se a publicar
       depois, com publicarPerfil.
     entrar(email, senha)        → { sessao, perfil }
     criarContaOrganizacao({ nome, email, senha, codigo })
       → { sessao, perfil, perfilPendente }
       Só para emails da equipa. O código só é pedido, e só
       serve, enquanto a equipa estiver vazia (pedeCodigo()).
     recuperar(email)            → resolve sempre, exista a conta ou não
     renovar(sessao)             → sessão nova
     publicarPerfil(sessao, p)   → grava o perfil
     contas(sessao)              → todos os perfis, para a organização
     apagarConta(sessao, uid)    → apaga o perfil e a conta

     A equipa — os emails que podem ter acesso de organização:
     equipa(sessao)              → [{ email, criado }]
     juntarEquipa(sessao, email) → acrescenta o email
     retirarEquipa(sessao, email)→ tira o email e apaga o acesso
                                   que houver com ele

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
       · Auth › Email/palavra-passe ligado, e o modelo do email
         de recuperação em português.
       · Regras do Firestore para contas/{uid}: cada pessoa lê e
         escreve a sua; a organização lê e apaga todas. Quem é
         da organização diz-se por equipa/{email}: um perfil só
         pode ter papel 'organizacao' se existir esse documento
         para o email do token.
       · Regras para equipa/{email}: get aberto a todos — a
         entrada precisa de saber se o email é da equipa antes
         de criar a conta —; list e escrita só para a equipa. A
         primeira entrada escreve-se à mão, na consola.
       · Uma Cloud Function em contas/{uid} onDelete que apaga
         o utilizador do Auth. O telemóvel não pode apagar a
         conta de outra pessoa, e sem isto o email ficaria
         preso a uma conta sem perfil.
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

  function auth(acao, corpo) {
    return pedir(AUTH + acao + '?key=' + CONFIG.apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    });
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
      papel: { stringValue: p.papel || 'convidado' },
      criado: { integerValue: String(p.criado) }
    } };
  }

  function deDocumento(doc) {
    const f = doc.fields || {};
    function t(k) { return f[k] ? (f[k].stringValue || '') : ''; }
    return {
      uid: doc.name.split('/').pop(),
      nome: t('nome'), email: t('email'), modelo: t('modelo'),
      papel: t('papel') === 'organizacao' ? 'organizacao' : 'convidado',
      criado: f.criado ? Number(f.criado.integerValue) : 0
    };
  }

  const firebase = {
    criarConta: function (d) {
      return auth('signUp', { email: normalizar(d.email), password: d.senha, returnSecureToken: true })
        .then(function (r) {
          const sessao = sessaoDe(r);
          const perfil = perfilDe(sessao.uid, d);
          return firebase.publicarPerfil(sessao, perfil)
            .then(function () { return { sessao: sessao, perfil: perfil, perfilPendente: false }; })
            .catch(function () { return { sessao: sessao, perfil: perfil, perfilPendente: true }; });
        });
    },

    /* Pergunta-se primeiro se o email é da equipa: criar a conta
       e só depois descobrir que não é deixaria uma conta órfã. */
    criarContaOrganizacao: function (d) {
      return pedir(firestore('equipa/' + encodeURIComponent(normalizar(d.email))), { method: 'GET' })
        .catch(function (e) { throw e.codigo === 'nao-existe' ? erro('fora-da-equipa') : e; })
        .then(function () {
          return firebase.criarConta(Object.assign({}, d, { papel: 'organizacao' }));
        });
    },

    entrar: function (email, senha) {
      return auth('signInWithPassword', { email: normalizar(email), password: senha, returnSecureToken: true })
        .then(function (r) {
          const sessao = sessaoDe(r);
          return pedir(firestore('contas/' + sessao.uid), comSessao(sessao, 'GET'))
            .then(deDocumento)
            .catch(function () { return perfilDe(sessao.uid, { email: email }); })
            .then(function (perfil) { return { sessao: sessao, perfil: perfil }; });
        });
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

    apagarConta: function (sessao, uid) {
      return pedir(firestore('contas/' + uid), comSessao(sessao, 'DELETE'))
        .catch(function (e) { if (e.codigo !== 'nao-existe') throw e; });
    },

    pedeCodigo: function () { return false; },

    equipa: function (sessao) {
      return pedir(firestore('equipa?pageSize=100'), comSessao(sessao, 'GET')).then(function (r) {
        return (r.documents || []).map(function (doc) {
          const f = doc.fields || {};
          return {
            email: f.email ? f.email.stringValue : decodeURIComponent(doc.name.split('/').pop()),
            criado: f.criado ? Number(f.criado.integerValue) : 0
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
    return { uid: c.uid, nome: c.nome, email: c.email, modelo: c.modelo,
      papel: c.papel === 'organizacao' ? 'organizacao' : 'convidado', criado: c.criado };
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

    /* A primeira pessoa da equipa entra com o código; as outras
       têm de lá estar antes, acrescentadas por quem já entrou. */
    criarContaOrganizacao: function (d) {
      const email = normalizar(d.email);
      const s = lerSimulado();
      if (!s.equipa[email]) {
        if (Object.keys(s.equipa).length) return demora().then(function () { throw erro('fora-da-equipa'); });
        if (String(d.codigo || '').trim() !== CODIGO_EQUIPA) return demora().then(function () { throw erro('codigo-errado'); });
      }
      return simulado.criarConta(Object.assign({}, d, { papel: 'organizacao' })).then(function (r) {
        const t = lerSimulado();
        t.equipa[email] = t.equipa[email] || { email: email, criado: Date.now() };
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
        Object.assign(c, { nome: perfil.nome, modelo: perfil.modelo });
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
        s.equipa[email] = s.equipa[email] || { email: email, criado: Date.now() };
        gravarSimulado(s);
      });
    },

    retirarEquipa: function (sessao, email) {
      return demora().then(function () {
        const s = lerSimulado();
        delete s.equipa[email];
        gravarSimulado(s);
        const c = porEmail(s, email);
        if (c) return simulado.apagarConta(sessao, c.uid);
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

  function criarContaOrganizacao(d) {
    if (!emailValido(normalizar(d.email))) return Promise.reject(erro('email-invalido'));
    if (String(d.senha || '').length < 6) return Promise.reject(erro('senha-curta'));
    return servidor().criarContaOrganizacao(d);
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
       câmara, sem reprocessar, mesmo que seja HEIC.

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

  function porLigar() {
    return Promise.reject(new Error('sem servidor'));
  }

  return {
    simulada: simulada,

    criarConta: criarConta,
    criarContaOrganizacao: criarContaOrganizacao,
    pedeCodigo: function () { return servidor().pedeCodigo(); },
    entrar: entrar,
    recuperar: recuperar,
    renovar: function (sessao) { return servidor().renovar(sessao); },
    publicarPerfil: function (sessao, perfil) { return servidor().publicarPerfil(sessao, perfil); },
    contas: function (sessao) { return servidor().contas(sessao); },
    apagarConta: function (sessao, uid) { return servidor().apagarConta(sessao, uid); },
    equipa: function (sessao) { return servidor().equipa(sessao); },
    juntarEquipa: emailDaEquipa,
    retirarEquipa: function (sessao, email) { return servidor().retirarEquipa(sessao, normalizar(email)); },

    ligada: function () { return false; },
    enviarFoto: porLigar,
    apagarFoto: porLigar,
    fotosDoDia: porLigar
  };
})();
