/* =========================================================
   Ícones — traço de 1.5px, cantos vivos, sem preenchimento.
   20px em linha, 24px em navegação. Nunca maiores.
   ========================================================= */

window.Icone = (function () {
  const P = {
    hoje: '<path d="M4 6h16v14H4z"/><path d="M4 10h16"/><path d="M8 3v4M16 3v4"/>',
    roadbook: '<path d="M4 4h7v16H4z"/><path d="M13 4h7v16h-7z"/><path d="M6.5 8h2M15.5 8h2"/>',
    mapa: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    galeria: '<path d="M3 7h4l1.5-2h7L17 7h4v13H3z"/><path d="M12 17a4 4 0 100-8 4 4 0 000 8z"/>',
    mais: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    seta: '<path d="M9 5l7 7-7 7"/>',
    voltar: '<path d="M15 5l-7 7 7 7"/>',
    externo: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
    relogio: '<path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M12 7v5l3.5 2"/>',
    verificado: '<path d="M4.5 12.5l5 5 10-11"/>',
    telefone: '<path d="M6 3h4l2 5-2.5 1.5a11 11 0 005 5L16 12l5 2v4a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z"/>',
    descarregar: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    alerta: '<path d="M12 3l9 17H3z"/><path d="M12 9v5"/><path d="M12 17.2v.1"/>',
    juntar: '<path d="M12 5v14M5 12h14"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    semrede: '<path d="M3 3l18 18"/><path d="M5 9.5A14 14 0 0110 7"/><path d="M2 6a19 19 0 015-3.2"/><path d="M8.5 13a8 8 0 013-1.7"/><path d="M12 18.5v.1"/><path d="M19.5 9.2A14 14 0 0017 7.4"/>',
    sincronizar: '<path d="M20 12a8 8 0 01-13.7 5.6M4 12a8 8 0 0113.7-5.6"/><path d="M17.7 3v3.4h-3.4M6.3 21v-3.4h3.4"/>',
    selado: '<path d="M5 11h14v9H5z"/><path d="M8 11V7.5a4 4 0 018 0V11"/>',
    carro: '<path d="M3 15v-3l2-5h14l2 5v3"/><path d="M3 15h18v3H3z"/><path d="M6.5 18v2M17.5 18v2"/>',
    pin: '<path d="M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11z"/><path d="M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>',
    mensagem: '<path d="M4 5h16v11H9l-5 4z"/>',
    documento: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    utensilios: '<path d="M6 3v7a2 2 0 004 0V3"/><path d="M8 10v11"/><path d="M17 3c-1.5 1.5-2 3-2 5s.7 3 2 3v10"/>',
    taca: '<path d="M7 3h10l-1 5a4 4 0 01-8 0z"/><path d="M12 12v6"/><path d="M8.5 21h7"/>',
    chuva: '<path d="M7 15a4 4 0 010-8 5.5 5.5 0 0110.4 1.6A3.5 3.5 0 0117 15z"/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3"/>',
    sol: '<path d="M12 17a5 5 0 100-10 5 5 0 000 10z"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
    nuvem: '<path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.4 1.6A3.5 3.5 0 0117 18z"/>',
    pessoas: '<path d="M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 5.2a3.5 3.5 0 010 6.6"/><path d="M17.5 14.4a6.5 6.5 0 014 5.6"/>',
    definicoes: '<path d="M4 7h16M4 17h16"/><path d="M9 4.5v5M15 14.5v5"/>',
    bussola: '<path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    partilhar: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 13v7h14v-7"/>',
    camara: '<path d="M3 7h4l1.5-2h7L17 7h4v13H3z"/><path d="M12 17a4 4 0 100-8 4 4 0 000 8z"/>',
    oficina: '<path d="M3 20V9l9-5 9 5v11"/><path d="M9 20v-6h6v6"/>',
    caixa: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'
  };

  return function (nome, tamanho, extra) {
    const t = tamanho || 20;
    const d = P[nome] || P.pin;
    return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" ' +
      'aria-hidden="true" focusable="false"' + (extra ? ' ' + extra : '') + '>' + d + '</svg>';
  };
})();
