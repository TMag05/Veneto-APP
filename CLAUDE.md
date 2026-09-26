# CLAUDE.md — instruções do projeto

App do passeio anual de clientes Aston Martin. Edição de 2026: **Dolomites Grand Tour** — *Da Grande Guerra à Laguna de Veneza*. Do Monte Grappa às Pale di San Martino, pelas colinas do Prosecco e pelo Cansiglio, até Veneza. Não passa por Cortina.
Este ficheiro é a linha de pensamento do projeto. Ler antes de escrever código.

---

## 1. O que é

Uma aplicação web mobile, instalável como PWA, sem dependências e sem passo de build, que acompanha trinta proprietários Aston Martin durante o passeio — e que é, em cada momento, o único sítio onde a informação certa vive.

São **duas apps sobre a mesma base de dados**:

- **A app do convidado** — trinta telemóveis, offline, roadbook editorial, sobretudo de leitura.
- **A área da organização** — itinerário, pessoas e contactos, tudo editável, gravação automática.

**O conteúdo é dado, não é código.** O itinerário é editado dentro da app, na área da organização, e aparece de imediato no telemóvel do convidado. A única exceção, até haver servidor, é a semente: o passeio real de 2026 vive em `semente.js` (`roteiro` e `biblioteca`), porque é o que cada telemóvel carrega à primeira abertura. Não escrever conteúdo do passeio em mais nenhum ficheiro `.js`.

---

## 2. A hierarquia da verdade

Quando dois documentos se contradizem, vale esta ordem:

1. **`app/css/tokens.css`** — paleta, tipografia, forma e ritmo. Fonte única de verdade do desenho. Não introduzir cores, raios ou espaçamentos fora desta folha.
2. **`README.md`** — o estado atual, as decisões em vigor e a lista do que é provisório.
3. **`ENQUADRAMENTO.md`** — o âmbito acordado, a comparação com o documento do diretor-geral e as perguntas ainda por responder.
4. **`MANIFESTO.md`** — os princípios. O *porquê* de tudo. Continua válido, tirando as fases que saíram do âmbito (§5 FASE 1).
5. **`BRAND-GUIDELINES.md`** — o argumento cultural e a disciplina. A **§4 voltou a valer**: é de lá que vem a paleta do tema claro. As **§6 e §12 continuam desatualizadas** (descrevem uma app ortogonal e sem sombras). O código está certo; o documento é que está por atualizar nessas duas.
6. **`PESQUISA-LUXO.html`** — os oito movimentos do luxo. Sete estão implementados; o que falta é fotografia real.

O documento do diretor-geral (`Estrutura-App-Passeio-Dolomitas.docx`) é a especificação da área da organização, não da app inteira.

---

## 3. Âmbito

**Dentro:** o antes imediato (briefing e revelação diária), o durante (de 1 a 5 de outubro de 2026) e o depois (álbum).

**Fora, e não voltar a trazer:** checkup nas oficinas, transporte da viatura para Itália, inscrições em experiências. Os convidados recebem acesso poucos dias antes de partir.

---

## 4. Regras de identidade que não se negoceiam

