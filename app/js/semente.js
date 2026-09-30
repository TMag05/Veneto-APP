/* =========================================================
   Semente — o passeio de 2026, tal como a app o carrega
   A app existe para o passeio e só para o passeio. Os
   convidados recebem acesso poucos dias antes de partir;
   não há checkup, não há transporte, não há inscrições.

   Isto é o itinerário real: é o que um telemóvel mostra à
   primeira abertura. A organização continua a poder mudar tudo
   na sua área; quando houver servidor, é de lá que isto vem.

   Fontes: a proposta da Stappando de 27.04.2026 (dias, horas,
   hotéis, restaurantes) com as correções de docs/, e a revisão da
   direção de 27.09.2026: os títulos e os interlúdios dos três dias
   de estrada são os dela, e o almoço de 3 de outubro é na Malga Ces.
   Os cinco dias são numerados, do 1 ao 5 (27.09.2026). Os textos das
   paragens vêm de docs/pesquisa-locais-passeio-dolomitas-2026.md;
   onde a pesquisa não chega, fica só o subtítulo. Nada inventado.
   ========================================================= */

window.SEMENTE = (function () {

  const evento = {
    nome: 'Dolomites Grand Tour',
    subtitulo: 'Há estradas que só se contam a quem lá esteve.',
    ano: 2026,
    inicio: '2026-10-01',
    fim: '2026-10-05',
    base: 'Hotel Villa Soligo',
    /* Onde é o passeio, por baixo da data na primeira abertura. */
    lugar: 'Veneto, Itália',
    hotel: 'Hotel Villa Soligo',
    /* Briefing que o convidado lê nos dias anteriores. */
    /* O que levar: os documentos e as chaves, pela lista da
       organização (28.09.2026). Destaca-se no Hoje até ao Dia 1. */
    levar: [
      'Cartão de Cidadão',
      'Carta de condução',
      'Documentação da viatura (DUA, ou DAV na sua falta)',
      'Seguro do Aston Martin',
      'Inspeção (se aplicável)',
      'Segunda chave e chave mecânica — nos modelos da plataforma VH, no DB11 e no Vantage até 2024'
    ],
    notas: [
      'Todas as manhãs, antes de partir, há um briefing: as regras da estrada e o resumo do dia.',
      'Todas as refeições estão asseguradas, do pequeno-almoço ao jantar.',
      'Código de vestuário: casual todos os dias. O jantar de encerramento é casual chic.'
    ]
  };

  /* ---------------------------------------------------------
     Os sítios do passeio
     Coordenadas do OpenStreetMap; imagens em assets/fotos/ (as
     oficiais de cada local, e Pixabay para Veneza e San Boldo)
     ou os gráficos de logística de imagens.js.
     --------------------------------------------------------- */
  const biblioteca = [

    { nome: 'Aeroporto Marco Polo', local: 'Veneza', tipo: 'logistica', lat: 45.5035, lng: 12.3426,
      subtitulo: 'Onde o passeio começa e acaba.',
      imagem: { grafico: 'chegada' } },

    { nome: 'LO.VE.', local: 'Via dei Colli 3, Follina', tipo: 'logistica', lat: 45.9370, lng: 12.1410,
      subtitulo: 'Onde se levantam e se entregam os carros.',
      imagem: { grafico: 'troca-de-viatura' } },

    { nome: 'Hotel Villa Soligo', local: 'Soligo', tipo: 'hotel', lat: 45.9116, lng: 12.1566,
      subtitulo: 'A casa do passeio, nas colinas do Prosecco.',
      imagem: { foto: 'assets/fotos/hotel-villa-soligo.jpg' } },

    { nome: 'Tempio Canoviano', local: 'Possagno', tipo: 'monumento', lat: 45.8582, lng: 11.8782,
      subtitulo: 'Canova desenhou-o para a terra onde nasceu.',
      historia: [
        'Antonio Canova nasceu aqui em 1757 e desenhou este templo aos quarenta e sete anos. Assistiu à primeira pedra, em 1819, e não o chegou a ver acabado.',
        'Morreu em Veneza em 1822. O templo só ficou pronto em 1857, no centenário do seu nascimento, e é nele que está sepultado.',
        'Ao lado, a Gypsotheca guarda os gessos originais: os modelos das estátuas que hoje estão em mármore pelos museus da Europa. É o momento em que a ideia ainda podia mudar de forma.'
      ],
      imagem: { foto: 'assets/fotos/tempio-canoviano.jpg' } },

    { nome: 'Sacrario del Monte Grappa', local: 'Cima Grappa', tipo: 'monumento', lat: 45.8721, lng: 11.7993,
      subtitulo: 'Pela estrada que o exército italiano abriu em 1917.', altitude: 1776,
      historia: [
        'Aqui estão sepultados os dois lados da mesma batalha, a poucos metros um do outro. Mais de doze mil italianos e dez mil austro-húngaros, na grande maioria sem nome.',
        'Depois de Caporetto, no inverno de 1917, o Grappa foi a linha que não cedeu. Atrás dela só havia a planície do Veneto.',
        'Chega-se pela Strada Cadorna, a estrada militar que abastecia a frente. A 1776 metros, o silêncio é o oposto do que este lugar já foi.'
      ],
      imagem: { foto: 'assets/fotos/sacrario-grappa.jpg' } },

    { nome: 'Rifugio Bassano', local: 'Cima Grappa', tipo: 'restaurante', lat: 45.8734, lng: 11.8030,
      subtitulo: 'Almoço no cimo do Grappa.',
      imagem: { foto: 'assets/fotos/rifugio-bassano.jpg' } },

    /* O fio da Grande Guerra: o Grappa e San Boldo são os dois lados da
       mesma frente. San Boldo faz-se duas vezes, nos dias 2 e 4. */
    { nome: 'Passo di San Boldo', local: 'Strada dei 100 Giorni', tipo: 'estrada', lat: 46.0060, lng: 12.1697,
      subtitulo: 'Cem dias, em 1918, do outro lado da frente.', altitude: 706,
      historia: [
        'Cem dias, sete mil pessoas e uma estrada escavada na rocha para vencer cem metros de desnível. Abriu-a o exército austro-húngaro, em 1918.',
        'Trabalharam soldados, prisioneiros italianos, russos e bósnios, e a gente de Tovena, com idosos, mulheres e crianças. São seis curvas em espiral e cinco túneis, sempre a dez por cento.',
        'Foi feita para levar o exército à frente do Grappa e do Piave. Meses depois, serviu-lhe para recuar.'
      ],
      nota: 'É o único troço que o passeio faz duas vezes, uma em cada sentido.',
      imagem: { foto: 'assets/fotos/passo-san-boldo.jpg' } },

    /* Sensibilidade: em 2014 houve aqui uma cheia mortal. Não se menciona,
       e evita-se escrever sobre a água como coisa calma. */
    { nome: 'Molinetto della Croda', local: 'Refrontolo', tipo: 'monumento', lat: 45.9379, lng: 12.1917,
      subtitulo: 'Um moinho de 1630, nas colinas do Prosecco.',
      historia: [
        'Um moinho de 1630, movido pela queda de doze metros do Lierza. Moeu durante quase trezentos e trinta anos, até 1953.',
        'É das imagens mais fotografadas das colinas do Prosecco, e foi cenário de «Mogliamante», com Marcello Mastroianni, em 1977. Hoje é um pequeno museu da moagem.'
      ],
      nota: 'Aqui faz-se a fotografia do grupo e a de cada carro. Segue-se um aperitivo, servido pela Locanda Al Bakaro.',
      imagem: { foto: 'assets/fotos/molinetto-della-croda.jpg' } },

    { nome: 'Ristorante Da Gigetto', local: 'Miane', tipo: 'restaurante', lat: 45.9421, lng: 12.0901,
      subtitulo: 'Uma adega com mais de 1600 rótulos.',
      imagem: { foto: 'assets/fotos/da-gigetto.jpg' } },

    { nome: 'Ateliê de Valentino Moro', local: 'Miane', tipo: 'vinha', lat: 45.9458, lng: 12.1020,
      subtitulo: 'Um ferreiro que trabalha sozinho, entre as vinhas.',
      historia: [
        'Trabalha sozinho, num ateliê que começou por ser um pequeno depósito entre as vinhas. Nada sai daqui em série.',
        'Usa ferro puro, sem ligas, porque só o ferro puro se deixa remodelar enquanto está quente. Às vezes junta-lhe pedra ou vidro.',
        'Para ele, o desenho é só o ponto de partida. O resto decide-se com o metal ainda quente.'
      ],
      imagem: { foto: 'assets/fotos/valentino-moro.jpg' } },

    /* Almoço do dia 3 de outubro, como no texto da direção de 27.09.2026.
       Coordenadas do OpenStreetMap. */
    { nome: 'Malga Ces', local: 'San Martino di Castrozza', tipo: 'restaurante', lat: 46.2707, lng: 11.7732,
      subtitulo: 'Almoço com vista para as Pale di San Martino.' },

    /* Chegou a ser o almoço do dia 3 de outubro; a direção voltou à
       Malga Ces a 27.09.2026. Fica na biblioteca, fora do itinerário. */
    { nome: 'Chalet Piereni', local: 'Val Canali', tipo: 'restaurante', lat: 46.2029, lng: 11.8580,
      subtitulo: 'Almoço de frente para as Pale di San Martino.',
      historia: [
        'É aqui que o passeio entra verdadeiramente nas Dolomitas. Do chalet, as Pale di San Martino ficam mesmo em frente.',
        'A Val Canali está dentro do Parco Naturale Paneveggio – Pale di San Martino e é um dos acessos a pé ao planalto das Pale. Desde 2009, estas montanhas são Património Mundial.',
        'A cozinha é a do Trentino. Já não estamos no Veneto.'
      ],
      imagem: { foto: 'assets/fotos/chalet-piereni.jpg' } },

    { nome: 'La Candola', local: 'Eremo di San Gallo', tipo: 'restaurante', lat: 45.9160, lng: 12.1456,
      subtitulo: 'Jantar junto ao Eremo di San Gallo.',
      imagem: { foto: 'assets/fotos/la-candola.jpg' } },

    { nome: 'La Casera', local: 'Nevegal', tipo: 'restaurante', lat: 46.0938, lng: 12.3040,
      subtitulo: 'Paragem curta no Nevegal.',
      imagem: { foto: 'assets/fotos/la-casera.jpg' } },

    { nome: 'Rifugio Città di Vittorio Veneto', local: 'Monte Pizzoc', tipo: 'miradouro', lat: 46.0412, lng: 12.3444,
      subtitulo: 'A floresta que fazia os remos de Veneza.', altitude: 1547,
      historia: [
        'Em dia limpo vê-se tudo daqui: as Dolomitas a norte, as friulanas a leste e, a sul, a laguna de Veneza. É o resto do dia, visto de cima.',
        'Veneza pôs a floresta do Cansiglio sob proteção em 1420. A partir de 1548 foi o Bosco da Reme: faias criadas durante mais de um século para dar remos ao Arsenale.',
        'Proibia-se ali o pastoreio, e marcos de pedra fechavam o perímetro. A floresta que remava a Serenissima ainda aqui está.'
      ],
      nota: 'Almoço volante, a caminho de Veneza.',
      imagem: { foto: 'assets/fotos/rifugio-vittorio-veneto.jpg' } },

    { nome: 'Canal Grande', local: 'Veneza', tipo: 'cidade', lat: 45.4380, lng: 12.3359,
      subtitulo: 'Do Tronchetto a San Marco, de barco.',
      nota: 'Barcos privados, com guias que falam inglês.',
      imagem: { foto: 'assets/fotos/canal-grande.jpg' } },

    /* Sensibilidade: a frase do «salão de estar da Europa» não tem
       confirmação de ter sido dita por Napoleão. Não se usa. */
    { nome: 'Piazza San Marco', local: 'Veneza', tipo: 'cidade', lat: 45.4343, lng: 12.3387,
      subtitulo: 'O fim da estrada é uma praça sem carros.',
      historia: [
        'O Caffè Florian abriu a 29 de dezembro de 1720, com o nome de Alla Venezia Trionfante. É o café mais antigo de Itália, sempre no mesmo lugar.',
        'Em frente fica o Caffè Quadri, que era o dos oficiais austríacos. O Florian era o dos venezianos, e em 1848 tratavam-se lá os feridos da revolta.',
        'Os quatro cavalos de bronze da basílica foram levados por Napoleão para Paris em 1797, e voltaram em 1815. O campanário caiu inteiro em 1902 e voltou a erguer-se igual, no mesmo sítio.'
      ],
      nota: 'Aperitivo do grupo no Caffè Florian.',
      imagem: { foto: 'assets/fotos/piazza-san-marco.jpg' } },

    { nome: 'JW Marriott Venice', local: 'Isola delle Rose', tipo: 'hotel', lat: 45.4052, lng: 12.3206,
      subtitulo: 'A última noite, numa ilha da laguna.',
      imagem: { foto: 'assets/fotos/jw-marriott.jpg' } },

    { nome: 'Sagra', local: 'Terraço do JW Marriott', tipo: 'restaurante', lat: 45.4052, lng: 12.3206,
      subtitulo: 'O jantar de encerramento, com Veneza à vista.',
      nota: 'Casual chic.',
      imagem: { foto: 'assets/fotos/sagra.jpg' } }
  ];

  /* Contactos: o número europeu de emergência e a equipa que
     acompanha o passeio (grupo 'equipa'). Um só contacto recebe os
     pedidos de assistência (assistencia: 'sim') — é para ele que o
     SOS liga e manda a localização. */
  const contactos = [
    { id: 'c-emergencia', nome: 'Emergência', papel: 'Número europeu', telefone: '112',
      notas: 'Funciona sem rede de dados e sem cartão.', icone: 'alerta' },
    { id: 'c-miguel-costa', grupo: 'equipa', nome: 'Miguel Costa', papel: '', telefone: '+351 916 934 941', notas: '', icone: 'telefone' },
    { id: 'c-bruno-oliveira', grupo: 'equipa', nome: 'Bruno Oliveira', papel: '', telefone: '+351 969 956 555', notas: '', icone: 'telefone' },
    { id: 'c-bernardo-encarnacao-jorge', grupo: 'equipa', nome: 'Bernardo Encarnação Jorge', papel: '', telefone: '+351 965 536 661', notas: '', icone: 'telefone' },
    { id: 'c-tiago-magalhaes', grupo: 'equipa', nome: 'Tiago Magalhães', papel: '', telefone: '+351 910 196 054', notas: '', icone: 'telefone', assistencia: 'sim' }
  ];

  /* ---------------------------------------------------------
     O itinerário, dia a dia
     As paragens e os momentos apontam para a biblioteca pelo
     nome. «paragens» são os troços ao volante — é deles que se
     tiram os quilómetros do dia. Uma hora vazia é uma hora ainda
     por confirmar. Com «horaOculta», a hora serve só o relógio da
     app: ao convidado mostra-se a da partida, a da chegada ao
     hotel e a do jantar, e mais nenhuma (27.09.2026).
     --------------------------------------------------------- */
  const roteiro = {
    /* Hotéis e restaurantes, com o telefone e a morada dos sites
       oficiais (28.09.2026). O Sagra não tem linha própria: é a
       do JW Marriott. */
    locais: [
      { tipo: 'hotel', nome: 'Hotel Villa Soligo', telefone: '+39 0438 173 6929',
        morada: 'Via Guglielmo Marconi 2, Farra di Soligo', notas: 'Noites de 1, 2 e 3 de outubro' },
      { tipo: 'hotel', nome: 'JW Marriott Venice', telefone: '+39 041 852 1300',
        morada: 'Isola delle Rose, Veneza', notas: 'Noite de 4 de outubro' },
      { tipo: 'restaurante', nome: 'Rifugio Bassano', telefone: '+39 0423 53101',
        morada: 'Via Madonna del Covolo 161, Crespano del Grappa', notas: 'Almoço, 2 de outubro' },
      { tipo: 'restaurante', nome: 'Ristorante Da Gigetto', telefone: '+39 0438 960 020',
        morada: 'Via Alcide De Gasperi 5, Miane', notas: 'Jantar, 2 de outubro' },
      { tipo: 'restaurante', nome: 'Malga Ces', telefone: '+39 0439 68223',
        morada: 'Località Ces, San Martino di Castrozza', notas: 'Almoço, 3 de outubro' },
      { tipo: 'restaurante', nome: 'La Candola', telefone: '+39 0438 900006',
        morada: 'Via San Gallo 43, Farra di Soligo', notas: 'Jantar, 3 de outubro' },
      { tipo: 'restaurante', nome: 'La Casera', telefone: '+39 0437 908180',
        morada: 'Via Faverghera 751, Nevegal, Belluno', notas: 'Paragem da manhã, 4 de outubro' },
      { tipo: 'restaurante', nome: 'Rifugio Città di Vittorio Veneto', telefone: '+39 0438 145 1035',
        morada: 'Via Monte Pizzoc 35, Fregona', notas: 'Almoço volante, 4 de outubro. Telemóvel: +39 349 368 0586' },
      { tipo: 'restaurante', nome: 'Sagra', telefone: '+39 041 852 1300',
        morada: 'JW Marriott Venice, Isola delle Rose, Veneza', notas: 'Jantar de encerramento, 4 de outubro' },
      { tipo: 'outro', nome: 'LO.VE. events&travels', morada: 'Via dei Colli 3, Follina' }
    ],
    dias: [
      {
        data: '2026-10-01', titulo: 'Chegada',
        subtitulo: 'Do aeroporto às colinas do Prosecco.',
        resumo: 'Do Marco Polo ao Hotel Villa Soligo, em transfer privado. A primeira noite é nas colinas do Prosecco.',
        hotel: 'Hotel Villa Soligo',
        imagem: { grafico: 'chegada' },
        paragens: ['Hotel Villa Soligo'],
        momentos: [
          { titulo: 'Chegada a Veneza', local: 'Aeroporto Marco Polo', tipo: 'logistica', paragem: 'Aeroporto Marco Polo',
            nota: 'Três transfers privados levam ao Hotel Villa Soligo, conforme os voos: manhã, hora de almoço e fim da tarde. Quem já estiver em Veneza junta-se ao grupo no aeroporto às 18:00, à chegada do TP862; quem vem em aviação privada ou de carro segue para o hotel a partir das 16:00.' },
          { hora: '20:30', titulo: 'Chegada ao hotel', local: 'Hotel Villa Soligo', tipo: 'paragem', paragem: 'Hotel Villa Soligo',
            nota: 'Aperitivo de boas-vindas e check-in.' },
          { hora: '21:00', titulo: 'Jantar no hotel', local: 'Hotel Villa Soligo', tipo: 'refeicao', paragem: 'Hotel Villa Soligo' }
        ]
      },
      {
        data: '2026-10-02', titulo: 'Trilhos da Grande Guerra',
        subtitulo: 'Canova, o Sacrario e a Strada dei 100 Giorni.',
        resumo: 'Da região vinícola de Conegliano-Valdobbiadene (património UNESCO) até ao Monte Grappa (1776 m) e ao Passo di San Boldo, terminando no jantar no Gigetto.',
        hotel: 'Hotel Villa Soligo',
        imagem: { foto: 'assets/fotos/sacrario-grappa.jpg' },
        paragens: ['Hotel Villa Soligo', 'Tempio Canoviano', 'Sacrario del Monte Grappa', 'Passo di San Boldo', 'Molinetto della Croda', 'Hotel Villa Soligo'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Hotel Villa Soligo', tipo: 'partida', paragem: 'Hotel Villa Soligo',
            nota: 'Abastecimento pelo caminho.' },
          { horaOculta: true, hora: '10:00', fim: '11:15', titulo: 'Tempio Canoviano', local: 'Possagno', tipo: 'visita', paragem: 'Tempio Canoviano',
            nota: 'Visita ao templo e ao Museo Canova.' },
          { horaOculta: true, hora: '12:30', fim: '13:15', titulo: 'Sacrario del Monte Grappa', local: 'Cima Grappa', tipo: 'visita', paragem: 'Sacrario del Monte Grappa' },
          { horaOculta: true, hora: '13:15', fim: '14:45', titulo: 'Almoço', local: 'Rifugio Bassano', tipo: 'refeicao', paragem: 'Rifugio Bassano' },
          { horaOculta: true, hora: '14:45', titulo: 'Passo di San Boldo', local: 'Strada dei 100 Giorni', tipo: 'estrada', paragem: 'Passo di San Boldo' },
          { horaOculta: true, hora: '16:45', titulo: 'Molinetto della Croda', local: 'Refrontolo', tipo: 'visita', paragem: 'Molinetto della Croda',
            nota: 'Fotografia do grupo e de cada carro, e um aperitivo.' },
          { hora: '18:00', titulo: 'Chegada ao hotel', local: 'Hotel Villa Soligo', tipo: 'paragem', paragem: 'Hotel Villa Soligo',
            nota: 'Os carros chegam em dois momentos, até às 18:30, para facilitar o estacionamento. Aperitivo à chegada.' },
          { horaOculta: true, hora: '20:15', titulo: 'Transfer para o jantar', local: 'À porta do hotel', tipo: 'logistica' },
          { hora: '20:30', titulo: 'Jantar', local: 'Ristorante Da Gigetto, Miane', tipo: 'refeicao', paragem: 'Ristorante Da Gigetto' },
          { horaOculta: true, hora: '23:30', titulo: 'Regresso ao hotel', local: 'Transfer privado', tipo: 'logistica', paragem: 'Hotel Villa Soligo' }
        ]
      },
      {
        data: '2026-10-03', titulo: 'As passagens das Dolomitas',
        subtitulo: 'Das colinas às Pale di San Martino.',
        resumo: 'O dia mais alpino, cruzando Croce d\'Aune, Rolle, Valles, Cereda e Forcella Aurine, com almoço na Malga Ces (vista para as Pale di San Martino) e jantar de destaque em La Candola.',
        hotel: 'Hotel Villa Soligo',
        imagem: { variante: 'poente', semente: 'd-2026-10-03' },
        paragens: ['Hotel Villa Soligo', 'Ateliê de Valentino Moro', 'Malga Ces', 'Hotel Villa Soligo'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Hotel Villa Soligo', tipo: 'partida', paragem: 'Hotel Villa Soligo',
            nota: 'Abastecimento pelo caminho.' },
          { horaOculta: true, hora: '09:15', fim: '10:15', titulo: 'Ateliê de Valentino Moro', local: 'Miane', tipo: 'visita', paragem: 'Ateliê de Valentino Moro' },
          { horaOculta: true, hora: '10:15', titulo: 'A caminho das Dolomitas', local: 'Pelos Pré-Alpes', tipo: 'estrada' },
          { horaOculta: true, hora: '13:00', fim: '14:30', titulo: 'Almoço', local: 'Malga Ces, San Martino di Castrozza', tipo: 'refeicao', paragem: 'Malga Ces' },
          { horaOculta: true, hora: '14:30', titulo: 'Vales das Dolomitas', local: 'O regresso', tipo: 'estrada' },
          { horaOculta: true, hora: '16:00', titulo: 'Paragem curta', local: 'A meio do caminho', tipo: 'paragem' },
          { hora: '18:00', titulo: 'Chegada ao hotel', local: 'Hotel Villa Soligo', tipo: 'paragem', paragem: 'Hotel Villa Soligo',
            nota: 'Aperitivo à chegada.' },
          { horaOculta: true, hora: '20:00', titulo: 'Transfer para o jantar', local: 'À porta do hotel', tipo: 'logistica' },
          { hora: '20:15', titulo: 'Jantar', local: 'La Candola, Eremo di San Gallo', tipo: 'refeicao', paragem: 'La Candola' },
          { horaOculta: true, hora: '23:30', titulo: 'Regresso ao hotel', local: 'Transfer privado', tipo: 'logistica', paragem: 'Hotel Villa Soligo' }
        ]
      },
      {
        data: '2026-10-04', titulo: 'Do alto ao mar — Soligo a Veneza',
        subtitulo: 'San Boldo, o Cansiglio e Veneza de barco.',
        resumo: 'A etapa de maior amplitude altimétrica: dos 150 m de Villa Soligo até ao Rifugio Pizzoc (1600 m) e depois a descida até Veneza (0 m), culminando na chegada de barco à Piazza San Marco e no jantar no JW Marriott, na Isola delle Rose.',
        hotel: 'JW Marriott Venice',
        imagem: { foto: 'assets/fotos/piazza-san-marco.jpg' },
        paragens: ['Hotel Villa Soligo', 'Passo di San Boldo', 'La Casera', 'Rifugio Città di Vittorio Veneto', 'LO.VE.'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Hotel Villa Soligo', tipo: 'partida', paragem: 'Hotel Villa Soligo',
            nota: 'Check-out feito antes de sair. Abastecimento pelo caminho.' },
          { horaOculta: true, hora: '09:15', titulo: 'Passo di San Boldo', local: 'Strada dei 100 Giorni, no sentido inverso', tipo: 'estrada', paragem: 'Passo di San Boldo' },
          { horaOculta: true, hora: '10:45', fim: '11:30', titulo: 'La Casera', local: 'Nevegal', tipo: 'paragem', paragem: 'La Casera',
            nota: 'Pausa curta.' },
          { horaOculta: true, hora: '11:30', titulo: 'Cansiglio', local: 'Planalto do Cansiglio', tipo: 'estrada' },
          { horaOculta: true, hora: '13:00', fim: '14:00', titulo: 'Almoço volante', local: 'Rifugio Città di Vittorio Veneto, Monte Pizzoc', tipo: 'refeicao', paragem: 'Rifugio Città di Vittorio Veneto',
            nota: 'Buffet, com vista até Veneza.' },
          { horaOculta: true, hora: '14:00', titulo: 'Partida', local: 'Para Follina', tipo: 'estrada' },
          { horaOculta: true, hora: '15:30', titulo: 'Entrega dos carros', local: 'LO.VE., Follina', tipo: 'logistica', paragem: 'LO.VE.',
            nota: 'Os carros ficam aqui. Segue-se para Veneza em transfer privado.' },
          { horaOculta: true, hora: '17:30', fim: '18:30', titulo: 'Canal Grande', local: 'Embarque no Tronchetto', tipo: 'visita', paragem: 'Canal Grande' },
          { horaOculta: true, hora: '18:30', fim: '19:30', titulo: 'Piazza San Marco', local: 'Veneza', tipo: 'visita', paragem: 'Piazza San Marco',
            nota: 'Visita à cidade e aperitivo reservado no Caffè Florian.' },
          { hora: '19:30', titulo: 'Barco para o hotel', local: 'JW Marriott, Isola delle Rose', tipo: 'logistica', paragem: 'JW Marriott Venice',
            imagem: { grafico: 'travessia-veneza' }, nota: 'Check-in à chegada.' },
          { horaOculta: true, hora: '21:00', titulo: 'Aperitivo no terraço', local: 'Sagra, JW Marriott', tipo: 'refeicao', paragem: 'Sagra',
            nota: 'Com Veneza à vista.' },
          { hora: '21:30', titulo: 'Jantar de encerramento', local: 'Sagra, JW Marriott', tipo: 'refeicao', paragem: 'Sagra' }
        ]
      },
      {
        data: '2026-10-05', titulo: 'Partida',
        subtitulo: 'Da laguna ao Marco Polo.',
        resumo: 'Check-out até às 10:00 e transfer para o aeroporto.',
        imagem: { grafico: 'partida' },
        paragens: [],
        momentos: [
          { fim: '10:00', titulo: 'Check-out e transfer', local: 'Do JW Marriott ao Marco Polo', tipo: 'logistica', paragem: 'JW Marriott Venice',
            imagem: { grafico: 'partida' } }
        ]
      }
    ]
  };

  /* ---------------------------------------------------------
     O tempo, por zonas
     As zonas por onde cada dia passa, cada uma num ponto do
     percurso e com a altitude oficial dele: é ela que acerta a
     temperatura de uma montanha que o modelo, de 9 km, alisa. A
     previsão é do MET Norway, pedida de hora a hora na publicação
     (ferramentas/tempo.js), e sai com a app em tempo.json. O Hoje
     junta as zonas de um dia quando a diferença entre elas não
     conta (30.09.2026).
     --------------------------------------------------------- */
  const tempo = {
    zonas: [
      { id: 'prosecco', nome: 'Colinas do Prosecco', curto: 'Prosecco', lat: 45.9116, lng: 12.1566, altitude: 150 },
      { id: 'grappa', nome: 'Cima Grappa', curto: 'Grappa', lat: 45.8721, lng: 11.7993, altitude: 1776 },
      { id: 'rolle', nome: 'Passo Rolle', curto: 'Rolle', lat: 46.2975, lng: 11.7869, altitude: 1984 },
      { id: 'pizzoc', nome: 'Monte Pizzoc', curto: 'Pizzoc', lat: 46.0412, lng: 12.3444, altitude: 1547 },
      { id: 'veneza', nome: 'Veneza', curto: 'Veneza', lat: 45.4343, lng: 12.3387, altitude: 2 }
    ],
    /* Pela ordem em que o dia passa por elas. */
    dias: {
      '2026-10-01': ['veneza', 'prosecco'],
      '2026-10-02': ['prosecco', 'grappa'],
      '2026-10-03': ['prosecco', 'rolle'],
      '2026-10-04': ['prosecco', 'pizzoc', 'veneza'],
      '2026-10-05': ['veneza']
    }
  };

  return {
    evento: evento,
    contactos: contactos,
    biblioteca: biblioteca,
    roteiro: roteiro,
    tempo: tempo
  };
})();
