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
                Silhuetas.svg(condutor.modelo, { rodas: false }) + '</div>' : '') +
              equipas[k].map(cartao).join('') +
            '</div>';
          }).join('')
        : '<div class="faixa"><div class="vazio">' +
            '<p class="corpo-editorial">Ainda não há participantes.</p>' +
            '<p class="meta" style="margin-top:8px">Cada pessoa fica associada a um carro pelo número de equipa.</p>' +
          '</div></div>';

      return OrgComum.cabecalhoEvento() +
        '<div class="faixa" style="padding-top:24px">' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Acessos criados', nota: 'Quem entrou pelo link e o link para o grupo', icone: 'selado', href: '#/org/acessos' }) +
            UI.linhaLista({ titulo: 'Equipa da organização', nota: 'Quem pode entrar nesta área', icone: 'oficina', href: '#/org/equipa' }) +
          '</div>' +
        '</div>' +
        corpo +
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

  /* ---------------------------------------------------------
     Acessos — quem criou conta pela app
     O registo é aberto: esta lista é para ver, não para aprovar.
     Apagar um acesso não impede ninguém de entrar — liberta o
     email, e a pessoa pode criar outro quando quiser. Serve para
     duplicados, enganos e testes.
     --------------------------------------------------------- */

  let acessos = null;
  let falhaAcessos = '';

  function carregarAcessos() {
    falhaAcessos = '';
    Estado.sessaoValida().then(function (s) {
      return Nuvem.contas(s);
    }).then(function (lista) {
      acessos = lista.sort(function (a, b) { return b.criado - a.criado; });
      App.repintar();
    }).catch(function (e) {
      falhaAcessos = e && e.codigo === 'sem-rede'
        ? 'Sem ligação. A lista de acessos vem do servidor.'
        : 'Não foi possível ler a lista agora.';
      App.repintar();
    });
  }

  function linkDoGrupo() {
    return location.origin + location.pathname + '#/entrar';
  }

  function linhaAcesso(c) {
    const ficha = Estado.associarPorEmail(c.email);
    const proprio = c.uid === Estado.get().uid;
    const carro = c.papel === 'organizacao'
      ? 'Organização'
      : (c.modelo ? Silhuetas.modelo(c.modelo).nome : 'Carro por escolher');
    return '<div class="linha-org">' +
      '<div class="linha-org__corpo">' +
        '<span class="titulo-ui" style="display:block">' + UI.h(c.nome || 'Sem nome') + '</span>' +
        '<span class="meta" style="display:block;margin-top:2px">' + UI.h(c.email) + '</span>' +
        '<span class="meta" style="display:block;margin-top:2px">' + UI.h(carro) +
          (c.criado ? ' · ' + UI.h(UI.dataCurta(Estado.chave(new Date(c.criado)))) : '') + '</span>' +
        '<span class="meta" style="display:block;margin-top:2px">' +
          (ficha ? 'Ficha: ' + UI.h(DADOS.nomeCompleto(ficha)) + (ficha.equipa ? ', carro ' + UI.h(ficha.equipa) : '') : 'Sem ficha da organização') +
          (proprio ? ' · o acesso deste telemóvel' : '') + '</span>' +
      '</div>' +
      '<button class="botao-icone" type="button" data-acao="apagarAcesso" data-valor="' + UI.h(c.uid) + '" ' +
        'aria-label="Apagar o acesso de ' + UI.h(c.nome || c.email) + '">' + Icone('apagar', 20) + '</button>' +
    '</div>';
  }

  Vistas.orgAcessos = {
    area: 'organizacao',
    nav: 'org-pessoas',
    cabecalho: { voltar: '#/org/participantes', titulo: 'Acessos', tituloSempre: true },
    desmontar: function () { acessos = null; falhaAcessos = ''; },
    html: function () {
      let lista;
      if (falhaAcessos && !acessos) {
        lista = '<div class="vazio">' +
            '<p class="corpo-editorial">' + UI.h(falhaAcessos) + '</p>' +
            '<button class="botao botao--secundario" style="margin-top:16px" type="button" data-acao="recarregar">Tentar de novo</button>' +
          '</div>';
      } else if (!acessos) {
        lista = '<p class="meta">A ler a lista.</p>';
      } else if (!acessos.length) {
        lista = '<div class="vazio">' +
            '<p class="corpo-editorial">Ainda ninguém criou acesso.</p>' +
            '<p class="meta" style="margin-top:8px">Aparecem aqui assim que entrarem pelo link.</p>' +
          '</div>';
      } else {
        lista = acessos.map(linhaAcesso).join('');
      }

      return '<div class="faixa" style="padding-top:24px">' +
          '<h2 class="etiqueta">O link para o grupo</h2>' +
          '<p class="corpo-ui silencioso" style="margin-top:8px">Um só para todos. Quem o abre cria o seu acesso, sem aprovação.</p>' +
          '<p class="corpo-ui num" style="margin-top:16px;overflow-wrap:anywhere">' + UI.h(linkDoGrupo()) + '</p>' +
          '<button class="botao botao--secundario botao--largo" style="margin-top:16px" type="button" data-acao="partilharLink">' +
            Icone('partilhar', 20) + 'Partilhar o link</button>' +
          (Nuvem.simulada()
            ? '<p class="meta" style="margin-top:16px">Sem servidor ligado, cada telemóvel guarda os seus acessos. ' +
                'Esta lista mostra só os que foram criados neste.</p>'
            : '') +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Acessos criados</h2>' +
            (acessos ? '<span class="meta num">' + acessos.length + '</span>' : '') + '</div>' +
          lista +
          '<p class="meta" style="margin-top:16px">Apagar um acesso não impede ninguém de entrar: o email fica livre e a pessoa pode criar outro.</p>' +
        '</div>';
    },
    montar: function (el, p, chegada) {
      if (chegada) carregarAcessos();
    },
    acoes: {
      recarregar: function () { falhaAcessos = ''; App.repintar(); carregarAcessos(); },

      partilharLink: function () {
        const url = linkDoGrupo();
        const titulo = DADOS.evento.nome || 'Passeio';
        if (navigator.share) {
          navigator.share({ title: titulo, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            UI.abrirFolha('Link copiado', '<p class="corpo-ui silencioso" style="overflow-wrap:anywhere">' + UI.h(url) + '</p>');
          }).catch(function () {});
        }
      },

      apagarAcesso: function (uid) {
        const c = (acessos || []).find(function (x) { return x.uid === uid; });
        if (!c) return;
        const proprio = uid === Estado.get().uid;
        UI.abrirFolha('Apagar acesso',
          '<p class="corpo-ui silencioso">' + UI.h(c.nome || c.email) + ' deixa de entrar com este email e esta palavra-passe. ' +
            'Pode criar outro acesso quando quiser.</p>' +
          (proprio ? '<p class="corpo-ui" style="margin-top:12px">É o acesso deste telemóvel: a app volta à entrada.</p>' : '') +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-apagar-acesso">Apagar acesso</button>' +
          '<p class="meta" style="margin-top:16px" id="msg-apagar-acesso" role="alert"></p>');

        const botao = document.getElementById('btn-apagar-acesso');
        botao.addEventListener('click', function () {
          botao.disabled = true;
          Estado.sessaoValida().then(function (s) {
            return Nuvem.apagarConta(s, uid);
          }).then(function () {
            UI.fecharFolha();
            acessos = acessos.filter(function (x) { return x.uid !== uid; });
            if (proprio) Estado.terminarSessao('conta-apagada');
            else App.repintar();
          }).catch(function (e) {
            botao.disabled = false;
            document.getElementById('msg-apagar-acesso').textContent = e && e.codigo === 'sem-rede'
              ? 'Sem ligação. Tente de novo quando houver rede.'
              : 'Não foi possível apagar agora.';
          });
        });
      }
    }
  };

  /* ---------------------------------------------------------
     Equipa — quem pode entrar na área da organização
     A equipa é uma lista de emails. Quem está nela cria o seu
     acesso na porta da organização, no fim da entrada; quem não
     está não passa. Retirar um email apaga o acesso que houver
     com ele, e a sessão desse telemóvel acaba na próxima ligação.
     --------------------------------------------------------- */

  let equipa = null;
  let contasEquipa = [];
  let falhaEquipa = '';

  function carregarEquipa() {
    falhaEquipa = '';
    Estado.sessaoValida().then(function (s) {
      return Promise.all([Nuvem.equipa(s), Nuvem.contas(s)]);
    }).then(function (r) {
      equipa = r[0].sort(function (a, b) { return a.criado - b.criado; });
      contasEquipa = r[1];
      App.repintar();
    }).catch(function (e) {
      falhaEquipa = e && e.codigo === 'sem-rede'
        ? 'Sem ligação. A equipa vem do servidor.'
        : 'Não foi possível ler a equipa agora.';
      App.repintar();
    });
  }

  function linhaEquipa(m) {
    const conta = contasEquipa.find(function (c) { return c.email === m.email; });
    const propria = m.email === Estado.get().perfil.email;
    return '<div class="linha-org">' +
      '<div class="linha-org__corpo">' +
        '<span class="titulo-ui" style="display:block">' + UI.h(conta && conta.nome ? conta.nome : m.email) + '</span>' +
        (conta && conta.nome ? '<span class="meta" style="display:block;margin-top:2px">' + UI.h(m.email) + '</span>' : '') +
        '<span class="meta" style="display:block;margin-top:2px">' +
          (conta ? 'Acesso criado' : 'Ainda sem acesso') + (propria ? ' · este telemóvel' : '') + '</span>' +
      '</div>' +
      (propria ? '' :
        '<button class="botao-icone" type="button" data-acao="retirar" data-valor="' + UI.h(m.email) + '" ' +
          'aria-label="Retirar ' + UI.h(m.email) + ' da equipa">' + Icone('apagar', 20) + '</button>') +
    '</div>';
  }

  function portaDaOrganizacao() {
    return location.origin + location.pathname + '#/organizacao';
  }

  Vistas.orgEquipa = {
    area: 'organizacao',
    nav: 'org-pessoas',
    cabecalho: { voltar: '#/org/participantes', titulo: 'Equipa', tituloSempre: true },
    desmontar: function () { equipa = null; contasEquipa = []; falhaEquipa = ''; },
    html: function () {
      let lista;
      if (falhaEquipa && !equipa) {
        lista = '<div class="vazio">' +
            '<p class="corpo-editorial">' + UI.h(falhaEquipa) + '</p>' +
            '<button class="botao botao--secundario" style="margin-top:16px" type="button" data-acao="recarregar">Tentar de novo</button>' +
          '</div>';
      } else if (!equipa) {
        lista = '<p class="meta">A ler a equipa.</p>';
      } else {
        lista = equipa.map(linhaEquipa).join('');
      }

      return '<div class="faixa" style="padding-top:24px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Equipa</h2>' +
            (equipa ? '<span class="meta num">' + equipa.length + '</span>' : '') + '</div>' +
          lista +
        '</div>' +

        '<div class="faixa">' +
          '<h2 class="etiqueta">Acrescentar à equipa</h2>' +
          '<p class="corpo-ui silencioso" style="margin-top:8px">Com o email acrescentado, a pessoa cria o seu acesso na porta da organização, no fim da entrada.</p>' +
          '<form id="form-equipa" class="pilha-2" style="margin-top:16px" novalidate>' +
            '<label class="campo">' +
              '<span class="campo__rotulo">Email</span>' +
              '<input class="campo__entrada" name="email" type="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="nome@exemplo.pt">' +
            '</label>' +
            '<button class="botao botao--secundario botao--largo" type="submit">' + Icone('juntar', 20) + 'Acrescentar</button>' +
            '<p class="meta" id="msg-equipa" role="alert"></p>' +
          '</form>' +
        '</div>' +

        '<div class="faixa">' +
          '<h2 class="etiqueta">A porta da organização</h2>' +
          '<p class="corpo-ui num" style="margin-top:12px;overflow-wrap:anywhere">' + UI.h(portaDaOrganizacao()) + '</p>' +
          '<p class="meta" style="margin-top:12px">É também o botão «Organização», no fim da entrada dos convidados.' +
            (Nuvem.simulada() ? ' Sem servidor ligado, a equipa vive em cada telemóvel: noutro, a primeira pessoa entra com o código.' : '') +
          '</p>' +
        '</div>';
    },
    montar: function (el, p, chegada) {
      if (chegada) carregarEquipa();
      const f = el.querySelector('#form-equipa');
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        const campo = f.querySelector('[name="email"]');
        const msg = f.querySelector('#msg-equipa');
        const email = campo.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Este email parece incompleto.'; return; }
        if ((equipa || []).some(function (m) { return m.email === email; })) { msg.textContent = 'Este email já está na equipa.'; return; }
        msg.textContent = 'A acrescentar.';
        Estado.sessaoValida().then(function (s) {
          return Nuvem.juntarEquipa(s, email);
        }).then(function () {
          carregarEquipa();
        }).catch(function (e) {
          msg.textContent = e && e.codigo === 'sem-rede'
            ? 'Sem ligação. Tente de novo quando houver rede.'
            : 'Não foi possível acrescentar agora.';
        });
      });
    },
    acoes: {
      recarregar: function () { falhaEquipa = ''; App.repintar(); carregarEquipa(); },

      retirar: function (email) {
        const conta = contasEquipa.find(function (c) { return c.email === email; });
        UI.abrirFolha('Retirar da equipa',
          '<p class="corpo-ui silencioso">' + UI.h(conta && conta.nome ? conta.nome : email) + ' deixa de entrar na área da organização.' +
            (conta ? ' O acesso é apagado, e a sessão no telemóvel dessa pessoa acaba na próxima ligação.' : '') + '</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-retirar">Retirar</button>' +
          '<p class="meta" style="margin-top:16px" id="msg-retirar" role="alert"></p>');

        const botao = document.getElementById('btn-retirar');
        botao.addEventListener('click', function () {
          botao.disabled = true;
          Estado.sessaoValida().then(function (s) {
            return Nuvem.retirarEquipa(s, email);
          }).then(function () {
            UI.fecharFolha();
            carregarEquipa();
          }).catch(function (e) {
            botao.disabled = false;
            document.getElementById('msg-retirar').textContent = e && e.codigo === 'sem-rede'
              ? 'Sem ligação. Tente de novo quando houver rede.'
              : 'Não foi possível retirar agora.';
          });
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

      '<div style="margin-top:32px">' + UI.escolhaCarro(x.modelo) + '</div>' +
      '<p class="meta" style="margin-top:12px">O convidado escolhe o modelo ao criar o acesso, e é esse o carro que vê na app. O desta ficha serve a organização.</p>' +
    '</div>';
  }
})();
