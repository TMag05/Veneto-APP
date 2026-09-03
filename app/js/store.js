/* =========================================================
   Estado local
   Offline é o estado normal. Tudo o que o convidado faz é
   escrito localmente primeiro e posto numa fila que sobe
   sozinha quando houver rede. O convidado nunca vê um erro.
   ========================================================= */

window.Estado = (function () {
  const CHAVE = 'veneto.estado.v1';
  const LIMITE_FOTOS = 30;

  const inicial = {
    versao: 1,
    autenticado: false,
    perfil: { nome: '', email: '', telefone: '' },
    /* O carro não é registado pelo convidado: vem da ficha que a
       organização criou, encontrada pelo email na entrada. */
    participanteId: '',
    chegadas: {},
    fotos: [],
    pedidos: [],
    fila: [],
    chegadaVista: false,
    demoFase: 'auto',
    tema: 'auto',
    album: false,
    papel: 'convidado'
  };

  let estado = carregar();
  const ouvintes = [];

  function carregar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CHAVE));
      if (guardado && guardado.versao === inicial.versao) {
        return Object.assign({}, inicial, guardado);
      }
    } catch (e) { /* estado corrompido: recomeça-se em silêncio */ }
    return JSON.parse(JSON.stringify(inicial));
  }

  function guardar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      /* Quota cheia: descarta-se a fotografia mais antiga e tenta-se de novo. */
      if (estado.fotos.length) {
        estado.fotos.shift();
        try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e2) { /* desiste */ }
      }
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
     Relógio — a demonstração pode saltar de fase
     --------------------------------------------------------- */

  function agora() {
    const real = new Date();
    const fase = estado.demoFase;
    /* Sem datas de evento não há linha temporal para simular. */
    if (fase === 'auto' || !DADOS.evento.inicio || !DADOS.evento.fim) return real;

    let dataBase;
    if (fase === 'pre') dataBase = new Date(DADOS.evento.inicio + 'T00:00:00');
    else if (fase === 'pos') dataBase = new Date(DADOS.evento.fim + 'T00:00:00');
    else {
      const dia = DADOS.dia(fase);
      dataBase = new Date((dia ? dia.data : DADOS.evento.inicio) + 'T00:00:00');
    }

    /* Os convidados recebem acesso poucos dias antes de partir. */
    if (fase === 'pre') dataBase.setDate(dataBase.getDate() - 3);
    if (fase === 'pos') dataBase.setDate(dataBase.getDate() + 1);

    /* Mantém-se a hora real do dia, dentro de uma janela plausível. */
    let h = real.getHours();
    if (h < 8) h = 8 + (real.getMinutes() % 4);
    if (h > 21) h = 21;
    dataBase.setHours(h, real.getMinutes(), 0, 0);
    return dataBase;
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

  function ehOrganizacao() { return estado.papel === 'organizacao'; }

  /* ---------------------------------------------------------
     Perfil e carro
     --------------------------------------------------------- */

  /* A ficha que a organização criou para esta pessoa. */
  function euParticipante() {
    if (!estado.participanteId) return null;
    return DADOS.participante(estado.participanteId);
  }

  /* O carro da equipa desta pessoa — o condutor é quem o define. */
  function meuCarro() {
    const p = euParticipante();
    if (!p) return null;
    return DADOS.carros.find(function (c) { return c.equipa === (p.equipa || '').trim(); }) || null;
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
      modelo: carro ? carro.modelo : 'db12',
      cor: carro ? carro.cor : 'magnetic',
      chegou: ultimaChegada()
    };
  }

  function carroRegistado() { return !!meuCarro(); }

  function ultimaChegada() {
    const ids = Object.keys(estado.chegadas);
    if (!ids.length) return null;
    return ids.sort(function (a, b) { return estado.chegadas[b] - estado.chegadas[a]; })[0];
  }

  function chegou(poiId) { return !!estado.chegadas[poiId]; }

  function marcarChegada(poiId) {
    if (estado.chegadas[poiId]) return;
    estado.chegadas[poiId] = Date.now();
    enfileirar('chegada', 'Chegada a ' + (POIS[poiId] ? POIS[poiId].nome : poiId));
  }

  /* ---------------------------------------------------------
     Fila offline
     --------------------------------------------------------- */

  function enfileirar(tipo, resumo) {
    const item = { id: 'q' + Date.now() + Math.floor(Math.random() * 1000), tipo: tipo, resumo: resumo, criado: Date.now(), estado: 'pendente' };
    estado.fila.push(item);
    guardar();
    emitir();
    sincronizar();
    return item.id;
  }

  let aSincronizar = false;
  function sincronizar() {
    if (aSincronizar) return;
    const pendentes = estado.fila.filter(function (i) { return i.estado === 'pendente'; });
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

  function pendentes() {
    return estado.fila.filter(function (i) { return i.estado === 'pendente'; }).length;
  }

  /* ---------------------------------------------------------
     Fotografias
     --------------------------------------------------------- */

  function juntarFoto(dataUrl, dia, poi) {
    estado.fotos.push({
      id: 'm' + Date.now(),
      autor: 'eu',
      dia: dia,
      poi: poi,
      dataUrl: dataUrl,
      criado: Date.now()
    });
    while (estado.fotos.length > LIMITE_FOTOS) estado.fotos.shift();
    enfileirar('foto', 'Fotografia' + (poi && POIS[poi] ? ' — ' + POIS[poi].nome : ''));
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
    eu: eu,
    carroRegistado: carroRegistado,
    euParticipante: euParticipante,
    meuCarro: meuCarro,
    associarPorEmail: associarPorEmail,
    chegou: chegou,
    marcarChegada: marcarChegada,
    ultimaChegada: ultimaChegada,
    enfileirar: enfileirar,
    sincronizar: sincronizar,
    pendentes: pendentes,
    juntarFoto: juntarFoto,
    fotos: fotos,
    pedir: pedir,
    reiniciar: function () {
      localStorage.removeItem(CHAVE);
      estado = JSON.parse(JSON.stringify(inicial));
      guardar();
      emitir();
    }
  };
})();
