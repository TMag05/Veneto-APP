# App do Passeio — versão de trabalho

Aplicação web mobile, instalável como PWA, para o passeio anual de clientes Aston Martin. Edição de 2026: **Dolomites Grand Tour** — *Da Grande Guerra à Laguna de Veneza*. Do Monte Grappa às Pale di San Martino, pelas colinas do Prosecco e pelo Cansiglio, até Veneza.

São **duas apps sobre a mesma base de dados**:

- **A app do convidado** — trinta telemóveis, offline, roadbook editorial. Nasce de [MANIFESTO.md](MANIFESTO.md) e [BRAND-GUIDELINES.md](BRAND-GUIDELINES.md).
- **A área da organização** — itinerário, participantes e contactos, tudo editável. Nasce do documento do diretor-geral. A comparação entre os dois está em [ENQUADRAMENTO.md](ENQUADRAMENTO.md).

O conteúdo do passeio **é editado dentro da app**, na área da organização, e aparece de imediato no telemóvel do convidado. O ponto de partida é o passeio real de 2026 — cinco dias, de 1 a 5 de outubro, com hotéis, restaurantes, horas e os textos das paragens —, que vive na semente (`js/semente.js`) até haver servidor: é o que cada telemóvel carrega à primeira abertura.

---

## Como abrir

```bash
node servidor.js
```

Depois: `http://localhost:8124`. Não há dependências, não há passo de build.

**Instalar no telemóvel:** abrir o endereço no Safari ou no Chrome e escolher *Adicionar ao ecrã principal*.

**Entrar na área da organização:** o botão «Organização», no fim da entrada dos convidados, abre `#/organizacao` — a palavra-passe comum da porta e, depois, o email da empresa e a palavra-passe de cada pessoa, sem a pergunta do carro. A área só abre com o email confirmado pelo link que o Firebase manda. Só cria acesso quem tiver o email na equipa (Pessoas › Equipa da organização); um acesso de convidado com um email da equipa passa a organização ao entrar por esta porta, e quem sai da equipa perde os poderes logo e a sessão na ligação seguinte. A primeira pessoa, com a equipa vazia, entra com o código `2026` (`CODIGO_EQUIPA` em `js/nuvem.js`); só existe no servidor simulado.

---

## A app do convidado

A app existe para o passeio e só para o passeio. Os convidados recebem acesso poucos dias antes de partir.

**A entrada** — um só link, `#/entrar`, partilhado no grupo do WhatsApp. Na primeira vez o convidado cria o seu acesso com nome, email, palavra-passe e o carro em que viaja; nas seguintes, a sessão está no telemóvel e a app abre sem perguntar nada, com ou sem rede. O registo é aberto: sem lista, sem aprovação, sem data de fecho. A organização vê quem se registou em Pessoas › Acessos criados e pode apagar acessos, sem nunca bloquear a entrada.

**A primeira abertura** — uma chegada, uma vez por instalação: fotografia a ecrã inteiro, o nome do convidado em Garamond, as datas e o carro dele em tamanho de objeto. É o equivalente digital de abrir a caixa.

**Nos dias anteriores** — o briefing: o programa, o que levar e as notas práticas, com o código de vestuário. Do programa, só o Dia 1 está à vista.

**Cada dia revela-se na véspera, depois do jantar** — quinze minutos depois da hora do jantar do dia anterior. Até lá, o convidado vê o número e a data do dia, e mais nada — nem os hotéis e restaurantes desse dia, em Hotéis e restaurantes. Entre a revelação e a meia-noite, o separador Hoje chama-se **Amanhã** e mostra o dia seguinte inteiro. É o que faz a app abrir-se todas as noites do passeio.

