/* =========================================================
   Arquivo de fotografias
   O ficheiro que saiu da câmara, inteiro, numa base do próprio
   telemóvel. O localStorage guarda só os metadados — nome, dia,
   paragem, hora — porque é isso que lá cabe. Guardar a imagem
   no localStorage enchia a quota à décima sétima fotografia e a
   app apagava a mais antiga sem dizer nada a ninguém.
   ========================================================= */

window.Fotos = (function () {

  const BASE = 'veneto-fotos';
  const LOJA = 'ficheiros';

  let ligacao = null;

  function abrir() {
    if (ligacao) return ligacao;
    ligacao = new Promise(function (resolver, recusar) {
      if (!window.indexedDB) { recusar(new Error('sem base local')); return; }
      const p = indexedDB.open(BASE, 1);
      p.onupgradeneeded = function () {
        const bd = p.result;
        if (!bd.objectStoreNames.contains(LOJA)) bd.createObjectStore(LOJA, { keyPath: 'id' });
      };
      p.onsuccess = function () { resolver(p.result); };
      p.onerror = function () { recusar(p.error); };
      p.onblocked = function () { recusar(new Error('base ocupada')); };
    });
    /* Uma falha não fica presa: a tentativa seguinte volta a abrir. */
    ligacao.catch(function () { ligacao = null; });
    return ligacao;
  }

  /* A transação fecha-se sozinha assim que o navegador volta ao
     ciclo de eventos — o pedido tem de ser feito aqui dentro. */
  function com(modo, fn) {
    return abrir().then(function (bd) {
      return pedido(fn(bd.transaction(LOJA, modo).objectStore(LOJA)));
    });
  }

  function pedido(req) {
    return new Promise(function (resolver, recusar) {
      req.onsuccess = function () { resolver(req.result); };
      req.onerror = function () { recusar(req.error); };
    });
  }

  /* ---------------------------------------------------------
     Ficheiros
     --------------------------------------------------------- */

  /* registo: { id, original, mini, vista, tipo, largura, altura, criado } */
  function guardar(registo) { return com('readwrite', function (l) { return l.put(registo); }); }
  function ler(id) { return com('readonly', function (l) { return l.get(id); }); }
  function apagar(id) { libertar(id); return com('readwrite', function (l) { return l.delete(id); }); }
  function chaves() { return com('readonly', function (l) { return l.getAllKeys(); }); }
  function limpar() { libertarTodos(); return com('readwrite', function (l) { return l.clear(); }); }

  /* Quanto ocupa o arquivo neste telemóvel, em bytes. */
  function ocupacao() {
    return com('readonly', function (l) { return l.getAll(); }).then(function (rs) {
      return (rs || []).reduce(function (t, r) {
        return t + ['original', 'mini', 'vista'].reduce(function (s, k) {
          return s + (r[k] && r[k].size ? r[k].size : 0);
        }, 0);
      }, 0);
    }).catch(function () { return 0; });
  }

  /* ---------------------------------------------------------
     Endereços temporários
     Um blob: por fotografia e por tamanho, reaproveitado entre
     repintagens e devolvido ao sair do ecrã. Sem isto, cada
     repintagem deixava para trás um endereço que ninguém fecha.
     --------------------------------------------------------- */

  const enderecos = {};

  function url(id, tamanho) {
    const t = tamanho || 'mini';
    const chave = id + '/' + t;
    if (enderecos[chave]) return Promise.resolve(enderecos[chave]);
    return ler(id).then(function (r) {
      const b = r && (r[t] || r.original);
      if (!b) return null;
      enderecos[chave] = URL.createObjectURL(b);
      return enderecos[chave];
    }).catch(function () { return null; });
  }

  function libertar(id) {
    Object.keys(enderecos).forEach(function (k) {
      if (k.indexOf(id + '/') === 0) { URL.revokeObjectURL(enderecos[k]); delete enderecos[k]; }
    });
  }

  function libertarTodos() {
    Object.keys(enderecos).forEach(function (k) { URL.revokeObjectURL(enderecos[k]); delete enderecos[k]; });
  }

  /* As vistas desenham <img data-foto="id" data-tamanho="mini"> sem
     endereço — o HTML é síncrono e a base não é. Isto preenche-os
     depois, pela ordem em que aparecem no ecrã. */
  function pintar(raiz) {
    const alvos = (raiz || document).querySelectorAll('img[data-foto]:not([src])');
    Array.prototype.forEach.call(alvos, function (img) {
      url(img.dataset.foto, img.dataset.tamanho).then(function (u) {
        if (u && img.isConnected) img.src = u;
      });
    });
  }

  return {
    guardar: guardar,
    ler: ler,
    apagar: apagar,
    chaves: chaves,
    limpar: limpar,
    ocupacao: ocupacao,
    url: url,
    libertar: libertar,
    libertarTodos: libertarTodos,
    pintar: pintar
  };
})();
