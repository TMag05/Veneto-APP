/* =========================================================
   Estado local
   Offline é o estado normal. Tudo o que o convidado faz é
   escrito localmente primeiro e posto numa fila que sobe
   sozinha quando houver rede. O convidado nunca vê um erro.
   ========================================================= */

window.Estado = (function () {
  const CHAVE = 'veneto.estado.v1';

  const inicial = {
    versao: 1,
    autenticado: false,
    /* A conta do convidado, criada por ele na primeira abertura.
       O carro é o que declarou: o modelo. */
    uid: '',
    sessao: null,
    perfilPendente: false,
    /* O que a entrada tem para dizer, quando a sessão acabou sem
       ser por escolha de quem a tinha. */
    aviso: '',
    /* papel vem da conta: 'convidado' ou 'organizacao'. */
    perfil: { nome: '', email: '', telefone: '', modelo: '', papel: 'convidado' },
    /* A ficha da organização com o mesmo email, se existir. Dá a
       matrícula e quem partilha o carro; não é condição de entrada. */
    participanteId: '',
    /* Só os metadados. A imagem vive em Fotos (IndexedDB). */
    fotos: [],
    pedidos: [],
    fila: [],
    chegadaVista: false,
    album: false,
    /* 'escuro' (o de origem) ou 'claro'. Escolhe-se em Mais. */
    tema: 'escuro',
    /* Só para acessos de organização: o modo em que se estava da
       última vez, 'convidado' ou 'organizacao'. A equipa usa a app
       como os convidados e passa à organização para alterar. */
    modo: 'convidado'
  };

  let estado = carregar();
  const ouvintes = [];

  function carregar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CHAVE));
      if (guardado && guardado.versao === inicial.versao) {
        const e = Object.assign({}, inicial, guardado);
        /* Até setembro de 2026 a imagem era gravada aqui dentro, em
           dataUrl e já reduzida. Essas entradas não se convertem: o
           original perdeu-se na redução e chamar-lhe original seria
           mentira. Saem, e o arquivo recomeça no ficheiro de origem. */
        e.fotos = (e.fotos || []).filter(function (f) { return f && !f.dataUrl; });
        /* A marcação de chegada saiu da app: o grupo anda em caravana e
           chega junto. O que ficou gravado de versões anteriores vai fora. */
        delete e.chegadas;
        e.perfil = Object.assign({}, inicial.perfil, e.perfil);
        /* Até 26.09.2026 a organização entrava por um código, e o
           papel ficava no telemóvel. Agora é da conta: quem entrou
           assim volta a convidado e entra pela porta da organização. */
        delete e.papel;
        /* Antes de haver contas, a entrada aceitava qualquer código.
           Quem entrou assim cria a sua conta; o nome e o email ficam
           escritos para não ter de os repetir. */
        if (e.autenticado && !e.uid) e.autenticado = false;
        return e;
      }
    } catch (e) { /* estado corrompido: recomeça-se em silêncio */ }
    return JSON.parse(JSON.stringify(inicial));
  }

  function guardar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      /* Aqui dentro já só há texto: cada fotografia ocupa uns cento e
         poucos bytes de metadados. Se mesmo assim a quota fechar, o
         que está em memória fica intacto — apagar a fotografia mais
         antiga em silêncio, como se fazia antes, é a pior resposta
         possível a um telemóvel cheio. */
    }
  }

  function emitir() {
    ouvintes.forEach(function (fn) { fn(estado); });
  }

  function definir(mudanca) {
    Object.assign(estado, mudanca);
    guardar();
    emitir();
  }

  function subscrever(fn) { ouvintes.push(fn); }

  /* ---------------------------------------------------------
     Relógio
     --------------------------------------------------------- */

  function agora() { return new Date(); }

  function chave(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* 'pre' | 'durante' | 'pos'. Sem datas definidas, está tudo por vir. */
  function fase() {
    if (!DADOS.evento.inicio || !DADOS.evento.fim) return 'pre';
    const hoje = chave(agora());
    if (hoje < DADOS.evento.inicio) return 'pre';
    if (hoje > DADOS.evento.fim) return 'pos';
    return 'durante';
  }

  /* O dia do programa a mostrar por defeito. Null se ainda não há itinerário. */
  function diaAtivo() {
    if (!DADOS.dias.length) return null;
    const hoje = chave(agora());
    const exato = DADOS.dias.find(function (d) { return d.data === hoje; });
    if (exato) return exato;
    return fase() === 'pos' ? DADOS.dias[DADOS.dias.length - 1] : DADOS.dias[0];
  }

  function diasAte() {
    if (!DADOS.evento.inicio) return null;
    const ms = new Date(DADOS.evento.inicio + 'T00:00:00') - new Date(chave(agora()) + 'T00:00:00');
    return Math.round(ms / 86400000);
  }

  function ehOrganizacao() { return estado.autenticado && estado.perfil.papel === 'organizacao'; }

  /* ---------------------------------------------------------
     Perfil e carro
     --------------------------------------------------------- */

  /* A ficha que a organização criou para esta pessoa, se criou. */
  function euParticipante() {
    if (!estado.participanteId) return null;
    return DADOS.participante(estado.participanteId);
  }

  /* O carro é o que o convidado declarou ao criar a conta. Havendo
     ficha da organização com o mesmo email, é dela que vêm a
     matrícula e quem viaja no mesmo carro. */
  function meuCarro() {
    const p = euParticipante();
    const daFicha = p ? DADOS.carros.find(function (c) { return c.equipa === (p.equipa || '').trim(); }) : null;
    const conta = estado.perfil;
    if (!conta.modelo) return daFicha || null;
    if (daFicha) return Object.assign({}, daFicha, { modelo: conta.modelo });
    return { id: 'conta', equipa: '', modelo: conta.modelo, matricula: '', perfis: [conta.nome] };
  }

  /* Encontra a ficha pelo email, na entrada. */
  function associarPorEmail(email) {
    const alvo = String(email || '').trim().toLowerCase();
    if (!alvo) return null;
    const p = DADOS.participantes.find(function (x) {
      return String(x.email || '').trim().toLowerCase() === alvo;
    });
    return p || null;
  }

  function eu() {
    const carro = meuCarro();
    const p = euParticipante();
    return {
      id: 'eu',
      nome: (p ? DADOS.nomeCompleto(p) : estado.perfil.nome) || 'Convidado',
      modelo: carro ? carro.modelo : 'db12'
    };
  }

  function carroRegistado() { return !!meuCarro(); }

  /* ---------------------------------------------------------
     Sessão
     A conta cria-se com rede, uma vez. Daí para a frente a
     sessão vive no telemóvel e a app abre sem perguntar nada,
     com ou sem rede. O token renova-se quando há ligação; se o
     servidor disser que a conta deixou de existir, volta-se à
     entrada, onde se pode criar outra.
     --------------------------------------------------------- */

  function iniciarSessao(r) {
    const ficha = associarPorEmail(r.perfil.email);
    definir({
      autenticado: true,
      aviso: '',
      uid: r.sessao.uid,
      sessao: r.sessao,
      perfilPendente: !!r.perfilPendente,
      participanteId: ficha ? ficha.id : '',
      perfil: {
        nome: r.perfil.nome || (ficha ? DADOS.nomeCompleto(ficha) : estado.perfil.nome),
        email: r.perfil.email,
        telefone: estado.perfil.telefone || (ficha ? ficha.telefone || '' : ''),
        modelo: r.perfil.modelo || '',
        papel: r.perfil.papel === 'organizacao' ? 'organizacao' : 'convidado'
      }
    });
    publicarPendente();
  }

  /* Lembra o modo sem repintar: é o ecrã que se abre que o diz. */
  function lembrarModo(modo) {
    if (estado.modo === modo) return;
    estado.modo = modo;
    guardar();
  }

  /* O papel é da conta: sai com ela. */
  function terminarSessao(aviso) {
    definir({
      autenticado: false, aviso: aviso || '', uid: '', sessao: null, perfilPendente: false, participanteId: '',
      perfil: Object.assign({}, estado.perfil, { papel: 'convidado' })
    });
  }

  /* Uma sessão com o token em dia, renovado se faltar pouco. */
  let aRenovar = null;
  function sessaoValida(forcar) {
    const s = estado.sessao;
    if (!s) return Promise.reject(new Error('sem sessão'));
    if (!forcar && s.expira - Date.now() > 5 * 60 * 1000) return Promise.resolve(s);
    if (aRenovar) return aRenovar;
    aRenovar = Nuvem.renovar(s).then(function (nova) {
      aRenovar = null;
      if (estado.sessao && estado.sessao.uid === nova.uid) {
        estado.sessao = nova;
        guardar();
      }
      return nova;
    }).catch(function (e) {
      aRenovar = null;
      if (e && e.codigo === 'conta-apagada' && estado.sessao === s) terminarSessao('conta-apagada');
      throw e;
    });
    return aRenovar;
  }

  function perfilPublico() {
    const p = estado.perfil;
    return { nome: p.nome, email: p.email, modelo: p.modelo, papel: p.papel, criado: Date.now() };
  }

  /* O perfil que ficou por gravar no servidor, ou que mudou desde. */
  function publicarPendente() {
    if (!estado.autenticado || !estado.perfilPendente || !navigator.onLine) return;
    sessaoValida().then(function (s) {
      return Nuvem.publicarPerfil(s, perfilPublico());
    }).then(function () {
      if (estado.perfilPendente) definir({ perfilPendente: false });
    }).catch(function () { /* fica para a próxima ligação */ });
  }

  /* Muda o nome, o contacto ou o carro. Escreve-se primeiro aqui;
     o servidor recebe quando houver rede. */
  function atualizarPerfil(mudanca) {
    definir({ perfil: Object.assign({}, estado.perfil, mudanca), perfilPendente: true });
    publicarPendente();
  }

  /* Ao abrir e ao voltar a ter rede: confirma a sessão e envia o
     que ficou pendente. Sem rede não faz nada, e ninguém dá por isso. */
  function verificarSessao() {
    if (!estado.autenticado || !estado.sessao || !navigator.onLine) return;
    /* Renova-se sempre: é o que faz saber que a conta ainda existe. */
    sessaoValida(true).then(publicarPendente).catch(function () { /* resolvido acima */ });
  }

  /* ---------------------------------------------------------
     Fila offline
     --------------------------------------------------------- */

  function enfileirar(tipo, resumo, ref) {
    const item = { id: 'q' + Date.now() + Math.floor(Math.random() * 1000), tipo: tipo, resumo: resumo, ref: ref || '', criado: Date.now(), estado: 'pendente' };
    estado.fila.push(item);
    guardar();
    emitir();
    sincronizar();
    return item.id;
  }

  let aSincronizar = false;
  function sincronizar() {
    if (aSincronizar) return;
    enviarFotos();
    /* As fotografias seguem por Nuvem, cada uma com a sua confirmação:
       só passam a 'enviado' quando os três tamanhos subirem. Dar uma
       fotografia por enviada sem ninguém a ter recebido é o erro que
       esta reescrita veio corrigir. */
    const pendentes = estado.fila.filter(function (i) { return i.estado === 'pendente' && i.tipo !== 'foto'; });
    if (!pendentes.length || !navigator.onLine) return;
    aSincronizar = true;
    /* Na versão real: escrita em Firestore / Storage com repetição. */
    setTimeout(function () {
      pendentes.forEach(function (i) { i.estado = 'enviado'; });
      estado.fila = estado.fila.filter(function (i) { return i.estado !== 'enviado'; });
      aSincronizar = false;
      guardar();
      emitir();
    }, 1400 + Math.random() * 900);
  }

  /* O que a barra de rede conta. As fotografias têm contagem própria
     — pô-las aqui punha o telemóvel a dizer «a sincronizar» para
     sempre, e isso seria tão falso como dizer «enviado». */
  function pendentes() {
    return estado.fila.filter(function (i) { return i.estado === 'pendente' && i.tipo !== 'foto'; }).length;
  }

  /* Sobe as que faltam, uma de cada vez para não afogar a ligação.
     Sem servidor não faz nada e ninguém dá por isso. */
  let aEnviarFotos = false;
  function enviarFotos() {
    if (aEnviarFotos || !Nuvem.ligada() || !navigator.onLine) return;
    const meta = estado.fotos.find(function (f) { return f.estadoEnvio !== 'enviado'; });
    if (!meta) return;
    aEnviarFotos = true;
    Fotos.ler(meta.id).then(function (registo) {
      if (!registo) throw new Error('ficheiro perdido');
      return Nuvem.enviarFoto(registo, meta);
    }).then(function (caminhos) {
      Object.assign(meta, caminhos, { estadoEnvio: 'enviado' });
      estado.fila = estado.fila.filter(function (i) { return !(i.tipo === 'foto' && i.ref === meta.id); });
      aEnviarFotos = false;
      guardar();
      emitir();
      enviarFotos();
    }).catch(function () {
      /* Fica pendente. A próxima ligação volta a tentar — e o caminho
         é o mesmo, por ser o do ficheiro, por isso repetir não duplica. */
      aEnviarFotos = false;
    });
  }

  function fotosPorEnviar() {
    return estado.fotos.filter(function (f) { return f.estadoEnvio !== 'enviado'; }).length;
  }

  /* ---------------------------------------------------------
     Fotografias
     --------------------------------------------------------- */

  /* Quem é esta pessoa para o servidor. Com contas a sério passa a
     ser o uid do Auth; até lá, a ficha que a organização criou. */
  function meuId() {
    return estado.uid || estado.participanteId || 'eu';
  }

  /* Travão de comportamento, não de armazenamento: cem fotografias
     num dia já é muito para trinta pessoas verem. */
  const LIMITE_DIARIO = 100;

  function contarDoDia(dia) {
    return estado.fotos.filter(function (f) { return f.dia === dia; }).length;
  }

  /* Recebe o ficheiro tal como saiu da câmara. O original vai inteiro
     para o arquivo do telemóvel, sem passar por tela nem por
     compressão; ao lado ficam os dois tamanhos que se mostram. Aqui
     só ficam os metadados. */
  function juntarFoto(ficheiro, dia, poi, feito) {
    if (contarDoDia(dia) >= LIMITE_DIARIO) { if (feito) feito(null, 'limite'); return; }

    const id = 'm' + Date.now() + Math.floor(Math.random() * 1000);
    const tamanhos = [
      { nome: 'mini', lado: 320, qualidade: 0.7 },
      { nome: 'vista', lado: 1600, qualidade: 0.85 }
    ];

    UI.derivadas(ficheiro, tamanhos, function (d) {
      if (!d) { if (feito) feito(null, 'leitura'); return; }
      Fotos.impressao(ficheiro).then(function (sha) {
        return Fotos.guardar({
          id: id,
          original: ficheiro,
          mini: d.mini,
          vista: d.vista,
          sha: sha,
          tipo: ficheiro.type || 'image/jpeg',
          largura: d.largura,
          altura: d.altura,
          criado: Date.now()
        }).then(function () { return sha; });
      }).then(function (sha) {
        estado.fotos.push({
          id: id,
          autor: 'eu',
          autorId: meuId(),
          dia: dia,
          poi: poi,
          sha: sha,
          criado: Date.now(),
          largura: d.largura,
          altura: d.altura,
          tamanho: ficheiro.size || 0,
          nome: ficheiro.name || '',
          estadoEnvio: 'pendente'
        });
        enfileirar('foto', 'Fotografia' + (poi && POIS[poi] ? ' — ' + POIS[poi].nome : ''), id);
        if (feito) feito(id);
      }).catch(function () {
        if (feito) feito(null, 'espaco');
      });
    });
  }

  function foto(id) {
    return estado.fotos.find(function (f) { return f.id === id; }) || null;
  }

  function apagarFoto(id) {
    const meta = foto(id);
    if (meta && meta.estadoEnvio === 'enviado' && Nuvem.ligada()) {
      Nuvem.apagarFoto(meta).catch(function () { /* fica para a limpeza da organização */ });
    }
    estado.fotos = estado.fotos.filter(function (f) { return f.id !== id; });
    estado.fila = estado.fila.filter(function (i) { return !(i.tipo === 'foto' && i.ref === id); });
    guardar();
    emitir();
    return Fotos.apagar(id).catch(function () { /* já não existia */ });
  }

  /* Todas as fotografias, as semeadas e as minhas, mais recentes primeiro. */
  function fotos() {
    const minhas = estado.fotos.map(function (f) { return Object.assign({ propria: true }, f); });
    const outras = DADOS.fotosIniciais.map(function (f) { return Object.assign({ propria: false }, f); });
    return outras.concat(minhas).reverse();
  }

  /* ---------------------------------------------------------
     Pedidos ao concierge
     --------------------------------------------------------- */

  /* Um pedido é entregue a uma pessoa. Não há resposta automática:
     fingir uma resposta é pior do que não ter nenhuma. */
  function pedir(texto) {
    estado.pedidos.push({ id: 'r' + Date.now(), texto: texto, criado: Date.now(), estado: 'entregue', resposta: null });
    enfileirar('pedido', 'Pedido ao concierge');
  }

  window.addEventListener('online', sincronizar);
  window.addEventListener('online', verificarSessao);
  window.addEventListener('offline', emitir);

  return {
    get: function () { return estado; },
    definir: definir,
    subscrever: subscrever,
    guardar: guardar,
    emitir: emitir,
    agora: agora,
    chave: chave,
    fase: fase,
    diaAtivo: diaAtivo,
    diasAte: diasAte,
    ehOrganizacao: ehOrganizacao,
    lembrarModo: lembrarModo,
    eu: eu,
    carroRegistado: carroRegistado,
    iniciarSessao: iniciarSessao,
    terminarSessao: terminarSessao,
    sessaoValida: sessaoValida,
    verificarSessao: verificarSessao,
    atualizarPerfil: atualizarPerfil,
    euParticipante: euParticipante,
    meuCarro: meuCarro,
    associarPorEmail: associarPorEmail,
    enfileirar: enfileirar,
    sincronizar: sincronizar,
    pendentes: pendentes,
    meuId: meuId,
    juntarFoto: juntarFoto,
    apagarFoto: apagarFoto,
    foto: foto,
    fotosPorEnviar: fotosPorEnviar,
    fotos: fotos,
    pedir: pedir,
    reiniciar: function () {
      Fotos.limpar().catch(function () { /* nada para limpar */ });
      localStorage.removeItem(CHAVE);
      estado = JSON.parse(JSON.stringify(inicial));
      guardar();
      emitir();
    }
  };
})();