**Durante** — o ecrã "Hoje" é **só o momento em curso**: sobre a paisagem, que fica parada atrás, a data e o título da etapa em Garamond de 44 px; por baixo, um cartão com o que está a acontecer — *Agora*, ou *A seguir* se o grupo estiver na estrada entre dois momentos —, com a hora, quando é das que se mostram, o título e o local; e, mais pequeno, o que vem depois. **Tocar no cartão abre a página desse momento** (`#/momento/dia/n`): quando há paragem, é a página do sítio — fotografia, subtítulo, a história como promessa, a nota prática — com o momento por cima, num cartão com a hora, o tipo, a nota e as alterações; quando não há (a partida, o jantar livre), é o momento sozinho. No fim de cada página, o que vem a seguir, para seguir o dia sem voltar ao Hoje. O dia inteiro está no roadbook. O roadbook fica para ler o dia de uma vez — o interlúdio do dia, cada momento com a sua secção, o cartão da paragem e a localização no Google Maps, com uma nota que o pede em vez do Waze; a história de cada paragem apresentada como **promessa** — um excerto sobre a fotografia do sítio — que se abre à hora a que o programa lá chega; no alto da paragem, **o que fazer à chegada**: onde estacionar, quem recebe, a que horas se volta aos carros; o separador **Etapas** com a estrada real de cada dia vista de cima e de lado — o perfil de altitude, com os pontos altos (Cima Grappa, 1776 m; Passo Valles, 2032 m; o Pizzoc, 1547 m) —, o traçado real de cada estrada e o desenho do percurso de cada dia; galeria com câmara nativa, para fotografias e vídeos até cinco minutos; contactos e SOS.

**O tempo** — no canto de cima, à direita, do Hoje, sobre a fotografia: o céu, a máxima, a mínima e a chuva prevista em milímetros, uma linha por zona quando as zonas do dia diferem (quatro graus, ou chover numa e na outra não); se não diferem, uma linha só. Até às 19:00 é só hoje; daí para a frente, hoje e amanhã. Por baixo, **a linha dos dias**: a máxima e a mínima de cada dia que falta, em duas linhas finas com um ponto por dia e o de hoje aceso — diz, sem uma palavra, que há mais dias, e a forma deles. Tocar abre `#/tempo`: todos os dias que faltam, cada local num cartão, com o vento, a sensação térmica e a humidade. Num dia ainda por revelar, os locais dizem-se «Em baixo» e «Em altitude», sem nome: a surpresa fica, e o nome aparece quando o dia se revela. A previsão é do MET Norway, pedida de hora a hora pela publicação (`ferramentas/tempo.js`) e servida com a app em `tempo.json`: o telemóvel não fala com mais ninguém, e sem rede mostra a última que guardou. O MET não dá a probabilidade de chuva fora dos países nórdicos, e a Open-Meteo, que a dá, só é gratuita para uso não comercial: a chuva diz-se em milímetros (30.09.2026).

**Toda a app é fotográfica, e escura de origem.** Em **Mais › Aspeto** troca-se para claro — a paleta de pedra de Istria dos guidelines —, e a escolha fica no telemóvel de quem a fez. O que assenta sobre fotografia não muda com o tema; tudo o resto passa AA nos dois. Cada separador abre com uma **capa** — um cartão de fotografia inserido das margens, de cantos redondos, com o título assente no fundo dela — e os separadores de topo não têm cabeçalho: a capa é o cabeçalho. Por baixo dela o conteúdo vive em cartões: os dias do roadbook, os grupos de linhas do Mais, a moldura do percurso, a chapa escura de cada traçado. Os filtros e os dias são cápsulas numa fila que corre na horizontal. A barra de navegação é uma só, flutuante, igual em toda a app. A navegação principal usa um sinal próprio — cinco punções desenhados na mesma gramática, grelha de 48 e traço único de 3 com pontas redondas: os picos com o sol a nascer (Hoje), a tulipa de roadbook de rally (Roadbook), o mapa dobrado (Etapas), a moldura com paisagem (Galeria) e três estratos de dolomia (Mais). A cor vem de fora: o separador aberto a cobre, os outros no cinzento da barra. É a única navegação da app que não usa o conjunto geral de ícones. A exceção deliberada é o SOS, que continua o único ecrã inteiramente vermelho — sem fotografia, para não distrair de uma emergência.

