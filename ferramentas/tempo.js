/* =========================================================
   O tempo, para a app
   Corre na publicação (.github/workflows/publicar.yml): a cada
   push ao main e, durante o passeio, de hora a hora. Pede ao MET
   Norway a previsão de cada zona do passeio (SEMENTE.tempo) e
   grava-a em app/tempo.json, que sai com a app. O telemóvel lê
   esse ficheiro do sítio de onde vem a própria app — não fala
   com mais ninguém (30.09.2026).

   O MET só dá a previsão a partir da hora em que se pergunta. As
   horas de hoje que já passaram vêm do tempo.json publicado, que
   as guarda; sem elas, a máxima de hoje, pedida às sete da tarde,
   seria a da noite.

   Fora da janela do passeio (da véspera do primeiro dia ao
   último), não escreve nada. Se o MET não responder, fica o que
   estava publicado. Nunca falha: a publicação não pode parar por
   causa do tempo.

       node ferramentas/tempo.js
   Sem dependências: node 20.
   ========================================================= */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'app', 'tempo.json');
const PUBLICADO = 'https://dolomitesgt.web.app/tempo.json';
const MET = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
/* O MET pede que cada pedido diga quem é e como se chega a quem o faz. */
const QUEM = 'dolomitesgt.web.app github.com/TMag05/Veneto-APP';
const HORA = 3600 * 1000;

/* ---------------------------------------------------------
   Horas de Itália
   --------------------------------------------------------- */

const relogio = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome', hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit'
});

function local(ms) {
  const p = {};
  relogio.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
  return { data: p.year + '-' + p.month + '-' + p.day, hora: Number(p.hour) % 24 };
}

function diaAntes(data) {
  const d = new Date(data + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/* ---------------------------------------------------------
   A semente, lida como a app a lê
   --------------------------------------------------------- */

function semente() {
  const contexto = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(RAIZ, 'app', 'js', 'semente.js'), 'utf8'), contexto);
  return contexto.window.SEMENTE;
}

/* ---------------------------------------------------------
   Pedidos
   --------------------------------------------------------- */

function pedir(url, cabecalhos) {
  const tentar = function () {
    return fetch(url, { headers: cabecalhos || {}, signal: AbortSignal.timeout(20000) }).then(function (r) {
      if (!r.ok) throw new Error(url + ' respondeu ' + r.status);
      return r.json();
    });
  };
  return tentar().catch(function () {
    return new Promise(function (resolver) { setTimeout(resolver, 3000); }).then(tentar);
  });
}

function previsao(z) {
  return pedir(MET + '?lat=' + z.lat.toFixed(4) + '&lon=' + z.lng.toFixed(4) + '&altitude=' + Math.round(z.altitude),
    { 'User-Agent': QUEM });
}

/* A sensação térmica, como a dão os serviços meteorológicos: abaixo
   dos 10° e com vento, o arrefecimento pelo vento; acima dos 27° e com
   humidade, o índice de calor; entre os dois, a temperatura. A do MET
   não serve: não a corrige pela altitude, e no Grappa, a 3° de noite,
   dizia 10° (30.09.2026). */
function sensacao(t, ventoMs, humidade) {
  if (typeof t !== 'number') return undefined;
  const v = (ventoMs || 0) * 3.6;
  if (t <= 10 && v > 4.8) {
    const p = Math.pow(v, 0.16);
    return 13.12 + 0.6215 * t - 11.37 * p + 0.3965 * t * p;
  }
  if (t >= 27 && humidade >= 40) {
    const f = t * 9 / 5 + 32;
    const r = humidade;
    const hi = -42.379 + 2.04901523 * f + 10.14333127 * r - 0.22475541 * f * r - 0.00683783 * f * f -
      0.05481717 * r * r + 0.00122874 * f * f * r + 0.00085282 * f * r * r - 0.00000199 * f * f * r * r;
    return Math.max(t, (hi - 32) * 5 / 9);
  }
  return t;
}

/* Uma entrada por passo da previsão: o instante e o período que
   começa nele — de uma hora nos primeiros dois dias e meio, de seis
   daí para a frente. */