- **Escura de origem, clara à escolha.** A app abre escura e assim fica, a não ser que o convidado escolha o claro em **Mais › Aspeto**. A escolha é dele e fica no telemóvel (`Estado.tema`). Decisão de 20.09.2026, que substituiu a regra anterior — "a app é sempre escura". Muda o material, não muda a forma: mesma grelha, mesmo ritmo, mesmas fotografias. O claro é a paleta de `BRAND-GUIDELINES.md` §4, com o cobre escurecido para `#9A5526`, e vive em `tokens.css` sob `:root[data-tema="claro"]` — nenhuma vista sabe qual é o tema.
- **A app não veste a marca Aston Martin, veste a região.** A marca está em três sítios e mais nenhum: a pergunta do carro na criação do acesso (*Qual é o seu Aston Martin?*), as silhuetas dos carros e o rodapé do álbum. A assinatura da entrada saiu a 26.09.2026; no lugar dela, por baixo do logótipo, fica o subtítulo do evento — *Há estradas que só se contam a quem lá esteve.* —, que não diz o percurso nem a marca.
- **O logótipo do passeio** (`assets/img/logo.png`, e a marca sozinha em `logo-marca.png`) vive noutros três: a entrada, a primeira abertura e a capa do álbum. É sempre claro sobre escuro, nunca leva cor de acento nem sombra, e é ele que dá o nome — onde ele está, o nome não se repete em texto. O ícone da app é a montanha sobre `--calce`.
- **Uma cor de acento por ecrã.** O acento geral é o cobre — `--ottone`, #D9915F no escuro e #9A5526 no claro. A tinta por cima de um preenchimento de acento é `--sobre-acento`, e também troca com o tema: no escuro os acentos são cores claras e pedem tinta escura. O álbum é `--radicchio`, o percurso no mapa é `--verde`, o SOS é o único ecrã inteiramente vermelho — e o único sem fotografia.
- **Serif conta, sans instrui.** EB Garamond para o editorial, Instrument Sans para a interface, com `tabular-nums` em horas, distâncias e altitudes. Distinção semântica, sem exceções.
- **Pesos 400 e 500 apenas.** Nunca 600 nem 700.
- **Cantos redondos, cápsulas e sombra difusa.** Capas a 26px, cartões a 20px, filtros e botões em cápsula, elevação por sombra baixa — não por linha de 1px. (Isto substituiu a regra antiga de `BRAND-GUIDELINES.md` §6.)
- **Cada separador abre com uma capa** — cartão de fotografia inserido das margens, com o título assente no fundo dela. A capa é o cabeçalho; os separadores de topo não têm outro.
- **Uma coisa de cada vez.** É a regra do ecrã Hoje e o princípio que governa qualquer ecrã novo. Durante o passeio, o Hoje mostra só o momento em curso — *Agora*, ou *A seguir* se o grupo estiver entre dois —, num cartão sobre a paisagem parada, com o que vem depois por baixo. Tocar abre a página desse momento (`#/momento/dia/n`): com paragem, é a página do sítio com o momento por cima (hora, o que acontece, nota, ritmo desde a paragem anterior); sem paragem, é o momento sozinho. O dia inteiro está no roadbook, nunca no Hoje. Decisão de 13.09.2026, depois de experimentada a lista do dia.
- **A navegação principal usa os cinco punções próprios** de `icones.js` (`PUNCOES`, grelha de 48, traço de 3), destacados a cobre por `currentColor`. É a única navegação que não usa o conjunto outline geral de 1.5px.
- **Alvos de 44px, contraste AA no mínimo, AAA no texto principal.** Isto é lido de pé, ao sol, por pessoas acima dos 45 anos. Nenhuma informação passa só por cor.
- **Movimento discreto:** 200ms. A única exceção é a revelação do álbum, a 600ms.
- **Fontes servidas localmente.** A app não faz um único pedido a servidores externos. Não introduzir CDNs, tipos do Google Fonts em runtime, mapas de terceiros com telemetria ou qualquer dependência de rede.

## 5. Tom de voz

Português europeu. Italiano só em nomes próprios — `Passo di San Boldo`, `Piazza San Marco`, `Caffè Florian` — e topónimos nunca se traduzem. As exceções são os nomes que o convidado já diz em português: Veneza, Dolomitas, Itália. Frases curtas, no máximo duas por ecrã. Sem exclamações, sem emoji, sem *Title Case*. Nunca escrever "utilizador", "conteúdo", "experiência" ou "jornada" em texto visível.

> Não: "Ups! Algo correu mal."  Sim: "Sem ligação. Guardámos para enviar depois."

**O registo é o de um evento privado de luxo, lido por quem tem mais de 45 anos.** Nada de vocabulário de excursão, de pacote turístico ou de balcão de aluguer. Revisto a 26.09.2026, depois de a organização assinalar «autocarro»:

