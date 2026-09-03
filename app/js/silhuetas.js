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
    sport: {
      nome: 'Desportivo',
      corpo: 'M 14 108 C 10 98 15 90 27 86 C 50 78 72 72 92 68 C 122 58 148 53 170 51 ' +
             'C 186 37 208 29 236 29 C 262 29 282 36 296 48 C 314 63 332 71 352 77 ' +
             'C 374 83 388 90 389 103 L 387 112 L 335 112 A 33 33 0 0 0 269 112 ' +
             'L 133 112 A 33 33 0 0 0 67 112 L 18 112 Z',
      vidro: 'M 186 49 C 200 39 218 34 238 34 C 258 34 276 40 288 51 Z',
      rodas: [[100, 105, 28], [302, 105, 28]]
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
      rodas = f.rodas.map(function (r) {
        return '<circle cx="' + r[0] + '" cy="' + r[1] + '" r="' + r[2] + '" fill="' + PNEU + '"/>' +
               '<circle cx="' + r[0] + '" cy="' + r[1] + '" r="' + (r[2] * 0.46).toFixed(1) + '" fill="' + JANTE + '"/>';
      }).join('');
    }

    return '<svg class="silhueta" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="' + escapar(titulo) + '">' +
      rodas +
      '<path d="' + f.corpo + '" fill="' + c.hex + '" stroke="' + CONTORNO +
      '" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      '<path d="' + f.vidro + '" fill="rgba(30,27,24,0.16)"/>' +
      '</svg>';
  }

  function escapar(t) {
    return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  return { svg: svg, MODELOS: MODELOS, CORES: CORES, modelo: modelo, cor: cor, FORMAS: FORMAS };
})();
