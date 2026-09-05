/* =========================================================
   Hoje — a âncora de utilização diária
   Antes do passeio mostra a preparação; durante, o programa
   vivo; depois, o álbum. É sempre o primeiro ecrã.
   ========================================================= */

(function () {

  /* Posição vista no ecrã imersivo — segue o momento real até se
     tocar para avançar; volta a seguir o relógio ao mudar de dia. */
  let diaEmVista = null;
  let indiceManual = null;
  let folhaAberta = false;

  function indiceMostrado(dia) {
    if (diaEmVista !== dia.id) { diaEmVista = dia.id; indiceManual = null; folhaAberta = false; }
    if (indiceManual !== null) return indiceManual;
    const a = indiceAtual(dia);
    return a < 0 ? dia.momentos.length - 1 : a;
  }

  /* ---------------------------------------------------------
     Um momento do programa
     --------------------------------------------------------- */
  function momento(m, estadoTemporal) {
    const classes = ['momento'];
    if (m.alterado) classes.push('momento--alterado');
    if (estadoTemporal === 'passado') classes.push('momento--passado');
    if (estadoTemporal === 'agora') classes.push('momento--agora');

    let corpo = '';
    if (m.alterado) {
      corpo += '<div style="margin-bottom:6px">' + UI.distintivo('Alterado', 'rosso') + '</div>';
    }
    corpo += '<h3 class="momento__titulo">' + UI.h(m.titulo) + '</h3>';
    if (m.local) corpo += '<p class="meta momento__local">' + UI.h(m.local) + '</p>';
    if (m.alterado) {
      corpo += '<p class="corpo-ui momento__nota silencioso">Era às ' + UI.h(m.alterado.antes.replace(':', 'h')) +
        '. ' + UI.h(m.alterado.razao) + '.</p>';
    }
    if (m.nota) corpo += '<p class="corpo-ui momento__nota silencioso">' + UI.h(m.nota) + '</p>';
    if (m.poi && POIS[m.poi] && POIS[m.poi].tipo !== 'logistica') {
      corpo += '<a class="botao botao--texto" href="#/poi/' + m.poi + '">' + UI.h(POIS[m.poi].nome) + ' &rsaquo;</a>';
    }

    return '<div class="' + classes.join(' ') + '">' +
      '<div>' +
        '<div class="momento__hora num">' + UI.h(m.hora) + '</div>' +
        (m.fim ? '<div class="meta num momento__fim">' + UI.h(m.fim) + '</div>' : '') +
      '</div>' +
      '<div>' + corpo + '</div>' +
    '</div>';
  }

  /* Qual é o momento em curso — ou o próximo, se estivermos entre dois. */
  function indiceAtual(dia) {
    const agora = UI.horaAgora();
    for (let i = 0; i < dia.momentos.length; i++) {
      const m = dia.momentos[i];
      const ini = UI.minutos(m.hora);
      const fim = m.fim ? UI.minutos(m.fim) : ini + 60;
      if (agora < fim) return i;
    }
    return -1;
  }

  function programa(dia, comEstadoTemporal, saltar) {
    const atual = comEstadoTemporal ? indiceAtual(dia) : -1;

    return '<div class="programa">' + dia.momentos.map(function (m, i) {
      if (saltar !== undefined && i === saltar) return '';
      let est = 'futuro';
      if (comEstadoTemporal) {
        if (atual < 0 || i < atual) est = 'passado';
        else if (i === atual) est = 'agora';
      }
      return momento(m, est);
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------
     O dia é uma coisa de cada vez — o ecrã imersivo do "durante".
     Um momento em grande sobre a paisagem, o resto do dia
     convocado por baixo. Tocar na fotografia avança; tocar na
     pauta abre o dia inteiro.
     --------------------------------------------------------- */

  function fundoImersivo() {
    return '<svg class="imersivo__fundo" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="ceuI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3E55"/><stop offset=".46" stop-color="#7E8FA0"/><stop offset="1" stop-color="#D8C3AE"/></linearGradient>' +
        '<linearGradient id="farI" x1="0" y1=".2" x2="0" y2="1"><stop offset="0" stop-color="#E9C3A4"/><stop offset=".45" stop-color="#A98D8B"/><stop offset="1" stop-color="#6E6570"/></linearGradient>' +
        '<linearGradient id="nearI" x1="0" y1=".3" x2="0" y2="1"><stop offset="0" stop-color="#55505C"/><stop offset="1" stop-color="#25242C"/></linearGradient>' +
        '<linearGradient id="veuI" x1="0" y1=".26" x2="0" y2="1"><stop offset="0" stop-color="#101216" stop-opacity="0"/><stop offset=".54" stop-color="#101216" stop-opacity=".46"/><stop offset="1" stop-color="#101216" stop-opacity=".95"/></linearGradient>' +
        '<linearGradient id="topoI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101216" stop-opacity=".4"/><stop offset="1" stop-color="#101216" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      '<rect width="390" height="844" fill="url(#ceuI)"/>' +
      '<path d="M-10 844 L-10 452 L34 318 L62 352 L92 342 L138 262 L172 306 L204 296 L258 380 L300 300 L336 344 L368 330 L400 352 L400 844 Z" fill="url(#farI)"/>' +
      '<path d="M-10 844 L-10 574 L44 470 L80 512 L114 500 L164 434 L204 486 L242 472 L296 552 L342 476 L400 528 L400 844 Z" fill="url(#nearI)"/>' +
      '<path d="M-10 844 L-10 660 Q 110 632 200 650 Q 300 670 400 640 L400 844 Z" fill="#1A1C20"/>' +
      '<rect width="390" height="844" fill="url(#veuI)"/>' +
      '<rect width="390" height="180" fill="url(#topoI)"/>' +
    '</svg>';
  }

  function imersivoHtml(dia) {
    const i = indiceMostrado(dia);
    const m = dia.momentos[i];
    const seg = dia.momentos[i + 1];
    const atual = indiceAtual(dia);
    const poi = m.poi ? POIS[m.poi] : null;

    let percurso = '';
    const de = Estado.ultimaChegada();
    if (poi && de && de !== m.poi && POIS[de]) {
      const t = UI.troco(de, m.poi);
      percurso = t.km + ' km · ' + UI.duracao(t.min);
    }

    const barras = dia.momentos.map(function (_, n) {
      const h = n === i ? 20 : (n < i ? 8 : 4);
      const cor = n === i ? 'var(--ottone)' : (n < i ? 'rgba(237,232,224,.42)' : 'rgba(237,232,224,.18)');
      return '<span style="background:' + cor + ';height:' + h + 'px"></span>';
    }).join('');

    const abas = [
      { rota: '#/hoje', icone: 'hoje', nome: 'Hoje' },
      { rota: '#/roadbook', icone: 'roadbook', nome: 'Roadbook' },
      { rota: '#/mapa', icone: 'mapa', nome: 'Mapa' },
      { rota: '#/galeria', icone: 'galeria', nome: 'Galeria' },
      { rota: '#/mais', icone: 'mais', nome: 'Mais' }
    ];
    const nav = abas.map(function (a) {
      const ativo = a.nome === 'Hoje';
      return '<a class="imersivo__nav-item" href="' + a.rota + '"' + (ativo ? ' aria-current="page"' : '') + '>' +
        IconePuncao(a.icone, ativo) +
        '<span>' + a.nome + '</span>' +
      '</a>';
    }).join('');

    const folha = dia.momentos.map(function (x, n) {
      return '<div class="imersivo__linha" data-acao="saltarPara" data-valor="' + n + '">' +
        '<span class="num">' + UI.h(x.hora) + '</span>' +
        '<span><span class="imersivo__linha-titulo">' + UI.h(x.titulo) + '</span>' +
        (x.local ? '<span class="imersivo__linha-local">' + UI.h(x.local) + '</span>' : '') + '</span>' +
      '</div>';
    }).join('');

    const altitudes = dia.momentos.map(function (x) { return x.poi && POIS[x.poi] ? POIS[x.poi].altitude : null; }).filter(Boolean);
    const maisAlto = altitudes.length ? Math.max.apply(null, altitudes) : null;

    return '<div class="imersivo">' +
      '<div class="imersivo__topo">' +
        '<span class="imersivo__data num">' + (dia.data ? UI.dataCurta(dia.data) : 'Dia ' + dia.numero) + '</span>' +
        '<span class="imersivo__etapa">' + UI.h((dia.titulo || '').toUpperCase()) + '</span>' +
      '</div>' +

      '<div class="imersivo__cena" data-acao="avancar">' +
        fundoImersivo() +
        '<span class="imersivo__escurecer"></span>' +
        '<div class="imersivo__hero">' +
          '<span class="imersivo__etiqueta">' + (i === atual ? 'Agora' : 'A seguir') +
            (m.alterado ? ' · alterado' : '') + '</span>' +
          '<div class="imersivo__hero-fundo">' +
            '<span class="imersivo__titulo">' + UI.h(m.titulo) + '</span>' +
            (m.nota ? '<span class="imersivo__nota">' + UI.h(m.nota) + '</span>'
              : (m.alterado ? '<span class="imersivo__nota">Era às ' + UI.h(m.alterado.antes.replace(':', 'h')) + '. ' + UI.h(m.alterado.razao) + '.</span>' : '')) +
            '<span class="imersivo__fila num">' +
              '<span class="imersivo__pastilha imersivo__pastilha--hora">' + UI.h(m.hora) + (m.fim ? '–' + UI.h(m.fim) : '') + '</span>' +
              (poi && poi.altitude ? '<span class="imersivo__pastilha">' + poi.altitude + ' m</span>' : '') +
              (percurso ? '<span class="imersivo__pastilha">' + percurso + '</span>' : '') +
            '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="imersivo__rodape">' +
        '<div class="imersivo__pauta" data-acao="abrirDia">' +
          '<div class="imersivo__barras">' + barras + '</div>' +
          '<div class="imersivo__seguinte">' +
            '<span>' + (seg ? 'A seguir, ' + UI.h(seg.titulo) : 'Fim do dia') + '</span>' +
            '<span>O dia</span>' +
          '</div>' +
        '</div>' +
        '<div class="imersivo__nav">' + nav + '</div>' +
      '</div>' +
      '<div class="imersivo__veu-folha" data-acao="fecharDia" data-aberto="' + (folhaAberta ? 'sim' : 'nao') + '"></div>' +
      '<div class="imersivo__folha" data-aberto="' + (folhaAberta ? 'sim' : 'nao') + '">' +
        '<span class="imersivo__puxador"></span>' +
        '<div class="imersivo__folha-cab" data-acao="fecharDia">' +
          '<span class="imersivo__folha-titulo">O dia inteiro</span><span>Fechar</span>' +
        '</div>' +
        folha +
        '<div class="imersivo__folha-totais num">' +
          '<span>' + dia.distancia + ' km</span><span>' + UI.h(dia.duracao) + '</span>' +
          (maisAlto ? '<span>' + maisAlto + ' m</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function meteo(dia) {
    if (!dia.meteo) return '';
    return '<div class="par" style="gap:10px;align-items:center">' +
      '<span style="color:var(--inchiostro-medio)">' + Icone(dia.meteo.icone, 20) + '</span>' +
      '<span class="corpo-ui num">' + dia.meteo.max + '° / ' + dia.meteo.min + '°</span>' +
      '<span class="meta">' + UI.h(dia.meteo.nota) + '</span>' +
    '</div>';
  }

  function capaDia(dia) {
    return '<div class="capa">' +
      UI.foto(dia.imagem, 'foto--32 capa__imagem') +
      '<div class="capa__texto">' +
        '<p class="capa__data">' + (dia.data ? UI.dataLonga(dia.data) : 'Dia ' + dia.numero) + '</p>' +
        '<h1 class="capa-titulo">' + UI.h(dia.titulo || 'Etapa ' + dia.numero) + '</h1>' +
        (dia.subtitulo ? '<p class="subtitulo" style="margin-top:8px">' + UI.h(dia.subtitulo) + '</p>' : '') +
      '</div>' +
    '</div>';
  }

  function rodapeDia(dia) {
    return '<div class="faixa">' +
      '<div class="dados">' +
        '<div><div class="dado__valor num">' + dia.distancia + ' km</div><div class="dado__rotulo meta">Percurso</div></div>' +
        '<div><div class="dado__valor num">' + UI.h(dia.duracao) + '</div><div class="dado__rotulo meta">Ao volante</div></div>' +
        '<div><div class="dado__valor num">' + (dia.etapas.length - 1) + '</div><div class="dado__rotulo meta">Troços</div></div>' +
      '</div>' +
      '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/roadbook/' + dia.id + '">Abrir o roadbook do dia</a>' +
    '</div>';
  }

  /* Enquanto a organização não publica o itinerário, o convidado
     vê isto — e não um ecrã partido. */
  function semItinerario(titulo) {
    return '<div class="faixa" style="padding-top:24px">' +
      '<div class="selado">' +
        '<div class="selado__icone">' + Icone('roadbook', 24) + '</div>' +
        '<p class="corpo-editorial">' + UI.h(titulo || 'O programa ainda não está publicado.') + '</p>' +
        '<p class="meta" style="margin-top:12px">Recebe uma notificação assim que estiver.</p>' +
      '</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     Antes de partir — os dias que antecedem o passeio
     A app chega ao convidado poucos dias antes. Este ecrã é o
     briefing: o que vai acontecer, o que levar, quem vai.
     --------------------------------------------------------- */

  /* Uma paragem por dia, revelada. É o que faz a app abrir-se
     todos os dias antes de partir. */
  function revelacaoHtml() {
    const hoje = Estado.chave(Estado.agora());
    const visiveis = Conteudo.reveladas(hoje);
    const nova = visiveis
      .map(function (id) { return Object.assign({ id: id }, POIS[id]); })
      .filter(function (p) { return p.revelacao === hoje; })[0];

    if (nova) {
      return '<div class="faixa" style="margin-top:32px">' +
        '<a class="revelacao" href="#/poi/' + nova.id + '" ' +
          'style="background-image:' + UI.imagemDe(nova.imagem, 1.2) + '">' +
          '<span class="revelacao__veu"></span>' +
          '<span class="revelacao__corpo">' +
            '<span class="revelacao__etiqueta">Hoje revela-se</span>' +
            '<span class="revelacao__titulo">' + UI.h(nova.nome) + '</span>' +
            (nova.subtitulo ? '<span class="revelacao__sub">' + UI.h(nova.subtitulo) + '</span>' : '') +
          '</span>' +
        '</a>' +
      '</div>';
    }

    const proxima = Conteudo.porRevelar(hoje);
    if (!proxima) return '';
    const dias = Math.round((new Date(proxima.revelacao + 'T00:00:00') - new Date(hoje + 'T00:00:00')) / 86400000);
    return '<div class="faixa" style="margin-top:32px">' +
      '<div class="selado selado--espera">' +
        '<p class="corpo-editorial italico">Falta revelar mais uma paragem do percurso.</p>' +
        '<p class="meta" style="margin-top:12px">' +
          (dias <= 1 ? 'Amanhã.' : 'Daqui a ' + UI.plural(dias, 'dia', 'dias') + '.') + '</p>' +
      '</div>' +
    '</div>';
  }

  function briefingHtml() {
    const faltam = Estado.diasAte();
    const carro = Estado.meuCarro();

    return '' +
      '<div class="capa">' +
        UI.foto({ variante: 'manha', semente: 'abertura' }, 'foto--32 capa__imagem') +
        '<div class="capa__texto">' +
          '<p class="capa__data">' + UI.intervaloEvento() + '</p>' +
          '<h1 class="capa-titulo">' + UI.h(DADOS.evento.nome || 'Passeio') + '</h1>' +
          '<p class="subtitulo" style="margin-top:8px">' +
            (faltam === null ? UI.h(DADOS.evento.base || 'Por confirmar')
              : (faltam > 0 ? 'Faltam ' + UI.plural(faltam, 'dia', 'dias') + '.' : 'Começa hoje.')) +
          '</p>' +
        '</div>' +
      '</div>' +

      (DADOS.dias.length || DADOS.carros.length ? '<div class="faixa" style="margin-top:24px">' +
        '<div class="dados">' +
          '<div><div class="dado__valor num">' + DADOS.dias.length + '</div><div class="dado__rotulo meta">Etapas</div></div>' +
          '<div><div class="dado__valor num">' +
            DADOS.dias.reduce(function (t, d) { return t + (d.distancia || 0); }, 0) +
            '</div><div class="dado__rotulo meta">Km</div></div>' +
          '<div><div class="dado__valor num">' + DADOS.carros.length + '</div><div class="dado__rotulo meta">Carros</div></div>' +
        '</div>' +
      '</div>' : '') +

      revelacaoHtml() +

      (carro ? '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">O seu carro</h2></div>' +
        '<a href="#/carro" style="display:block;color:inherit">' +
          '<div style="max-width:240px">' + Silhuetas.svg(carro.modelo, carro.cor) + '</div>' +
          '<p class="titulo-ui" style="margin-top:12px">' + UI.h(Silhuetas.modelo(carro.modelo).nome) + '</p>' +
          '<p class="meta" style="margin-top:2px">' +
            UI.h([Silhuetas.cor(carro.cor).nome, carro.matricula].filter(Boolean).join(' · ')) + '</p>' +
        '</a>' +
      '</div>' : '') +

      (DADOS.dias.length
        ? '<div class="faixa">' +
            '<div class="seccao-cabecalho"><h2 class="etiqueta">O programa</h2></div>' +
            '<div class="lista">' + DADOS.dias.map(function (d) {
              return UI.linhaLista({
                titulo: 'Dia ' + d.numero + (d.titulo ? ' — ' + d.titulo : ''),
                nota: [d.data ? UI.dataCurta(d.data) : null, d.distancia ? d.distancia + ' km' : null].filter(Boolean).join(' · '),
                href: '#/dia/' + d.id
              });
            }).join('') + '</div>' +
            '<a class="botao botao--secundario botao--largo" style="margin-top:24px" href="#/roadbook">Ver o roadbook completo</a>' +
          '</div>'
        : semItinerario('O itinerário está a ser preparado.')) +

      (DADOS.levar.length ? '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">O que levar</h2></div>' +
        '<div class="lista">' +
          UI.linhaLista({ titulo: 'Lista de bagagem', nota: UI.plural(DADOS.levar.length, 'item', 'itens'), icone: 'documento', href: '#/preparacao' }) +
        '</div>' +
      '</div>' : '') +

      (DADOS.carros.length
        ? '<div class="faixa">' +
            '<div class="seccao-cabecalho"><h2 class="etiqueta">Quem vai</h2></div>' +
            '<p class="corpo-editorial">' + UI.plural(DADOS.carros.length, 'carro', 'carros') + ', ' +
              UI.plural(DADOS.participantes.length, 'lugar', 'lugares') + '. A lista completa está no mapa.</p>' +
            '<a class="botao botao--texto" href="#/participantes">Ver os participantes &rsaquo;</a>' +
          '</div>'
        : '');
  }

  /* ---------------------------------------------------------
     Depois do último dia
     --------------------------------------------------------- */

  function posHtml() {
    const ultimo = DADOS.dias[DADOS.dias.length - 1] || null;
    return '' +
      '<div class="capa">' +
        UI.foto({ variante: 'noite', semente: 'fecho' }, 'foto--32 capa__imagem') +
        '<div class="capa__texto">' +
          '<p class="capa__data">' + UI.intervaloEvento() + '</p>' +
          '<h1 class="capa-titulo">Ficou tudo aqui.</h1>' +
        '</div>' +
      '</div>' +

      '<div class="faixa">' +
        '<p class="corpo-editorial">' +
        UI.plural(DADOS.dias.length, 'dia', 'dias') + ', ' +
        DADOS.dias.reduce(function (t, d) { return t + (d.distancia || 0); }, 0) +
        ' quilómetros e ' + UI.plural(Estado.fotos().length, 'fotografia', 'fotografias') + '. O álbum está pronto.</p>' +
        '<a class="botao botao--radicchio botao--largo" style="margin-top:24px" href="#/album">Abrir o álbum</a>' +
      '</div>' +

      '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">Arquivo</h2></div>' +
        '<div class="lista">' +
          UI.linhaLista({ titulo: 'Roadbook completo', nota: UI.plural(DADOS.dias.length, 'percurso', 'percursos'), icone: 'roadbook', href: '#/roadbook' }) +
          UI.linhaLista({ titulo: 'Galeria', nota: UI.plural(Estado.fotos().length, 'fotografia', 'fotografias'), icone: 'galeria', href: '#/galeria' }) +
          (ultimo ? UI.linhaLista({ titulo: 'Último dia', nota: ultimo.titulo, icone: 'hoje', href: '#/dia/' + ultimo.id }) : '') +
        '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Vistas
     --------------------------------------------------------- */

  /* Imersivo só quando há, de facto, um dia com momentos para
     mostrar — sem itinerário publicado o convidado continua a
     ver o estado de espera com o cabeçalho normal. */
  function imersivo() {
    if (Estado.fase() !== 'durante') return false;
    const dia = Estado.diaAtivo();
    return !!(dia && dia.momentos.length);
  }

  Vistas.hoje = {
    nav: 'hoje',
    semNav: imersivo,
    semCabecalho: imersivo,
    cabecalho: function () {
      const dia = Estado.fase() === 'durante' ? Estado.diaAtivo() : null;
      return {
        titulo: dia ? dia.titulo : (DADOS.evento.nome || 'Passeio'),
        linha: false,
        acao: { acao: 'partilhar', icone: 'partilhar', rotulo: 'Partilhar' }
      };
    },
    html: function () {
      const fase = Estado.fase();
      if (fase === 'pre') return briefingHtml();
      if (fase === 'pos') return posHtml();

      const dia = Estado.diaAtivo();
      if (!dia) return semItinerario('O programa de hoje ainda não está publicado.');
      if (!dia.momentos.length) return semItinerario('O programa de hoje ainda não está publicado.');

      return imersivoHtml(dia);
    },
    acoes: {
      avancar: function () {
        const dia = Estado.diaAtivo();
        if (!dia || !dia.momentos.length) return;
        indiceManual = (indiceMostrado(dia) + 1) % dia.momentos.length;
        App.repintar();
      },
      abrirDia: function () {
        folhaAberta = true;
        App.repintar();
      },
      fecharDia: function () {
        folhaAberta = false;
        App.repintar();
      },
      saltarPara: function (v) {
        indiceManual = parseInt(v, 10);
        folhaAberta = false;
        App.repintar();
      }
    }
  };

  Vistas.dia = {
    nav: 'hoje',
    cabecalho: function (p) {
      const d = DADOS.dia(p.id);
      return { voltar: '#/hoje', titulo: d ? d.titulo : 'Dia', linha: false };
    },
    html: function (p) {
      const dia = DADOS.dia(p.id);
      if (!dia) return '<div class="faixa"><p class="corpo-editorial">Dia não encontrado.</p></div>';
      const hoje = Estado.chave(Estado.agora()) === dia.data;
      return capaDia(dia) +
        '<div class="faixa">' + meteo(dia) + '</div>' +
        '<div class="faixa">' + programa(dia, hoje) + '</div>' +
        rodapeDia(dia);
    }
  };

  Vistas.preparacao = {
    nav: 'hoje',
    cabecalho: { voltar: '#/hoje', titulo: 'O que levar', tituloSempre: true },
    html: function () {
      return '<div class="faixa" style="padding-top:24px">' +
        '<h1 class="titulo-editorial">O que levar</h1>' +
        (DADOS.levar.length
          ? '<ul class="documento__lista" style="margin-top:16px">' +
              DADOS.levar.map(function (i) {
                return '<li class="documento__item"><span style="color:var(--verde)">' + Icone('verificado', 20) + '</span>' +
                  '<span class="corpo-editorial">' + UI.h(i) + '</span></li>';
              }).join('') +
            '</ul>'
          : '<p class="corpo-editorial silencioso" style="margin-top:16px">A lista ainda não está publicada.</p>') +
      '</div>' +
      (DADOS.notas.length ? '<div class="faixa">' +
        '<div class="seccao-cabecalho"><h2 class="etiqueta">Notas</h2></div>' +
        DADOS.notas.map(function (n) {
          return '<p class="corpo-editorial silencioso">' + UI.h(n) + '</p>';
        }).join('') +
      '</div>' : '');
    }
  };

  window.Programa = { momento: momento, programa: programa, capaDia: capaDia };
})();
