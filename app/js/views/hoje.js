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
    partida: 'Partida', estrada: 'Estrada', paragem: 'Paragem', visita: 'Visita',
    refeicao: 'Refeição', prova: 'Prova', logistica: 'Logística'
  };

  /* O troço desde a paragem anterior, ou nada se o sítio é o mesmo. */
  function trocoAte(dia, m, i) {
    const de = m.poi && POIS[m.poi] ? poiAnterior(dia.momentos, i) : null;
    if (!de || de === m.poi) return null;
    const t = UI.troco(de, m.poi);
    return t.km > 0 ? { de: de, km: t.km, min: t.min } : null;
  }

  /* Já começou? Sem hora de início mas com fim («até às 10:00») é
     porque está a decorrer; sem hora nenhuma, ainda está por vir. */
  function comecou(m) {
    if (!m.hora) return !!m.fim;
    return UI.horaAgora() >= UI.minutos(m.hora);
  }

  /* «A seguir, às 18:00» — ou só «A seguir» se a hora não está fechada. */
  function rotuloSeguinte(rotulo, s) {
    if (s.hora) return rotulo + ', às ' + s.hora;
    if (s.fim) return rotulo + ', até às ' + s.fim;
    return rotulo;
  }

  /* O momento em si: hora, o que acontece, onde, a alteração, a nota
     e o ritmo desde a paragem anterior. Serve à página do momento e
     aos capítulos do roadbook. */
  function corpoMomento(dia, m, i, rotulo, nivel) {
    const tag = nivel || 'h3';
    const t = trocoAte(dia, m, i);
    return '<div class="capitulo__cab num">' +
        '<span class="capitulo__hora">' + UI.h(UI.horario(m)) + '</span>' +
        '<span class="capitulo__tipo">' + UI.h(rotulo !== undefined ? rotulo : (TIPOS_MOMENTO[m.tipo] || '')) + '</span>' +
      '</div>' +
      '<' + tag + ' class="capitulo__titulo">' + UI.h(m.titulo) + '</' + tag + '>' +
      (m.local ? '<p class="meta capitulo__local">' + UI.h(m.local) + '</p>' : '') +
      (m.alterado ? '<p class="corpo-ui capitulo__nota">' + UI.distintivo('Alterado', 'rosso') + ' Era às ' +
        UI.h(m.alterado.antes.replace(':', 'h')) + '. ' + UI.h(m.alterado.razao) + '.</p>' : '') +
      (m.nota ? '<p class="corpo-ui silencioso capitulo__nota">' + UI.h(m.nota) + '</p>' : '') +
      (t ? '<p class="capitulo__ritmo num">' + t.km + ' km desde ' + UI.h(POIS[t.de].nome) + ' · ' + UI.duracao(t.min) + '</p>' : '');
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
        titulo: rotuloSeguinte(rotulo || 'A seguir', s),
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
        '<span class="momento__hora num">' + UI.h(m.hora || '—') + '</span>' +
        (m.fim ? '<span class="meta num momento__fim">' + (m.hora ? '' : 'até ') + UI.h(m.fim) + '</span>' : '') +
      '</span>' +
      '<span class="momento__corpo">' + corpo + '</span>' +
      '<span class="momento__seta">' + Icone('seta', 20) + '</span>' +
    '</a>';
  }

  /* O dia em blocos. Entre duas paragens, o ritmo do troço — dado
     ambiente, não instrução: o grupo segue a caravana. */
  function blocos(dia, comEstadoTemporal) {
    const atual = comEstadoTemporal ? indiceAtual(dia) : -1;
    const jaComecou = atual >= 0 && comecou(dia.momentos[atual]);

    return '<div class="programa">' + dia.momentos.map(function (m, i) {
      let est = 'futuro';
      if (comEstadoTemporal) {
        if (atual < 0 || i < atual) est = 'passado';
        else if (i === atual) est = jaComecou ? 'agora' : 'seguinte';
      }
      const t = trocoAte(dia, m, i);
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

  /* A hora em que começa o próximo momento com hora marcada. */
  function proximoInicio(momentos, i) {
    for (let n = i + 1; n < momentos.length; n++) {
      if (momentos[n].hora) return UI.minutos(momentos[n].hora);
    }
    return null;
  }

  /* Qual é o momento em curso — ou o próximo, se estivermos entre dois.
     Sem fim marcado, um momento dura uma hora, mas nunca para lá do
     início do seguinte; sem hora nenhuma, fica à espera até ao
     próximo momento que a tenha. */
  function indiceAtual(dia) {
    const agora = UI.horaAgora();
    const ms = dia.momentos;
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i];
      const seg = proximoInicio(ms, i);
      let fim;
      if (m.fim) fim = UI.minutos(m.fim);
      else if (m.hora) fim = Math.min(UI.minutos(m.hora) + 60, seg === null ? Infinity : seg);
      else fim = seg === null ? 24 * 60 : seg;
      if (agora < fim) return i;
    }
    return -1;
  }

  /* ---------------------------------------------------------
     Durante o passeio — o momento em curso
     Atrás, parada, a imagem do momento: a fotografia do sítio, ou
     o gráfico de logística; por cima, um só cartão com o que está
     a acontecer agora. Tocar abre a página do momento.
     --------------------------------------------------------- */

  /* A imagem de um momento: a sua própria, a do sítio onde acontece.
     Sem sítio — o transfer para o jantar, um troço de estrada — é a
     do sítio de onde o grupo vem; na estrada, a do sítio para onde
     vai, a não ser que seja o regresso ao hotel. Por fim, a do dia. */
  function imagemDoMomento(dia, i) {
    const ms = dia.momentos;
    const m = i >= 0 ? ms[i] : null;
    if (!m) return dia.imagem;
    if (m.imagem) return m.imagem;
    if (m.poi && POIS[m.poi]) return POIS[m.poi].imagem;
    if (m.tipo === 'estrada') {
      for (let n = i + 1; n < ms.length; n++) {
        const p = ms[n].poi && POIS[ms[n].poi];
        if (p) { if (p.tipo !== 'hotel') return p.imagem; break; }
      }
    }
    const ant = poiAnterior(ms, i);
    return ant ? POIS[ant].imagem : dia.imagem;
  }

  /* O cartão do momento. Agora, se já começou; a seguir, se o grupo
     está entre dois momentos — na estrada, a caminho dele. */
  function cartaoAgora(dia, i) {
    const m = dia.momentos[i];
    const t = trocoAte(dia, m, i);

    return '<a class="agora" href="#/momento/' + dia.id + '/' + i + '">' +
      '<span class="agora__cab num">' +
        '<span class="agora__estado">' + (comecou(m) ? 'Agora' : 'A seguir') + '</span>' +
        '<span class="agora__hora">' + UI.h(UI.horario(m)) + '</span>' +
      '</span>' +
      (m.alterado ? '<span class="agora__alterado">' + UI.distintivo('Alterado', 'rosso') +
        ' Era às ' + UI.h(m.alterado.antes.replace(':', 'h')) + '. ' + UI.h(m.alterado.razao) + '.</span>' : '') +
      '<span class="agora__titulo">' + UI.h(m.titulo) + '</span>' +
      (m.local ? '<span class="agora__local">' + UI.h(m.local) + '</span>' : '') +
      (t ? '<span class="agora__ritmo num">' + t.km + ' km desde ' + UI.h(POIS[t.de].nome) + ' · ' + UI.duracao(t.min) + '</span>' : '') +
      '<span class="agora__seta">' + Icone('seta', 22) + '</span>' +
    '</a>';
  }

  function duranteHtml(dia) {
    const i = indiceAtual(dia);
    const m = i >= 0 ? dia.momentos[i] : null;
    const s = i >= 0 ? dia.momentos[i + 1] : null;

    return '<div class="hoje-dia">' +
      '<div class="hoje-dia__fundo" style="background-image:' + UI.imagemDe(imagemDoMomento(dia, i), 0.46) + '"></div>' +

      '<div class="hoje-dia__abertura">' +
        '<p class="hoje-dia__data">Dia ' + dia.numero + (dia.data ? ' · ' + UI.dataCurta(dia.data) : '') + '</p>' +
        '<h1 class="hoje-dia__titulo">' + UI.h(dia.titulo || 'Etapa ' + dia.numero) + '</h1>' +
      '</div>' +

      (m
        ? cartaoAgora(dia, i)
        : '<div class="agora agora--fim">' +
            '<span class="agora__estado">Fim do dia</span>' +
            '<span class="agora__titulo">O programa de hoje terminou.</span>' +
          '</div>') +

      /* O que vem depois — é o último cartão, e assenta em cima da
         barra de navegação. */
      (s ? '<div class="hoje-dia__seguinte faixa"><div class="lista">' +
        UI.linhaLista({
          titulo: rotuloSeguinte(comecou(m) ? 'A seguir' : 'Depois', s),
          nota: [s.titulo, s.local].filter(Boolean).join(' · '),
          href: '#/momento/' + dia.id + '/' + (i + 1)
        }) +
      '</div></div>' : '') +
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
        '<p class="meta" style="margin-top:12px">Aparece aqui assim que estiver.</p>' +
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

  /* A história de uma paragem abre quando o grupo lá chega, segundo o
     programa. O grupo anda em caravana: a hora do itinerário sabe onde
     toda a gente está melhor do que um toque no ecrã — e funciona num
     vale sem rede, que é onde estas estradas passam. */
  function abertoAgora(poiId) {
    if (!poiId) return false;
    const hoje = Estado.chave(Estado.agora());
    const agora = UI.horaAgora();

    return DADOS.dias.some(function (d) {
      if (!d.data || d.data > hoje) return false;
      const naEtapa = d.etapas.indexOf(poiId) >= 0;
      const momentos = d.momentos.filter(function (m) { return m.poi === poiId; });
      if (!naEtapa && !momentos.length) return false;

      /* Dia passado: está tudo aberto. */
      if (d.data < hoje) return true;

      /* Hoje: abre à hora do momento. Sem hora marcada, abre com o dia. */
      if (!momentos.length) return true;
      return momentos.some(function (m) { return !m.hora || agora >= UI.minutos(m.hora); });
    });
  }

  window.Programa = {
    blocos: blocos, capaDia: capaDia, indiceAtual: indiceAtual, poiAnterior: poiAnterior,
    abertoAgora: abertoAgora,
    corpoMomento: corpoMomento, momentoEm: momentoEm, seguinteHtml: seguinteHtml,
    imagemDoMomento: imagemDoMomento
  };
})();
