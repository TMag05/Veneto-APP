/* =========================================================
   Conteúdo do evento — editável dentro da app
   O itinerário, os participantes e os contactos deixaram de
   viver em ficheiros: são criados e alterados na área da
   organização e ficam guardados imediatamente, sem gravar.

   Este módulo publica window.DADOS e window.POIS, que é o que
   toda a app do convidado lê. Trocar isto por Firestore é
   substituir carregar() e guardar().
   ========================================================= */

window.Conteudo = (function () {
  const CHAVE = 'passeio.conteudo.v1';
  /* Versão do formato guardado. Subiu para 2 quando o passeio real
     entrou na semente: o que os telemóveis tinham guardado era a
     maqueta de Cortina, e dá lugar ao itinerário de 2026. */
  const VERSAO_DADOS = 2;
  const ouvintes = [];

  /* Revisões de linguagem da semente. O itinerário guardado num
     telemóvel é dado, não código: mudar a semente não o alcança, e
     subir VERSAO_DADOS apagaria os participantes e o que a organização
     já editou. Por isso troca-se só o texto que ainda é, palavra por
     palavra, o da semente antiga — o resto fica como está.
     26.09.2026: «autocarro» deu lugar a «transfer», com outros termos
     que não eram do registo deste passeio.

     Tem de ficar acima de «let dados = carregar()»: carregar() corre
     aqui, no topo, e um const lido antes da declaração lança — o erro
     é apanhado em silêncio e a app recomeça da semente, sem o que
     estava guardado. */
  const REVISOES = {
    'Um autocarro privado leva o grupo até à LO.VE., em Follina.':
      'Um transfer privado leva o grupo até à LO.VE., em Follina.',
    'Autocarro para o jantar': 'Transfer para o jantar',
    'De autocarro': 'Transfer privado',
    'Os carros ficam aqui. Segue-se para Veneza de autocarro privado.':
      'Os carros ficam aqui. Segue-se para Veneza em transfer privado.',
    'O grupo chega em duas levas, até às 18:30, para facilitar o estacionamento. Aperitivo à chegada.':
      'Os carros chegam em dois momentos, até às 18:30, para facilitar o estacionamento. Aperitivo à chegada.',
    'Almoço de pé': 'Almoço volante',
    'Buffet de pé, a caminho de Veneza.': 'Almoço volante, a caminho de Veneza.',
    'Pequeno-almoço, almoço e jantar estão incluídos todos os dias.':
      'Todas as refeições estão asseguradas, do pequeno-almoço ao jantar.',
    'Um guia que fala inglês acompanha o grupo em todos os dias.':
      'Um guia de língua inglesa acompanha o grupo todos os dias.',
    'É aqui que o passeio entra na Dolomita a sério. Do chalet, as Pale di San Martino ficam mesmo em frente.':
      'É aqui que o passeio entra verdadeiramente nas Dolomitas. Do chalet, as Pale di San Martino ficam mesmo em frente.'
  };

  let dados = carregar();
  projetar();

  /* ---------------------------------------------------------
     Persistência
     --------------------------------------------------------- */

  function clonar(o) { return JSON.parse(JSON.stringify(o)); }

  function base() {
    return montar(SEMENTE.roteiro);
  }

  /* O passeio a partir da semente: as paragens vêm da biblioteca,
     pelo nome, e os identificadores são estáveis — o mesmo dia tem o
     mesmo endereço em todos os telemóveis, que é o que deixa um link
     do WhatsApp abrir o momento certo. */
  function montar(r) {
    const d = {
      versao: VERSAO_DADOS,
      evento: clonar(SEMENTE.evento),
      dias: [],
      pois: {},
      fotosIniciais: [],
      participantes: [],
      contactos: clonar(SEMENTE.contactos),
      locais: (r.locais || []).map(function (l) {
        return Object.assign({ id: 'l-' + talho(l.nome), telefone: '', morada: '', notas: '' }, clonar(l));
      })
    };

    const porNome = {};
    function paragem(nome) {
      if (porNome[nome]) return porNome[nome];
      const b = SEMENTE.biblioteca.find(function (x) { return x.nome === nome; });
      const id = idUnico(nome, d.pois);
      d.pois[id] = Object.assign({
        nome: nome, local: '', tipo: 'vila', lat: 0, lng: 0, altitude: 0,
        subtitulo: '', historia: [], nota: '', revelacao: '', chegada: chegadaVazia()
      }, clonar(b || {}));
      d.pois[id].chegada = Object.assign(chegadaVazia(), d.pois[id].chegada || {});
      if (!d.pois[id].imagem) d.pois[id].imagem = { variante: varianteDe(d.pois[id].tipo), semente: id };
      porNome[nome] = id;
      return id;
    }
    function local(nome) {
      const l = d.locais.find(function (x) { return x.nome === nome; });
      return l ? l.id : '';
    }

    r.dias.forEach(function (x) {
      const dia = {
        id: 'd-' + x.data,
        data: x.data, titulo: x.titulo, subtitulo: x.subtitulo || '', resumo: x.resumo || '',
        distancia: 0, duracao: '', hotel: x.hotel ? local(x.hotel) : '',
        etapas: (x.paragens || []).map(paragem),
        momentos: x.momentos.map(function (m) {
          const mo = {
            hora: m.hora || '', fim: m.fim || '', titulo: m.titulo, local: m.local || '',
            tipo: m.tipo || 'paragem', poi: m.paragem ? paragem(m.paragem) : '', nota: m.nota || ''
          };
          if (m.imagem) mo.imagem = clonar(m.imagem);
          return mo;
        })
      };
      if (x.imagem) dia.imagem = clonar(x.imagem);
      d.dias.push(dia);
    });
    return d;
  }

  /* Percorre o que está guardado e troca as frases antigas. Devolve
     quantas trocou, para se saber se vale a pena gravar. */
  function rever(o) {
    let trocas = 0;
    (function andar(v) {
      if (Array.isArray(v)) {
        v.forEach(function (x, i) {
          if (typeof x === 'string' && REVISOES[x]) { v[i] = REVISOES[x]; trocas++; }
          else andar(x);
        });
      } else if (v && typeof v === 'object') {
        Object.keys(v).forEach(function (k) {
          const x = v[k];
          if (typeof x === 'string' && REVISOES[x]) { v[k] = REVISOES[x]; trocas++; }
          else andar(x);
        });
      }
    })(o);
    return trocas;
  }

  function carregar() {
    try {
      const g = JSON.parse(localStorage.getItem(CHAVE));
      if (g && g.versao === VERSAO_DADOS) {
        if (rever(g)) {
          try { localStorage.setItem(CHAVE, JSON.stringify(g)); } catch (e) { /* quota */ }
        }
        return Object.assign(base(), g);
      }
    } catch (e) { /* conteúdo corrompido: recomeça-se da semente */ }
    return base();
  }

  function guardar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { /* quota */ }
    projetar();
    ouvintes.forEach(function (fn) { fn(dados); });
  }

  function subscrever(fn) { ouvintes.push(fn); }

  /* ---------------------------------------------------------
     Identificadores
     --------------------------------------------------------- */

  function sufixo() { return Math.random().toString(36).slice(2, 6); }

  function talho(t) { return UI.talho(t); }

  function idUnico(nome, existentes) {
    let raiz = talho(nome) || 'paragem';
    let id = raiz;
    while (existentes[id]) id = raiz + '-' + sufixo();
    return id;
  }

  /* ---------------------------------------------------------
     Projeção — o que a app do convidado lê
     --------------------------------------------------------- */

  function derivarCarros() {
    const mapa = {};
    dados.participantes.forEach(function (p) {
      const chave = (p.equipa || '').trim() || p.id;
      if (!mapa[chave]) {
        mapa[chave] = { id: 'eq-' + talho(chave), equipa: chave, modelo: '', cor: '', matricula: '', perfis: [] };
      }
      mapa[chave].perfis.push(nomeCompleto(p));
      if (p.papel === 'condutor') {
        mapa[chave].modelo = p.modelo || mapa[chave].modelo;
        mapa[chave].cor = p.cor || mapa[chave].cor;
        mapa[chave].matricula = p.matricula || mapa[chave].matricula;
      }
    });
    return Object.keys(mapa).map(function (k) {
      const c = mapa[k];
      if (!c.modelo) c.modelo = 'db12';
      if (!c.cor) c.cor = 'magnetic';
      return c;
    });
  }

  /* A hora do dia que melhor serve cada tipo de paragem. */
  function varianteDe(tipo) {
    if (tipo === 'lago') return 'lago';
    if (tipo === 'estrada') return 'estrada';
    if (tipo === 'miradouro') return 'poente';
    if (tipo === 'vila' || tipo === 'cidade') return 'arquitetura';
    if (tipo === 'monumento' || tipo === 'villa') return 'arquitetura';
    if (tipo === 'vinha') return 'prado';
    return 'paisagem';
  }

  function nomeCompleto(p) {
    return [p.nome, p.apelido].filter(Boolean).join(' ').trim() || 'Sem nome';
  }

  /* Distância e duração de um dia, somando os troços. */
  function medirDia(d) {
    if (!d.etapas || d.etapas.length < 2) return { km: 0, min: 0 };
    let km = 0, min = 0;
    for (let i = 0; i < d.etapas.length - 1; i++) {
      const t = window.UI ? UI.troco(d.etapas[i], d.etapas[i + 1]) : { km: 0, min: 0 };
      km += t.km; min += t.min;
    }
    return { km: km, min: min };
  }

  function projetar() {
    window.POIS = dados.pois;

    const dias = dados.dias.map(function (d, i) {
      const medida = medirDia(d);
      return Object.assign({}, d, {
        numero: i + 1,
        distancia: d.distancia || medida.km,
        duracao: d.duracao || (window.UI ? UI.duracao(medida.min) : ''),
        imagem: d.imagem || { variante: 'paisagem', semente: d.id },
        meteo: d.meteo || null,
        etapas: d.etapas || [],
        momentos: d.momentos || []
      });
    });

    window.DADOS = {
      evento: dados.evento,
      dias: dias,
      participantes: dados.participantes,
      carros: derivarCarros(),
      contactos: dados.contactos,
      locais: dados.locais,
      biblioteca: SEMENTE.biblioteca,
      concierge: dados.evento.concierge || { nome: '', papel: '', foto: '', promessa: '' },
      levar: dados.evento.levar || [],
      notas: dados.evento.notas || [],
      fotosIniciais: dados.fotosIniciais || [],

      dia: function (id) { return dias.find(function (d) { return d.id === id; }) || null; },
      participante: function (id) { return dados.participantes.find(function (p) { return p.id === id; }) || null; },
      contacto: function (id) { return dados.contactos.find(function (c) { return c.id === id; }) || null; },
      local: function (id) { return dados.locais.find(function (l) { return l.id === id; }) || null; },
      nomeCompleto: nomeCompleto
    };
  }

  /* ---------------------------------------------------------
     Evento
     --------------------------------------------------------- */

  function atualizarEvento(patch) {
    Object.assign(dados.evento, patch);
    guardar();
  }

  /* Seis meses depois do último dia. É a data em que a organização
     apaga as fotografias do grupo — ajustável, e nunca automática:
     quem apaga trinta álbuns carrega no botão com a mão. */
  function apagarEmPorOmissao(fim) {
    if (!fim) return '';
    const d = new Date(fim + 'T00:00:00');
    d.setMonth(d.getMonth() + 6);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function apagarEm() {
    return dados.evento.apagarEm || apagarEmPorOmissao(dados.evento.fim);
  }

  /* Dias que faltam até lá. Negativo quando já passou. */
  function diasAteApagar() {
    const data = apagarEm();
    if (!data) return null;
    const ms = new Date(data + 'T00:00:00') - new Date(Estado.chave(Estado.agora()) + 'T00:00:00');
    return Math.round(ms / 86400000);
  }

  /* ---------------------------------------------------------
     Fotografias de abertura
     Publicadas antes da revelação de cada dia. O ficheiro vai
     para o arquivo do telemóvel, como qualquer outra; aqui fica
     só o registo, que é conteúdo e viaja com o itinerário.
     --------------------------------------------------------- */

  function juntarFotoInicial(meta) {
    dados.fotosIniciais = dados.fotosIniciais || [];
    dados.fotosIniciais.push(meta);
    guardar();
  }

  function removerFotoInicial(id) {
    dados.fotosIniciais = (dados.fotosIniciais || []).filter(function (f) { return f.id !== id; });
    guardar();
    Fotos.apagar(id).catch(function () { /* já não existia */ });
  }

  function atualizarConcierge(patch) {
    dados.evento.concierge = Object.assign(
      { nome: '', papel: '', foto: '', promessa: '' }, dados.evento.concierge, patch);
    guardar();
  }

  /* Paragens que já se revelaram ao convidado, por data. */
  function reveladas(hoje) {
    return Object.keys(dados.pois).filter(function (id) {
      const r = dados.pois[id].revelacao;
      return !r || r <= hoje;
    });
  }

  /* A próxima paragem a revelar-se, e quando. */
  function porRevelar(hoje) {
    let melhor = null;
    Object.keys(dados.pois).forEach(function (id) {
      const r = dados.pois[id].revelacao;
      if (!r || r <= hoje) return;
      if (!melhor || r < melhor.revelacao) melhor = Object.assign({ id: id }, dados.pois[id]);
    });
    return melhor;
  }

  /* ---------------------------------------------------------
     Etapas do itinerário
     --------------------------------------------------------- */

  function criarDia() {
    const id = 'd-' + Date.now().toString(36);
    dados.dias.push({
      id: id,
      data: '',
      titulo: '',
      subtitulo: '',
      resumo: '',
      distancia: 0,
      duracao: '',
      hotel: '',
      etapas: [],
      momentos: []
    });
    guardar();
    return id;
  }

  function atualizarDia(id, patch) {
    const d = dados.dias.find(function (x) { return x.id === id; });
    if (!d) return;
    Object.assign(d, patch);
    guardar();
  }

  function removerDia(id) {
    dados.dias = dados.dias.filter(function (d) { return d.id !== id; });
    guardar();
  }

  function moverDia(id, delta) {
    const i = dados.dias.findIndex(function (d) { return d.id === id; });
    const j = i + delta;
    if (i < 0 || j < 0 || j >= dados.dias.length) return;
    const [x] = dados.dias.splice(i, 1);
    dados.dias.splice(j, 0, x);
    guardar();
  }

  /* ---------------------------------------------------------
     Paragens (pontos de interesse)
     --------------------------------------------------------- */

  function criarPoi(campos) {
    const c = campos || {};
    const id = idUnico(c.nome, dados.pois);
    dados.pois[id] = {
      nome: c.nome || 'Paragem sem nome',
      local: c.local || '',
      tipo: c.tipo || 'vila',
      lat: typeof c.lat === 'number' ? c.lat : 0,
      lng: typeof c.lng === 'number' ? c.lng : 0,
      altitude: typeof c.altitude === 'number' ? c.altitude : 0,
      subtitulo: c.subtitulo || '',
      historia: c.historia || [],
      nota: c.nota || '',
      /* Data em que a paragem se revela no briefing. Vazia = já visível. */
      revelacao: c.revelacao || '',
      chegada: Object.assign(chegadaVazia(), c.chegada || {}),
      imagem: c.imagem || { variante: varianteDe(c.tipo), semente: id }
    };
    guardar();
    return id;
  }

  /* O que fazer quando se pára ali: onde se deixam os carros, quem
     espera o grupo, e a que horas se volta. Campos vazios não
     aparecem ao convidado — isto é informação, não é desenho. */
  function chegadaVazia() {
    return { estacionamento: '', recebe: '', wc: '', regresso: '', nota: '' };
  }

  function atualizarChegada(id, patch) {
    if (!dados.pois[id]) return;
    dados.pois[id].chegada = Object.assign(chegadaVazia(), dados.pois[id].chegada, patch);
    guardar();
  }

  function atualizarPoi(id, patch) {
    if (!dados.pois[id]) return;
    Object.assign(dados.pois[id], patch);
    guardar();
  }

  function removerPoi(id) {
    delete dados.pois[id];
    dados.dias.forEach(function (d) {
      d.etapas = (d.etapas || []).filter(function (e) { return e !== id; });
      (d.momentos || []).forEach(function (m) { if (m.poi === id) m.poi = ''; });
    });
    guardar();
  }

  function juntarParagem(diaId, poiId) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d) return;
    d.etapas = d.etapas || [];
    d.etapas.push(poiId);
    guardar();
  }

  function removerParagem(diaId, indice) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d || !d.etapas) return;
    d.etapas.splice(indice, 1);
    guardar();
  }

  function moverParagem(diaId, indice, delta) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d || !d.etapas) return;
    const j = indice + delta;
    if (j < 0 || j >= d.etapas.length) return;
    const [x] = d.etapas.splice(indice, 1);
    d.etapas.splice(j, 0, x);
    guardar();
  }

  /* ---------------------------------------------------------
     Momentos do programa
     --------------------------------------------------------- */

  function criarMomento(diaId) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d) return;
    d.momentos = d.momentos || [];
    d.momentos.push({ hora: '09:00', fim: '', titulo: '', local: '', tipo: 'paragem', poi: '', nota: '' });
    ordenarMomentos(d);
    guardar();
  }

  function atualizarMomento(diaId, indice, patch) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d || !d.momentos[indice]) return;
    Object.assign(d.momentos[indice], patch);
    guardar();
  }

  function removerMomento(diaId, indice) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d || !d.momentos) return;
    d.momentos.splice(indice, 1);
    guardar();
  }

  function ordenarMomentosDe(diaId) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    if (!d) return;
    ordenarMomentos(d);
    guardar();
  }

  function ordenarMomentos(d) {
    (d.momentos || []).sort(function (a, b) {
      return String(a.hora || '').localeCompare(String(b.hora || ''));
    });
  }

  /* Marca um momento como alterado — é o que dispara a barra
     vermelha e a etiqueta no programa do convidado. */
  function alterarHora(diaId, indice, novaHora, razao) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    const m = d && d.momentos[indice];
    if (!m) return;
    if (m.hora !== novaHora) {
      m.alterado = { antes: m.hora, razao: razao || 'Alteração da organização' };
      m.hora = novaHora;
    } else if (razao) {
      m.alterado = { antes: m.hora, razao: razao };
    }
    ordenarMomentos(d);
    guardar();
  }

  function limparAlteracao(diaId, indice) {
    const d = dados.dias.find(function (x) { return x.id === diaId; });
    const m = d && d.momentos[indice];
    if (!m) return;
    delete m.alterado;
    guardar();
  }

  /* ---------------------------------------------------------
     Participantes
     --------------------------------------------------------- */

  function criarParticipante() {
    const id = 'p-' + Date.now().toString(36);
    dados.participantes.push({
      id: id,
      nome: '',
      apelido: '',
      nascimento: '',
      papel: 'condutor',
      equipa: String(dados.participantes.length + 1),
      foto: '',
      telefone: '',
      email: '',
      carta: '',
      apolice: '',
      matricula: '',
      modelo: 'db12',
      cor: 'racing'
    });
    guardar();
    return id;
  }

  function atualizarParticipante(id, patch) {
    const p = dados.participantes.find(function (x) { return x.id === id; });
    if (!p) return;
    Object.assign(p, patch);
    guardar();
  }

  function removerParticipante(id) {
    dados.participantes = dados.participantes.filter(function (p) { return p.id !== id; });
    guardar();
  }

  /* ---------------------------------------------------------
     Contactos e locais
     --------------------------------------------------------- */

  function criarContacto() {
    const id = 'c-' + Date.now().toString(36);
    dados.contactos.push({ id: id, nome: '', papel: '', telefone: '', notas: '', icone: 'telefone' });
    guardar();
    return id;
  }

  function atualizarContacto(id, patch) {
    const c = dados.contactos.find(function (x) { return x.id === id; });
    if (!c) return;
    Object.assign(c, patch);
    guardar();
  }

  function removerContacto(id) {
    dados.contactos = dados.contactos.filter(function (c) { return c.id !== id; });
    guardar();
  }

  function criarLocal() {
    const id = 'l-' + Date.now().toString(36);
    dados.locais.push({ id: id, tipo: 'hotel', nome: '', telefone: '', morada: '', notas: '' });
    guardar();
    return id;
  }

  function atualizarLocal(id, patch) {
    const l = dados.locais.find(function (x) { return x.id === id; });
    if (!l) return;
    Object.assign(l, patch);
    guardar();
  }

  function removerLocal(id) {
    dados.locais = dados.locais.filter(function (l) { return l.id !== id; });
    guardar();
  }

  /* ---------------------------------------------------------
     Cópia de segurança
     Enquanto não há servidor, é isto que evita perder o
     trabalho ao mudar de telemóvel ou limpar o browser.
     --------------------------------------------------------- */

  function exportar() { return JSON.stringify(dados, null, 2); }

  function importar(texto) {
    const novo = JSON.parse(texto);
    if (!novo || !novo.evento) throw new Error('Ficheiro sem evento');
    dados = Object.assign(base(), novo, { versao: VERSAO_DADOS });
    guardar();
  }

  function repor() {
    dados = base();
    guardar();
  }

  /* ---------------------------------------------------------
     Exemplo — o passeio real, com pessoas de exemplo por cima,
     para mostrar a app antes de a organização carregar as reais.
     --------------------------------------------------------- */

  function carregarExemplo() {
    const ex = SEMENTE.exemplo;
    dados = base();
    Object.assign(dados.evento, clonar(ex.evento || {}));

    ex.participantes.forEach(function (p, i) {
      dados.participantes.push({
        id: 'p-ex-' + i,
        nome: p[0], apelido: p[1], nascimento: '', papel: p[2], equipa: p[3],
        foto: '', telefone: '', email: '',
        carta: '', apolice: '', matricula: p[6] || '',
        modelo: p[4] || 'db12', cor: p[5] || 'magnetic'
      });
    });

    ex.contactos.forEach(function (c, i) {
      dados.contactos.push(Object.assign({ id: 'c-ex-' + i, notas: '' }, c));
    });

    guardar();
  }

  function vazio() {
    return !dados.dias.length && !dados.participantes.length && !dados.locais.length;
  }

  return {
    subscrever: subscrever,
    bruto: function () { return dados; },
    vazio: vazio,

    atualizarEvento: atualizarEvento, atualizarConcierge: atualizarConcierge,
    apagarEm: apagarEm, diasAteApagar: diasAteApagar,
    juntarFotoInicial: juntarFotoInicial, removerFotoInicial: removerFotoInicial,
    reveladas: reveladas, porRevelar: porRevelar, varianteDe: varianteDe,

    criarDia: criarDia, atualizarDia: atualizarDia, removerDia: removerDia, moverDia: moverDia,
    criarPoi: criarPoi, atualizarPoi: atualizarPoi, removerPoi: removerPoi,
    atualizarChegada: atualizarChegada,
    juntarParagem: juntarParagem, removerParagem: removerParagem, moverParagem: moverParagem,

    criarMomento: criarMomento, atualizarMomento: atualizarMomento, removerMomento: removerMomento,
    ordenarMomentos: ordenarMomentosDe, alterarHora: alterarHora, limparAlteracao: limparAlteracao,

    criarParticipante: criarParticipante, atualizarParticipante: atualizarParticipante, removerParticipante: removerParticipante,
    criarContacto: criarContacto, atualizarContacto: atualizarContacto, removerContacto: removerContacto,
    criarLocal: criarLocal, atualizarLocal: atualizarLocal, removerLocal: removerLocal,

    exportar: exportar, importar: importar, repor: repor, carregarExemplo: carregarExemplo
  };
})();