| Usar | Não usar | Porquê |
|---|---|---|
| transfer, transfer privado | autocarro | É o termo da hotelaria; «autocarro» é o da excursão |
| almoço volante | almoço de pé, buffet de pé | O termo de eventos para uma refeição servida de pé |
| as refeições estão asseguradas | estão incluídas | «Incluído» é a linguagem do pacote turístico |
| convidado | cliente, utilizador | O convidado é-o do passeio, não de uma venda |
| os carros chegam em dois momentos | em duas levas | «Levas» é de multidão |
| programa, itinerário | conteúdo | Palavra de quem faz o produto |
| pedido guardado, a enviar | item, sincronizar | Jargão técnico à vista do convidado |

Sem género presumido: um vocativo genérico como «Bem-vindo» erra metade dos convidados — ou se usa o nome, ou a frase não leva vocativo. Nenhuma promessa que a app não cumpra: não se escreve «recebe uma notificação» enquanto não houver notificações.

**O texto que já está nos telemóveis não muda sozinho.** O itinerário é dado, guardado à primeira abertura. Uma revisão de linguagem à semente entra também na tabela `REVISOES` de `conteudo.js`, que troca só o texto que ainda é, palavra por palavra, o antigo.

---

## 6. Arquitetura e regras de código

```
app/
  index.html            concha e ordem de carregamento
  sw.js                 offline; subir VERSAO a cada publicação
  css/tokens.css        paleta, tipografia, ritmo — fonte única de verdade
  css/app.css           componentes e ecrãs
  js/semente.js         o passeio de 2026: evento, sítios e itinerário; pessoas de exemplo
  js/conteudo.js        conteúdo editável; publica DADOS e POIS; CRUD e persistência
  js/fotos.js           arquivo das fotografias do grupo, em IndexedDB; impressão e caminhos
  js/nuvem.js           a fronteira com o servidor: contas (Firebase Auth por REST, simulado até haver projeto) e fotografias
  js/lib/zip.js         junta ficheiros num .zip, sem os comprimir
  js/store.js           estado do utilizador, fila offline, papel, relógio da demonstração
  js/ui.js              datas, distâncias, links do Maps, GPX, campos de edição
  js/icones.js          conjunto outline + punções da navegação
  js/silhuetas.js       perfis dos carros em SVG + paleta de carroçaria
  js/estradas.js        traçados das estradas em SVG, projetados do OpenStreetMap
  js/percursos.js       o percurso real de cada dia e o perfil de altitude (OSM + EU-DEM)
  js/imagens.js         desenhos de reserva e os gráficos de logística (cores lidas de tokens.css)
  assets/fotos/         fotografias dos sítios, servidas com a app e guardadas para funcionar offline
  assets/img/           logótipo do passeio (claro, transparente) e os ícones da app
  js/app.js             encaminhamento, histórico e chrome
  js/views/             ecrãs do convidado; org*.js são a área da organização
servidor.js             servidor estático de desenvolvimento
```

