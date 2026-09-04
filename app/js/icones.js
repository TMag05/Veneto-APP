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

/* =========================================================
   Punções — os cinco sinais desenhados do vocabulário do
   passeio (sol nascente, gancho de rota, retícula com curvas
   de nível, provas empilhadas, filetes em degradé), gravados
   em três pesos de traço. É a navegação principal da app do
   convidado — a organização mantém os ícones gerais.
   ========================================================= */

window.IconePuncao = (function () {
  const P = {
    hoje: '<path d="M2 22 H46"/><path d="M8 21.6 Q24 6.4 40 21.6"/>' +
      '<path d="M19 14.7 A5 5 0 0 1 29 14.7" stroke-width=".7" opacity=".62"/>' +
      '<g stroke-width="1"><path d="M24 8.4 V5.2"/><path d="M20.5 9.4 L18.91 6.86"/><path d="M27.5 9.4 L29.09 6.86"/><path d="M18.07 12.11 L15.37 10.79"/><path d="M29.93 12.11 L32.63 10.79"/></g>' +
      '<g stroke-width=".6" opacity=".55"><path d="M17.41 14.54 L15.42 14.4"/><path d="M30.59 14.54 L32.58 14.4"/></g>' +
      '<g stroke-width=".5" opacity=".4"><path d="M6 22.8 V24.6"/><path d="M12 22.8 V24.6"/><path d="M18 22.8 V24.6"/><path d="M24 22.8 V25.6"/><path d="M30 22.8 V24.6"/><path d="M36 22.8 V24.6"/><path d="M42 22.8 V24.6"/></g>',
    roadbook: '<path d="M6 24 H24 Q32 24 32 19 Q32 14.4 22 14.4 Q12 14.4 12 9.6 Q12 5 20 5 H42" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g stroke-width=".7" opacity=".72"><path d="M13.6 22.5 L15.4 24 L13.6 25.5"/><path d="M25.6 12.9 L24 14.4 L25.6 15.9"/><path d="M35.4 3.5 L37.2 5 L35.4 6.5"/></g>' +
      '<circle cx="6" cy="24" r="1.2" fill="currentColor" stroke="none"/><circle cx="42" cy="5" r="1.6" stroke-width=".8" opacity=".8"/>',
    mapa: '<path d="M4 7.4 L17 4.6 L30.5 7.4 L44 4.6 L44 17.2 L30.5 20 L17 17.2 L4 20 Z" stroke-linejoin="miter"/>' +
      '<g stroke-width=".95" opacity=".42"><path d="M17 4.6 V17.2"/><path d="M30.5 7.4 V20"/></g>' +
      '<g stroke-width=".95"><path d="M7 11 C11 9.2 14 9.6 17.6 10.6 C21.6 11.7 25 12.2 29 11.2 C33 10.2 37 9.6 41 10.8" opacity=".55"/><path d="M7 14.8 C11.4 13.6 14.6 13.9 18 14.6 C22 15.5 25.6 15.9 29.6 15 C33.4 14.2 37.2 13.7 41 14.6" opacity=".4"/></g>' +
      '<path d="M24 6.6 L25.6 9.2 H22.4 Z" stroke-width=".55" opacity=".5"/><circle cx="24" cy="8.3" r=".85" fill="currentColor" stroke="none"/>',
    galeria: '<path d="M15.4 3.6 H35.4 V17.6 H15.4 Z" stroke-width=".55" opacity=".32"/>' +
      '<path d="M13 5.8 H33 V19.8 H13 Z" stroke-width=".75" opacity=".56"/>' +
      '<path d="M10.6 8 H30.6 V22 H10.6 Z"/><path d="M12.4 9.8 H28.8 V20.2 H12.4 Z" stroke-width=".5" opacity=".34"/>' +
      '<path d="M13 17.8 Q17.4 13.4 20.6 16.6 Q22.6 18.6 24 17.2 Q26 15.2 28.2 18" stroke-width=".6" opacity=".5" stroke-linecap="round" stroke-linejoin="round"/>',
    mais: '<path d="M8 7 H40"/><path d="M8 13 H40" stroke-width=".85" opacity=".72"/><path d="M8 19 H40" stroke-width=".55" opacity=".44"/>' +
      '<g stroke-width=".5" opacity=".42"><path d="M8 4.6 V9.4"/><path d="M40 4.6 V9.4"/><path d="M8 11 V15"/><path d="M40 11 V15"/><path d="M8 17.4 V20.6" opacity=".7"/><path d="M40 17.4 V20.6" opacity=".7"/></g>'
  };

  return function (nome, ativo) {
    const peso = ativo ? 1.5 : 1.05;
    return '<svg width="30" height="16" viewBox="0 0 48 26" fill="none" stroke="currentColor" ' +
      'stroke-width="' + peso + '" stroke-linecap="round" aria-hidden="true">' + (P[nome] || '') + '</svg>';
  };
})();
