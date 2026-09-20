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
     Impressão digital
     O SHA-256 do ficheiro de origem. Duas cópias da mesma
     fotografia dão o mesmo caminho no Storage, e por isso a
     segunda não se soma à primeira — a fila offline pode tentar
     as vezes que precisar sem encher o arquivo de repetições.
     --------------------------------------------------------- */

  function impressao(blob) {
    return blob.arrayBuffer().then(function (buf) {
      if (window.crypto && crypto.subtle && crypto.subtle.digest) {
        return crypto.subtle.digest('SHA-256', buf).then(hex).catch(function () { return sha256(buf); });
      }
      /* Pelo IP da rede local, em http, o navegador não dá crypto.subtle
         — é o caso do telemóvel a ver a app no Mac. A conta é a mesma;
         só é feita aqui. */
      return sha256(buf);
    });
  }

  function hex(buf) {
    const b = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
    return s;
  }

  /* SHA-256 em JavaScript, do FIPS 180-4. Só serve de reserva. */
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256(buf) {
    const m = new Uint8Array(buf);
    const n = m.length;
    const blocos = new Uint8Array(((n + 9 + 63) >> 6) << 6);
    blocos.set(m);
    blocos[n] = 0x80;
    const bits = n * 8;
    const dv = new DataView(blocos.buffer);
    dv.setUint32(blocos.length - 8, Math.floor(bits / 4294967296));
    dv.setUint32(blocos.length - 4, bits >>> 0);

    const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64);

    function rotr(x, k) { return (x >>> k) | (x << (32 - k)); }

    for (let i = 0; i < blocos.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const a = w[t - 15], b = w[t - 2];
        const s0 = rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3);
        const s1 = rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], x = h[7];
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (x + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        x = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + x) >>> 0;
    }
    return h.map(function (v) { return v.toString(16).padStart(8, '0'); }).join('');
  }

  /* O caminho de um objeto no Storage. Função pura: o mesmo ficheiro,
     no mesmo dia e da mesma pessoa, dá sempre o mesmo caminho. */
  function caminho(dia, autorId, sha, tamanho) {
    return 'fotos/' + (dia || 'sem-dia') + '/' + (autorId || 'sem-autor') + '/' + sha + '-' + tamanho + '.jpg';
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
    impressao: impressao,
    caminho: caminho,
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