- **JavaScript simples, sem módulos, sem npm, sem build.** Cada ficheiro é um IIFE carregado por `<script>` em `index.html`, por ordem. Ao criar um ficheiro novo, acrescentá-lo a essa lista na posição certa.
- **A cada publicação sobe-se o `?v=` de todos os `<link>` e `<script>` de `index.html` e a `VERSAO` de `sw.js`.** Sem isso, o service worker serve o antigo. É também esse `?v=` que a app compara com o publicado, ao voltar a ficar à vista e ao mudar de ecrã, para se recarregar sozinha (`verificarVersao` em `app.js`) — um separador aberto não pede nada ao servidor quando só muda o que vem depois do `#`.
- **Fotografias em `assets/fotos/`,** reduzidas a 1600 px no lado maior e em JPEG de qualidade 72, sem nunca ampliar. Cada uma entra também na `CONCHA` de `sw.js`, para existir sem rede. Um sítio aponta para a sua com `imagem: { foto: 'assets/fotos/…' }`; um momento de logística com `imagem: { grafico: 'chegada' }`.
- **`conteudo.js` é a única peça que muda quando houver servidor** — `carregar()` e `guardar()`. Todo o resto lê `DADOS` e `POIS` e não sabe de onde vêm. Manter essa fronteira.
- **Offline é o estado normal.** Escrita local imediata, fila de sincronização, nunca um erro de rede à vista do convidado. Não existe botão de guardar em lado nenhum.
- **As fotografias do grupo não passam pelo `localStorage`.** O ficheiro sai da câmara e vai inteiro para `js/fotos.js` (IndexedDB, base `veneto-fotos`), sem compressão; ao lado ficam uma miniatura de 320 px e uma vista de 1600 px, geradas no telemóvel numa leitura só, com a orientação da câmara já aplicada. No `localStorage` ficam só os metadados. Uma fotografia só se dá por enviada quando o Storage confirmar — nunca por omissão, nunca por um temporizador. As vistas que mostram fotografias pedem os endereços a `Fotos.pintar` e devolvem-nos em `desmontar`.
- **Há duas peças que mudam quando houver servidor, e só duas:** `conteudo.js` para o conteúdo e `nuvem.js` para as contas e as fotografias. Para as fotografias, `nuvem.js` declara quatro funções — `ligada`, `enviarFoto`, `apagarFoto`, `fotosDoDia` — e enquanto responder que não está ligada, a fila fica parada, de propósito. Nada fora desse ficheiro conhece o Firestore, o Storage ou o Auth.
- **Entrada com registo aberto.** Um só link para todos, `#/entrar`, partilhado no grupo do WhatsApp. Na primeira vez o convidado cria o acesso — nome, email, palavra-passe e o carro em que viaja (modelo e cor) —; nas seguintes a sessão está no telemóvel e a app abre sem perguntar nada, com ou sem rede. Sem lista de convidados, sem aprovação, sem data de fecho: decisão de 26.09.2026. Volta-se a entrar com email e palavra-passe, e a recuperação é por email do Firebase. A organização vê quem se registou em Pessoas › Acessos criados e pode apagar acessos, mas nunca bloqueia ninguém — um acesso apagado liberta o email para outro. O Firebase Auth fala-se por REST, sem SDK, dentro de `nuvem.js`; com `CONFIG` vazio, as contas vivem num servidor simulado no `localStorage`, com o mesmo contrato e os mesmos erros. O carro do convidado é o que ele escolheu; a ficha da organização com o mesmo email, se existir, junta a matrícula e quem viaja no mesmo carro.
- **O caminho de uma fotografia é `fotos/{dia}/{idConvidado}/{sha256}-{tamanho}.jpg`**, calculado por `Fotos.caminho()`. O SHA-256 é do ficheiro de origem: a mesma fotografia enviada duas vezes cai no mesmo sítio, e por isso a fila pode repetir sem duplicar. Onde não há `crypto.subtle` — pelo IP da rede local, em http — a conta faz-se em JavaScript, no mesmo ficheiro.
- **Cada ecrã tem endereço fixo e partilhável** (`ROTAS` em `app.js`). É isto que permite ao WhatsApp ser o sino e à app ser o arquivo — e é a decisão com maior impacto no sucesso do projeto.
- **Voltar é recuar no caminho feito, não subir na hierarquia.** O ecrã-pai declarado só serve quando não há histórico — o caso do link vindo do WhatsApp.
- **O grupo segue em caravana: a app explica o dia, não indica o caminho.** Há batedores na estrada e os carros seguem-nos. O ecrã Hoje e o Itinerário dizem primeiro o que vai acontecer — paragem, hora, o que se faz ali. A distância e o tempo até à paragem seguinte são ritmo do dia, não instrução de condução, e medem-se de paragem a paragem do programa. O CTA principal de um ecrã nunca é "abrir no Maps".
- **Não há marcação de chegada.** Os vinte e cinco carros andam juntos, chegam juntos e param juntos: validar a chegada seria validar o que já é evidente, e dependeria de posição em vales sem cobertura. Saiu a 20.09.2026, com tudo o que vivia dela — a presença no mapa, a manchete do grupo e as contagens da certidão. **A história de uma paragem abre pelo relógio do programa** (`Programa.abertoAgora`), que numa caravana sabe onde está toda a gente melhor do que um toque no ecrã. A identidade pelo carro não desapareceu: mudou de sítio, e vive na criação do acesso, na primeira abertura, na lista de participantes e na certidão do álbum.
- **O Google Maps é rede de segurança, e mais nada.** Para quem se atrasar ou se separar da caravana, cada troço entre duas paragens tem o seu link individual, com waypoints âncora — nunca o dia inteiro, que o Maps recalcularia pelo mais rápido e dissolveria a estrada escolhida. Na paragem é uma linha de texto no fim da página, nunca uma barra fixa; no Itinerário vive no fim, junto com o GPX. Decisão de 12.09.2026 (`docs/decisao-navegacao-caravana.md`), com o estatuto revisto a 20.09.2026 quando a marcação de chegada saiu.
- **O separador das Etapas (`#/etapas`, que se chamou Estradas até 26.09.2026) é o retrato do que se conduz, não uma ferramenta.** Um traço por estrada, sem preenchimento, na cor do percurso (`--verde`), sobre chapa escura que não muda de tema — como a fotografia. Os traçados são geometria real, projetada uma vez do OpenStreetMap e gravada em `js/estradas.js`; a app continua a não fazer um único pedido externo. **Uma estrada sem traçado confirmado entra sem desenho**, só com o nome e a nota: um traço aproximado é uma mentira mais difícil de apanhar do que um número errado. Sem animação — o manifesto dá 200 ms ao movimento e uma só exceção, que é o álbum.
- **Cada etapa desenha-se duas vezes: vista de cima e vista de lado.** Em cima, a estrada real do dia, de paragem a paragem; por baixo, o perfil de altitude, com as altitudes à direita e os pontos altos com nome e altitude oficial — o ponto assenta na linha do terreno, a etiqueta diz o número oficial. Vive em `js/percursos.js`: geometria do OpenStreetMap pelo OSRM e altitude do EU-DEM (25 m) de 250 em 250 m, calculadas uma vez e gravadas. Um percurso só vale enquanto as paragens do dia forem, pela mesma ordem, as que lá estão; se a organização mudar o dia, volta o desenho de paragem a paragem. **O que é dedução vai a tracejado**, com a frase por baixo — hoje, a tarde do dia 3. Decisão de 26.09.2026.
- **O que fazer à chegada de cada paragem** — estacionamento, quem recebe, casas de banho, hora de voltar aos carros — vive no bloco `chegada` da paragem, editável na área da organização. Campos vazios não desenham nada, nem rótulo nem espaço reservado: isto é informação, e o orçamento gráfico do projeto vai todo para os traçados.
- **Estados de espera legíveis.** Enquanto a organização não publicar itinerário, o convidado vê um estado de espera — nunca um ecrã partido.
- **Commits em português, no imperativo, uma linha** — como os que já existem: *"Aplica o sistema de App - Separadores aos quatro separadores"*. Sem prefixos de convenção.

