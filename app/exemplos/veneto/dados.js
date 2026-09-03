/* =========================================================
   Dados do evento
   Tudo o que aqui está é conteúdo de demonstração e destina-se
   a ser substituído pelo backoffice (Firestore) na versão real.
   Estrutura pensada para mapear 1:1 em coleções.
   ========================================================= */

window.DADOS = (function () {

  const evento = {
    nome: 'Veneto',
    subtitulo: 'Quatro dias',
    ano: 2026,
    inicio: '2026-09-17',
    fim: '2026-09-20',
    base: 'Asolo',
    hotel: 'Villa Cipriani, Asolo',
    participantes: 30
  };

  /* ---------------------------------------------------------
     Os quatro dias. Cada dia é um capítulo.
     --------------------------------------------------------- */
  const dias = [
    {
      id: 'dia-1',
      numero: 1,
      data: '2026-09-17',
      titulo: 'Chegada',
      subtitulo: 'Treviso, e depois a subida a Asolo.',
      resumo: 'Entrega dos carros no aeroporto, primeira estrada até à crista de Asolo e jantar de abertura no terraço.',
      distancia: 62,
      duracao: '1 h 20',
      imagem: { variante: 'manha', semente: 'dia-1-capa' },
      meteo: { icone: 'sol', max: 26, min: 16, nota: 'Céu limpo' },
      etapas: ['treviso', 'asolo'],
      momentos: [
        { hora: '11:00', fim: '14:00', titulo: 'Entrega dos carros', local: 'Aeroporto de Treviso, nível zero', tipo: 'logistica', poi: 'treviso', nota: 'Por ordem de chegada dos voos.' },
        { hora: '14:30', titulo: 'Partida para Asolo', local: 'Saída pela SP102', tipo: 'partida', poi: 'treviso' },
        { hora: '16:00', titulo: 'Chegada e quartos', local: 'Villa Cipriani, Asolo', tipo: 'paragem', poi: 'asolo' },
        { hora: '18:30', titulo: 'Briefing do passeio', local: 'Sala Cornaro', tipo: 'visita', nota: 'Vinte minutos. Entrega do roadbook impresso.' },
        { hora: '20:00', titulo: 'Jantar de abertura', local: 'Terraço', tipo: 'refeicao' }
      ]
    },
    {
      id: 'dia-2',
      numero: 2,
      data: '2026-09-18',
      titulo: 'Colline del Prosecco',
      subtitulo: 'Cento e quarenta quilómetros de encosta.',
      resumo: 'Possagno, o Cartizze, o claustro de Follina e o regresso por Conegliano. O dia com mais curvas e menos linha reta.',
      distancia: 148,
      duracao: '3 h 40',
      imagem: { variante: 'vinha', semente: 'dia-2-capa' },
      meteo: { icone: 'nuvem', max: 24, min: 14, nota: 'Nuvens altas de manhã' },
      etapas: ['asolo', 'possagno', 'valdobbiadene', 'follina', 'conegliano', 'asolo'],
      momentos: [
        { hora: '08:30', titulo: 'Partida', local: 'Parque da Cipressina', tipo: 'partida', poi: 'asolo' },
        { hora: '09:15', fim: '10:15', titulo: 'Tempio Canoviano', local: 'Possagno', tipo: 'visita', poi: 'possagno' },
        { hora: '11:00', fim: '12:30', titulo: 'Prova no Cartizze', local: 'Valdobbiadene', tipo: 'prova', poi: 'valdobbiadene',
          alterado: { antes: '11:30', razao: 'O produtor antecipou a prova por causa da vindima' } },
        { hora: '13:00', fim: '14:30', titulo: 'Almoço', local: 'Follina', tipo: 'refeicao', poi: 'follina' },
        { hora: '14:45', fim: '15:15', titulo: 'Claustro da abadia', local: 'Follina', tipo: 'visita', poi: 'follina' },
        { hora: '16:15', fim: '16:45', titulo: 'Café em Conegliano', local: 'Via XX Settembre', tipo: 'paragem', poi: 'conegliano' },
        { hora: '18:00', titulo: 'Regresso a Asolo', local: 'Villa Cipriani', tipo: 'paragem', poi: 'asolo' },
        { hora: '20:30', titulo: 'Jantar livre', local: 'Sugestões no concierge', tipo: 'refeicao', nota: 'Sem programa. Há três mesas reservadas para quem quiser.' }
      ]
    },
    {
      id: 'dia-3',
      numero: 3,
      data: '2026-09-19',
      titulo: 'Monte Grappa',
      subtitulo: 'A estrada é o ponto de interesse.',
      resumo: 'A subida pela Strada Cadorna até aos 1775 metros, a descida para Bassano e a praça-tabuleiro de Marostica.',
      distancia: 132,
      duracao: '3 h 15',
      imagem: { variante: 'paisagem', semente: 'dia-3-capa' },
      meteo: { icone: 'sol', max: 22, min: 9, nota: 'Frio no cume' },
      etapas: ['asolo', 'grappa', 'bassano', 'marostica', 'asolo'],
      momentos: [
        { hora: '08:00', titulo: 'Partida', local: 'Parque da Cipressina', tipo: 'partida', poi: 'asolo', nota: 'Depósito cheio. Não há combustível na montanha.' },
        { hora: '09:30', fim: '10:45', titulo: 'Cima Grappa', local: 'Memorial', tipo: 'visita', poi: 'grappa' },
        { hora: '12:00', fim: '14:00', titulo: 'Almoço em Bassano', local: 'Margem esquerda do Brenta', tipo: 'refeicao', poi: 'bassano' },
        { hora: '14:30', fim: '15:30', titulo: 'Ponte degli Alpini', local: 'Bassano del Grappa', tipo: 'visita', poi: 'bassano' },
        { hora: '16:15', fim: '17:00', titulo: 'Marostica', local: 'Piazza degli Scacchi', tipo: 'paragem', poi: 'marostica' },
        { hora: '18:00', titulo: 'Regresso a Asolo', local: 'Villa Cipriani', tipo: 'paragem', poi: 'asolo' },
        { hora: '20:00', titulo: 'Jantar de gala', local: 'Villa Cipriani', tipo: 'refeicao', nota: 'Traje: casaco.' }
      ]
    },
    {
      id: 'dia-4',
      numero: 4,
      data: '2026-09-20',
      titulo: 'Palladio e Valpolicella',
      subtitulo: 'Da villa ao vinho, e o fecho em Verona.',
      resumo: 'A villa de Maser, o Teatro Olimpico, a muralha de Soave e a última prova antes de descer a Verona.',
      distancia: 196,
      duracao: '4 h 10',
      imagem: { variante: 'arquitetura', semente: 'dia-4-capa' },
      meteo: { icone: 'chuva', max: 21, min: 15, nota: 'Aguaceiros a partir do meio da tarde' },
      etapas: ['asolo', 'maser', 'vicenza', 'soave', 'valpolicella', 'verona'],
      momentos: [
        { hora: '08:00', titulo: 'Saída de mala feita', local: 'Villa Cipriani', tipo: 'partida', poi: 'asolo', nota: 'As malas seguem de carrinha para Verona.' },
        { hora: '08:30', fim: '09:30', titulo: 'Villa Barbaro', local: 'Maser', tipo: 'visita', poi: 'maser' },
        { hora: '10:30', fim: '11:30', titulo: 'Teatro Olimpico', local: 'Vicenza', tipo: 'visita', poi: 'vicenza' },
        { hora: '12:30', fim: '12:45', titulo: 'Paragem em Soave', local: 'Sopé da muralha', tipo: 'paragem', poi: 'soave' },
        { hora: '14:00', fim: '16:30', titulo: 'Prova e almoço tardio', local: 'San Pietro in Cariano', tipo: 'prova', poi: 'valpolicella' },
        { hora: '17:30', titulo: 'Chegada a Verona', local: 'Piazza Bra', tipo: 'paragem', poi: 'verona' },
        { hora: '20:00', titulo: 'Jantar de encerramento', local: 'Verona', tipo: 'refeicao', poi: 'verona', nota: 'O álbum do passeio fica disponível ao fim do jantar.' }
      ]
    }
  ];

  /* ---------------------------------------------------------
     Oficinas para o checkup
     --------------------------------------------------------- */
  const oficinas = [
    { id: 'lisboa', nome: 'Aston Martin Lisboa', morada: 'Av. de Ceuta, Alcântara', telefone: '+351 210 000 000',
      slots: ['2026-08-18 09:00', '2026-08-18 14:30', '2026-08-19 09:00', '2026-08-20 11:00', '2026-08-25 09:00'] },
    { id: 'porto', nome: 'Aston Martin Porto', morada: 'Via Norte, Maia', telefone: '+351 220 000 000',
      slots: ['2026-08-17 10:00', '2026-08-19 15:00', '2026-08-21 09:30', '2026-08-26 14:00'] },
    { id: 'algarve', nome: 'Serviço móvel — Algarve', morada: 'Recolha e entrega ao domicílio', telefone: '+351 289 000 000',
      slots: ['2026-08-24 09:00', '2026-08-27 09:00'] }
  ];

  /* Estados possíveis do checkup, por ordem. */
  const estadosCheckup = [
    { id: 'marcado', titulo: 'Marcado', nota: 'Slot confirmado' },
    { id: 'recebido', titulo: 'Recebido na oficina', nota: 'Entrada registada' },
    { id: 'inspecao', titulo: 'Em inspeção', nota: 'Trinta e dois pontos de verificação' },
    { id: 'pronto', titulo: 'Pronto a levantar', nota: 'Relatório disponível' }
  ];

  /* Relatório de exemplo — na versão real vem da oficina. */
  const relatorio = {
    referencia: 'CK-2026-0184',
    data: '2026-08-20',
    oficina: 'Aston Martin Lisboa',
    tecnico: 'J. Almeida',
    quilometros: 18420,
    verificados: 32,
    impecavel: [
      'Travões — pastilhas e discos dentro de tolerância',
      'Suspensão adaptativa — sem folgas',
      'Sistema de arrefecimento — pressão correta',
      'Bateria e alternador — carga nominal',
      'Iluminação e eletrónica — sem códigos de avaria'
    ],
    corrigido: [
      'Pressão dos quatro pneus acertada para carga de viagem',
      'Nível de óleo do motor completado em 0,3 l',
      'Atualização do software de infoentretenimento'
    ],
    atencao: [
      'Pneus traseiros a 4 mm. Suficientes para o passeio, substituição recomendada até ao inverno.'
    ],
    nota: 'Viatura pronta para o percurso do Veneto. Recomenda-se verificação de pressões à chegada a Itália, por diferença de temperatura.'
  };

  /* ---------------------------------------------------------
     Transporte do carro
     --------------------------------------------------------- */
  const transporte = {
    estados: [
      { id: 'agendado', titulo: 'Recolha agendada', nota: '10 de setembro, entre as 09h00 e as 13h00' },
      { id: 'recolhido', titulo: 'Recolhido', nota: 'Com relatório fotográfico de estado' },
      { id: 'transito', titulo: 'Em trânsito', nota: 'Camião fechado, três viaturas' },
      { id: 'chegado', titulo: 'Chegada ao Veneto', nota: 'Garagem de Treviso, 15 de setembro' }
    ],
    atual: 'agendado',
    regresso: 'Recolha em Verona a 21 de setembro. Entrega prevista para 26 de setembro.'
  };

  /* ---------------------------------------------------------
     Contactos
     --------------------------------------------------------- */
  const contactos = [
    { id: 'concierge', nome: 'Concierge do passeio', papel: 'Sara Duarte', telefone: '+39 340 000 0001', icone: 'mensagem' },
    { id: 'assistencia', nome: 'Assistência técnica', papel: 'Carro-oficina, 24 horas', telefone: '+39 340 000 0002', icone: 'oficina' },
    { id: 'vassoura', nome: 'Carro-vassoura', papel: 'Segue sempre o último do grupo', telefone: '+39 340 000 0003', icone: 'carro' },
    { id: 'hotel', nome: 'Villa Cipriani', papel: 'Asolo', telefone: '+39 0423 000 000', icone: 'caixa' },
    { id: 'emergencia', nome: 'Emergência', papel: 'Número europeu', telefone: '112', icone: 'alerta' }
  ];

  /* ---------------------------------------------------------
     Experiências opcionais
     --------------------------------------------------------- */
  const experiencias = [
    { id: 'balao', titulo: 'Balão sobre as colinas', dia: '18 de setembro, 06h30', duracao: '90 minutos',
      texto: 'Descolagem de Valdobbiadene ao nascer do sol, com aterragem entre vinhas. Regresso a tempo do pequeno-almoço.',
      vagas: 4, inscrito: false, imagem: { variante: 'manha', semente: 'balao' } },
    { id: 'amarone', titulo: 'Vertical de Amarone', dia: '20 de setembro, 15h00', duracao: '60 minutos',
      texto: 'Cinco colheitas da mesma parcela, de 2004 a 2019, com o enólogo da casa. Doze lugares à mesa.',
      vagas: 12, inscrito: true, imagem: { variante: 'vinha', semente: 'amarone' } },
    { id: 'sile', titulo: 'Barco no Sile', dia: '17 de setembro, 17h00', duracao: '2 horas',
      texto: 'Para quem chegar cedo. Descida do rio desde Treviso em barco de madeira, sem motor à vista.',
      vagas: 0, inscrito: false, imagem: { variante: 'paisagem', semente: 'sile' } }
  ];

  /* ---------------------------------------------------------
     Participantes — dados de demonstração
     Um carro admite até dois perfis. Alguns viajam sozinhos.
     [modelo, cor, último check-in, perfis…]
     --------------------------------------------------------- */
  const listaCarros = [
    ['db12', 'racing', 'valdobbiadene', 'Tiago Magalhães', 'Inês Magalhães'],
    ['dbx707', 'onyx', 'valdobbiadene', 'Rui Sacramento', 'Marta Sacramento'],
    ['vantage', 'hyper', 'valdobbiadene', 'Henrique Vilar'],
    ['db11', 'magnetic', 'follina', 'Carlos Bento', 'Ana Bento'],
    ['vanquish', 'ultramarine', 'valdobbiadene', 'Duarte Pinho'],
    ['v12-vantage', 'divine', 'possagno', 'Sofia Cardoso', 'Miguel Cardoso'],
    ['dbs', 'skyfall', 'follina', 'José Antunes', 'Leonor Antunes'],
    ['db12-volante', 'lunar', 'valdobbiadene', 'Pedro Sequeira', 'Filipa Sequeira'],
    ['dbx707', 'buckingham', 'conegliano', 'Nuno Teles'],
    ['valhalla', 'quantum', 'conegliano', 'Vasco Moreira', 'Beatriz Moreira'],
    ['vantage', 'aris', 'possagno', 'Álvaro Pinto', 'Teresa Pinto'],
    ['db11', 'jet', 'follina', 'Manuel Craveiro', 'Joana Craveiro'],
    ['db12', 'golden', 'valdobbiadene', 'Francisco Lemos', 'Rita Lemos'],
    ['dbs', 'onyx', 'possagno', 'António Sá'],
    ['vantage', 'sabiro', 'conegliano', 'Guilherme Reis', 'Madalena Reis'],
    ['dbx707', 'magnetic', 'follina', 'Eduardo Nobre', 'Cristina Nobre'],
    ['vanquish', 'racing', 'valdobbiadene', 'Paulo Vasconcelos', 'Helena Vasconcelos']
  ];

  const carros = [];
  const participantes = [];

  listaCarros.forEach(function (linha, i) {
    const id = 'c' + (i + 1);
    const perfis = linha.slice(3);
    carros.push({ id: id, modelo: linha[0], cor: linha[1], chegou: linha[2], perfis: perfis });
    perfis.forEach(function (nome) {
      participantes.push({
        id: 'p' + (participantes.length + 1),
        nome: nome,
        modelo: linha[0],
        cor: linha[1],
        chegou: linha[2],
        carroId: id
      });
    });
  });

  /* ---------------------------------------------------------
     Fotografias semeadas pela equipa — a galeria nunca começa vazia
     --------------------------------------------------------- */
  const fotosIniciais = [
    { id: 'f1', autor: 'p1', dia: 'dia-2', poi: 'valdobbiadene', semente: 'g-01', variante: 'vinha' },
    { id: 'f2', autor: 'p3', dia: 'dia-2', poi: 'possagno', semente: 'g-02', variante: 'arquitetura' },
    { id: 'f3', autor: 'p9', dia: 'dia-2', poi: 'valdobbiadene', semente: 'g-03', variante: 'paisagem' },
    { id: 'f4', autor: 'p6', dia: 'dia-2', poi: 'follina', semente: 'g-04', variante: 'arquitetura' },
    { id: 'f5', autor: 'p13', dia: 'dia-2', poi: 'conegliano', semente: 'g-05', variante: 'paisagem' },
    { id: 'f6', autor: 'p16', dia: 'dia-1', poi: 'asolo', semente: 'g-06', variante: 'manha' },
    { id: 'f7', autor: 'p2', dia: 'dia-1', poi: 'asolo', semente: 'g-07', variante: 'paisagem' },
    { id: 'f8', autor: 'p22', dia: 'dia-2', poi: 'valdobbiadene', semente: 'g-08', variante: 'vinha' },
    { id: 'f9', autor: 'p11', dia: 'dia-1', poi: 'treviso', semente: 'g-09', variante: 'manha' },
    { id: 'f10', autor: 'p5', dia: 'dia-2', poi: 'possagno', semente: 'g-10', variante: 'paisagem' },
    { id: 'f11', autor: 'p18', dia: 'dia-2', poi: 'follina', semente: 'g-11', variante: 'vinha' },
    { id: 'f12', autor: 'p27', dia: 'dia-2', poi: 'conegliano', semente: 'g-12', variante: 'arquitetura' }
  ];

  /* ---------------------------------------------------------
     Preparação — o que fazer antes de partir
     --------------------------------------------------------- */
  const preparacao = {
    levar: [
      'Carta de condução e documento de identificação',
      'Casaco de meia-estação — o Monte Grappa está dez graus abaixo',
      'Sapato confortável: Asolo, Marostica e Vicenza fazem-se a pé',
      'Adaptador de tomada tipo L, se vier de fora de Itália',
      'Óculos de sol. A estrada de dia 3 é toda virada a poente ao regresso'
    ],
    notas: [
      'Portagens e combustível estão incluídos e são liquidados pela organização.',
      'Há uma carrinha de apoio para bagagem entre Asolo e Verona no último dia.'
    ]
  };

  return {
    evento: evento,
    dias: dias,
    oficinas: oficinas,
    estadosCheckup: estadosCheckup,
    relatorio: relatorio,
    transporte: transporte,
    contactos: contactos,
    experiencias: experiencias,
    participantes: participantes,
    carros: carros,
    fotosIniciais: fotosIniciais,
    preparacao: preparacao,
    dia: function (id) { return dias.find(function (d) { return d.id === id; }); },
    participante: function (id) { return participantes.find(function (p) { return p.id === id; }); }
  };
})();
