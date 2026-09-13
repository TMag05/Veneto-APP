/* =========================================================
   Hoje — a âncora de utilização diária
   Antes do passeio mostra a preparação; durante, o momento em
   curso; depois, o álbum. É sempre o primeiro ecrã.

   Durante, o Hoje mostra só o que está a acontecer agora — ou o
   que vem a seguir, se o grupo estiver entre dois momentos. Tocar
   abre a página desse momento, que é a página do sítio onde
   acontece. O dia inteiro está no roadbook.
   ========================================================= */

(function () {

  const TIPOS_MOMENTO = {
    partida: 'Partida', paragem: 'Paragem', visita: 'Visita',
    refeicao: 'Refeição', prova: 'Prova', logistica: 'Logística'
  };

  /* O momento em si: hora, o que acontece, onde, a alteração, a nota
     e o ritmo desde a paragem anterior. Serve à página do momento e
     aos capítulos do roadbook. */
  function corpoMomento(dia, m, i, rotulo, nivel) {
    const tag = nivel || 'h3';
    const de = m.poi && POIS[m.poi] ? poiAnterior(dia.momentos, i) : null;
    const t = de && de !== m.poi ? UI.troco(de, m.poi) : null;
    return '<div class="capitulo__cab num">' +
        '<span class="capitulo__hora">' + UI.h(m.hora) + (m.fim ? ' – ' + UI.h(m.fim) : '') + '</span>' +
        '<span class="capitulo__tipo">' + UI.h(rotulo !== undefined ? rotulo : (TIPOS_MOMENTO[m.tipo] || '')) + '</span>' +
      '</div>' +
      '<' + tag + ' class="capitulo__titulo">' + UI.h(m.titulo) + '</' + tag + '>' +
      (m.local ? '<p class="meta capitulo__local">' + UI.h(m.local) + '</p>' : '') +
      (m.alterado ? '<p class="corpo-ui capitulo__nota">' + UI.distintivo('Alterado', 'rosso') + ' Era às ' +
        UI.h(m.alterado.antes.replace(':', 'h')) + '. ' + UI.h(m.alterado.razao) + '.</p>' : '') +
      (m.nota ? '<p class="corpo-ui silencioso capitulo__nota">' + UI.h(m.nota) + '</p>' : '') +
      (t ? '<p class="capitulo__ritmo num">' + t.km + ' km desde ' + UI.h(POIS[de].nome) + ' · ' + UI.duracao(t.min) + '</p>' : '');
  }

  /* O momento a partir do endereço #/momento/dia/n. */
  function momentoEm(diaId, n) {
    const dia = DADOS.dia(diaId);
    const i = parseInt(n, 10);
    if (!dia || isNaN(i) || !dia.momentos[i]) return null;
    return { dia: dia, m: dia.momentos[i], i: i };
  }

  /* O que vem depois, para seguir o dia sem voltar ao Hoje. */
  function seguinteHtml(dia, i, rotulo) {
    const s = dia.momentos[i + 1];
    if (!s) return '';
    return '<div class="faixa"><div class="lista">' +
      UI.linhaLista({
        titulo: (rotulo || 'A seguir') + ', às ' + s.hora,
        nota: [s.titulo, s.local].filter(Boolean).join(' · '),
        href: '#/momento/' + dia.id + '/' + (i + 1)
      }) +
    '</div></div>';
  }

  /* ---------------------------------------------------------
     Um bloco de hora
     --------------------------------------------------------- */
  function bloco(dia, m, i, est) {
    const classes = ['momento'];
    if (m.alterado) classes.push('momento--alterado');
    if (est === 'passado') classes.push('momento--passado');
    if (est === 'agora' || est === 'seguinte') classes.push('momento--agora');

    let corpo = '';
    if (est === 'agora') corpo += '<span class="momento__estado">Agora</span>';
    if (est === 'seguinte') corpo += '<span class="momento__estado">A seguir</span>';
    if (m.alterado) corpo += '<span class="momento__distintivo">' + UI.distintivo('Alterado', 'rosso') + '</span>';
    corpo += '<span class="momento__titulo">' + UI.h(m.titulo) + '</span>';
    if (m.local) corpo += '<span class="meta momento__local">' + UI.h(m.local) + '</span>';
    if (m.alterado) {
      corpo += '<span class="corpo-ui momento__nota silencioso">Era às ' + UI.h(m.alterado.antes.replace(':', 'h')) +
        '. ' + UI.h(m.alterado.razao) + '.</span>';
    }

    return '<a class="' + classes.join(' ') + '" href="#/momento/' + dia.id + '/' + i + '">' +
      '<span class="momento__horas">' +
        '<span class="momento__hora num">' + UI.h(m.hora) + '</span>' +
        (m.fim ? '<span class="meta num momento__fim">' + UI.h(m.fim) + '</span>' : '') +
      '</span>' +
      '<span class="momento__corpo">' + corpo + '</span>' +
      '<span class="momento__seta">' + Icone('seta', 20) + '</span>' +
    '</a>';
  }

  /* O dia em blocos. Entre duas paragens, o ritmo do troço — dado
     ambiente, não instrução: o grupo segue a caravana. */
  function blocos(dia, comEstadoTemporal) {
    const atual = comEstadoTemporal ? indiceAtual(dia) : -1;
    const jaComecou = atual >= 0 && UI.horaAgora() >= UI.minutos(dia.momentos[atual].hora);

    return '<div class="programa">' + dia.momentos.map(function (m, i) {
      let est = 'futuro';
      if (comEstadoTemporal) {
        if (atual < 0 || i < atual) est = 'passado';
        else if (i === atual) est = jaComecou ? 'agora' : 'seguinte';
      }
      const de = m.poi && POIS[m.poi] ? poiAnterior(dia.momentos, i) : null;
      const t = de && de !== m.poi ? UI.troco(de, m.poi) : null;
      return (t ? '<p class="ritmo num">' + t.km + ' km · ' + UI.duracao(t.min) + '</p>' : '') +
        bloco(dia, m, i, est);
    }).join('') + '</div>';
  }

  /* A paragem de onde o grupo vem: o último momento anterior com
     paragem associada. É daí que se conta o troço. */
  function poiAnterior(momentos, i) {
    for (let n = i - 1; n >= 0; n--) {
      const p = momentos[n].poi;
      if (p && POIS[p]) return p;
    }
    return null;
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

  /* ---------------------------------------------------------
     Durante o passeio — o momento em curso
     A paisagem fica parada atrás; por cima, um só cartão: o que
     está a acontecer agora. Tocar abre a página do momento.
     --------------------------------------------------------- */

  function paisagem() {
    return '<svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
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

  /* O cartão do momento. Agora, se já começou; a seguir, se o grupo
     está entre dois momentos — na estrada, a caminho dele. */
  function cartaoAgora(dia, i) {
    const m = dia.momentos[i];
    const jaComecou = UI.horaAgora() >= UI.minutos(m.hora);
    const de = m.poi && POIS[m.poi] ? poiAnterior(dia.momentos, i) : null;
    const t = de && de !== m.poi ? UI.troco(de, m.poi) : null;

    return '<a class="agora" href="#/momento/' + dia.id + '/' + i + '">' +
      '<span class="agora__cab num">' +
        '<span class="agora__estado">' + (jaComecou ? 'Agora' : 'A seguir') + '</span>' +
        '<span class="agora__hora">' + UI.h(m.hora) + (m.fim ? ' – ' + UI.h(m.fim) : '') + '</span>' +
      '</span>' +
      (m.alterado ? '<span class="agora__alterado">' + UI.distintivo('Alterado', 'rosso') +
        ' Era às ' + UI.h(m.alterado.antes.replace(':', 'h')) + '. ' + UI.h(m.alterado.razao) + '.</span>' : '') +
      '<span class="agora__titulo">' + UI.h(m.titulo) + '</span>' +
      (m.local ? '<span class="agora__local">' + UI.h(m.local) + '</span>' : '') +
      (t ? '<span class="agora__ritmo num">' + t.km + ' km desde ' + UI.h(POIS[de].nome) + ' · ' + UI.duracao(t.min) + '</span>' : '') +
      '<span class="agora__seta">' + Icone('seta', 22) + '</span>' +
    '</a>';
  }

  function duranteHtml(dia) {
    const i = indiceAtual(dia);
    const jaComecou = i >= 0 && UI.horaAgora() >= UI.minutos(dia.momentos[i].hora);
    const s = i >= 0 ? dia.momentos[i + 1] : null;

    return '<div class="hoje-dia">' +
      '<div class="hoje-dia__fundo">' + paisagem() + '</div>' +

      '<div class="hoje-dia__abertura">' +
        '<p class="hoje-dia__data">Dia ' + dia.numero + (dia.data ? ' · ' + UI.dataCurta(dia.data) : '') + '</p>' +
        '<h1 class="hoje-dia__titulo">' + UI.h(dia.titulo || 'Etapa ' + dia.numero) + '</h1>' +
      '</div>' +

      (i >= 0
        ? cartaoAgora(dia, i)
        : '<div class="agora agora--fim">' +
            '<span class="agora__estado">Fim do dia</span>' +
            '<span class="agora__titulo">O programa de hoje terminou.</span>' +
          '</div>') +

      /* O que vem depois e o caminho para o dia inteiro, num só cartão —
         é ele que assenta em cima da barra de navegação. */
      '<div class="hoje-dia__seguinte faixa"><div class="lista">' +
        (s ? UI.linhaLista({
          titulo: (jaComecou ? 'A seguir' : 'Depois') + ', às ' + s.hora,
          nota: [s.titulo, s.local].filter(Boolean).join(' · '),
          href: '#/momento/' + dia.id + '/' + (i + 1)
        }) : '') +
        UI.linhaLista({ titulo: 'O dia inteiro no roadbook', href: '#/roadbook/' + dia.id }) +
      '</div></div>' +
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

  /* Como se anda na estrada. O campo pode faltar em conteúdo guardado
     antes de existir; nesse caso vale a semente. Vazio de propósito é
     vazio — a organização pode querer não o mostrar. */
  function formato() {
    const f = DADOS.evento.formato;
    return f === undefined ? SEMENTE.evento.formato : f;
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
            (formato() ? '<p class="corpo-editorial silencioso" style="margin-bottom:16px">' + UI.h(formato()) + '</p>' : '') +
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

  /* O dia sobre a paisagem só quando há, de facto, um dia com
     momentos para mostrar — sem itinerário publicado o convidado
     continua a ver o estado de espera com o cabeçalho normal. */
  function comDia() {
    if (Estado.fase() !== 'durante') return false;
    const dia = Estado.diaAtivo();
    return !!(dia && dia.momentos.length);
  }

  Vistas.hoje = {
    nav: 'hoje',
    semCabecalho: comDia,
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

      return duranteHtml(dia);
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
        '<div class="faixa">' + blocos(dia, hoje) + '</div>' +
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

  window.Programa = {
    blocos: blocos, capaDia: capaDia, indiceAtual: indiceAtual, poiAnterior: poiAnterior,
    corpoMomento: corpoMomento, momentoEm: momentoEm, seguinteHtml: seguinteHtml
  };
})();
