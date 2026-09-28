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
    perfil: { nome: '', email: '', telefone: '', modelo: '', funcao: '', papel: 'convidado' },
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

  /* O relógio do programa é o de Itália, seja qual for o fuso do
     telemóvel: as horas do itinerário são italianas, e um telemóvel
     com a hora acertada à mão, ou ainda em Lisboa, andaria uma hora
     atrás dos outros (28.09.2026). Devolve uma data cujos campos
     locais — getHours, getDate — são a hora de Roma, e é por eles
     que a app conta tudo. Sem suporte de fusos, fica a do telemóvel. */
  const FUSO = 'Europe/Rome';
  let relogioItalia = null;
  try {
    relogioItalia = new Intl.DateTimeFormat('en-GB', {
      timeZone: FUSO, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch (e) { /* browser sem fusos: hora do telemóvel */ }

  function agora() {
    const real = new Date();
    if (!relogioItalia) return real;
    const p = {};
    relogioItalia.formatToParts(real).forEach(function (x) { p[x.type] = x.value; });
    return new Date(Number(p.year), Number(p.month) - 1, Number(p.day),
      Number(p.hour) % 24, Number(p.minute), Number(p.second), real.getMilliseconds());
  }

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
     A revelação de cada dia
     O programa de um dia revela-se na véspera, quinze minutos
     depois da hora do jantar; o primeiro está à vista desde
     sempre. É o fator surpresa do passeio (28.09.2026). Entre a
     revelação e a meia-noite, o separador Hoje chama-se Amanhã e
     mostra o dia seguinte inteiro. A organização vê tudo. A regra
     vive só aqui, e lê o relógio e o programa: funciona sem rede.
     --------------------------------------------------------- */

  const DEPOIS_DO_JANTAR = 15; /* minutos */

  /* O jantar de um dia: a última refeição marcada a partir das
     17:00. Se a organização o mudar de hora, a revelação vai com
     ele. */
  function jantar(dia) {
    let j = null;
    (dia.momentos || []).forEach(function (m) {
      if (m.tipo === 'refeicao' && m.hora && m.hora >= '17:00') j = m;
    });
    return j;
  }

  /* O instante em que um dia se revela, ou null se está à vista
     desde sempre. Sem jantar na véspera, abre à meia-noite. */
  function revelaEm(dia) {
    const i = dia ? DADOS.dias.findIndex(function (d) { return d.id === dia.id; }) : -1;
    if (i <= 0) return null;
    const vespera = DADOS.dias[i - 1];
    if (!vespera.data) return null;
    const t = new Date(vespera.data + 'T00:00:00');
    const j = jantar(vespera);
    if (j) t.setMinutes(UI.minutos(j.hora) + DEPOIS_DO_JANTAR);
    else t.setDate(t.getDate() + 1);
    return t;
  }

  function revelado(dia) {
    const t = revelaEm(dia);
    return !t || agora() >= t;
  }

  /* O que o convidado pode ver. A organização vê sempre tudo. */
  function diaVisivel(dia) { return !!dia && (ehOrganizacao() || revelado(dia)); }

  /* Uma paragem fica por revelar enquanto todos os dias em que
     aparece estiverem por revelar. A que não aparece em dia
     nenhum está à vista. */
  function poiVisivel(id) {
    if (ehOrganizacao()) return true;
    let aparece = false;
    const aberta = DADOS.dias.some(function (d) {
      const nele = (d.etapas || []).indexOf(id) >= 0 ||
        (d.momentos || []).some(function (m) { return m.poi === id; });
      if (nele) aparece = true;
      return nele && revelado(d);
    });
    return aberta || !aparece;
  }

  /* O dia de amanhã, entre a sua revelação e a meia-noite; fora
     dessa janela, null. */
  function amanha() {
    const hoje = chave(agora());
    return DADOS.dias.find(function (d) {
      const t = revelaEm(d);
      return !!t && d.data > hoje && agora() >= t;
    }) || null;
  }

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
        funcao: r.perfil.funcao || '',
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
    return { nome: p.nome, email: p.email, modelo: p.modelo, funcao: p.funcao || '', papel: p.papel, criado: Date.now() };
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
    sincronizarGrupo();
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
     Sai logo a seguir a tirar a fotografia — é nesse momento que o
     grupo a deve ver. Se falhar — um vale sem rede, uma ligação que
     cai a meio —, sobe no primeiro momento em que a ligação voltar:
     quando o telemóvel avisa que voltou, quando a app volta a ficar à
     vista, e, porque esse aviso nem sempre chega (no iPhone, ou com
     rede que não passa dados), de quinze em quinze segundos, sem
     espaçar. Sem rede, a tentativa nem sai do telemóvel. Sem servidor
     não faz nada e ninguém dá por isso. */
  let aEnviarFotos = false;
  let repetir = null;
  const REPETIR = 15; /* segundos */

  function tentarDeNovo() {
    if (repetir) return;
    repetir = setTimeout(function () { repetir = null; enviarFotos(); }, REPETIR * 1000);
  }

  function enviarFotos() {
    if (aEnviarFotos || !Nuvem.ligada()) return;
    if (!navigator.onLine) { if (fotosPorEnviar()) tentarDeNovo(); return; }
    const meta = estado.fotos.find(function (f) { return f.estadoEnvio !== 'enviado'; });
    if (!meta) return;
    aEnviarFotos = true;
    Fotos.ler(meta.id).then(function (registo) {
      if (!registo) throw new Error('ficheiro perdido');
      return Nuvem.enviarFoto(registo, Object.assign({}, meta, {
        autorNome: estado.perfil.nome || '',
        autorModelo: estado.perfil.modelo || '',
        autorFuncao: estado.perfil.funcao || '',
        autorPapel: estado.perfil.papel || ''
      }));
    }).then(function (caminhos) {
      Object.assign(meta, caminhos, { estadoEnvio: 'enviado' });
      estado.fila = estado.fila.filter(function (i) { return !(i.tipo === 'foto' && i.ref === meta.id); });
      aEnviarFotos = false;
      guardar();
      emitir();
      enviarFotos();
    }).catch(function () {
      /* Fica pendente e volta a tentar — e o caminho é o mesmo, por ser
         o do ficheiro, por isso repetir não duplica. */
      aEnviarFotos = false;
      tentarDeNovo();
    });
  }

  /* ---------------------------------------------------------
     As fotografias do grupo
     As que os outros telemóveis enviaram, disponíveis para todos no
     momento em que chegam ao servidor. Os metadados ficam numa chave
     própria, fora do estado — são centenas, e o estado grava-se a
     cada toque —; as imagens vêm do Storage à medida que aparecem no
     ecrã.

     Pede-se só o que chegou desde a última vez: ao abrir a Galeria, e
     de cinco em cinco segundos enquanto ela está aberta. Uma vez
     por hora, a coleção inteira, que é o que faz desaparecer as que
     foram apagadas.
     --------------------------------------------------------- */

  const CHAVE_GRUPO = 'veneto.grupo.v1';
  const INTERVALO = 5 * 1000;           /* nunca mais do que um pedido a cada cinco segundos */
  const COMPLETA = 60 * 60 * 1000;      /* a coleção inteira, de hora a hora */
  const FOLGA = 10 * 60 * 1000;         /* relógios de telemóveis diferentes */

  let grupo = carregarGrupo();
  let aPedirGrupo = false;
  let ultimoPedido = 0;

  function carregarGrupo() {
    try {
      const g = JSON.parse(localStorage.getItem(CHAVE_GRUPO));
      if (g && Array.isArray(g.fotos)) return g;
    } catch (e) { /* recomeça */ }
    return { fotos: [], cursor: 0, completa: 0 };
  }

  function guardarGrupo() {
    try { localStorage.setItem(CHAVE_GRUPO, JSON.stringify(grupo)); } catch (e) { /* fica em memória */ }
  }

  function doGrupo(id) {
    return grupo.fotos.find(function (f) { return f.id === id; }) || null;
  }

  function sincronizarGrupo(forcar) {
    if (aPedirGrupo || !Nuvem.ligada() || !navigator.onLine) return;
    const agoraMs = Date.now();
    if (!forcar && agoraMs - ultimoPedido < INTERVALO) return;
    aPedirGrupo = true;
    ultimoPedido = agoraMs;
    const completa = !grupo.completa || agoraMs - grupo.completa > COMPLETA;

    Nuvem.fotosDoGrupo(completa ? 0 : Math.max(0, grupo.cursor - FOLGA)).then(function (lista) {
      const validas = lista.filter(function (f) { return f.id && f.caminhoMini; });
      let mudou = false;
      if (completa) {
        const ficam = {};
        validas.forEach(function (f) { ficam[f.id] = true; });
        grupo.fotos.forEach(function (f) {
          /* Apagada no servidor: sai também do arquivo deste telemóvel. */
          if (!ficam[f.id]) { mudou = true; Fotos.apagar(f.id).catch(function () {}); }
        });
        if (validas.length !== grupo.fotos.length) mudou = true;
        grupo.fotos = validas;
        grupo.completa = agoraMs;
      } else {
        validas.forEach(function (f) {
          if (doGrupo(f.id)) return;
          grupo.fotos.push(f);
          mudou = true;
        });
      }
      grupo.fotos.forEach(function (f) { if (f.enviado > grupo.cursor) grupo.cursor = f.enviado; });
      guardarGrupo();
      aPedirGrupo = false;
      if (mudou) emitir();
    }).catch(function () {
      aPedirGrupo = false;
    });
  }

  /* O Storage é a fonte das imagens do grupo que ainda não estão cá. */
  function caminhoDe(f, tamanho) {
    return tamanho === 'mini' ? f.caminhoMini : tamanho === 'vista' ? f.caminhoVista : f.caminhoOriginal;
  }
  Fotos.definirFonte({
    descarregar: function (id, tamanho) {
      const f = doGrupo(id);
      return f ? Nuvem.descarregarFoto(caminhoDe(f, tamanho)) : null;
    },
    endereco: function (id, tamanho) {
      const f = doGrupo(id);
      return f ? Nuvem.enderecoFoto(caminhoDe(f, tamanho)) : '';
    }
  });

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
    /* Uma do grupo só a organização apaga: sai do servidor e daqui. */
    const doOutro = !foto(id) && doGrupo(id);
    if (doOutro) {
      if (Nuvem.ligada()) Nuvem.apagarFoto(doOutro).catch(function () { /* volta na próxima leitura completa */ });
      grupo.fotos = grupo.fotos.filter(function (f) { return f.id !== id; });
      guardarGrupo();
      emitir();
      return Fotos.apagar(id).catch(function () { /* já não existia */ });
    }
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
  /* Todas: as minhas, as do grupo e as de abertura. As minhas e as do
     grupo por hora, das mais recentes para as mais antigas; as de
     abertura no fim, como sempre estiveram. Uma fotografia minha que
     também veio do servidor conta uma vez. */
  function fotos() {
    const minhasIds = {};
    const minhas = estado.fotos.map(function (f) { minhasIds[f.id] = true; return Object.assign({ propria: true }, f); });
    const doGrupoVisiveis = grupo.fotos
      .filter(function (f) { return !minhasIds[f.id]; })
      .map(function (f) { return Object.assign({}, f, { propria: false, autor: 'grupo', estadoEnvio: 'enviado' }); });
    const porHora = minhas.concat(doGrupoVisiveis).sort(function (a, b) { return (b.criado || 0) - (a.criado || 0); });
    const outras = DADOS.fotosIniciais.map(function (f) { return Object.assign({ propria: false }, f); }).reverse();
    return porHora.concat(outras);
  }

  window.addEventListener('online', sincronizar);
  /* De volta à app, o que ficou por enviar tenta logo, sem esperar pela
     próxima tentativa marcada. */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    if (repetir) { clearTimeout(repetir); repetir = null; }
    sincronizar();
  });
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
    revelaEm: revelaEm,
    diaVisivel: diaVisivel,
    poiVisivel: poiVisivel,
    amanha: amanha,
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
    sincronizarGrupo: sincronizarGrupo,
    meuId: meuId,
    juntarFoto: juntarFoto,
    apagarFoto: apagarFoto,
    foto: foto,
    fotosPorEnviar: fotosPorEnviar,
    fotos: fotos,
    reiniciar: function () {
      Fotos.limpar().catch(function () { /* nada para limpar */ });
      localStorage.removeItem(CHAVE);
      estado = JSON.parse(JSON.stringify(inicial));
      guardar();
      emitir();
    }
  };
})();