---

## 7. Do desenho para o código

`design/` guarda os artboards do Claude Design (`*.dc.html` e `canvas.json`) — três direções exploradas: Silêncio, Concierge e Roadbook. **São estudos, não são o produto.**

Ao trazer uma alteração de desenho para a app:

1. Ler o artboard e identificar o que mudou de facto — cor, raio, escala, ritmo, hierarquia.
2. **Traduzir para `tokens.css` primeiro.** Se a alteração não cabe num token existente, a decisão é sobre o token, não sobre o ecrã.
3. Só depois ajustar `app.css` e a vista.
4. **Nunca colar HTML ou CSS do artboard dentro da app.** O canvas usa valores literais; a app usa tokens. Copiar literais é como o desenho e o código se desalinham.
5. Verificar que a alteração vale para **todos** os ecrãs que usam o mesmo componente, não só para aquele que estava no artboard.

O código é a verdade sobre o que existe. O canvas é a verdade sobre o que se quer.

---

## 8. Dados sensíveis

Data de nascimento, número de carta de condução e número de apólice existem **apenas** na área da organização e nunca são apresentados na app do convidado. É o que concilia a necessidade operacional com a regra do manifesto — *o perfil pede apenas nome e contacto*. A fotografia da pessoa vive no cartão da organização; no lado do convidado a identidade é a silhueta do carro.

