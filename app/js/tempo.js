/* =========================================================
   O tempo
   No Hoje, a previsão de hoje e, a partir das 19:00, a de
   amanhã, por zonas; no detalhe, a de todos os dias que faltam,
   por local (30.09.2026). Vem do MET Norway pela publicação, que a
   grava em tempo.json de hora a hora (ferramentas/tempo.js): o
   telemóvel pede-a ao sítio de onde vem a própria app e a mais
   ninguém. Guarda-se aqui, para se ver sem rede.

   As zonas de um dia só se mostram separadas quando a diferença
   entre elas conta; se não, juntam-se numa linha só. Num dia por
   revelar, os nomes diriam para onde se vai: a zona diz-se só
   pela altitude.
   ========================================================= */

window.Tempo = (function () {
  const CHAVE = 'veneto.tempo.v1';
  /* A partir desta hora aparece também amanhã. */
  const HORA_AMANHA = 19;
  /* Nunca mais do que um pedido a cada dez minutos. */
  const INTERVALO = 10 * 60 * 1000;
  /* O que conta como diferença entre duas zonas: quatro graus na
     máxima ou na mínima, ou chover numa e na outra não. */
  const GRAUS = 4;
  const MOLHADO = 1; /* mm */
  const ALTITUDE = 1000; /* m: daqui para cima, é «em altitude» */
  const SEVERIDADE = ['sol', 'pouco-nublado', 'nuvem', 'nevoeiro', 'chuva', 'neve', 'trovoada'];

  let dados = carregar();
  let aPedir = false;
  let ultimo = 0;

  function carregar() {
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE));
      if (d && d.dias && d.zonas) return d;
    } catch (e) { /* recomeça */ }
    return null;
  }

  function atualizar(forcar) {
    if (aPedir || !navigator.onLine) return;
    if (!forcar && Date.now() - ultimo < INTERVALO) return;
    aPedir = true;
    ultimo = Date.now();
    /* no-store: vai sempre à rede, e o service worker deixa-o passar. */
    fetch('tempo.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (novo) {
        aPedir = false;
        if (!novo || !novo.dias || !novo.zonas) return;
        if (dados && dados.atualizado === novo.atualizado) return;
        /* As horas servem à próxima previsão, não ao telemóvel. */
        delete novo.horas;
        dados = novo;
        try { localStorage.setItem(CHAVE, JSON.stringify(novo)); } catch (e) { /* fica em memória */ }
        Estado.emitir();
      })
      .catch(function () { aPedir = false; });
  }

  /* ---------------------------------------------------------
     Zonas
     --------------------------------------------------------- */

  function diferentes(a, b) {
    return Math.abs(a.max - b.max) >= GRAUS || Math.abs(a.min - b.min) >= GRAUS ||
      (a.chuva >= MOLHADO) !== (b.chuva >= MOLHADO);
  }

  function banda(r) {
    const z = dados.zonas[r.zona];
    return z && z.altitude >= ALTITUDE ? 'alto' : 'baixo';
  }

  /* Várias zonas numa linha: o que é mais extremo em cada uma — a
     máxima mais alta, a mínima mais baixa, a chuva e o vento mais
     fortes, o céu mais carregado. */
  function juntar(membros) {
    function valores(k) { return membros.map(function (r) { return r[k]; }).filter(numero); }
    function maior(k) { const v = valores(k); return v.length ? Math.max.apply(null, v) : null; }
    function menor(k) { const v = valores(k); return v.length ? Math.min.apply(null, v) : null; }
    if (membros.length === 1) return membros[0];
    const ventoso = membros.slice().sort(function (a, b) { return (b.vento || 0) - (a.vento || 0); })[0];
    const humidades = membros.map(function (r) { return r.humidade; }).filter(numero);
    return {
      max: maior('max'), min: menor('min'), chuva: maior('chuva'),
      vento: ventoso.vento, rumo: ventoso.rumo,
      sensMax: maior('sensMax'), sensMin: menor('sensMin'),
      humidade: humidades.length ? Math.round(humidades.reduce(function (a, b) { return a + b; }, 0) / humidades.length) : null,
      simbolo: membros.map(function (r) { return r.simbolo; })
        .sort(function (a, b) { return SEVERIDADE.indexOf(b) - SEVERIDADE.indexOf(a); })[0]
    };
  }

  function numero(x) { return typeof x === 'number' && isFinite(x); }

  /* As linhas de um dia: { nome, curto, altitude, valores }. No
     resumo, uma só linha se as zonas não diferem — e então sem nome,
     porque é o dia inteiro. No detalhe (porLocal), uma linha por
     zona, sempre com nome. Por revelar, as zonas juntam-se pela
     altitude, e o nome é o da altitude. */
  function linhas(data, porLocal) {
    if (!dados || !dados.dias[data]) return [];
    const lista = dados.dias[data].filter(function (r) { return dados.zonas[r.zona]; });
    const dia = DADOS.dias.find(function (d) { return d.data === data; });
    const aberto = !dia || Estado.diaVisivel(dia);

    let grupos = [];
    if (aberto && porLocal) {
      grupos = lista.map(function (r) { return [r]; });
    } else if (aberto) {
      lista.forEach(function (r) {
        const g = grupos.find(function (x) { return x.every(function (m) { return !diferentes(m, r); }); });
        if (g) g.push(r); else grupos.push([r]);
      });
    } else {
      const altos = lista.filter(function (r) { return banda(r) === 'alto'; });
      const baixos = lista.filter(function (r) { return banda(r) === 'baixo'; });
      grupos = [baixos, altos].filter(function (g) { return g.length; });
      if (!porLocal && grupos.length === 2 && !diferentes(juntar(grupos[0]), juntar(grupos[1]))) grupos = [lista];
    }

    const sozinho = !porLocal && grupos.length === 1;
    return grupos.map(function (g) {
      const zonas = g.map(function (r) { return dados.zonas[r.zona]; });
      let nome = '';
      let curto = '';
      if (!sozinho) {
        if (aberto) {
          nome = zonas.map(function (z) { return z.nome; }).join(' e ');
          curto = zonas.map(function (z) { return z.curto; }).join(' e ');
        } else {
          nome = curto = banda(g[0]) === 'alto' ? 'Em altitude' : 'Em baixo';
        }
      }
      return {
        nome: nome,
        curto: curto,
        /* A altitude só se diz de uma zona com nome, e sozinha na linha. */
        altitude: aberto && g.length === 1 ? zonas[0].altitude : null,
        valores: juntar(g)
      };
    });
  }

  function hojeEAmanha() {
    const agora = Estado.agora();
    const d = new Date(agora);
    d.setDate(d.getDate() + 1);
    return { agora: agora, hoje: Estado.chave(agora), amanha: Estado.chave(d) };
  }

  /* Os dias do resumo, no Hoje: hoje, se for dia do passeio, e amanhã
     a partir das 19:00. Cada um com as suas linhas. */
  function dias() {
    if (!dados) return [];
    const h = hojeEAmanha();
    const lista = [{ data: h.hoje, rotulo: 'Hoje' }];
    if (h.agora.getHours() >= HORA_AMANHA) lista.push({ data: h.amanha, rotulo: 'Amanhã' });
    return lista.map(function (x) {
      return Object.assign(x, { linhas: linhas(x.data) });
    }).filter(function (x) { return x.linhas.length; });
  }

  /* Os dias do detalhe: todos os que ainda faltam do passeio, cada um
     com uma linha por local (30.09.2026). */
  function todos() {
    if (!dados) return [];
    const h = hojeEAmanha();
    return Object.keys(dados.dias).filter(function (data) { return data >= h.hoje; }).sort().map(function (data) {
      return {
        data: data,
        rotulo: data === h.hoje ? 'Hoje' : data === h.amanha ? 'Amanhã' : '',
        dia: DADOS.dias.find(function (d) { return d.data === data; }) || null,
        linhas: linhas(data, true)
      };
    }).filter(function (x) { return x.linhas.length; });
  }

  /* Muda quando passa das 19:00 — é o que a app vigia para repintar. */
  function momento() {
    return Estado.agora().getHours() >= HORA_AMANHA ? 'noite' : 'dia';
  }

  function atualizado() {
    return dados && dados.atualizado ? new Date(dados.atualizado) : null;
  }

  setInterval(function () {
    if (document.visibilityState === 'visible') atualizar();
  }, 60 * 1000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') atualizar();
  });
  window.addEventListener('online', function () { atualizar(true); });

  return {
    atualizar: atualizar,
    dias: dias,
    todos: todos,
    momento: momento,
    atualizado: atualizado,
    fonte: function () { return dados ? dados.fonte || '' : ''; }
  };
})();
