/* =========================================================
   Semente — o passeio de 2026, tal como a app o carrega
   A app existe para o passeio e só para o passeio. Os
   convidados recebem acesso poucos dias antes de partir;
   não há checkup, não há transporte, não há inscrições.

   Isto é o itinerário real: é o que um telemóvel mostra à
   primeira abertura. A organização continua a poder mudar tudo
   na sua área; quando houver servidor, é de lá que isto vem.

   Fontes: a proposta da Stappando de 27.04.2026 (dias, horas,
   hotéis, restaurantes) com as correções de docs/ — o almoço do
   dia 3 é no Chalet Piereni, não no Malga Ces. Os textos das
   paragens vêm de docs/pesquisa-locais-passeio-dolomitas-2026.md;
   onde a pesquisa não chega, fica só o subtítulo. Nada inventado.
   ========================================================= */

window.SEMENTE = (function () {

  const evento = {
    nome: 'Dolomitas',
    subtitulo: 'Da Grande Guerra à Laguna de Veneza',
    ano: 2026,
    inicio: '2026-10-01',
    fim: '2026-10-05',
    base: 'Hotel Villa Soligo',
    hotel: 'Hotel Villa Soligo',
    /* Quem responde do outro lado. Uma pessoa, com nome e cara. */
    concierge: { nome: '', papel: '', foto: '', promessa: 'Respondemos em menos de dez minutos. Sempre uma pessoa.' },
    /* Como se anda na estrada. Há batedores e o grupo segue em
       caravana: a app é o guia do dia, não o de condução. */
    formato: 'Na estrada, segue-se a caravana, atrás dos batedores. A app diz o que vem a seguir — o caminho é com eles.',
    /* Briefing que o convidado lê nos dias anteriores. */
    levar: [
      'Carta de condução e documento de identificação',
      'Casaco quente — o Grappa passa dos 1700 m, e em outubro sente-se',
      'Óculos de sol. A luz na altitude é outra',
      'Sapato confortável para Veneza e para as paragens a pé',
      'Adaptador de tomada tipo L ou F'
    ],
    notas: [
      'Todas as manhãs, antes de partir, há um briefing: as regras da estrada e o resumo do dia.',
      'Pequeno-almoço, almoço e jantar estão incluídos todos os dias.',
      'Um guia que fala inglês acompanha o grupo em todos os dias.'
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
      nota: 'Quem chega em voo privado aterra em Treviso, no Antonio Canova.',
      imagem: { grafico: 'chegada' } },

    { nome: 'LO.VE.', local: 'Via dei Colli 3, Follina', tipo: 'logistica', lat: 45.9370, lng: 12.1410,
      subtitulo: 'Onde se levantam e se entregam os carros.',
      imagem: { grafico: 'troca-de-viatura' } },

    { nome: 'Hotel Villa Soligo', local: 'Soligo', tipo: 'hotel', lat: 45.9116, lng: 12.1566,
      subtitulo: 'A casa do passeio, nas colinas do Prosecco.',
      nota: 'Há um aperitivo de boas-vindas todos os dias.',
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

    /* Almoço do dia 3. Substitui o Malga Ces, que chegou a estar previsto. */
    { nome: 'Chalet Piereni', local: 'Val Canali', tipo: 'restaurante', lat: 46.2029, lng: 11.8580,
      subtitulo: 'Almoço de frente para as Pale di San Martino.',
      historia: [
        'É aqui que o passeio entra na Dolomita a sério. Do chalet, as Pale di San Martino ficam mesmo em frente.',
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
      nota: 'Buffet de pé, a caminho de Veneza.',
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
      subtitulo: 'O jantar de gala, com Veneza à vista.',
      nota: 'Sem código de vestuário.',
      imagem: { foto: 'assets/fotos/sagra.jpg' } }
  ];

  /* Contactos de emergência — só o que é universal. */
  const contactos = [
    { id: 'c-emergencia', nome: 'Emergência', papel: 'Número europeu', telefone: '112',
      notas: 'Funciona sem rede de dados e sem cartão.', icone: 'alerta' }
  ];

  /* ---------------------------------------------------------
     O itinerário, dia a dia
     As paragens e os momentos apontam para a biblioteca pelo
     nome. «paragens» são os troços ao volante — é deles que se
     tiram os quilómetros, o GPX e os links de recurso. Uma hora
     vazia é uma hora ainda por confirmar.
     --------------------------------------------------------- */
  const roteiro = {
    locais: [
      { tipo: 'hotel', nome: 'Hotel Villa Soligo', morada: 'Via Guglielmo Marconi 2, Soligo' },
      { tipo: 'hotel', nome: 'JW Marriott Venice', morada: 'Isola delle Rose, Veneza' },
      { tipo: 'outro', nome: 'LO.VE. events&travels', morada: 'Via dei Colli 3, Follina' }
    ],
    dias: [
      {
        data: '2026-10-01', titulo: 'Chegada',
        subtitulo: 'Dos aeroportos às colinas do Prosecco.',
        resumo: 'Os carros levantam-se em Follina e a primeira noite é no Hotel Villa Soligo.',
        hotel: 'Hotel Villa Soligo',
        imagem: { grafico: 'chegada' },
        paragens: ['LO.VE.', 'Hotel Villa Soligo'],
        momentos: [
          { titulo: 'Chegada a Veneza', local: 'Marco Polo, ou Treviso para voos privados', tipo: 'logistica', paragem: 'Aeroporto Marco Polo',
            nota: 'Um autocarro privado leva o grupo até à LO.VE., em Follina.' },
          { titulo: 'Levantamento dos carros', local: 'LO.VE., Follina', tipo: 'logistica', paragem: 'LO.VE.' },
          { titulo: 'Chegada ao hotel', local: 'Hotel Villa Soligo', tipo: 'paragem', paragem: 'Hotel Villa Soligo',
            nota: 'Aperitivo de boas-vindas e check-in.' },
          { hora: '20:00', titulo: 'Jantar no hotel', local: 'Hotel Villa Soligo', tipo: 'refeicao', paragem: 'Hotel Villa Soligo' }
        ]
      },
      {
        data: '2026-10-02', titulo: 'Do Prosecco ao Grappa',
        subtitulo: 'Canova, o Sacrario e a Strada dei 100 Giorni.',
        resumo: 'Das colinas do Prosecco aos Pré-Alpes do Grappa, e de volta pelo Passo di San Boldo.',
        hotel: 'Hotel Villa Soligo',
        imagem: { foto: 'assets/fotos/sacrario-grappa.jpg' },
        paragens: ['Hotel Villa Soligo', 'Tempio Canoviano', 'Sacrario del Monte Grappa', 'Passo di San Boldo', 'Molinetto della Croda', 'Hotel Villa Soligo'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Hotel Villa Soligo', tipo: 'partida', paragem: 'Hotel Villa Soligo',
            nota: 'Abastecimento pelo caminho.' },
          { hora: '10:00', fim: '11:15', titulo: 'Tempio Canoviano', local: 'Possagno', tipo: 'visita', paragem: 'Tempio Canoviano',
            nota: 'Visita ao templo e ao Museo Canova.' },
          { hora: '12:30', fim: '13:15', titulo: 'Sacrario del Monte Grappa', local: 'Cima Grappa', tipo: 'visita', paragem: 'Sacrario del Monte Grappa' },
          { hora: '13:15', fim: '14:45', titulo: 'Almoço', local: 'Rifugio Bassano', tipo: 'refeicao', paragem: 'Rifugio Bassano' },
          { hora: '14:45', titulo: 'Pelo Passo di San Boldo', local: 'Strada dei 100 Giorni', tipo: 'estrada', paragem: 'Passo di San Boldo' },
          { hora: '16:45', titulo: 'Molinetto della Croda', local: 'Refrontolo', tipo: 'visita', paragem: 'Molinetto della Croda',
            nota: 'Fotografia do grupo e de cada carro, e um aperitivo.' },
          { hora: '18:00', titulo: 'Chegada ao hotel', local: 'Hotel Villa Soligo', tipo: 'paragem', paragem: 'Hotel Villa Soligo',
            nota: 'O grupo chega em duas levas, até às 18:30, para facilitar o estacionamento. Aperitivo à chegada.' },
          { hora: '20:15', titulo: 'Autocarro para o jantar', local: 'À porta do hotel', tipo: 'logistica' },
          { hora: '20:30', titulo: 'Jantar', local: 'Ristorante Da Gigetto, Miane', tipo: 'refeicao', paragem: 'Ristorante Da Gigetto' },
          { hora: '23:30', titulo: 'Regresso ao hotel', local: 'De autocarro', tipo: 'logistica', paragem: 'Hotel Villa Soligo' }
        ]
      },
      {
        data: '2026-10-03', titulo: 'Dos 170 aos 2000 metros',
        subtitulo: 'Das colinas às Pale di San Martino.',
        resumo: 'Um ferreiro em Miane, o almoço de frente para as Pale e o regresso pelos vales das Dolomitas.',
        hotel: 'Hotel Villa Soligo',
        imagem: { foto: 'assets/fotos/chalet-piereni.jpg' },
        paragens: ['Hotel Villa Soligo', 'Ateliê de Valentino Moro', 'Chalet Piereni', 'Hotel Villa Soligo'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Hotel Villa Soligo', tipo: 'partida', paragem: 'Hotel Villa Soligo',
            nota: 'Abastecimento pelo caminho.' },
          { hora: '09:15', fim: '10:15', titulo: 'Ateliê de Valentino Moro', local: 'Miane', tipo: 'visita', paragem: 'Ateliê de Valentino Moro' },
          { hora: '10:15', titulo: 'A caminho das Dolomitas', local: 'Pelos Pré-Alpes', tipo: 'estrada' },
          { hora: '13:00', fim: '14:30', titulo: 'Almoço', local: 'Chalet Piereni, Val Canali', tipo: 'refeicao', paragem: 'Chalet Piereni' },
          { hora: '14:30', titulo: 'Pelos vales das Dolomitas', local: 'O regresso', tipo: 'estrada' },
          { hora: '16:00', titulo: 'Paragem curta', local: 'A meio do caminho', tipo: 'paragem' },
          { hora: '18:00', titulo: 'Chegada ao hotel', local: 'Hotel Villa Soligo', tipo: 'paragem', paragem: 'Hotel Villa Soligo',
            nota: 'Aperitivo à chegada.' },
          { hora: '20:00', titulo: 'Autocarro para o jantar', local: 'À porta do hotel', tipo: 'logistica' },
          { hora: '20:15', titulo: 'Jantar', local: 'La Candola, Eremo di San Gallo', tipo: 'refeicao', paragem: 'La Candola' },
          { hora: '23:00', titulo: 'Regresso ao hotel', local: 'De autocarro', tipo: 'logistica', paragem: 'Hotel Villa Soligo' }
        ]
      },
      {
        data: '2026-10-04', titulo: 'Do Prosecco à laguna',
        subtitulo: 'San Boldo, o Cansiglio e Veneza de barco.',
        resumo: 'A Strada dei 100 Giorni no sentido inverso, o almoço no alto do Cansiglio e a chegada a Veneza pelo Canal Grande.',
        hotel: 'JW Marriott Venice',
        imagem: { foto: 'assets/fotos/piazza-san-marco.jpg' },
        paragens: ['Hotel Villa Soligo', 'Passo di San Boldo', 'La Casera', 'Rifugio Città di Vittorio Veneto', 'LO.VE.'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Hotel Villa Soligo', tipo: 'partida', paragem: 'Hotel Villa Soligo',
            nota: 'Check-out feito antes de sair. Abastecimento pelo caminho.' },
          { hora: '09:15', titulo: 'Pelo Passo di San Boldo', local: 'Strada dei 100 Giorni, no sentido inverso', tipo: 'estrada', paragem: 'Passo di San Boldo' },
          { hora: '10:45', fim: '11:30', titulo: 'La Casera', local: 'Nevegal', tipo: 'paragem', paragem: 'La Casera',
            nota: 'Pausa curta.' },
          { hora: '11:30', titulo: 'Pelo Cansiglio', local: 'Planalto do Cansiglio', tipo: 'estrada' },
          { hora: '13:00', fim: '14:00', titulo: 'Almoço de pé', local: 'Rifugio Città di Vittorio Veneto, Monte Pizzoc', tipo: 'refeicao', paragem: 'Rifugio Città di Vittorio Veneto',
            nota: 'Buffet, com vista até Veneza.' },
          { hora: '14:00', titulo: 'Partida', local: 'Para Follina', tipo: 'estrada' },
          { hora: '15:30', titulo: 'Entrega dos carros', local: 'LO.VE., Follina', tipo: 'logistica', paragem: 'LO.VE.',
            nota: 'Os carros ficam aqui. Segue-se para Veneza de autocarro privado.' },
          { hora: '17:30', fim: '18:30', titulo: 'Pelo Canal Grande', local: 'Embarque no Tronchetto', tipo: 'visita', paragem: 'Canal Grande' },
          { hora: '18:30', fim: '19:30', titulo: 'Piazza San Marco', local: 'Veneza', tipo: 'visita', paragem: 'Piazza San Marco',
            nota: 'Visita à cidade e aperitivo reservado no Caffè Florian.' },
          { hora: '19:30', titulo: 'Barco para o hotel', local: 'JW Marriott, Isola delle Rose', tipo: 'logistica', paragem: 'JW Marriott Venice',
            imagem: { grafico: 'travessia-veneza' }, nota: 'Check-in à chegada.' },
          { hora: '21:00', titulo: 'Aperitivo no terraço', local: 'Sagra, JW Marriott', tipo: 'refeicao', paragem: 'Sagra',
            nota: 'Com Veneza à vista.' },
          { hora: '21:30', titulo: 'Jantar de gala', local: 'Sagra, JW Marriott', tipo: 'refeicao', paragem: 'Sagra',
            nota: 'Sem código de vestuário.' }
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
     Demonstração
     Pessoas e contactos de exemplo, postos por cima do passeio
     real para dar vida ao mapa e à manchete do grupo. Não são
     participantes reais — esses entram na área da organização.
     --------------------------------------------------------- */
  const exemplo = {
    evento: {
      concierge: { nome: 'Sara Duarte', papel: 'Concierge do passeio', foto: '',
        promessa: 'Respondemos em menos de dez minutos. Sempre uma pessoa.' }
    },
    participantes: [
      ['Tiago', 'Magalhães', 'condutor', '1', 'db12', 'racing', 'AA-12-BB'],
      ['Inês', 'Magalhães', 'acompanhante', '1'],
      ['Rui', 'Sacramento', 'condutor', '2', 'dbx707', 'onyx', 'BB-24-CC'],
      ['Marta', 'Sacramento', 'acompanhante', '2'],
      ['Henrique', 'Vilar', 'condutor', '3', 'vantage', 'hyper', 'CC-36-DD'],
      ['Duarte', 'Pinho', 'condutor', '4', 'vanquish', 'ultramarine', 'DD-48-EE'],
      ['Sofia', 'Cardoso', 'condutor', '5', 'v12-vantage', 'divine', 'EE-60-FF'],
      ['Miguel', 'Cardoso', 'acompanhante', '5']
    ],
    contactos: [
      { nome: 'Concierge do passeio', papel: 'Sara Duarte', telefone: '+39 340 000 0001', icone: 'mensagem' },
      { nome: 'Assistência técnica', papel: 'Carro-oficina, 24 horas', telefone: '+39 340 000 0002', icone: 'oficina' },
      { nome: 'Carro-vassoura', papel: 'Segue sempre o último do grupo', telefone: '+39 340 000 0003', icone: 'carro' }
    ]
  };

  return {
    evento: evento,
    contactos: contactos,
    biblioteca: biblioteca,
    roteiro: roteiro,
    exemplo: exemplo
  };
})();
