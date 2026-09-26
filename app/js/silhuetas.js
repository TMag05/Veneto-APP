/* =========================================================
   Silhuetas — o único elemento gráfico com personalidade
   Perfil lateral em SVG, preenchido com a cor real do carro.
   Contorno de 1px em Inchiostro a 20% para que carros claros
   continuem legíveis sobre Calce (BRAND-GUIDELINES §8).
   ========================================================= */

window.Silhuetas = (function () {
  const CONTORNO = 'rgba(30,27,24,0.22)';
  const PNEU = '#26241F';
  const JANTE = '#B9B3A3';
  const CUBO = '#3A3833';
  const CAVA = '#141311';
  const VIDRO = 'rgba(20,18,16,0.62)';
  const SOMBRA = 'rgba(20,18,16,0.4)';

  /* Cada forma: corpo (perfil), vidro (greenhouse) e eixos das rodas. */
  const FORMAS = {
    gt: {
      nome: 'Gran turismo',
      corpo: 'M 16 110 C 12 102 14 94 24 90 C 44 84 60 80 76 76 C 108 66 140 60 166 57 ' +
             'C 184 40 208 29 238 28 C 266 27 288 33 304 45 C 326 61 348 74 368 81 ' +
             'C 382 86 389 95 387 106 L 384 112 L 338 112 A 32 32 0 0 0 274 112 ' +
             'L 136 112 A 32 32 0 0 0 72 112 L 20 112 Z',
      vidro: 'M 182 54 C 198 42 216 35 240 34 C 262 33 282 39 296 50 Z',
      rodas: [[104, 105, 27], [306, 105, 27]]
    },
    /* Traçado sobre a fotografia de perfil do Vantage de 2024:
       carroçaria, vidros, espelho, faróis, soleira e linhas de porta. */
    sport: {
      nome: 'Desportivo',
      corpo: 'M 13.1 53.8 C 23.7 51.1 37.4 49 54.5 46.6 C 81.9 40.8 109.3 32.6 136.7 28.2 ' +
             'C 153.8 25.8 170.9 25.1 184.6 27.8 C 201.7 31.9 222.3 42.2 241.1 53.8 ' +
             'C 256.5 55.2 273.6 55.2 287.3 56.6 C 314.7 59 348.9 63.4 366 69.6 ' +
             'C 378 73.7 384.9 78.5 387.3 85.3 C 389 94.2 387.3 104.5 386.6 112 L 389.3 115.5 ' +
             'C 388.6 118.2 385.9 119.2 382.5 119.6 L 342.8 120.3 A 35.6 35.6 0 1 0 279.8 120.3 ' +
             'L 109.3 117.5 A 35.3 35.3 0 1 0 42.2 117.5 L 23.7 117.5 ' +
             'C 17.5 117.5 14.1 114.1 12.7 107.9 C 11.4 97.7 12.1 84 13.1 70.3 C 13.4 65.1 12.1 59.3 13.1 53.8 Z',
      vidro: 'M 92.8 42.9 C 105.9 36.7 126.4 31.2 146.9 28.8 C 167.5 27.1 184.6 29.2 198.3 34 ' +
             'C 212 39.5 229.1 47.7 242.1 55.2 C 222.3 55.2 191.4 53.8 157.2 52.5 C 133.2 51.1 109.3 47.7 92.8 42.9 Z',
      espelho: 'M 201 50.4 C 201 45.6 207.2 43.6 213.4 44.3 C 218.1 45.3 219.5 50.4 217.1 53.8 ' +
               'C 214.7 55.5 208.6 55.9 204.5 55.2 C 202.1 54.5 201 52.5 201 50.4 Z',
      escuro: 'M 109.3 114.8 L 279.8 117.5 L 277 120.3 L 110.6 118.2 Z ' +
              'M 348.2 118.2 L 383.2 116.8 L 389.3 115.5 L 386.6 120.3 L 349.6 121.6 Z ' +
              'M 12.7 87.4 C 20.3 88.1 34 90.8 37.4 97.7 L 40.8 114.8 L 23.7 116.8 C 17.5 116.8 14.1 113.4 12.7 107.9 Z',
      luzes: 'M 13.4 62.7 C 23.7 63.4 34 64.8 41.5 66.8 C 37.4 68.9 23.7 68.2 14.1 67.5 Z ' +
             'M 337.3 64.5 C 348.9 66.8 362.6 73.7 374.3 81.2 C 371.5 82.6 366 80.5 359.2 77.1 C 348.9 72 342.1 68.2 337.3 64.5 Z',
      linhas: 'M 126.4 53.8 C 123.7 70.3 126.4 90.8 140.8 108.6 M 242.1 55.9 C 247.6 70.3 249 90.8 249 109.3 ' +
              'M 253.1 77.1 C 259.9 76.4 270.2 76.4 276.3 77.8 M 105.9 63.4 C 157.2 65.5 225.7 67.5 294.1 70.3',
      cavas: 'M 279.8 120.3 A 35.6 35.6 0 1 1 342.8 120.3 Z M 42.2 117.5 A 35.3 35.3 0 1 1 109.3 117.5 Z',
      rodas: [[75, 103.5, 32.5], [311.3, 103.5, 32.5]]
    },
    suv: {
      nome: 'SUV',
      corpo: 'M 14 90 C 10 78 18 70 32 67 L 78 56 C 100 48 122 44 144 42 ' +
             'C 156 21 174 9 202 8 L 268 8 C 294 9 312 17 324 33 ' +
             'L 352 47 C 374 55 388 63 389 79 L 388 99 L 384 108 L 346 108 ' +
             'A 38 38 0 0 0 270 108 L 132 108 A 38 38 0 0 0 56 108 L 18 108 Z',
      vidro: 'M 160 41 C 172 23 188 14 208 14 L 262 14 C 282 15 296 23 306 39 Z',
      rodas: [[94, 100, 33], [308, 100, 33]]
    },
    mid: {
      nome: 'Motor central',
      corpo: 'M 12 108 C 8 100 12 93 22 91 L 58 85 C 74 81 88 77 100 73 ' +
             'C 116 57 138 47 164 45 C 192 43 214 52 228 67 C 244 78 262 83 288 85 ' +
             'C 330 88 366 92 384 99 C 391 102 392 108 390 112 L 343 112 ' +
             'A 31 31 0 0 0 281 112 L 133 112 A 31 31 0 0 0 71 112 L 16 112 Z',
      vidro: 'M 122 68 C 138 55 152 50 170 50 C 190 50 206 57 216 70 Z',
      rodas: [[102, 106, 26], [312, 106, 26]]
    },
    volante: {
      nome: 'Volante',
      corpo: 'M 16 110 C 12 102 14 94 24 90 C 44 84 60 80 76 76 C 108 66 140 60 166 57 ' +
             'C 180 44 196 36 212 34 C 216 44 222 51 236 54 L 300 57 ' +
             'C 326 66 350 76 368 82 C 382 87 389 96 387 106 L 384 112 L 338 112 ' +
             'A 32 32 0 0 0 274 112 L 136 112 A 32 32 0 0 0 72 112 L 20 112 Z',
      vidro: 'M 180 55 C 190 45 200 39 210 37 L 214 52 Z',
      rodas: [[104, 105, 27], [306, 105, 27]]
    }
  };

  /* Modelos disponíveis na ficha do participante. */
  const MODELOS = [
    { id: 'db12', nome: 'DB12', forma: 'gt' },
    { id: 'db12-volante', nome: 'DB12 Volante', forma: 'volante' },
    { id: 'db11', nome: 'DB11', forma: 'gt' },
    { id: 'vanquish', nome: 'Vanquish', forma: 'gt' },
    { id: 'dbs', nome: 'DBS Superleggera', forma: 'gt' },
    { id: 'vantage', nome: 'Vantage', forma: 'sport' },
    { id: 'v12-vantage', nome: 'V12 Vantage', forma: 'sport' },
    { id: 'dbx707', nome: 'DBX707', forma: 'suv' },
    { id: 'valhalla', nome: 'Valhalla', forma: 'mid' }
  ];

  /* Paleta de carroçaria. Códigos a confirmar com a marca. */
  const CORES = [
    { id: 'onyx', nome: 'Onyx Black', hex: '#17181A' },
    { id: 'jet', nome: 'Jet Black', hex: '#2B2C2F' },
    { id: 'magnetic', nome: 'Magnetic Silver', hex: '#A9AEB2' },
    { id: 'skyfall', nome: 'Skyfall Silver', hex: '#C3C8CB' },
    { id: 'lunar', nome: 'Lunar White', hex: '#E4E2DC' },
    { id: 'racing', nome: 'AM Racing Green', hex: '#1D3A2C' },
    { id: 'buckingham', nome: 'Buckinghamshire Green', hex: '#12352A' },
    { id: 'aris', nome: 'Aris Blue', hex: '#20415F' },
    { id: 'ultramarine', nome: 'Ultramarine Black', hex: '#161E2C' },
    { id: 'hyper', nome: 'Hyper Red', hex: '#8E1319' },
    { id: 'divine', nome: 'Divine Red', hex: '#6B1418' },
    { id: 'golden', nome: 'Golden Saffron', hex: '#B98A2A' },
    { id: 'sabiro', nome: 'Sabiro Blue', hex: '#3E6C93' },
    { id: 'quantum', nome: 'Quantum Silver', hex: '#8B9095' }
  ];

  function modelo(id) {
    return MODELOS.find(function (m) { return m.id === id; }) || MODELOS[0];
  }

  function cor(id) {
    const c = CORES.find(function (x) { return x.id === id; });
    return c || CORES[5];
  }

  /* svg(modeloId, corId, { rodas:false, titulo:'' }) → string */
  function svg(modeloId, corId, opcoes) {
    const o = opcoes || {};
    const m = modelo(modeloId);
    const f = FORMAS[m.forma];
    const c = cor(corId);
    const titulo = o.titulo === undefined ? m.nome + ', ' + c.nome : o.titulo;

    let rodas = '';
    if (o.rodas !== false) {
      rodas = (f.cavas ? '<path d="' + f.cavas + '" fill="' + CAVA + '"/>' : '') + f.rodas.map(roda).join('');
    }

    /* Os pormenores só se desenham com rodas: sem elas, a silhueta é pequena de mais para os ler. */
    const pormenor = o.rodas !== false;
    return '<svg class="silhueta" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="' + escapar(titulo) + '">' +
      rodas +
      '<path d="' + f.corpo + '" fill="' + c.hex + '" stroke="' + CONTORNO +
      '" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      (f.escuro ? '<path d="' + f.escuro + '" fill="' + SOMBRA + '"/>' : '') +
      '<path d="' + f.vidro + '" fill="' + (f.espelho ? VIDRO : 'rgba(30,27,24,0.16)') + '"/>' +
      (f.luzes ? '<path d="' + f.luzes + '" fill="' + SOMBRA + '"/>' : '') +
      (pormenor && f.linhas ? '<path d="' + f.linhas + '" fill="none" stroke="' + SOMBRA +
        '" stroke-width="0.75" vector-effect="non-scaling-stroke" stroke-linecap="round"/>' : '') +
      (f.espelho ? '<path d="' + f.espelho + '" fill="' + c.hex + '" stroke="' + CONTORNO +
        '" stroke-width="1" vector-effect="non-scaling-stroke"/>' : '') +
      '</svg>';
  }

  /* Pneu, jante de dez raios e cubo. */
  function roda(r) {
    const x = r[0], y = r[1], R = r[2];
    const f = function (n) { return n.toFixed(1); };
    let raios = '';
    for (let k = 0; k < 10; k++) {
      const a = k * Math.PI / 5;
      raios += 'M ' + f(x + Math.cos(a) * R * 0.2) + ' ' + f(y + Math.sin(a) * R * 0.2) +
               ' L ' + f(x + Math.cos(a) * R * 0.72) + ' ' + f(y + Math.sin(a) * R * 0.72) + ' ';
    }
    return '<circle cx="' + x + '" cy="' + y + '" r="' + R + '" fill="' + PNEU + '"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(R * 0.74) + '" fill="' + CUBO + '" stroke="' + JANTE +
      '" stroke-width="' + f(R * 0.05) + '"/>' +
      '<path d="' + raios + '" stroke="' + JANTE + '" stroke-width="' + f(R * 0.07) + '" stroke-linecap="round"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + f(R * 0.2) + '" fill="' + JANTE + '"/>';
  }

  function escapar(t) {
    return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  return { svg: svg, MODELOS: MODELOS, CORES: CORES, modelo: modelo, cor: cor, FORMAS: FORMAS };
})();
