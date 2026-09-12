/* =========================================================
   Semente — o estado inicial do conteúdo
   A app existe para o passeio e só para o passeio. Os
   convidados recebem acesso poucos dias antes de partir;
   não há checkup, não há transporte, não há inscrições.

   O itinerário, os participantes e os contactos são criados
   na área da organização. Aqui está o esqueleto, a biblioteca
   de sugestões da região e um exemplo para demonstração.
   ========================================================= */

window.SEMENTE = (function () {

  const evento = {
    nome: 'Dolomitas',
    subtitulo: 'Da Grande Guerra à Laguna de Veneza',
    ano: 2026,
    inicio: '',
    fim: '',
    base: '',
    hotel: '',
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
      'Sapato confortável para as paragens a pé',
      'Adaptador de tomada tipo L ou F'
    ],
    notas: [
      'Portagens e combustível estão incluídos e são liquidados pela organização.',
      'A organização confirma o programa de cada dia na véspera.'
    ]
  };

  /* ---------------------------------------------------------
     Biblioteca de paragens sugeridas
     Sítios da região com coordenadas já preenchidas, para a
     organização escolher enquanto o roadbook não existe.
     Coordenadas aproximadas ao centro do local — confirmar.
     --------------------------------------------------------- */
  const biblioteca = [

    /* As paragens reais de 2026, pela ordem do programa. Factos de
       docs/pesquisa-locais-passeio-dolomitas-2026.md; coordenadas a
       acertar com docs/informacao-base-passeio-dolomitas-2026.md.
       Onde a pesquisa não chega, fica só o subtítulo — nada inventado. */

    { nome: 'Tempio Canoviano', local: 'Possagno', tipo: 'monumento', lat: 45.8553, lng: 11.8836,
      subtitulo: 'Canova desenhou-o para a terra onde nasceu.',
      historia: [
        'Antonio Canova nasceu aqui em 1757 e desenhou este templo aos quarenta e sete anos. Assistiu à primeira pedra, em 1819, e não o chegou a ver acabado.',
        'Morreu em Veneza em 1822. O templo só ficou pronto em 1857, no centenário do seu nascimento, e é nele que está sepultado.',
        'Ao lado, a Gypsotheca guarda os gessos originais: os modelos das estátuas que hoje estão em mármore pelos museus da Europa. É o momento em que a ideia ainda podia mudar de forma.'
      ] },

    { nome: 'Sacrario del Monte Grappa', local: 'Cima Grappa', tipo: 'monumento', lat: 45.8722, lng: 11.8028,
      subtitulo: 'Pela estrada que o exército italiano abriu em 1917.', altitude: 1776,
      historia: [
        'Aqui estão sepultados os dois lados da mesma batalha, a poucos metros um do outro. Mais de doze mil italianos e dez mil austro-húngaros, na grande maioria sem nome.',
        'Depois de Caporetto, no inverno de 1917, o Grappa foi a linha que não cedeu. Atrás dela só havia a planície do Veneto.',
        'Chega-se pela Strada Cadorna, a estrada militar que abastecia a frente. A 1776 metros, o silêncio é o oposto do que este lugar já foi.'
      ] },

    { nome: 'Rifugio Bassano', local: 'Cima Grappa', tipo: 'miradouro', lat: 45.8705, lng: 11.8040,
      subtitulo: 'Almoço no cimo do Grappa.' },

    /* O fio da Grande Guerra: o Grappa e San Boldo são os dois lados da
       mesma frente. San Boldo faz-se duas vezes, nos dias 2 e 4. */
    { nome: 'Passo di San Boldo', local: 'Strada dei 100 Giorni', tipo: 'estrada', lat: 46.0130, lng: 12.1660,
      subtitulo: 'Cem dias, em 1918, do outro lado da frente.', altitude: 706,
      historia: [
        'Cem dias, sete mil pessoas e uma estrada escavada na rocha para vencer cem metros de desnível. Abriu-a o exército austro-húngaro, em 1918.',
        'Trabalharam soldados, prisioneiros italianos, russos e bósnios, e a gente de Tovena, com idosos, mulheres e crianças. São seis curvas em espiral e cinco túneis, sempre a dez por cento.',
        'Foi feita para levar o exército à frente do Grappa e do Piave. Meses depois, serviu-lhe para recuar.'
      ],
      nota: 'É o único troço que o passeio faz duas vezes, uma em cada sentido.' },

    /* Sensibilidade: em 2014 houve aqui uma cheia mortal. Não se menciona,
       e evita-se escrever sobre a água como coisa calma. */
    { nome: 'Molinetto della Croda', local: 'Refrontolo', tipo: 'monumento', lat: 45.9330, lng: 12.2030,
      subtitulo: 'Um moinho de 1630, nas colinas do Prosecco.',
      historia: [
        'Um moinho de 1630, movido pela queda de doze metros do Lierza. Moeu durante quase trezentos e trinta anos, até 1953.',
        'É das imagens mais fotografadas das colinas do Prosecco, e foi cenário de «Mogliamante», com Marcello Mastroianni, em 1977. Hoje é um pequeno museu da moagem.'
      ],
      nota: 'Aqui faz-se a fotografia do grupo e a de cada carro. Segue-se um aperitivo, servido pela Locanda Al Bakaro.' },

    { nome: 'Ateliê de Valentino Moro', local: 'Miane', tipo: 'vinha', lat: 45.9420, lng: 12.0930,
      subtitulo: 'Um ferreiro que trabalha sozinho, entre as vinhas.',
      historia: [
        'Trabalha sozinho, num ateliê que começou por ser um pequeno depósito entre as vinhas. Nada sai daqui em série.',
        'Usa ferro puro, sem ligas, porque só o ferro puro se deixa remodelar enquanto está quente. Às vezes junta-lhe pedra ou vidro.',
        'Para ele, o desenho é só o ponto de partida. O resto decide-se com o metal ainda quente.'
      ] },

    /* Almoço do dia 3. Substitui o Malga Ces, que chegou a estar previsto. */
    { nome: 'Chalet Piereni', local: 'Val Canali', tipo: 'miradouro', lat: 46.2060, lng: 11.8640,
      subtitulo: 'Almoço de frente para as Pale di San Martino.',
      historia: [
        'É aqui que o passeio entra na Dolomita a sério. Do chalet, as Pale di San Martino ficam mesmo em frente.',
        'A Val Canali está dentro do Parco Naturale Paneveggio – Pale di San Martino e é um dos acessos a pé ao planalto das Pale. Desde 2009, estas montanhas são Património Mundial.',
        'A cozinha é a do Trentino. Já não estamos no Veneto.'
      ] },

    { nome: 'La Candola', local: 'Eremo di San Gallo', tipo: 'miradouro', lat: 45.9030, lng: 12.1170,
      subtitulo: 'Jantar junto ao Eremo di San Gallo.' },

    { nome: 'La Casera', local: 'Nevegal', tipo: 'miradouro', lat: 46.1040, lng: 12.2400,
      subtitulo: 'Paragem curta no Nevegal.' },

    { nome: 'Rifugio Città di Vittorio Veneto', local: 'Monte Pizzoc', tipo: 'miradouro', lat: 46.0500, lng: 12.3380,
      subtitulo: 'A floresta que fazia os remos de Veneza.', altitude: 1547,
      historia: [
        'Em dia limpo vê-se tudo daqui: as Dolomitas a norte, as friulanas a leste e, a sul, a laguna de Veneza. É o resto do dia, visto de cima.',
        'Veneza pôs a floresta do Cansiglio sob proteção em 1420. A partir de 1548 foi o Bosco da Reme: faias criadas durante mais de um século para dar remos ao Arsenale.',
        'Proibia-se ali o pastoreio, e marcos de pedra fechavam o perímetro. A floresta que remava a Serenissima ainda aqui está.'
      ],
      nota: 'Buffet de pé, a caminho de Veneza.' },

    /* Sensibilidade: a frase do «salão de estar da Europa» não tem
       confirmação de ter sido dita por Napoleão. Não se usa. */
    { nome: 'Piazza San Marco', local: 'Veneza', tipo: 'cidade', lat: 45.4341, lng: 12.3388,
      subtitulo: 'O fim da estrada é uma praça sem carros.',
      historia: [
        'O Caffè Florian abriu a 29 de dezembro de 1720, com o nome de Alla Venezia Trionfante. É o café mais antigo de Itália, sempre no mesmo lugar.',
        'Em frente fica o Caffè Quadri, que era o dos oficiais austríacos. O Florian era o dos venezianos, e em 1848 tratavam-se lá os feridos da revolta.',
        'Os quatro cavalos de bronze da basílica foram levados por Napoleão para Paris em 1797, e voltaram em 1815. O campanário caiu inteiro em 1902 e voltou a erguer-se igual, no mesmo sítio.'
      ],
      nota: 'Aperitivo do grupo no Caffè Florian.' },

    /* Maqueta anterior à rota real: sítios de Cortina e do Sella, que
       servem o passeio de exemplo. Saem quando entrar o itinerário de 2026. */

    { nome: 'Cortina d\'Ampezzo', local: 'Corso Italia', tipo: 'vila', lat: 46.5405, lng: 12.1357,
      subtitulo: 'A rainha das Dolomitas.', altitude: 1224,
      historia: ['A Ampezzo foi ladina antes de ser italiana, e ainda se ouve. O ladino é uma língua românica com raízes que antecedem o vêneto, e sobrevive nestes vales de forma teimosa: nos topónimos, nas ementas, nos apelidos.', 'Recebeu os Jogos Olímpicos de Inverno em 1956 e volta a recebê-los em 2026, com Milão. Entre uma coisa e outra passaram setenta anos em que a vila mudou pouco: a mesma rua principal, as mesmas fachadas, o mesmo campanário a marcar a hora.', 'O melhor de Cortina não se vê da rua. Vê-se das estradas que saem dela — e é para essas que vamos.'],
      nota: 'O parque do centro é apertado. Vale a pena deixar o carro no coberto e subir a pé.' },
    { nome: 'Passo Falzarego', local: '2105 m', tipo: 'estrada', lat: 46.5194, lng: 12.0086,
      subtitulo: 'Vinte e nove curvas desde Cortina.' , altitude: 2105 ,
      historia: ['O nome vem de uma lenda ladina sobre um rei que terá sido transformado em pedra: falza rego, o falso rei. É a explicação que a montanha dá a si própria para uma silhueta que, de certos ângulos, parece uma figura sentada.', 'Entre 1915 e 1917 a frente entre a Itália e a Áustria-Hungria passava exatamente por aqui. Os dois exércitos escavaram túneis dentro do Lagazuoi, por cima deste passo, e passaram meses a tentar rebentar a montanha um debaixo do outro. Os túneis ainda se percorrem.', 'A subida desde Cortina faz-se em vinte e nove curvas. A estrada é larga e o piso é bom — é dos passos mais generosos das Dolomitas para quem quer conduzir e não travar.'], nota: 'Há café no cimo e um teleférico para o Lagazuoi. A temperatura desce dez graus em relação a Cortina.' },
    { nome: 'Passo Valparola', local: '2168 m', tipo: 'estrada', lat: 46.5286, lng: 11.9908,
      subtitulo: 'O irmão sossegado do Falzarego.' , altitude: 2168 },
    { nome: 'Passo Giau', local: '2236 m', tipo: 'estrada', lat: 46.4833, lng: 12.0553,
      subtitulo: 'Vinte e nove curvas numeradas, uma a uma.' , altitude: 2236 ,
      historia: ['Vinte e nove curvas numeradas, uma a uma, com placa. É a subida mais fotografada dos Alpes e a razão é simples: nenhuma outra combina esta inclinação com esta vista aberta.', 'Por cima do passo está a Ra Gusela, uma pirâmide de rocha que parece desenhada. Ao fundo, em dia limpo, a Marmolada — o único glaciar das Dolomitas, e cada ano mais pequeno.', 'O Giro d\'Italia sobe aqui com regularidade, e quando sobe é dia de decidir a corrida. A estrada é estreita e sem bermas: se vier alguém em sentido contrário, um dos dois encosta.'], nota: 'Estreito e sem guardas em vários troços. Não é sítio para ir a olhar para o lado.' },
    { nome: 'Passo Pordoi', local: '2239 m', tipo: 'estrada', lat: 46.4879, lng: 11.8127,
      subtitulo: 'O ponto alto da Sellaronda.' , altitude: 2239 ,
      historia: ['Dois mil duzentos e trinta e nove metros, e o ponto mais alto do circuito do Sella. De um lado o maciço do Sella, uma muralha contínua de dolomia; do outro, a Marmolada.', 'Do passo sai um teleférico para o Sass Pordoi, a que chamam o terraço das Dolomitas. São três minutos de subida para uma plataforma a dois mil novecentos e cinquenta metros, de onde se vê tudo o que vamos conduzir nos próximos dois dias.', 'A estrada foi aberta nos anos vinte para ligar os vales, e o traçado nunca foi corrigido — é por isso que as curvas são as que são.'], nota: 'Almoço no rifugio do passo. Reserva feita em nome do grupo.' },
    { nome: 'Passo Sella', local: '2244 m', tipo: 'estrada', lat: 46.5122, lng: 11.7614,
      subtitulo: 'O Sassolungo em cima da estrada.' , altitude: 2244 ,
      historia: ['A estrada passa debaixo do Sassolungo, que em alemão se chama Langkofel e em ladino Sasslong: três nomes para a mesma parede de três mil metros que aqui está encostada à berma.', 'É o passo com a relação mais brutal entre a escala da rocha e a escala da estrada. Nos outros a montanha está ao longe; aqui está por cima do capô.', 'Do lado sul abre-se o vale de Fassa; do norte, a Val Gardena. Duas línguas, dois modos de construir, quinze quilómetros entre eles.'], nota: 'Paragem fotográfica curta. O parque enche cedo.' },
    { nome: 'Passo Gardena', local: 'Grödner Joch, 2121 m', tipo: 'estrada', lat: 46.5464, lng: 11.8144,
      subtitulo: 'Onde o italiano dá lugar ao ladino.' , altitude: 2121 ,
      historia: ['Em italiano é Passo Gardena, em alemão Grödner Joch, em ladino Ju de Frara. Três nomes oficiais no mesmo poste — é a forma mais rápida de perceber onde estamos.', 'Deste lado começa a Val Gardena, onde se esculpe madeira há mais de trezentos anos. Começou como ocupação de inverno para famílias de agricultores e acabou por abastecer igrejas em toda a Europa central.', 'O passo fecha o circuito do Sella. Quem o faz inteiro anda à volta do mesmo maciço durante cinquenta e cinco quilómetros e vê-o de quatro ângulos diferentes.'], nota: 'Última paragem do circuito. Depois é descida até Corvara.' },
    { nome: 'Passo Campolongo', local: '1875 m', tipo: 'estrada', lat: 46.4900, lng: 11.8700,
      subtitulo: 'O quarto lado do circuito do Sella.' , altitude: 1875 },
    { nome: 'Passo Fedaia', local: 'Marmolada, 2057 m', tipo: 'estrada', lat: 46.4586, lng: 11.8756,
      subtitulo: 'Ao pé do glaciar.' , altitude: 2057 },
    { nome: 'Passo Rolle', local: '1984 m', tipo: 'estrada', lat: 46.2975, lng: 11.7864,
      subtitulo: 'O Cimon della Pala ao fundo da reta.' , altitude: 1984 },
    { nome: 'Passo Costalunga', local: 'Karerpass, 1745 m', tipo: 'estrada', lat: 46.4092, lng: 11.6006,
      subtitulo: 'A porta do Catinaccio.' , altitude: 1745 },
    { nome: 'Lago di Braies', local: 'Pragser Wildsee', tipo: 'lago', lat: 46.6947, lng: 12.0854,
      subtitulo: 'Água verde debaixo da Croda del Becco.' , altitude: 1496 ,
      historia: ['A água é verde por causa do calcário em suspensão, e muda de tom conforme a hora e a época. Por cima está a Croda del Becco, que os alemães chamam Seekofel — o pico do lago.', 'Os barcos de madeira do embarcadouro são os mesmos há décadas e continuam a ser remados à mão. Não há motores no lago, e é por isso que o sítio soa como soa.', 'A fama chegou-lhe tarde e a más horas: depois de aparecer numa série de televisão, o acesso no verão passou a ser regulado. Fora de época e ao início da manhã, volta a ser o que sempre foi.'], nota: 'Chegar cedo. A partir das dez, o parque está cheio e a luz já não presta.' },
    { nome: 'Lago di Misurina', local: 'Auronzo di Cadore', tipo: 'lago', lat: 46.5817, lng: 12.2544,
      subtitulo: 'O espelho das Tre Cime.' , altitude: 1754 ,
      historia: ['O maior lago natural do Cadore, e o espelho onde as Tre Cime aparecem quando não há vento. É pequeno — dá-se a volta a pé em meia hora — e é toda a razão pela qual se para aqui.', 'O ar de Misurina tem uma particularidade reconhecida desde o início do século XX: a altitude e a ausência de pólen fizeram com que aqui se instalasse um centro de tratamento de asma infantil, o único dos Alpes.', 'Ao fundo, para lá do lago, começa a estrada de portagem que sobe às Tre Cime.'], nota: 'Almoço à beira de água. O grupo estaciona no lado norte.' },
    { nome: 'Lago di Carezza', local: 'Karersee', tipo: 'lago', lat: 46.4092, lng: 11.5764,
      subtitulo: 'O lago do arco-íris, na lenda ladina.' , altitude: 1534 },
    { nome: 'Lago di Alleghe', local: 'Alleghe', tipo: 'lago', lat: 46.4083, lng: 12.0222,
      subtitulo: 'Nasceu de um desabamento, em 1771.' , altitude: 979 },
    { nome: 'Tre Cime di Lavaredo', local: 'Rifugio Auronzo', tipo: 'miradouro', lat: 46.6167, lng: 12.2950,
      subtitulo: 'A estrada de portagem sobe até aos 2320 m.' , altitude: 2320 ,
      historia: ['Cima Grande, Cima Ovest, Cima Piccola. São três torres de dolomia isoladas de tudo o resto, e são a imagem que o mundo tem destas montanhas.', 'A estrada que lá vai é de portagem e sobe até aos dois mil trezentos e vinte metros, ao Rifugio Auronzo. São sete quilómetros de subida contínua com o cume à vista quase todo o tempo.', 'Como em quase todo o lado por aqui, a frente da Grande Guerra passou por estas paredes. As trincheiras e os postos de observação continuam lá, e não foram reconstruídos: estão simplesmente onde ficaram.'], nota: 'Portagem à entrada, paga pela organização. O parque do rifugio esgota ao meio-dia.' },
    { nome: 'Cinque Torri', local: 'Averau', tipo: 'miradouro', lat: 46.5175, lng: 12.0450,
      subtitulo: 'Trincheiras da Grande Guerra ao ar livre.' , altitude: 2137 ,
      historia: ['Cinco torres de dolomia soltas no meio de um prado, à vista de toda a gente. Ao contrário do resto, não são o topo de nada — são o que sobrou de uma parede que ruiu.', 'À volta delas está um museu ao ar livre da Grande Guerra: trincheiras, abrigos e postos italianos restaurados no sítio exato onde estavam. Percorre-se em vinte minutos e não tem bilheteira nem vitrinas.', 'O rifugio Averau, ali ao lado, é dos poucos sítios em altitude onde se come mesmo bem.'], nota: 'Sobe-se de telecadeira ou por estrada de terra batida. Com estes carros, telecadeira.' },
    { nome: 'Alpe di Siusi', local: 'Seiser Alm', tipo: 'miradouro', lat: 46.5333, lng: 11.6167,
      subtitulo: 'O maior planalto alpino da Europa.' , altitude: 1826 ,
      historia: ['Cinquenta e seis quilómetros quadrados de prado a mil oitocentos metros: é o maior planalto alpino da Europa, e não se parece com nada à volta.', 'Depois de dias de rocha vertical, é o contrário — ondulado, aberto, sem arestas. Os celeiros de madeira espalhados pelo planalto são de famílias que ainda cortam feno aqui em julho.', 'Ao fundo, o Sassolungo e o Sciliar fecham o horizonte e lembram onde estamos.'], nota: 'O acesso motorizado é restrito durante o dia. Confirmar horários na véspera.' },
    { nome: 'Val di Funes', local: 'Santa Maddalena', tipo: 'miradouro', lat: 46.6417, lng: 11.7000,
      subtitulo: 'A igreja mais fotografada dos Alpes.' , altitude: 1339 },
    { nome: 'Corvara', local: 'Alta Badia', tipo: 'vila', lat: 46.5514, lng: 11.8747,
      subtitulo: 'Coração ladino do Sella.' , altitude: 1568 ,
      historia: ['Coração da Alta Badia e um dos vales onde o ladino continua a ser primeira língua — ensina-se na escola e fala-se em casa.', 'A vila vive encaixada entre o Sella e o Sassongher, e é por isso que serve de base a metade das rotas destas montanhas.', 'A cozinha da Alta Badia é a mais premiada dos Alpes italianos, e não é por acidente: é o que acontece quando a tradição austríaca e a italiana são obrigadas a coabitar durante um século.'], nota: 'Paragem de café. Vinte minutos.' },
    { nome: 'Arabba', local: 'Livinallongo', tipo: 'vila', lat: 46.4972, lng: 11.8744,
      subtitulo: 'Entre o Pordoi e o Campolongo.' , altitude: 1602 },
    { nome: 'Ortisei', local: 'St. Ulrich, Val Gardena', tipo: 'vila', lat: 46.5758, lng: 11.6717,
      subtitulo: 'Trezentos anos a esculpir madeira.' , altitude: 1236 },
    { nome: 'Castelrotto', local: 'Kastelruth', tipo: 'vila', lat: 46.5667, lng: 11.5583,
      subtitulo: 'Fachadas pintadas e um campanário desproporcionado.' , altitude: 1060 },
    { nome: 'Dobbiaco', local: 'Toblach', tipo: 'vila', lat: 46.7350, lng: 12.2230,
      subtitulo: 'Mahler escreveu aqui a Nona.' , altitude: 1256 ,
      historia: ['Toblach em alemão, e é o alemão que se ouve na rua. Estamos no Alto Ádige, e a fronteira cultural nota-se mais depressa do que a geográfica.', 'Gustav Mahler passou aqui três verões, entre 1908 e 1910, e compôs numa cabana no bosque. Foi o período da Nona Sinfonia e da Canção da Terra — a música mais tardia e mais desamparada que escreveu.', 'A vila é o ponto de partida para o vale de Landro e para os lagos. Daqui, a descida para sul começa.'], nota: 'Almoço de encerramento. Estacionamento reservado junto à igreja.' },
    { nome: 'San Martino di Castrozza', local: 'Primiero', tipo: 'vila', lat: 46.2617, lng: 11.7994,
      subtitulo: 'As Pale ao fundo da rua.' , altitude: 1487 },
    { nome: 'Bolzano', local: 'Bozen', tipo: 'cidade', lat: 46.4983, lng: 11.3548,
      subtitulo: 'Duas línguas em cada placa.' , altitude: 262 },
    { nome: 'Belluno', local: 'Piazza dei Martiri', tipo: 'cidade', lat: 46.1400, lng: 12.2170,
      subtitulo: 'A porta veneta das Dolomitas.' , altitude: 383 ,
      historia: ['A porta veneta das Dolomitas. Foi território da República de Veneza durante quase quatro séculos e continua a parecê-lo: a loggia, as fachadas, o desenho da praça.', 'É onde a planície acaba e a montanha começa. Quem sobe de Veneza percebe a mudança aqui, e não antes.', 'A Piazza dei Martiri tem o nome que tem por causa de quatro partigiani executados na praça em 1945.'], nota: 'Paragem técnica. Combustível e café.' },
    { nome: 'Aeroporto de Veneza', local: 'Marco Polo', tipo: 'logistica', lat: 45.5053, lng: 12.3519,
      subtitulo: 'Ponto de encontro.' , altitude: 2 }
  ];

  /* Contactos de emergência — só o que é universal. */
  const contactos = [
    { id: 'c-emergencia', nome: 'Emergência', papel: 'Número europeu', telefone: '112',
      notas: 'Funciona sem rede de dados e sem cartão.', icone: 'alerta' }
  ];

  /* ---------------------------------------------------------
     Exemplo para demonstração
     Um passeio completo, montado com a biblioteca acima, para
     mostrar a app sem ter de escrever um itinerário à mão.
     Não é o roadbook real.
     --------------------------------------------------------- */
  const exemplo = {
    evento: { nome: 'Dolomitas', base: 'Cortina d\'Ampezzo', inicio: '2026-09-17', fim: '2026-09-20',
      hotel: 'Hotel de la Poste',
      concierge: { nome: 'Sara Duarte', papel: 'Concierge do passeio', foto: '',
        promessa: 'Respondemos em menos de dez minutos. Sempre uma pessoa.' } },
    dias: [
      {
        data: '2026-09-17', titulo: 'Chegada a Cortina',
        subtitulo: 'Do aeroporto à crista das Dolomitas.',
        resumo: 'Entrega dos carros em Veneza e a primeira subida, pelo vale do Piave.',
        paragens: ['Aeroporto de Veneza', 'Belluno', 'Cortina d\'Ampezzo'],
        momentos: [
          { hora: '11:00', fim: '14:00', titulo: 'Entrega dos carros', local: 'Marco Polo, nível zero', tipo: 'logistica', paragem: 'Aeroporto de Veneza' },
          { hora: '14:30', titulo: 'Partida', local: 'Saída pela A27', tipo: 'partida' },
          { hora: '17:30', titulo: 'Chegada e quartos', local: 'Cortina', tipo: 'paragem', paragem: 'Cortina d\'Ampezzo' },
          { hora: '20:00', titulo: 'Jantar de abertura', local: 'Terraço', tipo: 'refeicao' }
        ]
      },
      {
        data: '2026-09-18', titulo: 'A Sellaronda',
        subtitulo: 'Quatro passos, um circuito.',
        resumo: 'Campolongo, Pordoi, Sella e Gardena — o circuito clássico, feito no sentido dos ponteiros.',
        paragens: ['Cortina d\'Ampezzo', 'Passo Falzarego', 'Corvara', 'Passo Campolongo', 'Passo Pordoi', 'Passo Sella', 'Passo Gardena', 'Cortina d\'Ampezzo'],
        momentos: [
          { hora: '08:30', titulo: 'Partida', local: 'Parque do hotel', tipo: 'partida' },
          { hora: '09:30', fim: '10:00', titulo: 'Café no Falzarego', local: '2105 m', tipo: 'paragem', paragem: 'Passo Falzarego' },
          { hora: '13:00', fim: '14:30', titulo: 'Almoço', local: 'Rifugio, Passo Pordoi', tipo: 'refeicao', paragem: 'Passo Pordoi' },
          { hora: '18:00', titulo: 'Regresso', local: 'Cortina', tipo: 'paragem' },
          { hora: '20:30', titulo: 'Jantar livre', local: 'Sugestões no concierge', tipo: 'refeicao' }
        ]
      },
      {
        data: '2026-09-19', titulo: 'Giau e os lagos',
        subtitulo: 'A estrada mais fotografada dos Alpes.',
        resumo: 'A subida ao Giau de manhã, Misurina e as Tre Cime à tarde.',
        paragens: ['Cortina d\'Ampezzo', 'Passo Giau', 'Cinque Torri', 'Lago di Misurina', 'Tre Cime di Lavaredo'],
        momentos: [
          { hora: '08:00', titulo: 'Partida', local: 'Depósito cheio', tipo: 'partida', nota: 'Não há combustível na montanha.' },
          { hora: '09:00', fim: '10:00', titulo: 'Passo Giau', local: '2236 m', tipo: 'visita', paragem: 'Passo Giau' },
          { hora: '13:00', fim: '14:30', titulo: 'Almoço em Misurina', local: 'À beira do lago', tipo: 'refeicao', paragem: 'Lago di Misurina' },
          { hora: '20:00', titulo: 'Jantar de gala', local: 'Cortina', tipo: 'refeicao', nota: 'Traje: casaco.' }
        ]
      },
      {
        data: '2026-09-20', titulo: 'Braies e o regresso',
        subtitulo: 'O último lago antes de descer.',
        resumo: 'Braies ao nascer do sol, Dobbiaco e a descida final para Veneza.',
        paragens: ['Cortina d\'Ampezzo', 'Lago di Braies', 'Dobbiaco', 'Aeroporto de Veneza'],
        momentos: [
          { hora: '07:30', titulo: 'Saída de mala feita', local: 'Cortina', tipo: 'partida' },
          { hora: '08:30', fim: '09:30', titulo: 'Lago di Braies', local: 'Pragser Wildsee', tipo: 'visita', paragem: 'Lago di Braies' },
          { hora: '12:30', fim: '14:30', titulo: 'Almoço de encerramento', local: 'Dobbiaco', tipo: 'refeicao', paragem: 'Dobbiaco' },
          { hora: '17:00', titulo: 'Entrega dos carros', local: 'Marco Polo', tipo: 'logistica', paragem: 'Aeroporto de Veneza' }
        ]
      }
    ],
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
    ],
    locais: [
      { tipo: 'hotel', nome: 'Hotel de la Poste', telefone: '+39 0436 4271', morada: 'Piazza Roma 14, Cortina d\'Ampezzo' },
      { tipo: 'restaurante', nome: 'Rifugio Averau', telefone: '+39 0436 4660', morada: 'Cinque Torri, 2413 m' }
    ]
  };

  return {
    evento: evento,
    dias: [],
    pois: {},
    participantes: [],
    contactos: contactos,
    locais: [],
    biblioteca: biblioteca,
    exemplo: exemplo
  };
})();
