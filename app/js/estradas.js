/* =========================================================
   Estradas — o desenho do traçado, não um mapa
   Um retrato de cada estrada: um traço, sem preenchimento,
   fiel à geometria real. Os traçados vêm do OpenStreetMap
   (ODbL), projetados uma vez e gravados aqui — a app não faz
   um único pedido a servidores externos.

   Uma estrada sem traçado confirmado entra aqui na mesma, com
   o nome e a nota, e sem desenho. Um traço aproximado é uma
   mentira mais difícil de apanhar do que um número errado.
   ========================================================= */

window.ESTRADAS = (function () {

  const TRACOS = {

    /* O troço dos tornantes, entre o primeiro e o último túnel, com
       a aproximação de cada lado: 796 m de estrada medidos sobre a
       geometria do OpenStreetMap, dentro de um retângulo de 184 por
       139 metros. Bate com os «cerca de 800 m» da pesquisa, e os
       cinco troços marcados como túnel no OSM batem com os cinco
       túneis documentados. */
    'san-boldo': {
      id: 'san-boldo',
      nome: 'Passo di San Boldo',
      subtitulo: 'La Strada dei 100 Giorni',
      dias: [2, 4],
      /* A própria estrada é paragem do programa, nos dois dias. */
      paragem: 'passo-di-san-boldo',
      estado: 'confirmado',
      viewBox: '0 0 1000 792',
      traco:
        'M 930 107.5 L 873.6 117.3 L 820.8 133.2 L 779.9 151.8 L 746.4 178.4 ' +
        'L 701.3 234.5 L 614.5 332.8 L 523 421 L 468.2 465.1 L 450.9 490.2 L 440.5 521.1 ' +
        'L 438.9 551.3 L 435.9 595.9 L 427.5 630 L 406.8 679.1 L 400.3 692.9 ' +
        'L 387.5 708.4 L 371.1 720 L 357.7 722.1 L 342.2 720 L 328.9 713.9 L 314.7 701.5 ' +
        'L 304.8 685.1 L 299.2 659.3 L 299.5 633.3 L 305.2 613.2 L 316.9 593.3 ' +
        'L 335.1 564.1 L 370.4 521.1 L 435.6 441.5 L 502.4 367.4 L 514.1 356.9 ' +
        'L 520.6 345.8 L 522.2 331.8 L 520.6 320 L 512.9 308.3 L 499.9 299 L 483.8 296.1 ' +
        'L 457.4 297 L 441.7 303.4 L 426.3 316.4 L 382.4 376.8 L 319.4 454.3 L 311 468.8 ' +
        'L 304.7 483.2 L 292.4 512.7 L 272.6 567.7 L 248.4 632.9 L 238.2 646.8 ' +
        'L 226.2 659.3 L 213 665.6 L 197.8 669.3 L 185.1 665.4 L 177.3 656.2 ' +
        'L 173.5 644.9 L 172.7 633.3 L 174.1 617.3 L 194.6 531.3 L 199 512.4 L 218.6 429 ' +
        'L 251.6 349.9 L 265.6 316.2 L 268.7 305.3 L 269.2 295.2 L 266.6 285.1 ' +
        'L 261.4 278.3 L 253.1 272.6 L 241.4 271.1 L 230.2 273.2 L 220.5 279.3 ' +
        'L 213 285.5 L 206.3 293.9 L 197.9 315.7 L 177.9 416.3 L 158 483.3 L 153.3 499.3 ' +
        'L 122.4 593.1 L 116.4 600.8 L 108 606.2 L 99.2 609.7 L 90.7 610.5 L 82.3 608.9 ' +
        'L 76.7 604.2 L 71.8 596.7 L 70 587.8 L 73.3 572.1 L 106 501.2 L 138.9 419.3 ' +
        'L 177.6 257.2 L 183 242.1 L 188.3 230.5 L 193 222 L 200 212 L 211.1 202.4 ' +
        'L 226.4 195.5 L 247.7 186.6 L 273.6 184.6 L 345.7 183.6 L 375.8 185.6 ' +
        'L 403.9 197.4 L 439.3 216.9 L 446.8 222.8 L 455.7 226.1 L 465.3 226.2 ' +
        'L 474.3 223.4 L 482 217.7 L 487.4 209.9 L 490 201 L 489.7 191.7 L 486.5 183 ' +
        'L 480.8 175.8 L 473 170.7 L 438.1 159.6 L 409.2 141.7 L 396.3 124.1 ' +
        'L 380.1 95.5 L 376.8 82 L 375.1 70',
      /* docs/pesquisa-locais-passeio-dolomitas-2026.md §2, com fontes
         qdpnews.it e FAI. Nada aqui é estimado. */
      dados: {
        curvas: 6,
        tuneis: 5,
        inclinacao: '10%',
        desnivel: '100 m',
        comprimento: '800 m'
      },
      nota: 'Cem dias, entre janeiro e 10 de junho de 1918. O passeio faz esta estrada duas vezes, uma em cada sentido.'
    },

    /* As quatro que faltam. Há mais do que um traçado possível a
       partir de Possagno, e os vales do dia 3 não têm um único nome
       na proposta — por isso entram sem desenho, até a Stappando
       confirmar por onde se vai. */
    'strada-cadorna': {
      id: 'strada-cadorna',
      nome: 'Strada Cadorna',
      subtitulo: 'A subida a Cima Grappa',
      dias: [2],
      /* «Acesso pela Strada Cadorna» — pesquisa §1. */
      paragem: 'sacrario-del-monte-grappa',
      estado: 'por confirmar',
      dados: {},
      nota: 'Estrada militar mandada abrir pelo general Cadorna, concluída em 1917.'
    },

    'val-canali': {
      id: 'val-canali',
      nome: 'Val Canali',
      subtitulo: 'A subida às Pale di San Martino',
      dias: [3],
      /* «Localizado na Val Canali» — pesquisa §6. */
      paragem: 'chalet-piereni',
      estado: 'por confirmar',
      dados: {},
      nota: 'O vale que separa o Lagorai das Pale di San Martino.'
    },

    'vales-dolomitas': {
      id: 'vales-dolomitas',
      nome: 'Os vales das Dolomitas',
      subtitulo: 'A tarde do terceiro dia',
      dias: [3],
      paragem: '',
      estado: 'por confirmar',
      dados: {},
      nota: 'Três horas e meia de estrada pelos vales, com o percurso ainda por confirmar.'
    },

    'cansiglio': {
      id: 'cansiglio',
      nome: 'Altopiano del Cansiglio',
      subtitulo: 'A subida ao Monte Pizzoc',
      dias: [4],
      /* O rifúgio está no Monte Pizzoc, no Cansiglio — pesquisa §8. */
      paragem: 'rifugio-citta-di-vittorio-veneto',
      estado: 'por confirmar',
      dados: {},
      nota: 'O bosque de faias que Veneza guardou desde 1420 para fazer os remos do Arsenale.'
    }
  };

  /* As estradas de um dia, pela ordem em que se percorrem. */
  function doDia(numero) {
    return Object.keys(TRACOS)
      .map(function (k) { return TRACOS[k]; })
      .filter(function (e) { return e.dias.indexOf(numero) >= 0; });
  }

  function por(id) { return TRACOS[id] || null; }

  /* A estrada que conduz a uma paragem, nesse dia. */
  function paraParagem(numero, poiId) {
    return doDia(numero).find(function (e) { return e.paragem === poiId; }) || null;
  }

  /* As que ficam sem sítio na sequência do dia — os vales sem nome. */
  function soltas(numero) {
    return doDia(numero).filter(function (e) { return !e.paragem; });
  }

  /* Só as que têm traçado é que se desenham. */
  function desenhavel(e) { return !!(e && e.traco && e.viewBox); }

  /* O retrato de uma estrada. Um traço, sem preenchimento, na cor do
     percurso — e mais nenhuma. A espessura vem de tokens.css e não
     escala com o desenho, para o mesmo traçado se ler grande numa
     capa e pequeno numa lista. */
  function svg(e, classes) {
    if (!desenhavel(e)) return '';
    return '<svg class="estrada ' + (classes || '') + '" viewBox="' + e.viewBox + '" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Traçado do ' + UI.h(e.nome) + '">' +
      '<path class="estrada__traco" d="' + e.traco + '"/>' +
    '</svg>';
  }

  return { TRACOS: TRACOS, doDia: doDia, por: por, paraParagem: paraParagem, soltas: soltas, desenhavel: desenhavel, svg: svg };
})();