**Depois** — o álbum abre com uma **certidão do percurso**: quilómetros, etapas, paragens visitadas, ponto mais alto com altitude, viatura, matrícula e número de edição, seguida dos passos ordenados por altitude e das fotografias. Na Galeria e no Álbum, «Selecionar» escolhe várias e guarda-as na galeria do telemóvel, em qualidade original; não há .zip, que num telemóvel não se abre.

Não há checkup, não há transporte de viatura e não há inscrições — essas fases não fazem parte do âmbito.

**Sempre** — funciona sem rede, com fila local de escritas; cada ecrã tem endereço fixo e partilhável; alvos de 44 px e contrastes AA/AAA.

Enquanto a organização não publicar itinerário, o convidado vê estados de espera legíveis — nunca um ecrã partido.

---

## A área da organização

Três separadores, como no documento, mais os dados do evento. Mesma identidade escura e fotográfica do lado do convidado; os ícones da navegação continuam os gerais (a organização precisa de reconhecer Itinerário/Pessoas/Contactos/Evento de relance, não de se emocionar), mas o separador ativo destaca-se a latão.

**Itinerário** — etapas com data, título, subtítulo e notas de percurso; reordenáveis. Dentro de cada etapa: as paragens (ordenáveis) e o programa do dia ao minuto. Alterar a hora de um momento marca-o como alterado no telemóvel de toda a gente, com a razão à vista.

**Paragens** — criadas de raiz ou escolhidas de uma **biblioteca de sugestões da região** com coordenadas já preenchidas: os dezoito sítios reais de 2026, com fotografia, e texto para os de maior peso (a partir de [docs/pesquisa-locais-passeio-dolomitas-2026.md](docs/pesquisa-locais-passeio-dolomitas-2026.md)). Aceita-se um endereço colado do Google Maps: as coordenadas são extraídas automaticamente. Cada paragem tem subtítulo, história em parágrafos e nota prática.

**Pessoas** — cartão por participante com nome, apelido, data de nascimento, papel, nº do carro, email e fotografia. O bloco do veículo — carta, apólice, matrícula e modelo — só aparece para condutores. Os carros são derivados do nº de equipa: quem partilha o número, partilha o carro.

**É o email que liga as duas apps.** Quando o convidado entra, a app procura a ficha com esse email: dela vêm o nome e o carro. Quem não estiver na lista entra na mesma, mas sem carro associado — e o ecrã diz-lhe porquê.

**Fotografias** — cada etapa e cada paragem aceitam uma fotografia, carregada do telemóvel e reduzida automaticamente. Sem fotografia, fica o desenho gerado. É o campo com mais efeito de toda a área.

**Revelação** — não se edita: cada dia abre-se sozinho, depois do jantar da véspera. Mudar a hora do jantar muda a hora da revelação. A organização vê sempre o programa inteiro, com a hora a que cada dia se revela.

**Contactos** — emergência (nome, telefone, notas) e hotéis/restaurantes (tipo, nome, telefone, morada). Cada etapa pode apontar para o hotel do fim do dia.

**Evento** — nome, subtítulo, base, datas, o briefing (como se anda na estrada, o que levar e as notas práticas) e cópia de segurança: descarregar tudo em JSON, restaurar de ficheiro, e exportar os participantes em CSV para Excel.

Gravação automática em todo o lado. Não existe botão de guardar.

### Dados sensíveis

Data de nascimento, carta de condução e apólice existem **apenas** nesta área e nunca são apresentados na app do convidado. É o que concilia a necessidade operacional da organização com a regra do manifesto — *o perfil pede apenas nome e contacto*. Enquanto não houver servidor, ficam no `localStorage` do telemóvel de quem organiza: faça cópias de segurança e não use um telemóvel partilhado.

---

## Estrutura

