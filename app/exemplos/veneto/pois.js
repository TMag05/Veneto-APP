/* =========================================================
   Pontos de interesse — o coração do evento
   Cada POI é uma página com história, não um pin.
   Conteúdo de trabalho: rever com a equipa antes da publicação.
   Coordenadas aproximadas — confirmar antes de gerar os links.
   ========================================================= */

window.POIS = {

  treviso: {
    nome: 'Treviso',
    local: 'Aeroporto Antonio Canova',
    tipo: 'logistica',
    lat: 45.6484, lng: 12.1944,
    subtitulo: 'O ponto de encontro.',
    imagem: { variante: 'manha', semente: 'treviso' },
    historia: [
      'A equipa está no parque de estacionamento coberto, no nível zero. Os carros chegaram de camião na véspera e passaram a noite em garagem fechada.',
      'A entrega faz-se por ordem de chegada dos voos. Não há pressa: quem chegar cedo tem café e a primeira parte do roadbook em papel, impressa à mão.'
    ],
    nota: 'Documento de identificação e carta de condução são pedidos na entrega.'
  },

  asolo: {
    nome: 'Asolo',
    local: 'Piazza Garibaldi',
    tipo: 'vila',
    lat: 45.7997, lng: 11.9130,
    subtitulo: 'A cidade dos cem horizontes.',
    imagem: { variante: 'paisagem', semente: 'asolo-01' },
    historia: [
      'Carducci chamou-lhe a cidade dos cem horizontes, e a expressão pegou porque é literal: a vila assenta numa crista e cada rua acaba numa vista diferente sobre a planície.',
      'Em 1489 Caterina Cornaro, rainha de Chipre, trocou um reino por este lugar. A corte que aqui manteve atraiu Pietro Bembo, que ambientou em Asolo o seu diálogo Gli Asolani e inventou o verbo asolare — passar o tempo sem propósito, mas com atenção.',
      'Vale a pena guardar o nome de Bembo. Foi para ele que Aldus Manutius imprimiu, em Veneza, o livro cujo tipo Francesco Griffo tinha acabado de cortar — o desenho que ainda hoje se chama Bembo, e de onde descende a letra que está a ler.'
    ],
    nota: 'A praça é estreita. Os carros ficam no parque da Cipressina, cinco minutos a pé.'
  },

  maser: {
    nome: 'Villa Barbaro',
    local: 'Maser',
    tipo: 'villa',
    lat: 45.8079, lng: 11.9789,
    subtitulo: 'Palladio e Veronese, no mesmo edifício.',
    imagem: { variante: 'arquitetura', semente: 'maser-villa' },
    historia: [
      'Andrea Palladio construiu-a por volta de 1560 para os irmãos Daniele e Marcantonio Barbaro. Paolo Caliari, o Veronese, cobriu-lhe o interior de frescos. É raro os dois nomes coincidirem numa só casa, e é por isso que esta está na lista da UNESCO.',
      'Repare-se no material: não é pedra. É tijolo rebocado a marmorino, com pedra apenas nas molduras. A riqueza está na proporção e na luz sobre uma superfície mate — o mesmo princípio que governa esta aplicação.',
      'Nos frescos, Veronese pinta portas falsas, paisagens falsas e uma criada que espreita de uma porta que não existe. A brincadeira tem quatro séculos e meio e continua a funcionar.'
    ],
    nota: 'Visita guiada de 45 minutos. Interior sem fotografia com flash.'
  },

  possagno: {
    nome: 'Tempio Canoviano',
    local: 'Possagno',
    tipo: 'monumento',
    lat: 45.8452, lng: 11.8797,
    subtitulo: 'Um escultor a desenhar a sua própria igreja.',
    imagem: { variante: 'arquitetura', semente: 'possagno' },
    historia: [
      'Antonio Canova nasceu aqui e desenhou este templo para a sua terra. A primeira pedra foi colocada em 1819; ele morreu em 1822 e a obra só ficou concluída dez anos depois.',
      'O edifício é uma soma deliberada de duas citações: o pórtico é o Partenon, a rotunda é o Panteão. Um escultor a fazer arquitetura decidiu não inventar nada — apenas juntar as duas coisas de que mais gostava.',
      'Do adro vê-se toda a planície até Veneza em dias limpos. A subida a pé desde o parque leva sete minutos e é a melhor forma de perceber a escala.'
    ],
    nota: 'A Gipsoteca, a 300 metros, guarda os moldes originais em gesso.'
  },

  valdobbiadene: {
    nome: 'Cartizze',
    local: 'Valdobbiadene',
    tipo: 'vinha',
    lat: 45.9066, lng: 12.0233,
    subtitulo: 'Cento e sete hectares, e nem um metro plano.',
    imagem: { variante: 'vinha', semente: 'cartizze' },
    historia: [
      'Cento e sete hectares entre Santo Stefano, San Pietro di Barbozza e Saccol. É a parcela mais cobiçada de todo o Prosecco Superiore e uma das terras agrícolas mais caras de Itália.',
      'A encosta é demasiado íngreme para máquinas. Tudo se faz à mão, em terraços estreitos chamados ciglioni, que desenham na colina um tabuleiro irregular. Chamam-lhe viticultura heroica e não é figura de estilo: estima-se em muitas centenas as horas de trabalho manual por hectare e por ano.',
      'Estas colinas entraram na lista do Património Mundial em 2019 — não pelo vinho, mas pela paisagem que este modo de trabalhar produziu ao longo de séculos.'
    ],
    nota: 'Prova de três vinhos com o produtor. Quem conduz prova e não engole — há cuspidor em cada mesa.'
  },

  follina: {
    nome: 'Abbazia di Follina',
    local: 'Follina',
    tipo: 'monumento',
    lat: 45.9527, lng: 12.1180,
    subtitulo: 'Um claustro cisterciense, em silêncio.',
    imagem: { variante: 'arquitetura', semente: 'follina' },
    historia: [
      'Os cistercienses chegaram a este vale no século XII à procura de água — e encontraram-na em quantidade suficiente para que Follina vivesse de lã durante setecentos anos.',
      'O claustro é a razão da paragem. Colunas pequenas, todas diferentes umas das outras, à volta de um pátio que se atravessa em vinte passos. Não há nada a ver ali além da proporção, o que é precisamente o ponto.',
      'A regra da ordem exigia que os mosteiros fossem construídos longe das cidades e sem ornamento. O resultado, oitocentos anos depois, é o edifício mais calmo do percurso de hoje.'
    ],
    nota: 'Paragem de vinte minutos. O claustro faz eco: fala-se baixo.'
  },

  conegliano: {
    nome: 'Conegliano',
    local: 'Via XX Settembre',
    tipo: 'vila',
    lat: 45.8880, lng: 12.2977,
    subtitulo: 'Onde se ensinou a fazer vinho pela primeira vez.',
    imagem: { variante: 'paisagem', semente: 'conegliano' },
    historia: [
      'Em 1876 abriu aqui a primeira escola de enologia de Itália. Antes disso, fazer vinho era uma coisa que se herdava; a partir daqui passou a ser uma coisa que se estuda.',
      'A cidade deu também o nome a um pintor: Giovanni Battista Cima, dito Cima da Conegliano, que assinava as tábuas com o nome da terra e punha estas mesmas colinas ao fundo das suas Madonas.',
      'A Via XX Settembre atravessa o centro sob arcadas contínuas. É a rua mais fotografada da zona e, à hora do aperitivo, também a mais cheia.'
    ],
    nota: 'Café e paragem livre de trinta minutos.'
  },

  grappa: {
    nome: 'Cima Grappa',
    local: 'Strada Cadorna',
    tipo: 'estrada',
    lat: 45.8729, lng: 11.8001,
    subtitulo: 'Vinte e seis quilómetros de curvas construídos por um exército.',
    imagem: { variante: 'paisagem', semente: 'grappa-strada' },
    historia: [
      'A estrada que estão a subir foi aberta em plena guerra, entre 1916 e 1917, para levar artilharia ao cume. Chama-se Cadorna por causa do general que a mandou fazer e é a razão pela qual esta montanha tem asfalto.',
      'Em 1917 e 1918 a frente passava exatamente por aqui. O memorial no topo, inaugurado em 1935 com desenho de Giovanni Greppi, dispõe os túmulos em anéis concêntricos que sobem até uma capela — mais de doze mil homens, de ambos os lados.',
      'Do cume, num dia limpo, vê-se a laguna de Veneza. É o ponto mais alto de todo o passeio e o mais silencioso.'
    ],
    nota: 'Dez graus abaixo da planície e vento constante. Levar casaco mesmo com sol.'
  },

  bassano: {
    nome: 'Ponte degli Alpini',
    local: 'Bassano del Grappa',
    tipo: 'monumento',
    lat: 45.7662, lng: 11.7337,
    subtitulo: 'Uma ponte de madeira desenhada para poder partir-se.',
    imagem: { variante: 'arquitetura', semente: 'bassano' },
    historia: [
      'Palladio desenhou-a em 1569 e fez uma escolha que parece um erro: madeira, num rio que leva tudo. Não foi erro. Uma ponte de madeira cede à cheia e volta a levantar-se em semanas; uma de pedra parte-se e leva anos.',
      'A ponte foi destruída e reconstruída tantas vezes que ninguém tem a conta certa. A última reconstrução, depois da Segunda Guerra, é de 1948, e foi feita pelos Alpini — donde o nome que hoje toda a gente usa.',
      'À cabeceira da ponte está a Nardini, aberta em 1779 e uma das casas de grappa mais antigas de Itália. O balcão é de pé e o copo é pequeno.'
    ],
    nota: 'Almoço às 13h00 na margem esquerda. Os carros ficam no Prato Santa Caterina.'
  },

  marostica: {
    nome: 'Piazza degli Scacchi',
    local: 'Marostica',
    tipo: 'vila',
    lat: 45.7457, lng: 11.7787,
    subtitulo: 'Uma praça que é um tabuleiro.',
    imagem: { variante: 'arquitetura', semente: 'marostica' },
    historia: [
      'O pavimento da praça é um tabuleiro de xadrez à escala real, entre dois castelos ligados por uma muralha que sobe a encosta.',
      'De dois em dois anos, em setembro, joga-se aqui uma partida com peças humanas, em traje do século XV. A tradição foi inventada em 1954 a partir de uma lenda local sobre dois pretendentes que teriam resolvido a disputa ao tabuleiro em vez de à espada.',
      'Não estamos em ano de partida, o que é uma sorte: a praça está vazia e vê-se o desenho todo.'
    ],
    nota: 'Cerejas de Marostica, se for época. Não é.'
  },

  vicenza: {
    nome: 'Teatro Olimpico',
    local: 'Vicenza',
    tipo: 'monumento',
    lat: 45.5497, lng: 11.5486,
    subtitulo: 'A última obra de Palladio, acabada por outro.',
    imagem: { variante: 'arquitetura', semente: 'vicenza' },
    historia: [
      'Palladio começou-o em 1580 e morreu nesse mesmo ano. Vincenzo Scamozzi terminou-o em 1585 e acrescentou aquilo que toda a gente vem ver: as sete ruas em perspetiva que se abrem atrás do palco.',
      'As ruas têm poucos metros de profundidade e parecem ter centenas. O truque está no chão inclinado e nas casas que encolhem à medida que se afastam. Foi construído para uma única representação e nunca foi desmontado.',
      'É o teatro coberto mais antigo do mundo ainda de pé. Continua a funcionar, sem luz elétrica no palco durante os concertos de outono.'
    ],
    nota: 'Entrada com bilhete de grupo. Ponto de encontro à porta, às 11h15.'
  },

  soave: {
    nome: 'Castello di Soave',
    local: 'Soave',
    tipo: 'monumento',
    lat: 45.4239, lng: 11.2450,
    subtitulo: 'A muralha sobe a colina inteira.',
    imagem: { variante: 'paisagem', semente: 'soave' },
    historia: [
      'Os Scaligeri de Verona fortificaram esta colina no século XIV e fizeram descer a muralha até envolver a vila toda. Ainda está lá, inteira, com vinte e quatro torres.',
      'Em volta, apenas Garganega — a casta branca que dá o vinho com o nome da terra. As vinhas sobem em pérgola, um sistema antigo que mantém a uva à sombra das próprias folhas.',
      'A paragem é curta e serve sobretudo para o contraste: viemos das colinas verdes do norte e entrámos na planície quente.'
    ],
    nota: 'Paragem técnica de quinze minutos. Sombra no lado norte da muralha.'
  },

  valpolicella: {
    nome: 'Valpolicella',
    local: 'San Pietro in Cariano',
    tipo: 'vinha',
    lat: 45.5170, lng: 10.8930,
    subtitulo: 'Uvas que passam o inverno a secar.',
    imagem: { variante: 'vinha', semente: 'valpolicella' },
    historia: [
      'O método chama-se appassimento e é simples de explicar: colhem-se as uvas em setembro, estendem-se em caixas ventiladas e deixam-se secar até janeiro. Perdem cerca de um terço do peso em água. O que fica é açúcar, cor e concentração.',
      'Desse mosto sai o Amarone. O nome veio de um engano — um vinho que ficou seco quando devia ficar doce — e ninguém quis corrigir o engano.',
      'A origem do topónimo é disputada. A versão que os produtores preferem é vale das muitas adegas, e é difícil discordar quando se olha para a encosta.'
    ],
    nota: 'Prova e almoço tardio. Quem conduz prova em copo pequeno.'
  },

  verona: {
    nome: 'Verona',
    local: 'Piazza Bra',
    tipo: 'cidade',
    lat: 45.4384, lng: 10.9916,
    subtitulo: 'A cidade de onde veio a cor deste passeio.',
    imagem: { variante: 'arquitetura', semente: 'verona' },
    historia: [
      'A Arena é do século I e continua a encher no verão. Foi construída em calcário local — o mesmo Rosso Ammonitico que dá a Verona o tom acobreado que se vê em todos os degraus, em todos os umbrais e em todas as praças.',
      'É dessa pedra, e do pigmento verde extraído destas mesmas colinas, que saiu a paleta desta aplicação. As duas cores estavam aqui muito antes de existir ecrãs.',
      'A Piazza delle Erbe, a cinco minutos, ocupa o lugar exato do fórum romano. O traçado nunca mudou: a praça é comprida e estreita porque a cidade cresceu por cima de si mesma sem nunca apagar a planta.'
    ],
    nota: 'Jantar de encerramento às 20h00. As chaves entregam-se no domingo de manhã.'
  }
};
