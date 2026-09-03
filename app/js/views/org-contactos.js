/* =========================================================
   Área da organização — contactos
   Duas listas, como no documento: emergência, e hotéis e
   restaurantes. Ambas aparecem na app do convidado.
   ========================================================= */

(function () {

  const TIPOS_LOCAL = [
    { valor: 'hotel', rotulo: 'Hotel' },
    { valor: 'restaurante', rotulo: 'Restaurante' },
    { valor: 'outro', rotulo: 'Outro' }
  ];

  const ICONES = [
    { valor: 'telefone', rotulo: 'Telefone' },
    { valor: 'alerta', rotulo: 'Emergência' },
    { valor: 'oficina', rotulo: 'Assistência' },
    { valor: 'carro', rotulo: 'Carro-vassoura' },
    { valor: 'mensagem', rotulo: 'Concierge' },
    { valor: 'caixa', rotulo: 'Logística' }
  ];

  Vistas.orgContactos = {
    area: 'organizacao',
    nav: 'org-contactos',
    cabecalho: OrgComum.cabecalhoOrg('Contactos'),
    html: function () {
      return OrgComum.cabecalhoEvento() +

        '<div class="faixa" style="padding-top:24px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Emergência</h2>' +
            '<span class="meta num">' + DADOS.contactos.length + '</span></div>' +
          '<p class="corpo-ui silencioso">Hospital, seguradora, assistência em viagem, organização.</p>' +
          (DADOS.contactos.length
            ? '<div class="lista" style="margin-top:16px">' + DADOS.contactos.map(function (c) {
                return UI.linhaLista({
                  titulo: c.nome || 'Contacto sem nome',
                  nota: [c.papel, c.telefone].filter(Boolean).join(' · '),
                  icone: c.icone || 'telefone',
                  href: '#/org/contacto/' + c.id
                });
              }).join('') + '</div>'
            : '<div class="vazio"><p class="corpo-ui silencioso">Sem contactos de emergência.</p></div>') +
          '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="novoContacto">' +
            Icone('juntar', 20) + 'Adicionar contacto</button>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Hotéis e restaurantes</h2>' +
            '<span class="meta num">' + DADOS.locais.length + '</span></div>' +
          (DADOS.locais.length
            ? '<div class="lista" style="margin-top:16px">' + DADOS.locais.map(function (l) {
                return UI.linhaLista({
                  titulo: l.nome || 'Local sem nome',
                  nota: [rotuloTipo(l.tipo), l.morada].filter(Boolean).join(' · '),
                  icone: l.tipo === 'restaurante' ? 'utensilios' : (l.tipo === 'hotel' ? 'caixa' : 'pin'),
                  href: '#/org/local/' + l.id
                });
              }).join('') + '</div>'
            : '<div class="vazio"><p class="corpo-ui silencioso">Sem locais registados.</p></div>') +
          '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="novoLocal">' +
            Icone('juntar', 20) + 'Adicionar hotel ou restaurante</button>' +
        '</div>';
    },
    acoes: Object.assign({}, OrgComum.acoesComuns, {
      novoContacto: function () { App.ir('#/org/contacto/' + Conteudo.criarContacto()); },
      novoLocal: function () { App.ir('#/org/local/' + Conteudo.criarLocal()); }
    })
  };

  function rotuloTipo(t) {
    const x = TIPOS_LOCAL.find(function (o) { return o.valor === t; });
    return x ? x.rotulo : '';
  }

  /* ---------------------------------------------------------
     Ficha de contacto
     --------------------------------------------------------- */

  Vistas.orgContacto = {
    area: 'organizacao',
    nav: 'org-contactos',
    cabecalho: { voltar: '#/org/contactos', titulo: 'Contacto', tituloSempre: true },
    html: function (p) {
      const c = Conteudo.bruto().contactos.find(function (x) { return x.id === p.id; });
      if (!c) return '<div class="faixa" style="padding-top:24px"><p class="corpo-editorial">Contacto não encontrado.</p></div>';

      return '<div class="faixa" style="padding-top:24px">' +
          '<div class="pilha-2">' +
            UI.campo({ rotulo: 'Nome ou entidade', nome: 'nome', valor: c.nome, placeholder: 'Assistência em viagem' }) +
            UI.campo({ rotulo: 'Descrição', nome: 'papel', valor: c.papel, placeholder: 'Vinte e quatro horas' }) +
            UI.campo({ rotulo: 'Telefone', nome: 'telefone', valor: c.telefone, tipo: 'tel', placeholder: '+39 340 000 0000' }) +
            UI.campo({ rotulo: 'Notas', nome: 'notas', valor: c.notas, tipo: 'area', linhas: 3 }) +
            UI.campo({ rotulo: 'Ícone', nome: 'icone', valor: c.icone, tipo: 'lista', opcoes: ICONES }) +
          '</div>' +
        '</div>' +
        '<div class="faixa">' +
          '<button class="botao botao--secundario botao--largo" type="button" data-acao="remover">Remover contacto</button>' +
        '</div>';
    },
    montar: function (el, p) {
      UI.ligarCampos(el, function (nome, valor) {
        const patch = {};
        patch[nome] = valor;
        Conteudo.atualizarContacto(p.id, patch);
      });
    },
    acoes: {
      remover: function (v, el, p) {
        Conteudo.removerContacto(p.id);
        App.substituir('#/org/contactos');
      }
    }
  };

  /* ---------------------------------------------------------
     Ficha de hotel ou restaurante
     --------------------------------------------------------- */

  Vistas.orgLocal = {
    area: 'organizacao',
    nav: 'org-contactos',
    cabecalho: { voltar: '#/org/contactos', titulo: 'Local', tituloSempre: true },
    html: function (p) {
      const l = Conteudo.bruto().locais.find(function (x) { return x.id === p.id; });
      if (!l) return '<div class="faixa" style="padding-top:24px"><p class="corpo-editorial">Local não encontrado.</p></div>';

      const dias = DADOS.dias.filter(function (d) { return d.hotel === p.id; });

      return '<div class="faixa" style="padding-top:24px">' +
          '<div class="pilha-2">' +
            UI.campo({ rotulo: 'Tipo', nome: 'tipo', valor: l.tipo, tipo: 'lista', opcoes: TIPOS_LOCAL }) +
            UI.campo({ rotulo: 'Nome do local', nome: 'nome', valor: l.nome, placeholder: 'Hotel de la Poste' }) +
            UI.campo({ rotulo: 'Telefone', nome: 'telefone', valor: l.telefone, tipo: 'tel' }) +
            UI.campo({ rotulo: 'Morada', nome: 'morada', valor: l.morada, tipo: 'area', linhas: 2 }) +
            UI.campo({ rotulo: 'Notas', nome: 'notas', valor: l.notas, tipo: 'area', linhas: 2 }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Etapas</h2></div>' +
          '<p class="corpo-ui silencioso">' + (dias.length
            ? 'Alojamento de: ' + dias.map(function (d) { return UI.h(d.titulo || 'etapa ' + d.numero); }).join(', ')
            : 'Ainda não está associado a nenhuma etapa. Faz-se no editor da etapa.') + '</p>' +
        '</div>' +

        '<div class="faixa">' +
          '<button class="botao botao--secundario botao--largo" type="button" data-acao="remover">Remover local</button>' +
        '</div>';
    },
    montar: function (el, p) {
      UI.ligarCampos(el, function (nome, valor) {
        const patch = {};
        patch[nome] = valor;
        Conteudo.atualizarLocal(p.id, patch);
      });
    },
    acoes: {
      remover: function (v, el, p) {
        Conteudo.removerLocal(p.id);
        App.substituir('#/org/contactos');
      }
    }
  };
})();