```
app/
  index.html            concha e ordem de carregamento
  manifest.webmanifest  PWA
  sw.js                 offline; subir VERSAO a cada publicação
  css/
    tokens.css          paleta, tipografia, ritmo — fonte única de verdade
    app.css             componentes e ecrãs
  js/
    semente.js          esqueleto do evento + biblioteca de sugestões da região
    conteudo.js         conteúdo editável; publica DADOS e POIS; CRUD e persistência
    store.js            estado do utilizador, fila offline, papel
    tempo.js            a previsão do tempo por zonas, lida de tempo.json
    ui.js               datas, distâncias, links do Google Maps, campos de edição
    silhuetas.js        perfis dos carros em SVG + paleta de carroçaria
    estradas.js         traçados das estradas, projetados do OpenStreetMap
    views/chegada.js    a primeira abertura, uma vez por instalação
    icones.js           conjunto outline de 1.5px + os punções da navegação principal
    imagens.js          imagens de reserva, a substituir por fotografia
    fotos.js            arquivo das fotografias do grupo, em IndexedDB
    nuvem.js            a fronteira com o servidor: contas (REST do Firebase, simulado até haver projeto) e fotografias
    guardar.js          guardar na galeria do telemóvel, uma ou várias escolhidas
    app.js              encaminhamento, histórico e chrome
    views/              ecrãs do convidado; org*.js são a área da organização
  exemplos/veneto/      conteúdo da edição do Veneto, guardado para referência
ferramentas/tempo.js    pede a previsão ao MET Norway e grava app/tempo.json, na publicação
servidor.js             servidor estático de desenvolvimento
```

`conteudo.js` é a única peça que muda quando houver Firestore: `carregar()` e `guardar()`. Todo o resto lê `DADOS` e `POIS` e não sabe de onde vêm.

---

## Demonstração

**Saiu a 20.09.2026** (commit `bc18040`), por ser condição de entrega: a secção `Demonstração`, o endereço `#/demo/n` e o campo `demoFase`. O relógio da app é o de Itália (desde 28.09.2026), e para ver o passeio a decorrer é preciso mudar a data do aparelho. **«Repor tudo»** passou para a área da organização, em Evento › Cópia de segurança. O carregador do passeio de exemplo, que metia pessoas falsas por cima das reais, saiu no lançamento aos convidados, a 28.09.2026.

**Num telemóvel, num só toque:** abrir `http://<ip-do-mac>:8123/#/demo/2` carrega o exemplo, faz a entrada como o primeiro participante e põe o relógio no dia 2 (também `#/demo/pre` e `#/demo/pos`). Cada endereço guarda os seus próprios dados — `localhost` no Mac e o IP da rede no telemóvel são dois sítios diferentes —, por isso é assim que se põem dois aparelhos no mesmo estado. O servidor de desenvolvimento regista quem abre a app e com que versão; a versão carregada também aparece no fim do Mais.

---

## O que ainda é provisório

