/* =========================================================
   Imagens de reserva
   Substituem a fotografia real até existirem os ficheiros.
   Não são decoração: são dolomia — torres, ombros, paredes a
   pique — apanhadas à hora que o ecrã pede. Alvorada fria,
   dia alto, enrosadira ao poente, noite azul.

   Assim que a organização carregar uma fotografia, ela toma
   o lugar disto sem mais nada mudar.
   ========================================================= */

window.Imagens = (function () {

  /* Cada hora do dia é uma paleta fechada: céu, rocha longe,
     rocha perto, névoa, vegetação, e a força do rosa nos cumes. */
  const HORAS = {
    alvorada: {
      ceu: ['#1E2A3A', '#4A5468', '#9D9392'],
      longe: '#5D6272', perto: '#3B4150', nevoa: '#7C8391',
      verde: '#2E3A3A', rosa: '#E7A88E', brilho: 0.55, luz: 0.18
    },
    dia: {
      ceu: ['#8FA7BE', '#B9C6D2', '#DCE0DF'],
      longe: '#A9AFB6', perto: '#7E848E', nevoa: '#C8CDD1',
      verde: '#5A6A55', rosa: '#C9B4A6', brilho: 0.16, luz: 0.62
    },
    poente: {
      ceu: ['#2C3550', '#7A6379', '#D79A80'],
      longe: '#8A6E71', perto: '#4E4450', nevoa: '#A98A85',
      verde: '#33392F', rosa: '#F0A183', brilho: 0.95, luz: 0.30
    },
    noite: {
      ceu: ['#0C1220', '#161F31', '#2A3446'],
      longe: '#2E3849', perto: '#1B2331', nevoa: '#39435A',
      verde: '#1C2622', rosa: '#5D6C8A', brilho: 0.22, luz: 0.06
    }
  };

  /* As variantes que os ecrãs pedem, mapeadas em hora + primeiro plano. */
  const VARIANTES = {
    paisagem:    { hora: 'dia',      frente: 'floresta' },
    manha:       { hora: 'alvorada', frente: 'prado' },
    poente:      { hora: 'poente',   frente: 'floresta' },
    noite:       { hora: 'noite',    frente: 'floresta' },
    vinha:       { hora: 'dia',      frente: 'prado' },
    prado:       { hora: 'alvorada', frente: 'prado' },
    lago:        { hora: 'poente',   frente: 'lago' },
    estrada:     { hora: 'dia',      frente: 'estrada' },
    arquitetura: { hora: 'alvorada', frente: 'aldeia' }
  };

  function prng(semente) {
    let h = 2166136261;
    const s = String(semente);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Uma crista de dolomia: subida quase a pique, ombro plano,
     degrau, e uma parede a cair. Nunca uma curva. */
  function crista(r, L, base, altura, torres) {
    const p = [[-20, base]];
    let x = -20;
    const largura = L / torres;
    while (x < L + largura) {
      const w = largura * (0.6 + r() * 0.8);
      const pico = base - altura * (0.34 + r() * 0.66);
      const ombro = pico + altura * (0.03 + r() * 0.09);
      p.push([x + w * 0.14, pico]);
      p.push([x + w * 0.28, ombro]);
      p.push([x + w * 0.40, pico + altura * (0.01 + r() * 0.05)]);
      p.push([x + w * 0.58, ombro + altura * (0.06 + r() * 0.14)]);
      p.push([x + w * 0.74, ombro + altura * (0.02 + r() * 0.08)]);
      p.push([x + w * 0.92, base - altura * (0.02 + r() * 0.12)]);
      x += w;
    }
    p.push([L + 20, base]);
    return p;
  }

  function caminho(pontos, A, L) {
    return 'M -20 ' + (A + 20) +
      pontos.map(function (q) { return ' L ' + q[0].toFixed(0) + ' ' + q[1].toFixed(0); }).join('') +
      ' L ' + (L + 20) + ' ' + (A + 20) + ' Z';
  }

  function topo(pontos) {
    return pontos.reduce(function (m, q) { return Math.min(m, q[1]); }, 1e9);
  }

  /* ---------------------------------------------------------
     Primeiros planos
     --------------------------------------------------------- */

  function larico(x, y, h, cor) {
    /* Larício: cone estreito e irregular, não um triângulo. */
    const l = h * 0.17;
    return '<path d="M ' + x.toFixed(0) + ' ' + y.toFixed(0) +
      ' L ' + (x - l).toFixed(0) + ' ' + (y - h * 0.26).toFixed(0) +
      ' L ' + (x - l * 0.55).toFixed(0) + ' ' + (y - h * 0.30).toFixed(0) +
      ' L ' + (x - l * 0.85).toFixed(0) + ' ' + (y - h * 0.58).toFixed(0) +
      ' L ' + (x - l * 0.40).toFixed(0) + ' ' + (y - h * 0.62).toFixed(0) +
      ' L ' + x.toFixed(0) + ' ' + (y - h).toFixed(0) +
      ' L ' + (x + l * 0.40).toFixed(0) + ' ' + (y - h * 0.62).toFixed(0) +
      ' L ' + (x + l * 0.85).toFixed(0) + ' ' + (y - h * 0.58).toFixed(0) +
      ' L ' + (x + l * 0.55).toFixed(0) + ' ' + (y - h * 0.30).toFixed(0) +
      ' L ' + (x + l).toFixed(0) + ' ' + (y - h * 0.26).toFixed(0) +
      ' Z" fill="' + cor + '"/>';
  }

  function floresta(r, L, A, p) {
    const base = A * 0.94;
    let s = '<path d="M 0 ' + (A * 0.86).toFixed(0) + ' Q ' + (L * 0.5) + ' ' + (A * 0.82).toFixed(0) +
      ' ' + L + ' ' + (A * 0.87).toFixed(0) + ' L ' + L + ' ' + A + ' L 0 ' + A + ' Z" fill="' + p.verde + '"/>';
    const n = 16 + Math.floor(r() * 10);
    for (let i = 0; i < n; i++) {
      const x = r() * L * 1.02;
      const h = A * (0.10 + r() * 0.13);
      s += larico(x, base - r() * A * 0.04, h, sombra(p.verde, 0.72 + r() * 0.3));
    }
    return s;
  }

  function prado(r, L, A, p) {
    let s = '<path d="M 0 ' + (A * 0.80).toFixed(0) + ' Q ' + (L * 0.35) + ' ' + (A * 0.74).toFixed(0) +
      ' ' + L + ' ' + (A * 0.84).toFixed(0) + ' L ' + L + ' ' + A + ' L 0 ' + A + ' Z" fill="' + p.verde + '"/>';
    /* Socalcos de pasto: linhas de corte que seguem a encosta. */
    s += '<g stroke="' + sombra(p.verde, 1.3) + '" stroke-width="2" opacity="0.5" fill="none">';
    for (let i = 0; i < 5; i++) {
      const y = A * (0.84 + i * 0.032);
      s += '<path d="M 0 ' + y.toFixed(0) + ' Q ' + (L * 0.4) + ' ' + (y - A * 0.03).toFixed(0) +
        ' ' + L + ' ' + (y + A * 0.01).toFixed(0) + '"/>';
    }
    s += '</g>';
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      s += larico(L * (0.05 + r() * 0.9), A * (0.88 + r() * 0.06), A * (0.09 + r() * 0.08), sombra(p.verde, 0.7));
    }
    return s;
  }

  function lago(r, L, A, p, cristas) {
    const linha = A * 0.72;
    let s = '<rect x="0" y="' + linha.toFixed(0) + '" width="' + L + '" height="' + (A - linha).toFixed(0) +
      '" fill="url(#agua)"/>';
    /* Reflexo: a mesma crista, invertida e esbatida. */
    s += '<g opacity="0.34" transform="translate(0,' + (linha * 2).toFixed(0) + ') scale(1,-1)">' + cristas + '</g>';
    s += '<g stroke="' + sombra(p.nevoa, 1.25) + '" stroke-width="2" opacity="0.45">';
    for (let i = 0; i < 7; i++) {
      const y = linha + A * (0.03 + i * 0.035);
      const x = r() * L * 0.5;
      s += '<line x1="' + x.toFixed(0) + '" y1="' + y.toFixed(0) + '" x2="' + (x + L * (0.15 + r() * 0.3)).toFixed(0) + '" y2="' + y.toFixed(0) + '"/>';
    }
    return s + '</g>';
  }

  function estrada(r, L, A, p) {
    const encosta = sombra(p.verde, 1.05);
    let s = '<path d="M 0 ' + (A * 0.74).toFixed(0) + ' Q ' + (L * 0.5) + ' ' + (A * 0.68).toFixed(0) +
      ' ' + L + ' ' + (A * 0.76).toFixed(0) + ' L ' + L + ' ' + A + ' L 0 ' + A + ' Z" fill="' + encosta + '"/>';

    /* Cotovelos encaixados na encosta: cada lanço mais curto do que
       o de baixo, como uma estrada de passo vista de frente. */
    const asfalto = sombra(p.perto, 0.62);
    s += '<g fill="none" stroke="' + asfalto + '" stroke-linecap="round">';
    for (let i = 0; i < 4; i++) {
      const y = A * (0.80 + i * 0.045);
      const largura = 0.30 + i * 0.14;
      const x0 = L * (0.5 - largura / 2);
      const x1 = L * (0.5 + largura / 2);
      const dir = i % 2 ? 1 : -1;
      s += '<path d="M ' + x0.toFixed(0) + ' ' + y.toFixed(0) +
        ' C ' + (L * 0.5 + dir * L * largura * 0.4).toFixed(0) + ' ' + (y - A * 0.03).toFixed(0) +
        ' ' + (L * 0.5 - dir * L * largura * 0.4).toFixed(0) + ' ' + (y + A * 0.045).toFixed(0) +
        ' ' + x1.toFixed(0) + ' ' + (y + A * 0.018).toFixed(0) + '" stroke-width="' + (A * 0.016).toFixed(1) + '"/>';
    }
    s += '</g>';

    /* Guarda de proteção: o traço branco que se vê de longe. */
    s += '<g fill="none" stroke="' + sombra(p.nevoa, 1.15) + '" opacity="0.5" stroke-width="' + (A * 0.004).toFixed(1) + '">';
    for (let i = 0; i < 4; i++) {
      const y = A * (0.80 + i * 0.045) + A * 0.010;
      const largura = 0.30 + i * 0.14;
      s += '<path d="M ' + (L * (0.5 - largura / 2)).toFixed(0) + ' ' + y.toFixed(0) +
        ' Q ' + (L * 0.5).toFixed(0) + ' ' + (y + A * 0.012).toFixed(0) +
        ' ' + (L * (0.5 + largura / 2)).toFixed(0) + ' ' + (y + A * 0.018).toFixed(0) + '"/>';
    }
    return s + '</g>';
  }

  function aldeia(r, L, A, p) {
    let s = '<path d="M 0 ' + (A * 0.80).toFixed(0) + ' Q ' + (L * 0.5) + ' ' + (A * 0.76).toFixed(0) +
      ' ' + L + ' ' + (A * 0.82).toFixed(0) + ' L ' + L + ' ' + A + ' L 0 ' + A + ' Z" fill="' + p.verde + '"/>';
    /* Casas alpinas: telhado largo de duas águas, corpo estreito. */
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const w = L * (0.09 + r() * 0.08);
      const x = L * (0.08 + i * (0.84 / n) + r() * 0.04);
      const h = w * (0.72 + r() * 0.4);
      const y = A * (0.90 + r() * 0.04);
      const parede = sombra(p.nevoa, 1.18);
      const telha = sombra(p.perto, 0.8);
      s += '<rect x="' + x.toFixed(0) + '" y="' + (y - h).toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" fill="' + parede + '"/>';
      s += '<path d="M ' + (x - w * 0.14).toFixed(0) + ' ' + (y - h).toFixed(0) +
        ' L ' + (x + w * 0.5).toFixed(0) + ' ' + (y - h - w * 0.34).toFixed(0) +
        ' L ' + (x + w * 1.14).toFixed(0) + ' ' + (y - h).toFixed(0) + ' Z" fill="' + telha + '"/>';
      s += '<rect x="' + (x + w * 0.16).toFixed(0) + '" y="' + (y - h * 0.62).toFixed(0) +
        '" width="' + (w * 0.2).toFixed(0) + '" height="' + (h * 0.26).toFixed(0) + '" fill="' + telha + '" opacity="0.8"/>';
    }
    /* Um campanário, que é o que se vê primeiro num vale destes. */
    const cx = L * (0.2 + r() * 0.6);
    const cy = A * 0.92;
    const ch = A * (0.22 + r() * 0.08);
    s += '<rect x="' + (cx - A * 0.018).toFixed(0) + '" y="' + (cy - ch).toFixed(0) +
      '" width="' + (A * 0.036).toFixed(0) + '" height="' + ch.toFixed(0) + '" fill="' + sombra(p.nevoa, 1.22) + '"/>';
    s += '<path d="M ' + (cx - A * 0.026).toFixed(0) + ' ' + (cy - ch).toFixed(0) +
      ' L ' + cx.toFixed(0) + ' ' + (cy - ch - A * 0.075).toFixed(0) +
      ' L ' + (cx + A * 0.026).toFixed(0) + ' ' + (cy - ch).toFixed(0) + ' Z" fill="' + sombra(p.perto, 0.75) + '"/>';
    return s;
  }

  /* ---------------------------------------------------------
     Cor
     --------------------------------------------------------- */

  function rgb(hex) {
    const s = hex.replace('#', '');
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }

  function hex(c) {
    return '#' + c.map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    }).join('');
  }

  function sombra(cor, fator) {
    return hex(rgb(cor).map(function (v) { return v * fator; }));
  }

  function misturar(a, b, t) {
    const x = rgb(a), y = rgb(b);
    return hex(x.map(function (v, i) { return v + (y[i] - v) * t; }));
  }

  /* ---------------------------------------------------------
     A imagem
     --------------------------------------------------------- */

  function svg(semente, variante, proporcao) {
    const v = VARIANTES[variante] || VARIANTES.paisagem;
    const p = HORAS[v.hora];
    const r = prng(semente + '|' + variante);
    const L = 1200;
    const A = Math.round(L / (proporcao || 1.5));

    /* Três planos de rocha, cada um mais escuro e mais baixo. */
    const planos = [
      { pts: crista(r, L, A * 0.62, A * 0.40, 2.4), luz: 1.00, cor: p.longe },
      { pts: crista(r, L, A * 0.72, A * 0.34, 1.8), luz: 0.55, cor: misturar(p.longe, p.perto, 0.5) },
      { pts: crista(r, L, A * 0.82, A * 0.26, 1.3), luz: 0.22, cor: p.perto }
    ];

    let defs = '<linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + p.ceu[0] + '"/>' +
      '<stop offset="0.55" stop-color="' + p.ceu[1] + '"/>' +
      '<stop offset="1" stop-color="' + p.ceu[2] + '"/></linearGradient>';

    let rocha = '';
    planos.forEach(function (pl, i) {
      const t = topo(pl.pts);
      const forca = Math.min(1, p.brilho * pl.luz);
      defs += '<linearGradient id="r' + i + '" x1="0" y1="' + (t / A).toFixed(3) + '" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + misturar(pl.cor, p.rosa, forca) + '"/>' +
        '<stop offset="0.28" stop-color="' + misturar(pl.cor, p.rosa, forca * 0.45) + '"/>' +
        '<stop offset="1" stop-color="' + sombra(pl.cor, 0.72) + '"/></linearGradient>';
      rocha += '<path d="' + caminho(pl.pts, A, L) + '" fill="url(#r' + i + ')"/>';
      /* Névoa entre planos: é o que dá profundidade a uma serra. */
      if (i < planos.length - 1) {
        rocha += '<rect x="0" y="' + (A * (0.58 + i * 0.10)).toFixed(0) + '" width="' + L +
          '" height="' + (A * 0.22).toFixed(0) + '" fill="url(#n' + i + ')"/>';
        defs += '<linearGradient id="n' + i + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + p.nevoa + '" stop-opacity="0"/>' +
          '<stop offset="0.7" stop-color="' + p.nevoa + '" stop-opacity="0.5"/>' +
          '<stop offset="1" stop-color="' + p.nevoa + '" stop-opacity="0"/></linearGradient>';
      }
    });

    if (v.frente === 'lago') {
      defs += '<linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + misturar(p.nevoa, p.perto, 0.4) + '"/>' +
        '<stop offset="1" stop-color="' + sombra(p.perto, 0.85) + '"/></linearGradient>';
    }

    let frente = '';
    if (v.frente === 'floresta') frente = floresta(r, L, A, p);
    else if (v.frente === 'prado') frente = prado(r, L, A, p);
    else if (v.frente === 'lago') frente = lago(r, L, A, p, rocha);
    else if (v.frente === 'estrada') frente = estrada(r, L, A, p);
    else if (v.frente === 'aldeia') frente = aldeia(r, L, A, p);

    /* Vinheta ténue: nenhuma fotografia é uniforme nos cantos. */
    defs += '<radialGradient id="vin" cx="0.5" cy="0.42" r="0.78">' +
      '<stop offset="0.55" stop-color="#000000" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000000" stop-opacity="' + (0.26 - p.luz * 0.14).toFixed(2) + '"/></radialGradient>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + L + ' ' + A + '" width="' + L + '" height="' + A + '">' +
      '<defs>' + defs + '</defs>' +
      '<rect width="' + L + '" height="' + A + '" fill="url(#ceu)"/>' +
      rocha + frente +
      '<rect width="' + L + '" height="' + A + '" fill="url(#vin)"/>' +
    '</svg>';
  }

  function fundo(semente, variante, proporcao) {
    /* Aspas simples: o resultado é usado dentro de atributos style="…". */
    return "url('data:image/svg+xml," + encodeURIComponent(svg(semente, variante, proporcao)) + "')";
  }

  return { fundo: fundo, svg: svg, VARIANTES: VARIANTES };
})();
