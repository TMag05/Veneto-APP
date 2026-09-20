/* =========================================================
   A fronteira com o servidor
   Toda a app trata as fotografias como se o servidor não
   existisse: escreve no telemóvel e segue. Este ficheiro é o
   único sítio que sabe que há um do outro lado — e enquanto
   não houver, responde que não está ligado e a fila fica
   parada, de propósito.

   Quem ligar o Firebase implementa as quatro funções abaixo e
   mais nenhuma. Nada fora deste ficheiro conhece o Firestore,
   o Storage ou o Auth.
   ========================================================= */

window.Nuvem = (function () {

  /* ---------------------------------------------------------
     O contrato

     ligada()
       true quando há projeto configurado e sessão iniciada.
       Enquanto for false, a fila não tenta enviar nada e
       nenhuma fotografia passa a 'enviado'.

     enviarFoto(registo, meta)
       registo — { id, original, mini, vista, tipo, largura, altura }
                 tal como está guardado em Fotos.
       meta    — { id, dia, poi, autorId, sha, criado }

       Sobe os três tamanhos em paralelo, assim que houver
       qualquer rede — não esperar por Wi-Fi, não consultar
       navigator.connection. Os caminhos são os de
       Fotos.caminho(dia, autorId, sha, tamanho), com 'mini',
       'vista' e 'original'; o original sobe tal como veio da
       câmara, sem reprocessar, mesmo que seja HEIC.

       Metadados de cada objeto:
         Cache-Control: public, max-age=31536000, immutable
         contentType:   o tipo do ficheiro

       Depois dos três confirmarem — e só depois — escreve o
       documento em fotos/{id} e resolve com
       { caminhoMini, caminhoVista, caminhoOriginal }.
       Qualquer falha rejeita: a fotografia fica pendente e a
       fila volta a tentar.

     apagarFoto(meta)
       Apaga os três objetos do Storage e o documento do
       Firestore. Nunca um sem o outro.

     fotosDoDia(dia, limite, depoisDe)
       Consulta paginada — where dia == X, limit N. Nunca um
       ouvinte na coleção inteira, nunca list() no bucket.
       Resolve com uma lista de metadados.
     --------------------------------------------------------- */

  function porLigar() {
    return Promise.reject(new Error('sem servidor'));
  }

  return {
    ligada: function () { return false; },
    enviarFoto: porLigar,
    apagarFoto: porLigar,
    fotosDoDia: porLigar
  };
})();