Enquanto não houver servidor, tudo isto está no `localStorage` do telemóvel de quem organiza. Fazer cópias de segurança; não usar telemóvel partilhado.

O código de acesso da organização (`2026`, em `js/views/mais.js`) é uma porta, não autenticação. Não o tratar como segurança.

---

## 9. O que é provisório

| O quê | Onde |
|---|---|
| Coordenadas dos sítios | `semente.js` › `biblioteca` — do OpenStreetMap; a do LO.VE. é a da rua, não a do portão |
| Distâncias e tempos dos troços | `ui.js` › `troco()` — linha reta com fator de sinuosidade; erram por defeito nos passos alpinos. O total de cada dia já vem da estrada real, em `percursos.js` |
| Percursos dos dias | `js/percursos.js` — estrada calculada pelo OSRM com as âncoras do programa. **A tarde do dia 3 é dedução** (Passo Rolle e Passo Valles, pelo «dos 170 aos 2000 metros» da proposta) e vai a tracejado. Tudo por confirmar com a Stappando |
| Waypoints âncora | `ui.js` › `ANCORAS` — da rota real, lidos do programa (Strada Cadorna; San Boldo por Trichiana e Tovena; o Cansiglio pelo Alpago). **Por confirmar com a organização**; os troços do dia 3 pelos vales ainda não têm. Só servem o link de recurso |
| Horas por confirmar | `semente.js` › `roteiro` — a chegada do dia 1 (aeroportos, levantamento dos carros, hotel) não tem hora na proposta; a app mostra *A confirmar* |
| Fotografias | `assets/fotos/` — as oficiais de cada sítio (hotéis, restaurantes, museus, ateliê) e Pixabay para Veneza e San Boldo, usadas sem créditos por decisão da organização, que trata da autorização. Sem fotografia, fica o desenho de `imagens.js` |
| Silhuetas dos carros | `silhuetas.js` — em tamanho de leitura, desenho a traço na cor do texto; em etiqueta, o perfil cheio na cor do carro. Só há traço do DB12, vetorizado de um desenho de terceiros (licença por confirmar) e usado também por DB11, Vanquish, DBS e Vantage. DB12 Volante, DBX707 e Valhalla continuam com o perfil antigo, só em linha |
| Cores de carroçaria | `silhuetas.js` › `CORES` — hexadecimais aproximados |
| Código da organização | `js/views/mais.js` |
| Traçados das estradas | `js/estradas.js` — só o San Boldo está confirmado. Ver a tabela abaixo |
| Envio das fotografias | `js/nuvem.js` — as quatro funções por implementar. Até lá a fila diz *pendente* e nunca *enviado* |
| Contas dos convidados | `js/nuvem.js` › `CONFIG` — vazio, as contas vivem num servidor simulado em cada browser, e a organização só vê as criadas no seu. Com o projeto Firebase faltam as regras de `contas/{uid}` e uma Cloud Function que apague do Auth a conta cujo perfil a organização apagou. Sem servidor, a recuperação da palavra-passe não envia email, e o ecrã diz isso |
| Fotografias de abertura | `js/views/org-fotos.js` — ficam no telemóvel de quem organiza, como o resto do conteúdo |

**Traçados por confirmar.** Só se desenha o que estiver confirmado; as outras quatro aparecem no ecrã como entrada de texto, sem desenho:

