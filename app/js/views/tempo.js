/* =========================================================
   O tempo — o cartão do Hoje e a página de detalhe
   No canto superior direito do Hoje, sobre a fotografia, o
   resumo: o céu, a máxima, a mínima e a chuva prevista, uma
   linha por zona quando as zonas diferem. Até às 19:00 é só
   hoje; daí para a frente, hoje e amanhã. Por baixo, a linha dos
   dias, com a máxima e a mínima de cada um. Tocar abre #/tempo:
   todos os dias que faltam, por local, com o vento, a sensação
   térmica e a humidade de cada um (30.09.2026). A chuva diz-se em milímetros: o MET Norway, que
   é a fonte, não dá a probabilidade fora dos países nórdicos.
   ========================================================= */

(function () {

  const CEU = {
    'sol': 'Céu limpo', 'pouco-nublado': 'Pouco nublado', 'nuvem': 'Nublado',
    'nevoeiro': 'Nevoeiro', 'chuva': 'Chuva', 'neve': 'Neve', 'trovoada': 'Trovoada'
  };
  const RUMOS = {
    N: 'norte', NE: 'nordeste', E: 'este', SE: 'sudeste',
    S: 'sul', SO: 'sudoeste', O: 'oeste', NO: 'noroeste'
  };

  function numero(x) { return typeof x === 'number' && isFinite(x); }

  /* Com o sinal de menos tipográfico: −2°, não -2°. */
  function grau(n) {
    return numero(n) ? (n < 0 ? '−' + Math.abs(n) : String(n)) + '°' : '—';
  }

  function decimal(n) { return String(n).replace('.', ','); }

  /* Milímetros: uma casa decimal abaixo de dez. */
  function mm(n) {
    if (!numero(n) || n < 0.1) return '0 mm';
    return (n < 10 ? decimal(Math.round(n * 10) / 10) : Math.round(n)) + ' mm';
  }

  function chuvaPorExtenso(n) {
    return !numero(n) || n < 0.1 ? 'Sem chuva prevista' : mm(n) + ' previstos';
  }


  function sensacao(v) {
    if (!numero(v.sensMin) || !numero(v.sensMax)) return '—';
    return v.sensMin === v.sensMax ? grau(v.sensMin) : grau(v.sensMin) + ' a ' + grau(v.sensMax);
  }

  /* «hoje, às 14:07», «ontem, às 22:07» ou «29 de setembro, às 22:07». */
  function quando(d) {
    const hoje = Estado.chave(Estado.agora());
    /* A hora de Itália, como o resto da app. */
    const p = {};
    try {
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    } catch (e) {
      p.year = d.getFullYear(); p.month = String(d.getMonth() + 1).padStart(2, '0'); p.day = String(d.getDate()).padStart(2, '0');
      p.hour = String(d.getHours()).padStart(2, '0'); p.minute = String(d.getMinutes()).padStart(2, '0');
    }
    const data = p.year + '-' + p.month + '-' + p.day;
    const ontem = new Date(hoje + 'T00:00:00');
    ontem.setDate(ontem.getDate() - 1);
    const dia = data === hoje ? 'hoje' : data === Estado.chave(ontem) ? 'ontem' : UI.dataCurta(data);
    return dia + ', às ' + String(Number(p.hour) % 24).padStart(2, '0') + ':' + p.minute;
  }

  /* ---------------------------------------------------------
     O cartão do Hoje
     --------------------------------------------------------- */

  function rotuloAcessivel(dias) {
    return 'O tempo. ' + dias.map(function (d) {
      return d.rotulo + ': ' + d.linhas.map(function (l) {
        const v = l.valores;
        return (l.nome ? l.nome + ', ' : '') + (CEU[v.simbolo] || '').toLowerCase() +
          ', máxima ' + grau(v.max) + ', mínima ' + grau(v.min) + ', ' + chuvaPorExtenso(v.chuva).toLowerCase();
      }).join('; ');
    }).join('. ') + '. Abre a previsão de todos os dias.';
  }

  /* A linha dos dias: duas linhas finas, a máxima por cima e a
     mínima por baixo, com um ponto por dia que falta e o de hoje
     aceso. Diz, sem uma palavra, que há mais dias por trás do cartão
     — e a forma deles: o dia frio da montanha vê-se de relance. É o
     desenho do perfil das Etapas, com a temperatura no lugar da
     altitude (01.10.2026). Com um dia só, não há linha. */
  const CURVA = { alto: 32, margem: 5, lado: 4 };

  function linhaDosDias() {
    const dias = Tempo.curva();
    if (dias.length < 2) return '';
    const alta = Math.max.apply(null, dias.map(function (d) { return d.max; }));
    const baixa = Math.min.apply(null, dias.map(function (d) { return d.min; }));
    const amplitude = Math.max(1, alta - baixa);
    function x(i) { return CURVA.lado + i * (100 - 2 * CURVA.lado) / (dias.length - 1); }
    function y(t) { return CURVA.margem + (alta - t) / amplitude * (CURVA.alto - 2 * CURVA.margem); }
    function arred(n) { return Math.round(n * 10) / 10; }
    function traco(k) {
      return dias.map(function (d, i) { return arred(x(i)) + ',' + arred(y(d[k])); }).join(' ');
    }
    function pontos(k) {
      return dias.map(function (d, i) {
        return '<i class="tempo__ponto tempo__ponto--' + k + (d.aceso ? ' tempo__ponto--aceso' : '') +
          '" style="left:' + arred(x(i)) + '%;top:' + arred(y(d[k])) + 'px"></i>';
      }).join('');
    }
    return '<span class="tempo__curva" aria-hidden="true">' +
      '<svg viewBox="0 0 100 ' + CURVA.alto + '" preserveAspectRatio="none" focusable="false">' +
        '<polyline class="tempo__curva-max" points="' + traco('max') + '"/>' +
        '<polyline class="tempo__curva-min" points="' + traco('min') + '"/>' +
      '</svg>' +
      pontos('max') + pontos('min') +
    '</span>';
  }

  /* O resumo, ou nada se não houver previsão para mostrar. Os dias
     levam nome só quando amanhã está à vista. */
  function cartao() {
    const dias = Tempo.dias();
    if (!dias.length) return '';
    const comNome = dias.some(function (d) { return d.rotulo !== 'Hoje'; });
    const comZonas = dias.some(function (d) { return d.linhas.length > 1; });
    return '<a class="tempo' + (comZonas ? '' : ' tempo--sem-zonas') + '" href="#/tempo" aria-label="' + UI.h(rotuloAcessivel(dias)) + '">' +
      dias.map(function (d) {
        return (comNome ? '<span class="tempo__dia">' + d.rotulo + '</span>' : '') +
          d.linhas.map(function (l) {
            const v = l.valores;
            return '<span class="tempo__linha num">' +
              '<span class="tempo__ceu">' + Icone(v.simbolo, 18) + '</span>' +
              (comZonas ? '<span class="tempo__zona">' + UI.h(l.curto) + '</span>' : '') +
              '<span class="tempo__max">' + grau(v.max) + '</span>' +
              '<span class="tempo__min">' + grau(v.min) + '</span>' +
              '<span class="tempo__chuva">' + Icone('gota', 14) + mm(v.chuva) + '</span>' +
            '</span>';
          }).join('');
      }).join('') +
      linhaDosDias() +
    '</a>';
  }

  /* ---------------------------------------------------------
     O detalhe — #/tempo
     --------------------------------------------------------- */

  /* Um local: o céu, a máxima e a mínima; por baixo, numa fila, a
     chuva, o vento, a sensação térmica e a humidade. */
  function zona(l) {
    const v = l.valores;
    return '<div class="tempo-zona">' +
      '<div class="tempo-zona__cab">' +
        '<span class="tempo-zona__ceu">' + Icone(v.simbolo, 24) + '</span>' +
        '<span class="tempo-zona__nome">' +
          (l.nome ? '<span class="titulo-ui">' + UI.h(l.nome) + '</span>' : '') +
          '<span class="meta">' + UI.h([CEU[v.simbolo] || '', numero(l.altitude) ? l.altitude + ' m' : ''].filter(Boolean).join(' · ')) + '</span>' +
        '</span>' +
        '<span class="tempo-zona__temps num">' +
          '<span class="tempo-zona__max">' + grau(v.max) + '</span>' +
          '<span class="tempo-zona__min">' + grau(v.min) + '</span>' +
        '</span>' +
      '</div>' +
      '<dl class="tempo-zona__dados num">' +
        '<div><dt>Chuva</dt><dd>' + mm(v.chuva) + '</dd></div>' +
        '<div><dt>Vento</dt><dd>' + (numero(v.vento) ? v.vento + ' km/h' : '—') +
          (RUMOS[v.rumo] ? '<span class="tempo-zona__rumo">de ' + RUMOS[v.rumo] + '</span>' : '') + '</dd></div>' +
        '<div><dt>Sensação</dt><dd>' + sensacao(v) + '</dd></div>' +
        '<div><dt>Humidade</dt><dd>' + (numero(v.humidade) ? v.humidade + '%' : '—') + '</dd></div>' +
      '</dl>' +
    '</div>';
  }

  /* «Hoje · Dia 2 · 2 de outubro». O número e a data de um dia estão
     sempre à vista, mesmo por revelar. */
  function cabecalhoDia(d) {
    return [d.rotulo, d.dia && d.dia.etiqueta, UI.dataCurta(d.data)].filter(Boolean).join(' · ');
  }

  Vistas.tempo = {
    nav: 'hoje',
    cabecalho: { voltar: '#/hoje', titulo: 'O tempo' },
    html: function () {
      const dias = Tempo.todos();
      const feito = Tempo.atualizado();
      return '<div class="faixa" style="padding-top:24px">' +
          '<h1 class="titulo-editorial">O tempo</h1>' +
        '</div>' +
        (dias.length
          ? dias.map(function (d) {
              return '<div class="faixa">' +
                '<div class="seccao-cabecalho"><h2 class="etiqueta">' + UI.h(cabecalhoDia(d)) + '</h2></div>' +
                '<div class="pilha-2">' + d.linhas.map(zona).join('') + '</div>' +
              '</div>';
            }).join('') +
            '<div class="faixa">' +
              '<p class="meta">Sensação térmica do dia inteiro; vento e humidade das 08:00 às 20:00. ' +
                'Previsão do MET Norway' + (feito ? ', atualizada ' + quando(feito) : '') + '.</p>' +
            '</div>'
          : '<div class="faixa">' +
              '<p class="corpo-editorial silencioso">' +
                (feito ? 'A previsão aparece aqui durante o passeio.' : 'A previsão aparece aqui quando houver rede.') +
              '</p>' +
            '</div>');
    }
  };

  window.Previsao = { cartao: cartao };
})();
