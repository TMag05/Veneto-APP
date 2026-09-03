/* =========================================================
   Área da organização — participantes
   Cartão por pessoa, com os campos do veículo visíveis apenas
   quando o papel é condutor. Os dados sensíveis (nascimento,
   carta, apólice) vivem só aqui: nunca chegam à app do convidado.
   ========================================================= */

(function () {

  const PAPEIS = [
    { valor: 'condutor', rotulo: 'Condutor' },
    { valor: 'acompanhante', rotulo: 'Acompanhante' }
  ];

  function bruto(id) {
    return Conteudo.bruto().participantes.find(function (p) { return p.id === id; });
  }

  /* ---------------------------------------------------------
     Lista, agrupada por equipa
     --------------------------------------------------------- */

  Vistas.orgParticipantes = {
    area: 'organizacao',
    nav: 'org-pessoas',
    cabecalho: OrgComum.cabecalhoOrg('Participantes'),
    html: function () {
      const equipas = {};
      DADOS.participantes.forEach(function (p) {
        const k = (p.equipa || '').trim() || '—';
        (equipas[k] = equipas[k] || []).push(p);
      });
      const chaves = Object.keys(equipas).sort(function (a, b) {
        return String(a).localeCompare(String(b), 'pt', { numeric: true });
      });

      const corpo = chaves.length
        ? chaves.map(function (k) {
            const condutor = equipas[k].find(function (p) { return p.papel === 'condutor'; });
            return '<div class="faixa">' +
              '<div class="seccao-cabecalho">' +
                '<h2 class="etiqueta">Carro ' + UI.h(k) + '</h2>' +
                (condutor && condutor.matricula ? '<span class="meta num">' + UI.h(condutor.matricula) + '</span>' : '') +
              '</div>' +
              (condutor ? '<div style="max-width:180px;margin-bottom:12px">' +
                Silhuetas.svg(condutor.modelo, condutor.cor, { rodas: false }) + '</div>' : '') +
              equipas[k].map(cartao).join('') +
            '</div>';
          }).join('')
        : '<div class="faixa"><div class="vazio">' +
            '<p class="corpo-editorial">Ainda não há participantes.</p>' +
            '<p class="meta" style="margin-top:8px">Cada pessoa fica associada a um carro pelo número de equipa.</p>' +
          '</div></div>';

      return OrgComum.cabecalhoEvento() + corpo +
        '<div class="faixa">' +
          '<button class="botao botao--secundario botao--largo" type="button" data-acao="novo">' +
            Icone('juntar', 20) + 'Adicionar participante</button>' +
          '<p class="meta" style="margin-top:16px">Data de nascimento, carta de condução e apólice ficam nesta área. A app do convidado nunca os mostra.</p>' +
        '</div>';
    },
    acoes: Object.assign({}, OrgComum.acoesComuns, {
      novo: function () { App.ir('#/org/participante/' + Conteudo.criarParticipante()); }
    })
  };

  function cartao(p) {
    const nome = DADOS.nomeCompleto(p);
    return '<a class="bilhete" href="#/org/participante/' + p.id + '">' +
      '<span class="bilhete__foto"' + (p.foto ? ' style="background-image:url(\'' + p.foto + '\')"' : '') + '>' +
        (p.foto ? '' : Icone('pessoas', 24)) +
      '</span>' +
      '<span class="bilhete__corpo">' +
        '<span class="titulo-ui" style="display:block">' + UI.h(nome) + '</span>' +
        '<span class="meta" style="display:block;margin-top:2px">' +
          UI.h(p.papel === 'condutor' ? 'Condutor' : 'Acompanhante') +
          (p.papel === 'condutor' && p.modelo ? ' · ' + UI.h(Silhuetas.modelo(p.modelo).nome) : '') +
        '</span>' +
      '</span>' +
      '<span class="lista-linha__seta">' + Icone('seta', 20) + '</span>' +
    '</a>';
  }

  /* ---------------------------------------------------------
     Ficha
     --------------------------------------------------------- */

  Vistas.orgParticipante = {
    area: 'organizacao',
    nav: 'org-pessoas',
    cabecalho: { voltar: '#/org/participantes', titulo: 'Participante', tituloSempre: true },
    html: function (p) {
      const x = bruto(p.id);
      if (!x) return '<div class="faixa" style="padding-top:24px"><p class="corpo-editorial">Participante não encontrado.</p></div>';

      const equipas = [];
      DADOS.participantes.forEach(function (o) {
        const k = (o.equipa || '').trim();
        if (k && equipas.indexOf(k) < 0) equipas.push(k);
      });

      return '<div class="faixa" style="padding-top:24px">' +
          '<div class="bilhete-cabecalho">' +
            '<button class="bilhete__foto bilhete__foto--grande" type="button" data-acao="foto"' +
              (x.foto ? ' style="background-image:url(\'' + x.foto + '\')"' : '') + ' aria-label="Fotografia do participante">' +
              (x.foto ? '' : Icone('camara', 24)) +
            '</button>' +
            '<div>' +
              '<p class="titulo-ui">' + UI.h(DADOS.nomeCompleto(x)) + '</p>' +
              '<p class="meta" style="margin-top:2px">' + (x.foto ? 'Tocar para trocar a fotografia' : 'Tocar para juntar fotografia') + '</p>' +
            '</div>' +
          '</div>' +
          '<input type="file" id="ent-foto" accept="image/*" style="display:none">' +
        '</div>' +

        '<div class="faixa" style="margin-top:24px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Dados pessoais</h2></div>' +
          '<div class="pilha-2">' +
            '<div class="par-campos">' +
              UI.campo({ rotulo: 'Nome', nome: 'nome', valor: x.nome }) +
              UI.campo({ rotulo: 'Apelido', nome: 'apelido', valor: x.apelido }) +
            '</div>' +
            UI.campo({ rotulo: 'Data de nascimento', nome: 'nascimento', valor: x.nascimento, tipo: 'data' }) +
            UI.campo({ rotulo: 'Papel', nome: 'papel', valor: x.papel, tipo: 'lista', opcoes: PAPEIS }) +
            UI.campo({ rotulo: 'Nº do carro (equipa)', nome: 'equipa', valor: x.equipa,
              nota: equipas.length ? 'Já existem: ' + equipas.join(', ') : 'Associa condutor e acompanhante ao mesmo veículo' }) +
            '<div class="par-campos">' +
              UI.campo({ rotulo: 'Telemóvel', nome: 'telefone', valor: x.telefone, tipo: 'tel' }) +
              UI.campo({ rotulo: 'Email', nome: 'email', valor: x.email }) +
            '</div>' +
          '</div>' +
        '</div>' +

        (x.papel === 'condutor' ? blocoVeiculo(x) : '') +

        '<div class="faixa">' +
          '<button class="botao botao--secundario botao--largo" type="button" data-acao="remover">Remover participante</button>' +
        '</div>';
    },

    montar: function (el, p) {
      UI.ligarCampos(el, function (nome, valor) {
        const patch = {};
        patch[nome] = nome === 'equipa' ? String(valor).trim() : valor;
        Conteudo.atualizarParticipante(p.id, patch);
      });

      const ent = el.querySelector('#ent-foto');
      if (ent) {
        ent.addEventListener('change', function () {
          const f = ent.files && ent.files[0];
          if (!f) return;
          UI.reduzirImagem(f, 480, function (dataUrl) {
            if (dataUrl) Conteudo.atualizarParticipante(p.id, { foto: dataUrl });
          });
          ent.value = '';
        });
      }
    },

    acoes: {
      foto: function () { document.getElementById('ent-foto').click(); },
      modelo: function (id, el, p) { Conteudo.atualizarParticipante(p.id, { modelo: id }); },
      cor: function (id, el, p) { Conteudo.atualizarParticipante(p.id, { cor: id }); },
      remover: function (v, el, p) {
        UI.abrirFolha('Remover participante',
          '<p class="corpo-ui silencioso">Apaga a ficha e os dados do veículo associados.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-remover-p">Remover</button>');
        document.getElementById('btn-remover-p').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.removerParticipante(p.id);
          App.substituir('#/org/participantes');
        });
      }
    }
  };

  function blocoVeiculo(x) {
    return '<div class="faixa faixa--recuada" style="margin-top:32px">' +
      '<h2 class="etiqueta">Veículo</h2>' +
      '<p class="corpo-ui silencioso" style="margin-top:8px">Só para condutores.</p>' +

      '<div class="pilha-2" style="margin-top:24px">' +
        UI.campo({ rotulo: 'Matrícula', nome: 'matricula', valor: x.matricula, placeholder: 'AA-00-BB' }) +
        UI.campo({ rotulo: 'Carta de condução', nome: 'carta', valor: x.carta, placeholder: 'Número' }) +
        UI.campo({ rotulo: 'Nº apólice de seguro', nome: 'apolice', valor: x.apolice, placeholder: 'Número' }) +
      '</div>' +

      '<h3 class="etiqueta" style="margin-top:32px">Modelo</h3>' +
      '<div class="silhueta-grelha" style="margin-top:12px">' + Silhuetas.MODELOS.map(function (m) {
        return '<button class="silhueta-opcao" type="button" data-acao="modelo" data-valor="' + m.id + '" ' +
          'aria-pressed="' + (m.id === x.modelo ? 'true' : 'false') + '">' +
          Silhuetas.svg(m.id, x.cor, { rodas: false }) +
          '<span class="silhueta-opcao__nome">' + UI.h(m.nome) + '</span></button>';
      }).join('') + '</div>' +

      '<h3 class="etiqueta" style="margin-top:32px">Cor</h3>' +
      '<div class="cores-grelha" style="margin-top:12px">' + Silhuetas.CORES.map(function (c) {
        return '<button class="cor-opcao" type="button" data-acao="cor" data-valor="' + c.id + '" ' +
          'aria-pressed="' + (c.id === x.cor ? 'true' : 'false') + '" style="background:' + c.hex + '" ' +
          'aria-label="' + UI.h(c.nome) + '"></button>';
      }).join('') + '</div>' +
      '<p class="meta" style="margin-top:12px">É esta silhueta que representa o carro no mapa e nas fotografias.</p>' +
    '</div>';
  }
})();