| O quê | Onde | Nota |
|---|---|---|
| Coordenadas dos sítios | `semente.js` | Do OpenStreetMap. A do LO.VE. é a da rua (Via dei Colli, Follina), não a do portão. |
| Horas da chegada | `semente.js` › `roteiro` | Hotel às 20:30 e jantar às 21:00, dependentes da pontualidade dos voos. A chegada ao Marco Polo não tem hora, e sem hora a app não mostra nenhuma |
| Distâncias dos troços | `ui.js` › `troco()` | Linha reta com fator de sinuosidade. Já não se mostram ao convidado; só medem o dia quando não há percurso gravado |
| Fotografias | `assets/fotos/` | Dezasseis fotografias dos sítios: as oficiais de cada local (hotel, restaurantes, museu, ateliê, refúgios) e Pixabay para Veneza e San Boldo, reduzidas a 1600 px e guardadas pelo service worker. Usadas sem créditos, por decisão da organização, que trata da autorização. Os quatro momentos de logística usam os gráficos de `imagens.js`, com as cores de `tokens.css`. A organização pode trocar qualquer uma na sua área |
| Silhuetas dos carros | `silhuetas.js` › `FORMAS` | Cinco arquétipos. A versão final deve ter um perfil por modelo |
| Código da primeira pessoa da equipa | `js/nuvem.js` › `CODIGO_EQUIPA` | Só no servidor simulado, e só com a equipa vazia, onde essa pessoa fica master. No Firebase, o master escreve-se na consola (`master: true` em `equipa/{email}`), e é o único que acrescenta e retira pessoas da equipa |
| Traçados das estradas | `js/estradas.js` | Só o Passo di San Boldo está confirmado, com geometria do OpenStreetMap. A Strada Cadorna, as passagens das Dolomitas de 3 de outubro e o Cansiglio aparecem sem desenho, até a Stappando confirmar por onde se vai |
| O que fazer à chegada | `js/conteudo.js` › `chegada` | Estacionamento, quem recebe, casas de banho e hora de voltar aos carros. Os campos estão criados e editáveis; falta a organização preenchê-los paragem a paragem |
| Contas dos convidados | `js/nuvem.js` › `CONFIG` | Sem projeto Firebase, as contas vivem num servidor simulado em cada browser: a organização só vê as criadas no seu, e a recuperação da palavra-passe não envia email. Com o projeto, faltam as regras de `contas/{uid}` e a Cloud Function que apaga do Auth a conta que a organização apagou |
| Envio das fotografias | `js/nuvem.js` | Ligado ao Firebase: o original, a miniatura e a vista sobem para o Storage logo a seguir a tirar a fotografia, e o registo vai para o Firestore. Sem rede, fica guardada no telemóvel e sobe no primeiro momento em que a ligação voltar. Na Galeria, é de todos em poucos segundos |
| Vídeos | `js/store.js` | Entram pela Galeria, pelo botão Filmar ou da galeria do telemóvel, até cinco minutos, sem limite por dia — o teto só apanha o vídeo que ficou a gravar no bolso. Sobem tal como saíram da câmara, pelo mesmo caminho das fotografias, com uma imagem do início como miniatura. Cada minuto do iPhone são cerca de 60 MB no Storage, e cada vez que alguém o vê é descarga paga. Os do grupo veem-se com rede |
| CORS do bucket | `docs/firebase/cors.json` | Aplicado a 03.10.2026. Sem ele, nenhum original do grupo se conseguia guardar na galeria. Só leitura, e só para os domínios da app: se um mudar, acrescenta-se a esse ficheiro e volta-se a aplicar — na [Cloud Shell](https://console.cloud.google.com/?cloudshell=true&project=dolomitesgt), criar `cors.json` com o conteúdo dele e correr `gcloud storage buckets update gs://dolomitesgt.firebasestorage.app --cors-file=cors.json` |

---

## O que veio da pesquisa

Sete dos oito movimentos de [O Luxo é Atmosfera](PESQUISA-LUXO.html) estão implementados: fotografia a toda a largura com carregamento pela organização, a primeira abertura, um momento de cada vez, a revelação de cada dia na véspera, a história como recompensa e o álbum como certidão. O oitavo — a manchete do grupo — saiu com a marcação de chegada: numa caravana que chega junta, não há notícia nenhuma em dizer que os carros chegaram. O que continua a faltar é a fotografia real — nenhum desenho gerado substitui uma sessão no percurso.

---

## Por fazer, por ordem

1. **Sessão fotográfica do próprio passeio.** As fotografias oficiais dos sítios já estão na app; falta o passeio em si — os carros na estrada, o grupo, a luz de outubro. É o movimento de maior efeito.
2. **O traçado real dos quatro troços por confirmar**, pedido à Stappando: a subida a Cima Grappa, as passagens das Dolomitas de 3 de outubro (Croce d'Aune, Rolle, Valles, Forcella Aurine e Cereda — a ordem da tarde é dedução e está a tracejado no mapa) e a subida ao Cansiglio. Chega o GPX ou o nome das estradas — o desenho projeta-se do OpenStreetMap, como se fez ao San Boldo.
2. **Servidor.** Firestore para conteúdo e pedidos; Storage para fotografias; o projeto Firebase para as contas, que já falam REST com email e palavra-passe; papéis de organização e convidado com regras de segurança a sério; Cloud Messaging para as notificações de alteração de programa.
3. **Publicação e notificação.** O botão que empurra uma alteração para os telemóveis. Sem isto a regra operacional da secção 4 do manifesto não se cumpre.
4. **Revisão da identidade para a rota real.** `Pietra e Vigna` foi deduzida do Veneto — pedra de Istria, verde Veronese, villas palladianas, tipografia aldina — e a rota de 2026 passa a maior parte do tempo precisamente aí. O que a fundamentação ainda não tem são os dois fios que o passeio acrescenta: a Grande Guerra (o Grappa e San Boldo) e a dolomia das Pale di San Martino. A paleta e as regras ficam; a revisão acrescenta, não substitui. Ver [ENQUADRAMENTO.md](ENQUADRAMENTO.md) §4.
5. **Exportação em PDF** do roadbook (o CSV de participantes já existe).

---

## Decisões que vale a pena conhecer

**O conteúdo é dado, não é código.** Foi a alteração estrutural desta ronda. O itinerário não existia quando a app foi feita e passou a poder ser criado dentro dela, sem programador no meio.

**A app não veste a marca Aston Martin, veste a região.** A presença da marca está em três sítios: a pergunta do carro na criação do acesso, as silhuetas dos carros e o rodapé do álbum. A exceção, de 28.09.2026, é o título da secção «Equipa Aston Martin» nos Contactos, que nomeia quem acompanha o passeio da parte da marca. A assinatura da entrada saiu a 26.09.2026.

**Uma cor de acento por ecrã.** O acento da app é agora um cobre (`--ottone`, #D9915F) — o latão anterior era frio demais ao lado da fotografia da montanha. É ele que marca o separador aberto, as setas das listas e o botão principal. O álbum mantém o momento `Radicchio`, o percurso e os traçados das estradas são `Verde`, e o SOS é o único ecrã inteiramente vermelho.

**A app é escura de origem, clara à escolha** (20.09.2026 — ver acima). O parágrafo que se segue descreve a decisão anterior, de quando não havia tema claro nenhum. Os valores que antes eram só o "modo escuro" — a lagoa ao anoitecer da BRAND-GUIDELINES.md §12 — passaram a ser os únicos valores em `tokens.css`; não sobrevive nenhuma cor clara fora dos componentes que já eram sempre escuros por natureza (a chegada, o ecrã imersivo da Hoje).

**Serif conta, sans instrui.** EB Garamond para o editorial, Instrument Sans para a interface, com algarismos tabulares. Servidas localmente: a app não faz um único pedido a servidores externos.

**A caravana leva o grupo; a app explica o dia.** Há batedores na estrada. O Hoje e o Itinerário dizem o que vai acontecer, sem percurso à vista: nem distância entre paragens, nem quilómetros por dia no programa, e só três horas por dia — a partida, a chegada ao hotel e o jantar. Cada paragem abre-se no Google Maps, só o sítio. Decisão da direção de 27.09.2026, que tirou os links por troço e o GPX de [docs/decisao-navegacao-caravana.md](docs/decisao-navegacao-caravana.md). O Waze saiu a 02.10.2026, porque os caminhos que propunha não eram os melhores; uma nota, uma vez por ecrã, pede o Google Maps.

**Voltar é recuar no caminho feito, não subir na hierarquia.** Cada vista declara um ecrã-pai, mas esse só é usado quando não há histórico — o caso do deep link vindo do WhatsApp.

**Cantos redondos, cápsulas e sombra difusa.** Substituiu a regra anterior — *sem sombras, sem cantos redondos* — quando o sistema desenhado em `App - Separadores` passou a ser o da app. A fotografia vive em cartões de 26 px de raio, os grupos de linhas em cartões de 20 px, os botões e os filtros são cápsulas, e a elevação é uma sombra difusa e baixa em vez de uma linha de 1 px. As regras antigas ficam registadas em [BRAND-GUIDELINES.md](BRAND-GUIDELINES.md) §12; é o documento que está por atualizar, não o código.
