/* =========================================================
   Zip
   Junta ficheiros num .zip, no telemóvel, sem os comprimir.

   Não há aqui biblioteca de terceiros, e é de propósito. O que
   entra neste ficheiro são JPEG, que já vêm comprimidos: passá-los
   por deflate poupa cerca de um por cento e gasta minutos de
   processador num telemóvel. Guardados tal como estão, o .zip é
   um envelope — e um envelope são duzentas linhas, não trinta
   kilobytes descarregados de um CDN.

   O ficheiro nunca se monta todo em memória: cada fotografia entra
   na lista como o Blob que já é, e o navegador só o lê quando
   escrever o ficheiro final em disco.

   Formato: APPNOTE 6.3.3, método 0 (store), nomes em UTF-8.
   ========================================================= */

window.Zip = (function () {

  /* ---------------------------------------------------------
     CRC-32, que o formato exige por ficheiro
     --------------------------------------------------------- */

  const TABELA = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(u8) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < u8.length; i++) c = TABELA[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /* ---------------------------------------------------------
     Peças do formato
     --------------------------------------------------------- */

  function texto(s) { return new TextEncoder().encode(s); }

  /* Hora e data no formato do MS-DOS, que o zip herdou em 1989. */
  function relogio(d) {
    const data = d || new Date();
    const hora = (data.getHours() << 11) | (data.getMinutes() << 5) | (data.getSeconds() >> 1);
    const dia = (Math.max(0, data.getFullYear() - 1980) << 9) | ((data.getMonth() + 1) << 5) | data.getDate();
    return { hora: hora, dia: dia };
  }

  function cabecalhoLocal(e) {
    const b = new Uint8Array(30 + e.nome.length);
    const v = new DataView(b.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);        /* versão mínima */
    v.setUint16(6, 0x0800, true);    /* nomes em UTF-8 */
    v.setUint16(8, 0, true);         /* método: guardado */
    v.setUint16(10, e.relogio.hora, true);
    v.setUint16(12, e.relogio.dia, true);
    v.setUint32(14, e.crc, true);
    v.setUint32(18, e.tamanho, true);
    v.setUint32(22, e.tamanho, true);
    v.setUint16(26, e.nome.length, true);
    v.setUint16(28, 0, true);
    b.set(e.nome, 30);
    return b;
  }

  function cabecalhoCentral(e) {
    const b = new Uint8Array(46 + e.nome.length);
    const v = new DataView(b.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);        /* feito por */
    v.setUint16(6, 20, true);        /* versão mínima */
    v.setUint16(8, 0x0800, true);
    v.setUint16(10, 0, true);
    v.setUint16(12, e.relogio.hora, true);
    v.setUint16(14, e.relogio.dia, true);
    v.setUint32(16, e.crc, true);
    v.setUint32(20, e.tamanho, true);
    v.setUint32(24, e.tamanho, true);
    v.setUint16(28, e.nome.length, true);
    v.setUint32(42, e.posicao, true);
    b.set(e.nome, 46);
    return b;
  }

  function fecho(n, tamanhoCentral, posicaoCentral) {
    const b = new Uint8Array(22);
    const v = new DataView(b.buffer);
    v.setUint32(0, 0x06054b50, true);
    v.setUint16(8, n, true);
    v.setUint16(10, n, true);
    v.setUint32(12, tamanhoCentral, true);
    v.setUint32(16, posicaoCentral, true);
    return b;
  }

  /* ---------------------------------------------------------
     Montagem
     --------------------------------------------------------- */

  /* O formato clássico conta posições em 32 bits: acima disto era
     preciso o ZIP64, que não vale a pena para o que aqui cabe. */
  const TETO = 4294967295;

  /* ficheiros: [{ nome, blob, data }]
     aoProgredir(feitos, total) é opcional. */
  function criar(ficheiros, aoProgredir) {
    const partes = [];
    const entradas = [];
    let posicao = 0;

    function seguinte(i) {
      if (i >= ficheiros.length) return Promise.resolve();
      const f = ficheiros[i];
      return f.blob.arrayBuffer().then(function (buf) {
        const u8 = new Uint8Array(buf);
        const e = {
          nome: texto(f.nome),
          crc: crc32(u8),
          tamanho: u8.length,
          relogio: relogio(f.data),
          posicao: posicao
        };
        const cab = cabecalhoLocal(e);
        partes.push(cab, f.blob);
        posicao += cab.length + e.tamanho;
        entradas.push(e);
        if (aoProgredir) aoProgredir(i + 1, ficheiros.length);
        if (posicao > TETO) throw new Error('grande demais');
        return seguinte(i + 1);
      });
    }

    return seguinte(0).then(function () {
      const inicioCentral = posicao;
      let tamanhoCentral = 0;
      entradas.forEach(function (e) {
        const c = cabecalhoCentral(e);
        partes.push(c);
        tamanhoCentral += c.length;
      });
      partes.push(fecho(entradas.length, tamanhoCentral, inicioCentral));
      return new Blob(partes, { type: 'application/zip' });
    });
  }

  return { criar: criar, crc32: crc32 };
})();
