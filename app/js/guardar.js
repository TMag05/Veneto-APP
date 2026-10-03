/* =========================================================
   Guardar na galeria do telemóvel — uma, ou várias escolhidas
   (03.10.2026). O que se guarda é o original, como saiu da câmara,
   e vai para a galeria do telemóvel, nunca para um ficheiro: num
   telemóvel, um .zip não se abre em lado nenhum.

   No iPhone, a única porta de um site para as Fotografias é a folha
   de Partilhar, com «Guardar imagem» e «Guardar vídeo»: o que se
   descarrega acaba na app Ficheiros. No Android, o que se descarrega
   vai para Transferências, que a galeria mostra, e a folha de
   Partilhar de lá não tem onde guardar.

   A folha de Partilhar só abre dentro de um toque. Os originais do
   grupo vêm do servidor e podem demorar: a folha da app diz quanto
   já veio e, se o toque tiver passado, fica com um botão para o
   segundo.
   ========================================================= */

window.Guardar = (function () {

  const ESPERA = 400;      /* ms até a folha dizer que está a trazer os originais */
  const ENTRE = 400;       /* ms entre descargas, no Android: seguidas, o browser perde algumas */

  /* Os ficheiros, para a galeria: { nome, blob, tipo }.
       → 'galeria' | 'cancelado' | 'sem-toque' | 'descarregado' */
  function naGaleria(ficheiros) {
    let files = [];
    try {
      files = ficheiros.map(function (x) { return new File([x.blob], x.nome, { type: x.tipo }); });
    } catch (e) { files = []; /* sem File: descarrega-se */ }
    const partilha = UI.iphone && files.length && navigator.share && navigator.canShare &&
      navigator.canShare({ files: files });
    if (!partilha) return descarregarTodos(ficheiros).then(function () { return 'descarregado'; });
    /* Só os ficheiros: a folha é para os guardar, não para os mandar
       com uma mensagem. */
    return navigator.share({ files: files }).then(function () { return 'galeria'; }, function (e) {
      const erro = e && e.name;
      if (erro === 'NotAllowedError') return 'sem-toque';
      /* Fechou-se a folha, ou já havia uma aberta (dois toques). */
      if (erro === 'AbortError' || erro === 'InvalidStateError') return 'cancelado';
      return descarregarTodos(ficheiros).then(function () { return 'descarregado'; });
    });
  }

  function descarregarTodos(ficheiros) {
    return ficheiros.reduce(function (corrente, x, k) {
      return corrente.then(function () {
        UI.descarregar(x.nome, x.blob, x.tipo);
        if (k < ficheiros.length - 1) return new Promise(function (r) { setTimeout(r, ENTRE); });
      });
    }, Promise.resolve());
  }

  /* ---------------------------------------------------------
     Trazer os originais e entregá-los
     --------------------------------------------------------- */

  /* Duas fotografias do mesmo minuto teriam o mesmo nome. */
  function semRepetir(usados, nome) {
    if (!usados[nome]) { usados[nome] = 1; return nome; }
    const ponto = nome.lastIndexOf('.');
    const raiz = ponto > 0 ? nome.slice(0, ponto) : nome;
    const ext = ponto > 0 ? nome.slice(ponto) : '';
    usados[nome] += 1;
    return raiz + '-' + usados[nome] + ext;
  }

  function megas(bytes) {
    return (bytes / 1048576).toLocaleString('pt-PT', { maximumFractionDigits: bytes < 10485760 ? 1 : 0 });
  }

  function soVideos(lista) { return lista.every(function (f) { return Fotos.ehVideo(f); }); }
  function soImagens(lista) { return !lista.some(function (f) { return Fotos.ehVideo(f); }); }

  function titulo(lista) {
    if (lista.length > 1) return 'Guardar na galeria';
    return Fotos.ehVideo(lista[0]) ? 'Guardar o vídeo' : 'Guardar a fotografia';
  }

  /* O nome da opção na folha de Partilhar do iPhone. Serve para as da
     galeria e para os ficheiros prontos: os dois trazem o tipo. */
  function opcaoIphone(lista) {
    const n = lista.length;
    if (soImagens(lista)) return n === 1 ? '«Guardar imagem»' : '«Guardar ' + n + ' imagens»';
    if (soVideos(lista)) return n === 1 ? '«Guardar vídeo»' : '«Guardar ' + n + ' vídeos»';
    return 'a opção Guardar';
  }

  function folha(lista, corpo) { UI.abrirFolha(titulo(lista), corpo); }

  function texto(t) { return '<p class="corpo-ui silencioso">' + t + '</p>'; }

  /* Um de cada vez: são vários megabytes cada, e o telemóvel não os
     deve ter todos a chegar ao mesmo tempo. */
  function preparar(lista, avanco, desistiu) {
    const ficheiros = [];
    const falharam = [];
    const usados = {};
    return lista.reduce(function (corrente, f, k) {
      return corrente.then(function () {
        if (desistiu()) return;
        avanco(k, 0, 0);
        return Promise.all([
          Fotos.obter(f.id, 'original', function (lidos, total) { avanco(k, lidos, total); }).catch(function () { return null; }),
          Fotos.ler(f.id).catch(function () { return null; })
        ]).then(function (x) {
          const blob = x[0];
          if (!blob) { falharam.push(f.id); return; }
          const tipo = (x[1] && x[1].tipo) || f.tipo || blob.type || 'image/jpeg';
          ficheiros.push({ id: f.id, nome: semRepetir(usados, UI.nomeDeFoto(f, tipo)), blob: blob, tipo: tipo });
        });
      });
    }, Promise.resolve()).then(function () { return { ficheiros: ficheiros, falharam: falharam }; });
  }

  let aGuardar = 0;   /* o pedido em curso; um toque novo esquece o anterior */

  /* fotos: as da galeria (Estado.fotos), uma ou várias.
     opcoes.botao      — a classe do botão, na cor de acento do ecrã
     opcoes.aoAcabar(falharam) — guardadas, menos as que não vieram */
  function fotos(lista, opcoes) {
    const o = opcoes || {};
    if (!lista.length) return;
    const pedido = ++aGuardar;
    let aEsperar = false;
    const elFolha = document.getElementById('folha');
    function desistiu() { return pedido !== aGuardar || (aEsperar && elFolha.hidden); }

    const temporizador = setTimeout(function () {
      aEsperar = true;
      folha(lista, texto(lista.length === 1 ? 'A trazer o original, como saiu da câmara.' : 'A trazer os originais, como saíram da câmara.') +
        '<p class="meta num" style="margin-top:16px" id="guardar-conta"></p>');
    }, ESPERA);

    function avanco(k, lidos, total) {
      const conta = document.getElementById('guardar-conta');
      if (!conta) return;
      const partes = [];
      if (lista.length > 1) partes.push((k + 1) + ' de ' + lista.length);
      if (lidos) partes.push(total ? megas(lidos) + ' de ' + megas(total) + ' MB' : megas(lidos) + ' MB');
      conta.textContent = partes.join(' · ');
    }

    preparar(lista, avanco, desistiu).then(function (r) {
      clearTimeout(temporizador);
      if (desistiu()) return;
      if (!r.ficheiros.length) { semOriginais(lista, o); return; }
      naGaleria(r.ficheiros).then(function (resultado) {
        if (resultado === 'sem-toque') pronto(lista, r, o);
        else if (resultado === 'cancelado') { if (aEsperar) UI.fecharFolha(); }
        else concluir(lista, r, o);
      });
    });
  }

  /* O toque já passou: os originais ficam prontos, à espera de outro. */
  function pronto(lista, r, o) {
    const vieram = r.ficheiros;
    const um = vieram.length === 1;
    const frase = um ? (Fotos.ehVideo(vieram[0]) ? 'O vídeo está pronto.' : 'A fotografia está pronta.') : 'Está tudo pronto.';
    folha(lista, texto(frase + ' No ecrã seguinte, escolha ' + opcaoIphone(vieram) + '.') +
      '<button class="botao ' + (o.botao || 'botao--principal') + ' botao--largo" style="margin-top:24px" type="button" id="btn-guardar-galeria">' +
        Icone('descarregar', 20) + 'Guardar nas Fotografias</button>');
    document.getElementById('btn-guardar-galeria').addEventListener('click', function () {
      naGaleria(vieram).then(function (resultado) {
        /* Se fechou a folha de Partilhar sem guardar, o botão fica. */
        if (resultado === 'galeria' || resultado === 'descarregado') concluir(lista, r, o);
      });
    });
  }

  /* Guardadas. As que não vieram ficam escolhidas, para outra vez. */
  function concluir(lista, r, o) {
    if (r.falharam.length) {
      const faltam = lista.filter(function (f) { return r.falharam.indexOf(f.id) >= 0; });
      const uma = faltam.length === 1;
      folha(lista, texto((uma ? 'Não veio ' : 'Não vieram ') + UI.contagemGaleria(faltam) +
        ': a ligação não chegou para trazer ' + (uma ? 'o original.' : 'os originais.') +
        (uma ? ' Fica' : ' Ficam') + ' na seleção, para tentar de novo.'));
    } else {
      UI.fecharFolha();
    }
    if (o.aoAcabar) o.aoAcabar(r.falharam);
  }

  /* Nenhum original veio: sem rede, ou a ligação não chegou. */
  function semOriginais(lista, o) {
    const um = lista.length === 1;
    const de = um ? (Fotos.ehVideo(lista[0]) ? ' deste vídeo' : ' desta fotografia') : '';
    if (!navigator.onLine) {
      folha(lista, texto((um ? 'O original' + de + ' está' : 'Os originais estão') + ' no servidor. Tente de novo com rede.'));
      return;
    }
    folha(lista, texto('A ligação não chegou para trazer ' + (um ? 'o original' + de : 'os originais') + '.') +
      '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" id="btn-guardar-outra">Tentar de novo</button>');
    document.getElementById('btn-guardar-outra').addEventListener('click', function () {
      UI.fecharFolha();
      fotos(lista, o);
    });
  }

  /* ---------------------------------------------------------
     Escolher várias
     Como nas Fotografias do iPhone: «Selecionar» por cima da grelha,
     e a partir daí um toque escolhe, em vez de abrir. A barra de baixo
     diz quantas e guarda-as. A escolha sobrevive às repinturas — as
     do grupo chegam de cinco em cinco segundos — e acaba ao sair do
     ecrã. Cada ecrã junta as ações dela às suas (selecao.acoes).
       opcoes.botao — a classe do botão de guardar, no acento do ecrã
     --------------------------------------------------------- */

  function selecao(opcoes) {
    const botao = (opcoes && opcoes.botao) || 'botao--principal';
    let ativa = false;
    let ids = [];

    function escolhidas() {
      const marcadas = {};
      ids.forEach(function (id) { marcadas[id] = true; });
      return Estado.fotos().filter(function (f) { return f.id && marcadas[f.id]; });
    }

    function contagem(lista) {
      return lista.length ? UI.contagemGaleria(lista) : 'Toque para escolher.';
    }

    function atualizarBarra() {
      const lista = escolhidas();
      const conta = document.querySelector('[data-selecao-conta]');
      const guardar = document.querySelector('[data-acao="guardarEscolhidas"]');
      if (conta) conta.textContent = contagem(lista);
      if (guardar) guardar.disabled = !lista.length;
    }

    function sair() { ativa = false; ids = []; }

    return {
      ativa: function () { return ativa; },
      /* Ao sair do ecrã, sem repintar. */
      limpar: sair,

      /* A linha por cima da grelha: um texto à esquerda, se o ecrã o
         quiser, e o botão de entrar e sair. */
      topo: function (esquerda) {
        return '<div class="selecao-topo">' +
          '<p class="meta">' + UI.h(esquerda || '') + '</p>' +
          '<button class="escolha" type="button" data-acao="selecionar">' + (ativa ? 'Cancelar' : 'Selecionar') + '</button>' +
        '</div>';
      },

      /* A célula de uma fotografia enquanto se escolhe: um botão, com
         o círculo no canto. O visto diz que está escolhida, não só a cor. */
      celula: function (f, dentro, rotulo) {
        const sim = ids.indexOf(f.id) >= 0;
        return '<button class="grelha-fotos__celula" type="button" data-acao="escolher" data-valor="' + UI.h(f.id) + '" ' +
          'aria-pressed="' + sim + '" aria-label="' + UI.h(rotulo) + '">' + dentro +
          '<span class="grelha-fotos__escolha" aria-hidden="true">' + Icone('verificado', 16) + '</span>' +
        '</button>';
      },

      barra: function () {
        const lista = escolhidas();
        return '<div class="selecao barra-inferior">' +
          '<p class="selecao__conta corpo-ui num" data-selecao-conta aria-live="polite">' + UI.h(contagem(lista)) + '</p>' +
          '<button class="botao ' + botao + '" type="button" data-acao="guardarEscolhidas"' + (lista.length ? '' : ' disabled') + '>' +
            Icone('descarregar', 20) + 'Guardar na galeria</button>' +
        '</div>';
      },

      acoes: {
        selecionar: function () {
          if (ativa) sair(); else { ativa = true; ids = []; }
          App.repintar();
        },
        escolher: function (id, el) {
          const k = ids.indexOf(id);
          if (k >= 0) ids.splice(k, 1); else ids.push(id);
          if (el) el.setAttribute('aria-pressed', String(k < 0));
          atualizarBarra();
        },
        guardarEscolhidas: function () {
          fotos(escolhidas(), {
            botao: botao,
            aoAcabar: function (falharam) {
              if (falharam.length) ids = falharam.slice(); else sair();
              App.repintar();
            }
          });
        }
      }
    };
  }

  return {
    naGaleria: naGaleria,
    fotos: fotos,
    selecao: selecao
  };
})();
