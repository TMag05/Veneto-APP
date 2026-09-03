/* =========================================================
   Área da organização — editor de etapa e de paragem
   ========================================================= */

(function () {

  const TIPOS_POI = [
    { valor: 'vila', rotulo: 'Vila' },
    { valor: 'cidade', rotulo: 'Cidade' },
    { valor: 'estrada', rotulo: 'Estrada ou passo' },
    { valor: 'lago', rotulo: 'Lago' },
    { valor: 'miradouro', rotulo: 'Miradouro' },
    { valor: 'monumento', rotulo: 'Monumento' },
    { valor: 'villa', rotulo: 'Villa ou palácio' },
    { valor: 'vinha', rotulo: 'Produtor' },
    { valor: 'logistica', rotulo: 'Logística' }
  ];

  const TIPOS_MOMENTO = [
    { valor: 'partida', rotulo: 'Partida' },
    { valor: 'paragem', rotulo: 'Paragem' },
    { valor: 'visita', rotulo: 'Visita' },
    { valor: 'refeicao', rotulo: 'Refeição' },
    { valor: 'prova', rotulo: 'Prova' },
    { valor: 'logistica', rotulo: 'Logística' }
  ];

  function bruto(diaId) {
    return Conteudo.bruto().dias.find(function (d) { return d.id === diaId; });
  }

  /* ---------------------------------------------------------
     Sugestões da região
     --------------------------------------------------------- */

  function abrirSugestoes(diaId) {
    const existentes = Object.keys(POIS).map(function (id) { return POIS[id].nome; });

    UI.abrirFolha('Sugestões da região',
      '<p class="corpo-ui silencioso">Sítios da zona com coordenadas já preenchidas. Confirme-as antes de gerar os percursos.</p>' +
      '<div class="lista" style="margin-top:16px">' +
        DADOS.biblioteca.map(function (b, i) {
          const jaExiste = existentes.indexOf(b.nome) >= 0;
          return '<button class="lista-linha" type="button" data-sugestao="' + i + '"' + (jaExiste ? ' disabled' : '') + '>' +
            '<span class="lista-linha__corpo">' +
              '<span class="titulo-ui" style="display:block">' + UI.h(b.nome) + '</span>' +
              '<span class="meta" style="display:block;margin-top:2px">' + UI.h(b.local) +
                (jaExiste ? ' · já adicionada' : '') + '</span>' +
            '</span>' +
            '<span class="lista-linha__seta">' + Icone(jaExiste ? 'verificado' : 'juntar', 20) + '</span>' +
          '</button>';
        }).join('') +
      '</div>');

    document.querySelectorAll('[data-sugestao]').forEach(function (el) {
      el.addEventListener('click', function () {
        const b = DADOS.biblioteca[parseInt(el.dataset.sugestao, 10)];
        const id = Conteudo.criarPoi(b);
        if (diaId) Conteudo.juntarParagem(diaId, id);
        UI.fecharFolha();
      });
    });
  }

  window.OrgEtapa = { abrirSugestoes: abrirSugestoes };

  /* ---------------------------------------------------------
     Etapa
     --------------------------------------------------------- */

  Vistas.orgEtapa = {
    area: 'organizacao',
    nav: 'org-itinerario',
    cabecalho: { voltar: '#/org/itinerario', titulo: 'Etapa', tituloSempre: true },
    html: function (p) {
      const d = bruto(p.id);
      if (!d) return '<div class="faixa" style="padding-top:24px"><p class="corpo-editorial">Etapa não encontrada.</p></div>';
      const projetado = DADOS.dia(p.id);

      return '<div class="faixa" style="padding-top:24px">' +
          UI.campoFoto({
            rotulo: 'Fotografia da etapa', id: 'ent-foto-etapa', acao: 'foto', remover: 'tirarFoto',
            valor: d.imagem && d.imagem.dataUrl ? d.imagem.dataUrl : '',
            nota: 'É a capa que o convidado vê. Sem ela, fica um desenho.'
          }) +
          '<div class="pilha-2" style="margin-top:24px">' +
            UI.campo({ rotulo: 'Data', nome: 'data', valor: d.data, tipo: 'data' }) +
            UI.campo({ rotulo: 'Título da etapa', nome: 'titulo', valor: d.titulo,
              placeholder: 'Cortina → Falzarego → Gardena' }) +
            UI.campo({ rotulo: 'Subtítulo', nome: 'subtitulo', valor: d.subtitulo,
              placeholder: 'Uma frase, em itálico, por baixo do título' }) +
            UI.campo({ rotulo: 'Notas, percurso e paragens', nome: 'resumo', valor: d.resumo, tipo: 'area', linhas: 5,
              placeholder: 'Descrição do percurso, paragens fotográficas, almoço, hotel de destino' }) +
            UI.campo({ rotulo: 'Alojamento no fim da etapa', nome: 'hotel', valor: d.hotel, tipo: 'lista',
              opcoes: [{ valor: '', rotulo: 'Sem alojamento associado' }].concat(
                DADOS.locais.filter(function (l) { return l.tipo === 'hotel'; })
                  .map(function (l) { return { valor: l.id, rotulo: l.nome || 'Hotel sem nome' }; })),
              nota: 'Os hotéis criam-se no separador Contactos.' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Paragens</h2>' +
            '<span class="meta num">' + (projetado.distancia || 0) + ' km · ' + UI.h(projetado.duracao || '—') + '</span></div>' +
          ((d.etapas || []).length
            ? (d.etapas || []).map(function (id, i) {
                const poi = POIS[id];
                return '<div class="linha-org">' +
                  '<a class="linha-org__corpo" href="#/org/paragem/' + id + '">' +
                    '<span class="titulo-ui" style="display:block">' + UI.h(poi ? poi.nome : 'Paragem apagada') + '</span>' +
                    '<span class="meta" style="display:block;margin-top:2px">' + UI.h(poi ? poi.local : '') + '</span>' +
                  '</a>' +
                  '<div class="linha-org__acoes">' +
                    '<button class="botao-icone" type="button" data-acao="subirParagem" data-valor="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>' +
                      Icone('seta', 20, 'style="transform:rotate(-90deg)"') + '</button>' +
                    '<button class="botao-icone" type="button" data-acao="descerParagem" data-valor="' + i + '" aria-label="Descer"' + (i === d.etapas.length - 1 ? ' disabled' : '') + '>' +
                      Icone('seta', 20, 'style="transform:rotate(90deg)"') + '</button>' +
                    '<button class="botao-icone" type="button" data-acao="tirarParagem" data-valor="' + i + '" aria-label="Retirar">' +
                      Icone('fechar', 20) + '</button>' +
                  '</div>' +
                '</div>';
              }).join('')
            : '<div class="vazio"><p class="corpo-ui silencioso">Sem paragens. O percurso desta etapa começa aqui.</p></div>') +

          '<div class="pilha" style="margin-top:16px">' +
            '<button class="botao botao--secundario botao--largo" type="button" data-acao="juntarExistente">' +
              Icone('juntar', 20) + 'Juntar paragem existente</button>' +
            '<button class="botao botao--secundario botao--largo" type="button" data-acao="juntarSugestao">' +
              Icone('pin', 20) + 'Escolher das sugestões</button>' +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Programa do dia</h2>' +
            '<span class="meta num">' + (d.momentos || []).length + '</span></div>' +
          '<p class="corpo-ui silencioso">É isto que o convidado vê em "Hoje". Alterar uma hora marca o momento como alterado no telemóvel de toda a gente.</p>' +
          '<div style="margin-top:16px">' +
            (d.momentos || []).map(function (m, i) { return momentoEditor(d, m, i); }).join('') +
          '</div>' +
          '<button class="botao botao--secundario botao--largo" style="margin-top:16px" type="button" data-acao="novoMomento">' +
            Icone('juntar', 20) + 'Adicionar momento</button>' +
        '</div>' +

        '<div class="faixa">' +
          '<button class="botao botao--secundario botao--largo" type="button" data-acao="remover">Remover etapa</button>' +
        '</div>';
    },

    montar: function (el, p) {
      const ent = el.querySelector('#ent-foto-etapa');
      if (ent) {
        ent.addEventListener('change', function () {
          const f = ent.files && ent.files[0];
          if (!f) return;
          UI.reduzirImagem(f, 1600, function (dataUrl) {
            if (dataUrl) Conteudo.atualizarDia(p.id, { imagem: { dataUrl: dataUrl } });
          });
          ent.value = '';
        });
      }

      UI.ligarCampos(el, function (nome, valor, campo) {
        const dono = campo.closest('[data-momento]');
        if (dono) {
          const patch = {};
          patch[nome] = valor;
          Conteudo.atualizarMomento(p.id, parseInt(dono.dataset.momento, 10), patch);
          return;
        }
        const patch = {};
        patch[nome] = valor;
        Conteudo.atualizarDia(p.id, patch);
      });
    },

    acoes: {
      foto: function () { document.getElementById('ent-foto-etapa').click(); },
      tirarFoto: function (v, el, p) {
        Conteudo.atualizarDia(p.id, { imagem: { variante: 'paisagem', semente: p.id } });
      },
      subirParagem: function (i, el, p) { Conteudo.moverParagem(p.id, parseInt(i, 10), -1); },
      descerParagem: function (i, el, p) { Conteudo.moverParagem(p.id, parseInt(i, 10), 1); },
      tirarParagem: function (i, el, p) { Conteudo.removerParagem(p.id, parseInt(i, 10)); },
      juntarSugestao: function (v, el, p) { abrirSugestoes(p.id); },

      juntarExistente: function (v, el, p) {
        const ids = Object.keys(POIS);
        if (!ids.length) { abrirSugestoes(p.id); return; }
        UI.abrirFolha('Juntar paragem',
          '<div class="lista">' + ids.map(function (id) {
            return '<button class="lista-linha" type="button" data-juntar="' + id + '">' +
              '<span class="lista-linha__corpo">' +
                '<span class="titulo-ui" style="display:block">' + UI.h(POIS[id].nome) + '</span>' +
                '<span class="meta" style="display:block;margin-top:2px">' + UI.h(POIS[id].local) + '</span>' +
              '</span><span class="lista-linha__seta">' + Icone('juntar', 20) + '</span></button>';
          }).join('') + '</div>' +
          '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" id="btn-nova-paragem">Criar paragem nova</button>');

        document.querySelectorAll('[data-juntar]').forEach(function (b) {
          b.addEventListener('click', function () {
            Conteudo.juntarParagem(p.id, b.dataset.juntar);
            UI.fecharFolha();
          });
        });
        document.getElementById('btn-nova-paragem').addEventListener('click', function () {
          const id = Conteudo.criarPoi({ nome: '' });
          Conteudo.juntarParagem(p.id, id);
          UI.fecharFolha();
          App.ir('#/org/paragem/' + id);
        });
      },

      novoMomento: function (v, el, p) { Conteudo.criarMomento(p.id); },
      removerMomento: function (i, el, p) { Conteudo.removerMomento(p.id, parseInt(i, 10)); },
      limparAlteracao: function (i, el, p) { Conteudo.limparAlteracao(p.id, parseInt(i, 10)); },

      alterarHora: function (i, el, p) {
        const indice = parseInt(i, 10);
        const m = bruto(p.id).momentos[indice];
        UI.abrirFolha('Alterar a hora',
          '<p class="corpo-ui silencioso">O momento fica marcado como alterado no programa de toda a gente, com a razão à vista.</p>' +
          '<div class="pilha-2" style="margin-top:24px">' +
            UI.campo({ rotulo: 'Nova hora', nome: 'novaHora', valor: m.hora, tipo: 'hora' }) +
            UI.campo({ rotulo: 'Razão', nome: 'razao', valor: '', placeholder: 'O produtor antecipou a prova' }) +
          '</div>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-alterar">Publicar alteração</button>');

        document.getElementById('btn-alterar').addEventListener('click', function () {
          const painel = document.getElementById('folha');
          const hora = painel.querySelector('[data-campo="novaHora"]').value;
          const razao = painel.querySelector('[data-campo="razao"]').value;
          Conteudo.alterarHora(p.id, indice, hora, razao);
          UI.fecharFolha();
        });
      },

      remover: function (v, el, p) {
        UI.abrirFolha('Remover etapa',
          '<p class="corpo-ui silencioso">A etapa desaparece do itinerário. As paragens continuam disponíveis para outras etapas.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-remover-etapa">Remover</button>');
        document.getElementById('btn-remover-etapa').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.removerDia(p.id);
          App.substituir('#/org/itinerario');
        });
      }
    }
  };

  function momentoEditor(d, m, i) {
    const opcoesPoi = [{ valor: '', rotulo: 'Sem paragem associada' }]
      .concat((d.etapas || []).map(function (id) {
        return { valor: id, rotulo: POIS[id] ? POIS[id].nome : id };
      }));

    return '<div class="cartao-org" data-momento="' + i + '">' +
      '<div class="par par--espalhado" style="align-items:center">' +
        '<span class="etiqueta">' + UI.h(m.hora || '--:--') + (m.alterado ? ' · alterado' : '') + '</span>' +
        '<div style="display:flex">' +
          '<button class="botao-icone" type="button" data-acao="alterarHora" data-valor="' + i + '" aria-label="Alterar hora e avisar">' +
            Icone('sincronizar', 20) + '</button>' +
          (m.alterado ? '<button class="botao-icone" type="button" data-acao="limparAlteracao" data-valor="' + i + '" aria-label="Retirar marca de alterado">' +
            Icone('verificado', 20) + '</button>' : '') +
          '<button class="botao-icone" type="button" data-acao="removerMomento" data-valor="' + i + '" aria-label="Remover momento">' +
            Icone('fechar', 20) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="pilha-2" style="margin-top:12px">' +
        '<div class="par-campos">' +
          UI.campo({ rotulo: 'Hora', nome: 'hora', valor: m.hora, tipo: 'hora' }) +
          UI.campo({ rotulo: 'Fim', nome: 'fim', valor: m.fim, tipo: 'hora' }) +
        '</div>' +
        UI.campo({ rotulo: 'Título', nome: 'titulo', valor: m.titulo, placeholder: 'Almoço' }) +
        UI.campo({ rotulo: 'Local', nome: 'local', valor: m.local, placeholder: 'Rifugio Averau' }) +
        UI.campo({ rotulo: 'Tipo', nome: 'tipo', valor: m.tipo, tipo: 'lista', opcoes: TIPOS_MOMENTO }) +
        UI.campo({ rotulo: 'Paragem', nome: 'poi', valor: m.poi, tipo: 'lista', opcoes: opcoesPoi }) +
        UI.campo({ rotulo: 'Nota', nome: 'nota', valor: m.nota, placeholder: 'Uma frase, no máximo' }) +
      '</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     Paragem
     --------------------------------------------------------- */

  Vistas.orgParagem = {
    area: 'organizacao',
    nav: 'org-itinerario',
    cabecalho: { voltar: '#/org/itinerario', titulo: 'Paragem', tituloSempre: true },
    html: function (p) {
      const poi = POIS[p.id];
      if (!poi) return '<div class="faixa" style="padding-top:24px"><p class="corpo-editorial">Paragem não encontrada.</p></div>';

      const usadaEm = DADOS.dias.filter(function (d) { return (d.etapas || []).indexOf(p.id) >= 0; });

      return '<div class="faixa" style="padding-top:24px">' +
          UI.campoFoto({
            rotulo: 'Fotografia da paragem', id: 'ent-foto-poi', acao: 'foto', remover: 'tirarFoto',
            valor: poi.imagem && poi.imagem.dataUrl ? poi.imagem.dataUrl : '',
            nota: 'Sem fotografia, é gerado um desenho da região.'
          }) +
          '<div class="pilha-2" style="margin-top:24px">' +
            UI.campo({ rotulo: 'Nome', nome: 'nome', valor: poi.nome, placeholder: 'Passo Falzarego' }) +
            UI.campo({ rotulo: 'Local', nome: 'local', valor: poi.local, placeholder: '2105 m' }) +
            UI.campo({ rotulo: 'Tipo', nome: 'tipo', valor: poi.tipo, tipo: 'lista', opcoes: TIPOS_POI }) +
          '</div>' +
        '</div>' +

        '<div class="faixa faixa--recuada" style="margin-top:32px">' +
          '<h2 class="etiqueta">Coordenadas</h2>' +
          '<p class="corpo-ui silencioso" style="margin-top:8px">Cole aqui o endereço do Google Maps ou as coordenadas. São elas que geram o mapa e a navegação.</p>' +
          '<div style="margin-top:16px">' +
            UI.campo({ rotulo: 'Colar do Google Maps', nome: 'colar', valor: '',
              placeholder: 'https://maps.app.goo.gl/… ou 46.5194, 12.0086' }) +
          '</div>' +
          '<div class="par-campos" style="margin-top:16px">' +
            UI.campo({ rotulo: 'Latitude', nome: 'lat', valor: poi.lat || '', modo: 'decimal' }) +
            UI.campo({ rotulo: 'Longitude', nome: 'lng', valor: poi.lng || '', modo: 'decimal' }) +
          '</div>' +
          '<div style="margin-top:16px">' +
            UI.campo({ rotulo: 'Altitude', nome: 'altitude', valor: poi.altitude || '', modo: 'numeric',
              placeholder: '2105', nota: 'Em metros. Aparece na certidão do álbum.' }) +
          '</div>' +
          (poi.lat && poi.lng
            ? '<a class="botao botao--secundario botao--largo" style="margin-top:16px" href="' + UI.linkLocal(p.id) + '" target="_blank" rel="noopener">' +
                Icone('externo', 20) + 'Confirmar no Google Maps</a>'
            : '<p class="meta" style="margin-top:16px">Sem coordenadas, esta paragem não aparece no mapa nem gera percurso.</p>') +
        '</div>' +

        '<div class="faixa" style="margin-top:32px">' +
          '<div class="seccao-cabecalho"><h2 class="etiqueta">Conteúdo editorial</h2></div>' +
          '<div class="pilha-2">' +
            UI.campo({ rotulo: 'Subtítulo', nome: 'subtitulo', valor: poi.subtitulo,
              placeholder: 'Uma frase. Aparece em itálico por baixo do nome' }) +
            UI.campo({ rotulo: 'História', nome: 'historia', valor: (poi.historia || []).join('\n\n'), tipo: 'area', linhas: 8,
              placeholder: 'Dois ou três parágrafos. Separe-os com uma linha em branco.',
              nota: 'Só abre ao convidado quando ele marca chegada.' }) +
            UI.campo({ rotulo: 'Nota prática', nome: 'nota', valor: poi.nota,
              placeholder: 'Estacionamento, horários, o que levar' }) +
            UI.campo({ rotulo: 'Revelar em', nome: 'revelacao', valor: poi.revelacao, tipo: 'data',
              nota: 'Nos dias antes de partir, uma paragem por dia. Em branco, fica visível desde já.' }) +
          '</div>' +
        '</div>' +

        '<div class="faixa">' +
          '<p class="meta">' + (usadaEm.length
            ? 'Usada em: ' + usadaEm.map(function (d) { return UI.h(d.titulo || 'etapa ' + d.numero); }).join(', ')
            : 'Ainda não está em nenhuma etapa.') + '</p>' +
          '<button class="botao botao--secundario botao--largo" style="margin-top:24px" type="button" data-acao="remover">Remover paragem</button>' +
        '</div>';
    },

    montar: function (el, p) {
      const ent = el.querySelector('#ent-foto-poi');
      if (ent) {
        ent.addEventListener('change', function () {
          const f = ent.files && ent.files[0];
          if (!f) return;
          UI.reduzirImagem(f, 1600, function (dataUrl) {
            if (dataUrl) Conteudo.atualizarPoi(p.id, { imagem: { dataUrl: dataUrl } });
          });
          ent.value = '';
        });
      }

      UI.ligarCampos(el, function (nome, valor, campo) {
        if (nome === 'colar') {
          const c = UI.coordenadas(valor);
          if (c) {
            Conteudo.atualizarPoi(p.id, { lat: c.lat, lng: c.lng });
            campo.value = '';
          }
          return;
        }
        const patch = {};
        if (nome === 'lat' || nome === 'lng' || nome === 'altitude') {
          const n = parseFloat(String(valor).replace(',', '.'));
          patch[nome] = isNaN(n) ? 0 : n;
        } else if (nome === 'historia') {
          patch.historia = String(valor).split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean);
        } else {
          patch[nome] = valor;
        }
        Conteudo.atualizarPoi(p.id, patch);
      });
    },

    acoes: {
      foto: function () { document.getElementById('ent-foto-poi').click(); },
      tirarFoto: function (v, el, p) {
        Conteudo.atualizarPoi(p.id, { imagem: { variante: Conteudo.varianteDe(POIS[p.id].tipo), semente: p.id } });
      },
      remover: function (v, el, p) {
        UI.abrirFolha('Remover paragem',
          '<p class="corpo-ui silencioso">Sai de todas as etapas onde estiver.</p>' +
          '<button class="botao botao--rosso botao--largo" style="margin-top:24px" type="button" id="btn-remover-poi">Remover</button>');
        document.getElementById('btn-remover-poi').addEventListener('click', function () {
          UI.fecharFolha();
          Conteudo.removerPoi(p.id);
          App.substituir('#/org/itinerario');
        });
      }
    }
  };
})();