| Estrada | Dias | Estado |
|---|---|---|
| Passo di San Boldo | 2 e 4 | **Confirmado.** Geometria do OpenStreetMap: 796 m medidos, cinco troços marcados como túnel. Bate com a pesquisa — seis curvas, cinco túneis, ~800 m para 100 m de desnível, 10% |
| Strada Cadorna (subida a Cima Grappa) | 2 | Por confirmar — há mais do que um traçado possível a partir de Possagno |
| Val Canali (subida às Pale di San Martino) | 3 | Por confirmar |
| Vales das Dolomitas, tarde do dia 3 | 3 | Desconhecido — três horas e meia sem um único nome na proposta |
| Altopiano del Cansiglio (subida ao Monte Pizzoc) | 4 | Por confirmar |

A secção **Demonstração**, o endereço `#/demo/n` e o campo `demoFase` **saíram a 20.09.2026** (commit `bc18040`). «Carregar passeio de exemplo» e «Repor tudo» passaram para a área da organização, em Evento › Cópia de segurança. O carregador de exemplo mete pessoas falsas por cima das reais — **deve sair antes da entrega**.

---

## 10. Por fazer, por ordem

1. **Sessão fotográfica, ou arquivo licenciado.** As fotografias oficiais dos sítios já estão na app; o que falta é o passeio em si — os carros na estrada, o grupo, a luz de outubro.
2. **Pedir à Stappando o traçado real dos quatro troços por confirmar** — a subida a Cima Grappa, a Val Canali, os vales da tarde do dia 3 e a subida ao Cansiglio. Basta o GPX ou o nome das estradas: o traçado projeta-se do OpenStreetMap, como se fez ao San Boldo. Sem isto, quatro das cinco estradas do passeio ficam sem desenho. É a par com a sessão fotográfica.
3. **Servidor** — Firestore para conteúdo e pedidos; Storage para fotografias; o projeto Firebase para as contas, que já falam REST (`nuvem.js` › `CONFIG`); papéis com regras a sério; Cloud Messaging.
4. **Publicação e notificação** — o botão que empurra uma alteração para os telemóveis. Sem isto, a regra operacional do manifesto §4 não se cumpre.
5. **Confirmar os waypoints âncora com a organização**, e acrescentar os do dia 3 pelos vales das Dolomitas. Com batedores, só servem o link de recurso — mas para quem se afastar da caravana só serve se apontar para a estrada certa.
6. **Revisão da identidade para a rota real.** `Pietra e Vigna` foi deduzida do Veneto — pedra, vinha, Veneza — e a rota de 2026 passa a maior parte do tempo precisamente aí: Possagno, as colinas do Prosecco, o Cansiglio, a laguna. O que a fundamentação ainda não tem são os dois fios que o passeio acrescenta: a Grande Guerra (o Grappa e San Boldo) e a dolomia das Pale di San Martino. A paleta e as regras ficam; a revisão acrescenta, não substitui — ver `ENQUADRAMENTO.md` §4.
7. **Exportação do roadbook em PDF** (o CSV de participantes já existe).

---

## 11. Como correr

```bash
node servidor.js     # http://localhost:8124
```

Sem dependências, sem build. Instalar no telemóvel pelo *Adicionar ao ecrã principal*. Entrar na organização por Mais › Organização › Entrar.

---

## 12. Antes de dar por feito

1. Se retirasse as silhuetas dos carros, isto passaria por uma app de um hotel de cinco estrelas no Veneto?
2. Lê-se ao sol, de pé, ao meio-dia?
3. Há mais do que uma cor de acento neste ecrã? Se sim, retirar uma.
4. Entrou alguma cor, raio ou espaçamento fora de `tokens.css`?
5. Funciona sem rede, e o ecrã tem endereço próprio?
6. Subiu-se o `?v=` e a `VERSAO` do service worker?
7. Viu-se nos dois temas? O que assenta sobre fotografia não muda; tudo o resto tem de passar AA nos dois.
