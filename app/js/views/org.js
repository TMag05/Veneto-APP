/* =========================================================
   Área da organização — itinerário, pessoas, contactos
   Estrutura do documento do diretor-geral. Gravação automática:
   não existe botão de guardar em lado nenhum.
   ========================================================= */

(function () {

  /* Cabeçalho comum a toda a área: nome, local, datas e
     indicadores rápidos, como pede o documento. */
  function cabecalhoEvento() {
    const e = DADOS.evento;
    const condutores = DADOS.participantes.filter(function (p) { return p.papel === 'condutor'; }).length;
    const acompanhantes = DADOS.participantes.length - condutores;

    return '<div class="capa capa--curta">' +
      UI.foto({ semente: e.nome || 'organizacao', variante: 'paisagem' }, 'foto--32 capa__imagem') +
      '<div class="capa__texto">' +
        '<p class="etiqueta">Organização</p>' +
        '<h1 class="titulo-editorial" style="margin-top:4px">' + UI.h(e.nome || 'Passeio sem nome') + '</h1>' +
        '<p class="meta" style="margin-top:4px">' +
          UI.h([e.base, UI.intervaloEvento()].filter(Boolean).join(' · ')) + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="faixa" style="margin-top:20px">' +
      '<div class="dados dados--quatro">' +
        '<div><div class="dado__valor num">' + DADOS.dias.length + '</div><div class="dado__rotulo meta">Etapas</div></div>' +
        '<div><div class="dado__valor num">' + condutores + '</div><div class="dado__rotulo meta">Condutores</div></div>' +
        '<div><div class="dado__valor num">' + acompanhantes + '</div><div class="dado__rotulo meta">Acompanhantes</div></div>' +
        '<div><div class="dado__valor num">' + Object.keys(POIS).length + '</div><div class="dado__rotulo meta">Paragens</div></div>' +
      '</div>' +
    '</div>';
  }

  function cabecalhoOrg(titulo, acao) {
    return {
      titulo: titulo,
      linha: true,
      acao: acao || { acao: 'verConvidado', icone: 'externo', rotulo: 'Ver como convidado' }
    };
  }

  const acoesComuns = {
    verConvidado: function () { App.ir('#/hoje'); }
  };

  /* «Alterado por Sara Duarte, 26 set., 14h02» — a última mão numa
     etapa ou numa paragem. */
  function editado(o) {
    const x = o && o.editado;
    if (!x || !x.em) return '';
    const d = new Date(x.em);
    const hora = String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
    return '<p class="meta num">Alterado' + (x.por ? ' por ' + UI.h(x.por) : '') + ', ' +
      UI.h(UI.dataCurta(Estado.chave(d))) + ', ' + hora + '</p>';
  }

  window.OrgComum = { cabecalhoEvento: cabecalhoEvento, cabecalhoOrg: cabecalhoOrg, acoesComuns: acoesComuns, editado: editado };

  /* ---------------------------------------------------------
     Entrada
     --------------------------------------------------------- */

  Vistas.orgInicio = {
    area: 'organizacao',
    nav: 'org-itinerario',
    cabecalho: cabecalhoOrg('Organização'),
    html: function () { return ''; },
    montar: function () { App.substituir('#/org/itinerario'); }
  };

  /* ---------------------------------------------------------
     Itinerário — lista de etapas
     --------------------------------------------------------- */

  Vistas.orgItinerario = {
    area: 'organizacao',
    nav: 'org-itinerario',
    cabecalho: cabecalhoOrg('Itinerário'),
    html: function () {
      const dias = DADOS.dias;

      const lista = dias.length
        ? dias.map(function (d, i) {
            const paragens = (d.etapas || []).length;
            return '<div class="linha-org">' +
              '<a class="linha-org__corpo" href="#/org/etapa/' + d.id + '">' +
                '<span class="etiqueta">Etapa ' + (i + 1) + (d.data ? ' · ' + UI.dataCurta(d.data) : '') + '</span>' +
                '<span class="titulo-ui" style="display:block;margin-top:4px">' +
                  UI.h(d.titulo || 'Etapa sem título') + '</span>' +
                '<span class="meta" style="display:block;margin-top:2px">' +
                  UI.plural(paragens, 'paragem', 'paragens') +
                  (d.distancia ? ' · ' + d.distancia + ' km' : '') +
                  ' · ' + UI.plural((d.momentos || []).length, 'momento', 'momentos') + '</span>' +
              '</a>' +
              '<div class="linha-org__acoes">' +
                '<button class="botao-icone" type="button" data-acao="subir" data-valor="' + d.id + '" aria-label="Subir"' +
                  (i === 0 ? ' disabled' : '') + '>' + Icone('seta', 20, 'style="transform:rotate(-90deg)"') + '</button>' +
                '<button class="botao-icone" type="button" data-acao="descer" data-valor="' + d.id + '" aria-label="Descer"' +
                  (i === dias.length - 1 ? ' disabled' : '') + '>' + Icone('seta', 20, 'style="transform:rotate(90deg)"') + '</button>' +
              '</div>' +
            '</div>';
          }).join('')
        : '<div class="vazio">' +
            '<p class="corpo-editorial">Ainda não há etapas.</p>' +
            '<p class="meta" style="margin-top:8px">Cada etapa é um dia do passeio: data, título, percurso e paragens.</p>' +
          '</div>';

      return cabecalhoEvento() +
        '<div class="faixa" style="padding-top:24px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Etapas</h2>' +
            '<span class="meta num">' + dias.length + '</span></div>' +
          lista +
          '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="novaEtapa">' +
            Icone('juntar', 20) + 'Adicionar etapa</button>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Paragens</h2>' +
            '<span class="meta num">' + Object.keys(POIS).length + '</span></div>' +
          '<p class="corpo-ui silencioso">As paragens são partilhadas por todas as etapas. Podem ser criadas de raiz ou escolhidas da lista de sugestões da região.</p>' +
          '<div class="lista" style="margin-top:16px">' +
            Object.keys(POIS).map(function (id) {
              const p = POIS[id];
              return UI.linhaLista({
                titulo: p.nome,
                nota: [p.local, p.lat ? p.lat.toFixed(3) + ', ' + p.lng.toFixed(3) : 'sem coordenadas'].filter(Boolean).join(' · '),
                icone: 'pin',
                href: '#/org/paragem/' + id
              });
            }).join('') +
          '</div>' +
          '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="novaParagem">' +
            Icone('juntar', 20) + 'Nova paragem</button>' +
          '<button class="botao botao--texto" style="width:100%" type="button" data-acao="sugestoes">Escolher das sugestões da região &rsaquo;</button>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="lista">' +
            UI.linhaLista({
              titulo: 'Fotografias de abertura',
              nota: UI.plural((DADOS.fotosIniciais || []).length, 'fotografia publicada', 'fotografias publicadas'),
              icone: 'galeria',
              href: '#/org/fotos'
            }) +
          '</div>' +
        '</div>';
    },
    acoes: Object.assign({}, acoesComuns, {
      novaEtapa: function () { App.ir('#/org/etapa/' + Conteudo.criarDia()); },
      subir: function (id) { Conteudo.moverDia(id, -1); },
      descer: function (id) { Conteudo.moverDia(id, 1); },
      novaParagem: function () { App.ir('#/org/paragem/' + Conteudo.criarPoi({ nome: '' })); },
      sugestoes: function () { OrgEtapa.abrirSugestoes(null); }
    })
  };

  /* ---------------------------------------------------------
     Evento — nome, base, datas e cópia de segurança
     --------------------------------------------------------- */

  /* Quanto tempo fica o álbum de pé. Seis meses depois do último
     dia, por omissão; a data muda-se aqui. O apagamento é um gesto
     de quem organiza, não um relógio a correr sozinho. */
  function seccaoArquivo() {
    const faltam = Conteudo.diasAteApagar();
    const guardadas = Estado.fotos().length;

    let aviso = '';
    if (faltam !== null && faltam <= 30) {
      aviso = '<div class="selado selado--aviso" style="margin-top:16px">' +
        '<p class="corpo-ui">' +
          (faltam < 0
            ? 'A data de apagar já passou.'
            : (faltam === 0 ? 'O arquivo apaga-se hoje.' : 'Faltam ' + faltam + ' dias para apagar o arquivo.')) +
        '</p>' +
        '<p class="meta" style="margin-top:8px">Avise o grupo antes. Depois de apagadas não voltam.</p>' +
      '</div>';
    }

    return '<div class="faixa">' +
      '<div class="seccao-cabecalho"><h2 class="etiqueta">Arquivo</h2></div>' +
      '<p class="corpo-ui silencioso">As fotografias do grupo ficam disponíveis até esta data. ' +
        'Passada, apagam-se à mão, a partir daqui.</p>' +
      '<div class="pilha-2" style="margin-top:16px">' +
        UI.campo({ rotulo: 'Apagar a partir de', nome: 'apagarEm', valor: Conteudo.apagarEm(), tipo: 'data',
          nota: 'Seis meses depois do último dia, se não se mudar.' }) +
      '</div>' +
      aviso +
      '<button class="botao botao--texto botao--apagar" style="margin-top:16px" type="button" data-acao="apagarArquivo">' +
        Icone('apagar', 20) + 'Apagar as fotografias (' + guardadas + ')</button>' +
    '</div>';
  }

  Vistas.orgEvento = {
    area: 'organizacao',
    nav: 'org-evento',
    cabecalho: cabecalhoOrg('Evento'),
    html: function () {
      const e = DADOS.evento;
      return cabecalhoEvento() +
        '<div class="faixa" style="padding-top:24px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Dados do evento</h2></div>' +
          '<div class="pilha-2">' +
            UI.campo({ rotulo: 'Nome do passeio', nome: 'nome', valor: e.nome, placeholder: 'Dolomites Grand Tour' }) +
            UI.campo({ rotulo: 'Subtítulo', nome: 'subtitulo', valor: e.subtitulo || '', placeholder: 'Há estradas que só se contam a quem lá esteve.' }) +
            UI.campo({ rotulo: 'Local / base', nome: 'base', valor: e.base, placeholder: 'Onde o grupo dorme' }) +
            '<div class="par-campos">' +
              UI.campo({ rotulo: 'Início', nome: 'inicio', valor: e.inicio, tipo: 'data' }) +
              UI.campo({ rotulo: 'Fim', nome: 'fim', valor: e.fim, tipo: 'data' }) +
            '</div>' +
            UI.campo({ rotulo: 'Alojamento', nome: 'hotel', valor: e.hotel, placeholder: 'Hotel de base' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Concierge</h2></div>' +
          '<p class="corpo-ui silencioso">Quem responde do outro lado. O convidado vê a cara, o nome e a promessa — e é isso que faz a diferença entre um chat e um serviço.</p>' +
          '<div style="margin-top:16px">' +
            UI.campoFoto({
              rotulo: 'Fotografia', id: 'ent-foto-conc', acao: 'fotoConcierge', remover: 'tirarFotoConcierge',
              valor: (e.concierge && e.concierge.foto) || '', nota: 'Um retrato, não um logótipo.'
            }) +
          '</div>' +
          '<div class="pilha-2" style="margin-top:16px">' +
            UI.campo({ rotulo: 'Nome', nome: 'c_nome', valor: (e.concierge && e.concierge.nome) || '', placeholder: 'Sara Duarte' }) +
            UI.campo({ rotulo: 'Função', nome: 'c_papel', valor: (e.concierge && e.concierge.papel) || '', placeholder: 'Concierge do passeio' }) +
            UI.campo({ rotulo: 'Promessa de resposta', nome: 'c_promessa', valor: (e.concierge && e.concierge.promessa) || '',
              placeholder: 'Respondemos em menos de dez minutos. Sempre uma pessoa.',
              nota: 'Só prometer o que se cumpre.' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Briefing</h2></div>' +
          '<p class="corpo-ui silencioso">O que o convidado lê nos dias que antecedem a partida.</p>' +
          '<div class="pilha-2" style="margin-top:16px">' +
            UI.campo({ rotulo: 'Como se anda na estrada', nome: 'formato',
              valor: e.formato === undefined ? SEMENTE.evento.formato : e.formato, tipo: 'area', linhas: 3,
              nota: 'Aparece por cima do programa. Deixar vazio para não mostrar.' }) +
            UI.campo({ rotulo: 'O que levar', nome: 'levar', valor: (e.levar || []).join('\n'), tipo: 'area', linhas: 6,
              placeholder: 'Um item por linha' }) +
            UI.campo({ rotulo: 'Notas práticas', nome: 'notas', valor: (e.notas || []).join('\n'), tipo: 'area', linhas: 3,
              placeholder: 'Uma nota por linha' }) +
          '</div>' +
        '</div>' +

        seccaoArquivo() +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Cópia de segurança</h2></div>' +
          '<p class="corpo-ui silencioso">Por agora, tudo o que se edita aqui vive neste telemóvel. Descarregue o ficheiro depois de trabalhar.</p>' +
          '<div class="lista" style="margin-top:16px">' +
            UI.linhaLista({ titulo: 'Descarregar cópia', nota: 'Ficheiro JSON com tudo', icone: 'descarregar', acao: 'exportar' }) +
            UI.linhaLista({ titulo: 'Restaurar de um ficheiro', nota: 'Substitui o que está neste telemóvel', icone: 'sincronizar', acao: 'importar' }) +
            UI.linhaLista({ titulo: 'Lista de participantes', nota: 'Ficheiro CSV para Excel', icone: 'documento', acao: 'csv' }) +
            UI.linhaLista({ titulo: 'Carregar passeio de exemplo', nota: 'O passeio de origem, com pessoas de exemplo', icone: 'juntar', acao: 'exemplo' }) +
            UI.linhaLista({ titulo: 'Repor tudo', nota: 'Volta ao passeio de origem e apaga o estado local', icone: 'fechar', acao: 'repor' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="lista">' +
            UI.linhaLista({ titulo: 'Ver como convidado', nota: 'A app que os convidados veem', icone: 'externo', acao: 'verConvidado' }) +
            UI.linhaLista({ titulo: 'Terminar sessão', nota: Estado.get().perfil.email, icone: 'fechar', acao: 'sair' }) +
          '</div>' +
          '<p class="meta" style="margin-top:24px">Cada pessoa da equipa entra com o seu acesso. As etapas e as paragens dizem quem as alterou por último.</p>' +
        '</div>';
    },
    montar: function (el) {
      const ent = el.querySelector('#ent-foto-conc');
      if (ent) {
        ent.addEventListener('change', function () {
          const f = ent.files && ent.files[0];
          if (!f) return;
          UI.reduzirImagem(f, 480, function (dataUrl) {
            if (dataUrl) Conteudo.atualizarConcierge({ foto: dataUrl });
          });
          ent.value = '';
        });
      }

      UI.ligarCampos(el, function (nome, valor) {
        if (nome.indexOf('c_') === 0) {
          const patch = {};
          patch[nome.slice(2)] = valor;
          Conteudo.atualizarConcierge(patch);
          return;
        }
        const patch = {};
        patch[nome] = (nome === 'levar' || nome === 'notas')
          ? String(valor).split('\n').map(function (t) { return t.trim(); }).filter(Boolean)
          : valor;
        Conteudo.atualizarEvento(patch);
      });
    },
    acoes: Object.assign({}, acoesComuns, {
      fotoConcierge: function () { document.getElementById('ent-foto-conc').click(); },
      tirarFotoConcierge: function () { Conteudo.atualizarConcierge({ foto: '' }); },

      exemplo: function () {
        UI.abrirFolha('Carregar exemplo',
          '<p class="corpo-ui silencioso">Repõe o passeio de origem e junta-lhe participantes e contactos de exemplo. Não são pessoas reais — apaga o que estiver registado.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-exemplo">Carregar</button>');
        document.getElementById('btn-exemplo').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.carregarExemplo();
          App.ir('#/org/itinerario');
        });
      },

      repor: function () {
        UI.abrirFolha('Repor tudo',
          '<p class="corpo-ui silencioso">Apaga o itinerário, os participantes, os contactos e as fotografias guardadas neste telemóvel.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-repor">Repor</button>');
        document.getElementById('btn-repor').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.repor();
          Estado.reiniciar();
          location.hash = '#/entrar';
        });
      },

      apagarArquivo: function () {
        const n = Estado.fotos().length;
        if (!n) {
          UI.abrirFolha('Arquivo vazio', '<p class="corpo-ui silencioso">Não há fotografias para apagar.</p>');
          return;
        }
        UI.abrirFolha('Apagar as fotografias',
          '<p class="corpo-ui silencioso">Saem ' + UI.plural(n, 'fotografia', 'fotografias') +
            ' deste telemóvel, as do grupo e as de abertura. Não se recuperam.</p>' +
          '<p class="meta" style="margin-top:16px">Descarregue o álbum antes, se ainda não o fez.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-apagar-arquivo">Apagar tudo</button>');
        document.getElementById('btn-apagar-arquivo').addEventListener('click', function () {
          UI.fecharFolha();
          (DADOS.fotosIniciais || []).slice().forEach(function (f) { Conteudo.removerFotoInicial(f.id); });
          Estado.get().fotos.slice().forEach(function (f) { Estado.apagarFoto(f.id); });
          Fotos.limpar().catch(function () {});
          App.repintar();
        });
      },
      exportar: function () {
        const nome = 'passeio-' + (DADOS.evento.nome || 'evento').toLowerCase().replace(/\s+/g, '-') + '.json';
        UI.descarregar(nome, Conteudo.exportar(), 'application/json');
      },
      importar: function () {
        UI.abrirFolha('Restaurar de um ficheiro',
          '<p class="corpo-ui silencioso">Substitui tudo o que está neste telemóvel pelo que vem no ficheiro.</p>' +
          '<input type="file" id="ent-json" accept="application/json,.json" style="margin-top:24px">' +
          '<p class="meta" id="msg-json" style="margin-top:16px"></p>');
        document.getElementById('ent-json').addEventListener('change', function (ev) {
          const f = ev.target.files[0];
          if (!f) return;
          const leitor = new FileReader();
          leitor.onload = function () {
            try {
              Conteudo.importar(leitor.result);
              UI.fecharFolha();
            } catch (erro) {
              document.getElementById('msg-json').textContent = 'Não foi possível ler o ficheiro.';
            }
          };
          leitor.readAsText(f);
        });
      },
      csv: function () {
        const cabecalho = ['Nome', 'Apelido', 'Nascimento', 'Papel', 'Equipa', 'Telefone', 'Email', 'Carta', 'Apolice', 'Matricula', 'Modelo'];
        const linhas = DADOS.participantes.map(function (p) {
          return [p.nome, p.apelido, p.nascimento, p.papel, p.equipa, p.telefone, p.email,
            p.papel === 'condutor' ? p.carta : '', p.papel === 'condutor' ? p.apolice : '',
            p.papel === 'condutor' ? p.matricula : '',
            p.papel === 'condutor' ? Silhuetas.modelo(p.modelo).nome : ''];
        });
        const csv = [cabecalho].concat(linhas).map(function (l) {
          return l.map(function (c) { return '"' + String(c || '').replace(/"/g, '""') + '"'; }).join(';');
        }).join('\n');
        UI.descarregar('participantes.csv', '﻿' + csv, 'text/csv;charset=utf-8');
      },
      sair: function () {
        UI.abrirFolha('Terminar sessão',
          '<p class="corpo-ui silencioso">Para voltar a entrar, use a porta da organização, no fim da entrada, com o email e a palavra-passe.</p>' +
          '<button class="botao botao--principal botao--largo" style="margin-top:24px" type="button" id="btn-sair">Terminar sessão</button>');
        document.getElementById('btn-sair').addEventListener('click', function () {
          UI.fecharFolha();
          Estado.terminarSessao();
        });
      }
    })
  };
})();