function horasDe(met) {
  return met.properties.timeseries.map(function (p) {
    const i = p.data.instant.details;
    const um = p.data.next_1_hours;
    const seis = p.data.next_6_hours;
    const periodo = um || seis;
    const h = {
      t: p.time,
      temp: i.air_temperature,
      sens: sensacao(i.air_temperature, i.wind_speed, i.relative_humidity),
      hum: i.relative_humidity,
      vento: i.wind_speed,
      rumo: i.wind_from_direction
    };
    if (periodo) {
      h.dur = um ? 1 : 6;
      h.chuva = periodo.details ? periodo.details.precipitation_amount : undefined;
      h.simbolo = periodo.summary ? periodo.summary.symbol_code : '';
    }
    if (!um && seis && seis.details) {
      h.tmax = seis.details.air_temperature_max;
      h.tmin = seis.details.air_temperature_min;
    }
    return h;
  });
}

/* ---------------------------------------------------------
   O resumo de um dia numa zona
   Máxima e mínima do dia inteiro, como em qualquer previsão; a
   chuva, a soma do dia; o vento e a humidade das 8 às 20, que é
   quando o grupo está na estrada; o céu, o que mais horas ocupa
   de dia — e, se chover duas horas ou mais, a chuva.
   --------------------------------------------------------- */

function categoria(codigo) {
  const c = String(codigo || '').replace(/_(day|night|polartwilight)$/, '');
  if (!c) return '';
  if (/thunder/.test(c)) return 'trovoada';
  if (/snow|sleet/.test(c)) return 'neve';
  if (/rain|drizzle/.test(c)) return 'chuva';
  if (c === 'fog') return 'nevoeiro';
  if (c === 'clearsky') return 'sol';
  if (c === 'fair' || c === 'partlycloudy') return 'pouco-nublado';
  return 'nuvem';
}

const MOLHADO = ['trovoada', 'neve', 'chuva'];
const RUMOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

function arredondar1(n) { return Math.round(n * 10) / 10; }

function resumir(horas, data, hoje) {
  const doDia = horas.filter(function (h) { return local(Date.parse(h.t)).data === data; });
  if (!doDia.length) return null;
  const horasDoDia = doDia.map(function (h) { return local(Date.parse(h.t)).hora; });
  /* Um dia só entra se a previsão lhe chega à manhã e à noite; o de
     hoje entra como estiver. */
  if (data !== hoje && (Math.min.apply(null, horasDoDia) > 9 || Math.max.apply(null, horasDoDia) < 18)) return null;

  const temps = [];
  const sens = [];
  doDia.forEach(function (h) {
    if (typeof h.temp === 'number') temps.push(h.temp);
    if (typeof h.sens === 'number') sens.push(h.sens);
  });

  /* Os períodos, sem se sobreporem: a chuva e o céu de cada um
     repartidos pelas horas que caem neste dia. */
  let ate = -Infinity;
  let chuva = 0;
  const ceu = {};
  horas.forEach(function (h) {
    const t = Date.parse(h.t);
    if (!h.dur || t < ate) return;
    ate = t + h.dur * HORA;
    let noDia = 0;
    let deDia = 0;
    for (let k = 0; k < h.dur; k++) {
      const l = local(t + k * HORA);
      if (l.data !== data) continue;
      noDia++;
      if (l.hora >= 8 && l.hora < 20) deDia++;
    }
    if (!noDia) return;
    if (typeof h.chuva === 'number') chuva += h.chuva * noDia / h.dur;
    if (h.dur > 1 && noDia * 2 >= h.dur) {
      if (typeof h.tmax === 'number') temps.push(h.tmax);
      if (typeof h.tmin === 'number') temps.push(h.tmin);
    }
    const c = categoria(h.simbolo);
    if (c && deDia) ceu[c] = (ceu[c] || 0) + deDia;
  });
  if (!temps.length) return null;

  const diurnas = doDia.filter(function (h) { const l = local(Date.parse(h.t)); return l.hora >= 8 && l.hora <= 20; });
  const base = diurnas.length ? diurnas : doDia;
  let forte = null;
  base.forEach(function (h) { if (typeof h.vento === 'number' && (!forte || h.vento > forte.vento)) forte = h; });
  const humidades = base.map(function (h) { return h.hum; }).filter(function (x) { return typeof x === 'number'; });

  const molhadas = MOLHADO.reduce(function (t, c) { return t + (ceu[c] || 0); }, 0);
  const candidatas = Object.keys(ceu).filter(function (c) { return molhadas >= 2 ? MOLHADO.indexOf(c) >= 0 : MOLHADO.indexOf(c) < 0; });
  const simbolo = (candidatas.length ? candidatas : Object.keys(ceu))
    .sort(function (a, b) { return ceu[b] - ceu[a]; })[0] || 'nuvem';

  return {
    max: Math.round(Math.max.apply(null, temps)),
    min: Math.round(Math.min.apply(null, temps)),
    chuva: arredondar1(chuva),
    vento: forte ? Math.round(forte.vento * 3.6) : null,
    rumo: forte && typeof forte.rumo === 'number' ? RUMOS[Math.round(forte.rumo / 45) % 8] : '',
    sensMax: sens.length ? Math.round(Math.max.apply(null, sens)) : null,
    sensMin: sens.length ? Math.round(Math.min.apply(null, sens)) : null,
    humidade: humidades.length ? Math.round(humidades.reduce(function (a, b) { return a + b; }, 0) / humidades.length) : null,
    simbolo: simbolo
  };
}

/* ---------------------------------------------------------
   Corrida
   --------------------------------------------------------- */

function saida(publicar) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'publicar=' + publicar + '\n');
}

async function correr() {
  const S = semente();
  const agora = Date.now();
  const hoje = local(agora).data;
  const inicio = S.evento.inicio;
  const fim = S.evento.fim;

  if (!S.tempo || hoje < diaAntes(inicio) || hoje > fim) {
    console.log('Fora do passeio (' + hoje + '): sem previsão.');
    saida(false);
    return;
  }
  saida(true);

  const anterior = await pedir(PUBLICADO).catch(function () { return null; });

  const datas = Object.keys(S.tempo.dias).filter(function (d) { return d >= hoje; }).sort();
  const usadas = [];
  datas.forEach(function (d) {
    S.tempo.dias[d].forEach(function (id) { if (usadas.indexOf(id) < 0) usadas.push(id); });
  });
  const zonas = {};
  S.tempo.zonas.forEach(function (z) { zonas[z.id] = z; });

  let respostas;
  try {
    respostas = await Promise.all(usadas.map(function (id) { return previsao(zonas[id]); }));
  } catch (e) {
    console.log('O MET não respondeu (' + e.message + ').');
    if (anterior) {
      fs.writeFileSync(DESTINO, JSON.stringify(anterior));
      console.log('Fica a previsão publicada, de ' + anterior.atualizado + '.');
    }
    return;
  }

  const saidaZonas = {};
  const horas = {};
  const guardadas = {};
  usadas.forEach(function (id, n) {
    const z = zonas[id];
    saidaZonas[id] = { nome: z.nome, curto: z.curto, altitude: z.altitude };
    const novas = horasDe(respostas[n]);
    const primeira = novas.length ? Date.parse(novas[0].t) : Infinity;
    /* As horas de hoje que já passaram, de uma corrida anterior. */
    const antigas = anterior && anterior.horas && anterior.horas[id] ? anterior.horas[id].filter(function (h) {
      return Date.parse(h.t) < primeira && local(Date.parse(h.t)).data === hoje;
    }) : [];
    horas[id] = antigas.concat(novas);
    guardadas[id] = horas[id].filter(function (h) { return h.dur === 1 && local(Date.parse(h.t)).data === hoje; });
  });

  const dias = {};
  datas.forEach(function (d) {
    const lista = S.tempo.dias[d].map(function (id) {
      const r = resumir(horas[id], d, hoje);
      return r ? Object.assign({ zona: id }, r) : null;
    }).filter(Boolean);
    if (lista.length) dias[d] = lista;
  });

  const ficheiro = {
    fonte: 'MET Norway',
    atualizado: new Date(agora).toISOString(),
    zonas: saidaZonas,
    dias: dias,
    horas: guardadas
  };
  fs.writeFileSync(DESTINO, JSON.stringify(ficheiro));
  console.log('Previsão de ' + Object.keys(dias).join(', ') + ' em ' + path.relative(RAIZ, DESTINO) + '.');
  Object.keys(dias).forEach(function (d) {
    dias[d].forEach(function (r) {
      console.log('  ' + d + '  ' + zonas[r.zona].curto.padEnd(9) + ' ' + String(r.max).padStart(3) + '° ' + String(r.min).padStart(3) + '°  ' +
        r.chuva + ' mm  ' + r.vento + ' km/h ' + r.rumo + '  sensação ' + r.sensMin + '° a ' + r.sensMax + '°  ' + r.humidade + '%  ' + r.simbolo);
    });
  });
}

correr().catch(function (e) {
  console.log('Previsão por fazer: ' + (e && e.message));
});
