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

**Entrar na área da organização:** Mais › Organização › Entrar. O código provisório é `2026`, definido em `js/views/mais.js`. Não é segurança — é uma porta. A segurança chega com contas no servidor.

---

## A app do convidado

A app existe para o passeio e só para o passeio. Os convidados recebem acesso poucos dias antes de partir.

**A primeira abertura** — uma chegada, uma vez por instalação: fotografia a ecrã inteiro, o nome do convidado em Garamond, as datas e o carro dele em tamanho de objeto. É o equivalente digital de abrir a caixa.

**Nos dias anteriores** — o briefing, que explica também como se anda na estrada: há batedores e o grupo segue em caravana, a app é o guia do dia e não o de condução. E uma **revelação por dia**: uma paragem do percurso que se abre, com fotografia e três linhas. É o que faz a app abrir-se todos os dias antes de partir.

**Durante** — o ecrã "Hoje" é **só o momento em curso**: sobre a paisagem, que fica parada atrás, a data e o título da etapa em Garamond de 44 px; por baixo, um cartão com o que está a acontecer — *Agora*, ou *A seguir* se o grupo estiver na estrada entre dois momentos —, com a hora de início e fim, o título, o local e a distância desde a paragem anterior; e, mais pequeno, o que vem depois. **Tocar no cartão abre a página desse momento** (`#/momento/dia/n`): quando há paragem, é a página do sítio — fotografia, subtítulo, a história como promessa, a nota prática — com o momento por cima, num cartão com a hora, o tipo, a nota, as alterações e o ritmo; quando não há (a partida, o jantar livre), é o momento sozinho. No fim de cada página, o que vem a seguir, para seguir o dia sem voltar ao Hoje. O dia inteiro está no roadbook. O roadbook fica para ler o dia de uma vez — cada momento com a sua secção e o cartão da paragem. No fim de cada etapa, um link de Google Maps por troço e o GPX, para quem se afastar da caravana; a história de cada paragem apresentada como **promessa** — um excerto sobre a fotografia do sítio — que se revela à chegada; mapa monocromático com os carros a cores reais e uma **manchete** quando o grupo se junta num sítio; galeria com câmara nativa; concierge com cara, nome e promessa de resposta; contactos e SOS.

**Toda a app é fotográfica, e escura de origem.** Em **Mais › Aspeto** troca-se para claro — a paleta de pedra de Istria dos guidelines —, e a escolha fica no telemóvel de quem a fez. O que assenta sobre fotografia não muda com o tema; tudo o resto passa AA nos dois. Cada separador abre com uma **capa** — um cartão de fotografia inserido das margens, de cantos redondos, com o título assente no fundo dela — e os separadores de topo não têm cabeçalho: a capa é o cabeçalho. Por baixo dela o conteúdo vive em cartões: os dias do roadbook, os grupos de linhas do Mais, as paragens do "onde está o grupo", a moldura do mapa. Os filtros e os dias são cápsulas numa fila que corre na horizontal. A barra de navegação é uma só, flutuante, igual em toda a app. A navegação principal usa um sinal próprio — cinco punções desenhados na mesma gramática, grelha de 48 e traço único de 3 com pontas redondas: os picos com o sol a nascer (Hoje), a tulipa de roadbook de rally (Roadbook), o mapa dobrado (Mapa), a moldura com paisagem (Galeria) e três estratos de dolomia (Mais). A cor vem de fora: o separador aberto a cobre, os outros no cinzento da barra. É a única navegação da app que não usa o conjunto geral de ícones. A exceção deliberada é o SOS, que continua o único ecrã inteiramente vermelho — sem fotografia, para não distrair de uma emergência.

**Depois** — o álbum abre com uma **certidão do percurso**: quilómetros, etapas, paragens visitadas, ponto mais alto com altitude, viatura, matrícula e número de edição, seguida dos passos ordenados por altitude e das fotografias.

Não há checkup, não há transporte de viatura e não há inscrições — essas fases não fazem parte do âmbito.

**Sempre** — funciona sem rede, com fila local de escritas; cada ecrã tem endereço fixo e partilhável; alvos de 44 px e contrastes AA/AAA.

Enquanto a organização não publicar itinerário, o convidado vê estados de espera legíveis — nunca um ecrã partido.

---

## A área da organização

Três separadores, como no documento, mais os dados do evento. Mesma identidade escura e fotográfica do lado do convidado; os ícones da navegação continuam os gerais (a organização precisa de reconhecer Itinerário/Pessoas/Contactos/Evento de relance, não de se emocionar), mas o separador ativo destaca-se a latão.

**Itinerário** — etapas com data, título, subtítulo e notas de percurso; reordenáveis. Dentro de cada etapa: as paragens (ordenáveis) e o programa do dia ao minuto. Alterar a hora de um momento marca-o como alterado no telemóvel de toda a gente, com a razão à vista.

**Paragens** — criadas de raiz ou escolhidas de uma **biblioteca de sugestões da região** com coordenadas já preenchidas: os dezoito sítios reais de 2026, com fotografia, e texto para os de maior peso (a partir de [docs/pesquisa-locais-passeio-dolomitas-2026.md](docs/pesquisa-locais-passeio-dolomitas-2026.md)). Aceita-se um endereço colado do Google Maps: as coordenadas são extraídas automaticamente. Cada paragem tem subtítulo, história em parágrafos e nota prática.

**Pessoas** — cartão por participante com nome, apelido, data de nascimento, papel, nº do carro, email e fotografia. O bloco do veículo — carta, apólice, matrícula, modelo e cor — só aparece para condutores. Os carros são derivados do nº de equipa: quem partilha o número, partilha o carro.

**É o email que liga as duas apps.** Quando o convidado entra, a app procura a ficha com esse email: dela vêm o nome e o carro. Quem não estiver na lista entra na mesma, mas sem carro associado — e o ecrã diz-lhe porquê.

**Fotografias** — cada etapa e cada paragem aceitam uma fotografia, carregada do telemóvel e reduzida automaticamente. Sem fotografia, fica o desenho gerado. É o campo com mais efeito de toda a área.

**Revelação** — cada paragem pode ter uma data em que se revela ao convidado, nos dias antes de partir. Uma por dia é o ritmo certo.

**Contactos** — emergência (nome, telefone, notas) e hotéis/restaurantes (tipo, nome, telefone, morada). Cada etapa pode apontar para o hotel do fim do dia.

**Concierge** — retrato, nome, função e promessa de resposta. Sem resposta automática: um pedido fica *entregue* e é uma pessoa que responde. Fingir uma resposta é pior do que não ter nenhuma.

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
    store.js            estado do utilizador, fila offline, papel, relógio da demonstração
    ui.js               datas, distâncias, links do Maps, GPX, campos de edição
    silhuetas.js        perfis dos carros em SVG + paleta de carroçaria
    views/chegada.js    a primeira abertura, uma vez por instalação
    icones.js           conjunto outline de 1.5px + os punções da navegação principal
    imagens.js          imagens de reserva, a substituir por fotografia
    fotos.js            arquivo das fotografias do grupo, em IndexedDB
    app.js              encaminhamento, histórico e chrome
    views/              ecrãs do convidado; org*.js são a área da organização
  exemplos/veneto/      conteúdo da edição do Veneto, guardado para referência
servidor.js             servidor estático de desenvolvimento
```

`conteudo.js` é a única peça que muda quando houver Firestore: `carregar()` e `guardar()`. Todo o resto lê `DADOS` e `POIS` e não sabe de onde vêm.

---

## Demonstração

Em **Mais › Definições › Demonstração** salta-se entre os dias anteriores, cada etapa e o pós-evento, e carrega-se um **passeio de exemplo** — o itinerário real de 2026 com participantes e contactos de exemplo por cima, para dar vida ao mapa e à manchete do grupo. Serve para demonstrar fora das datas do evento e **não deve existir na versão entregue aos convidados** — apagar a secção `Demonstração` em `js/views/mais.js`, o endereço `#/demo` em `js/app.js` e o campo `demoFase` em `js/store.js`.

**Num telemóvel, num só toque:** abrir `http://<ip-do-mac>:8123/#/demo/2` carrega o exemplo, faz a entrada como o primeiro participante e põe o relógio no dia 2 (também `#/demo/pre` e `#/demo/pos`). Cada endereço guarda os seus próprios dados — `localhost` no Mac e o IP da rede no telemóvel são dois sítios diferentes —, por isso é assim que se põem dois aparelhos no mesmo estado. O servidor de desenvolvimento regista quem abre a app e com que versão; a versão carregada também aparece no fim do Mais.

---

## O que ainda é provisório

| O quê | Onde | Nota |
|---|---|---|
| Coordenadas dos sítios | `semente.js` | Do OpenStreetMap. A do LO.VE. é a da rua (Via dei Colli, Follina), não a do portão |
| Horas da chegada | `semente.js` › `roteiro` | O dia 1 não tem horas na proposta (aeroportos, levantamento dos carros, hotel). A app mostra *A confirmar* até a organização as pôr |
| Distâncias e tempos dos troços | `ui.js` › `troco()` | Linha reta com fator de sinuosidade. Nos passos alpinos erram por defeito; devem vir dos GPX reais |
| Waypoints âncora | `ui.js` › `ANCORAS` | Da rota real, lidos do programa: a Strada Cadorna para subir ao Grappa, San Boldo por Trichiana e Tovena, o Cansiglio pelo Alpago. **Confirmar com a organização**; o dia 3 pelos vales ainda não tem. Só servem o link de recurso |
| Fotografias | `assets/fotos/` | Dezasseis fotografias dos sítios: as oficiais de cada local (hotel, restaurantes, museu, ateliê, refúgios) e Pixabay para Veneza e San Boldo, reduzidas a 1600 px e guardadas pelo service worker. Usadas sem créditos, por decisão da organização, que trata da autorização. Os quatro momentos de logística usam os gráficos de `imagens.js`, com as cores de `tokens.css`. A organização pode trocar qualquer uma na sua área |
| Silhuetas dos carros | `silhuetas.js` › `FORMAS` | Cinco arquétipos. A versão final deve ter um perfil por modelo |
| Cores de carroçaria | `silhuetas.js` › `CORES` | Nomes reais, hexadecimais aproximados — pedir os códigos à marca |
| Código de acesso da organização | `js/views/mais.js` | Um código partilhado. Não é autenticação |
| Envio das fotografias | `js/store.js` › `sincronizar()` | O ficheiro fica guardado no telemóvel, inteiro e sem limite de número. O envio espera pelo Storage: até lá a fila diz *pendente* e nunca *enviado* |

---

## O que veio da pesquisa

Os oito movimentos de [O Luxo é Atmosfera](PESQUISA-LUXO.html) estão implementados: fotografia a toda a largura com carregamento pela organização, a chegada, um momento de cada vez, o concierge com cara, a revelação diária, a manchete do grupo, a história como recompensa e o álbum como certidão. O que continua a faltar é a fotografia real — nenhum desenho gerado substitui uma sessão no percurso.

---

## Por fazer, por ordem

1. **Sessão fotográfica do próprio passeio.** As fotografias oficiais dos sítios já estão na app; falta o passeio em si — os carros na estrada, o grupo, a luz de outubro. É o movimento de maior efeito.
2. **Servidor.** Firestore para conteúdo, chegadas e pedidos; Storage para fotografias; Auth por link mágico; papéis de organização e convidado com regras de segurança a sério; Cloud Messaging para as notificações de alteração de programa.
3. **Publicação e notificação.** O botão que empurra uma alteração para os telemóveis. Sem isto a regra operacional da secção 4 do manifesto não se cumpre.
4. **Confirmar os waypoints âncora com a organização** e acrescentar os do dia 3 pelos vales das Dolomitas. Com batedores, só servem o link de recurso — mas para quem se afastar da caravana só serve se apontar para a estrada certa.
5. **Revisão da identidade para a rota real.** `Pietra e Vigna` foi deduzida do Veneto — pedra de Istria, verde Veronese, villas palladianas, tipografia aldina — e a rota de 2026 passa a maior parte do tempo precisamente aí. O que a fundamentação ainda não tem são os dois fios que o passeio acrescenta: a Grande Guerra (o Grappa e San Boldo) e a dolomia das Pale di San Martino. A paleta e as regras ficam; a revisão acrescenta, não substitui. Ver [ENQUADRAMENTO.md](ENQUADRAMENTO.md) §4.
6. **Exportação em PDF** do roadbook (o CSV de participantes já existe).

---

## Decisões que vale a pena conhecer

**O conteúdo é dado, não é código.** Foi a alteração estrutural desta ronda. O itinerário não existia quando a app foi feita e passou a poder ser criado dentro dela, sem programador no meio.

**A app não veste a marca Aston Martin, veste a região.** A presença da marca está em três sítios: a assinatura no ecrã de entrada, as silhuetas dos carros e o rodapé do álbum.

**Uma cor de acento por ecrã.** O acento da app é agora um cobre (`--ottone`, #D9915F) — o latão anterior era frio demais ao lado da fotografia da montanha. É ele que marca o separador aberto, as setas das listas e o botão principal. O álbum mantém o momento `Radicchio`, o percurso no mapa é `Verde`, e o SOS é o único ecrã inteiramente vermelho.

**A app é sempre escura.** Deixou de haver modo claro. Os valores que antes eram só o "modo escuro" — a lagoa ao anoitecer da BRAND-GUIDELINES.md §12 — passaram a ser os únicos valores em `tokens.css`; não sobrevive nenhuma cor clara fora dos componentes que já eram sempre escuros por natureza (a chegada, o ecrã imersivo da Hoje).

**Serif conta, sans instrui.** EB Garamond para o editorial, Instrument Sans para a interface, com algarismos tabulares. Servidas localmente: a app não faz um único pedido a servidores externos.

**A caravana leva o grupo; a app explica o dia.** Há batedores na estrada. O Hoje e o Itinerário dizem o que vai acontecer e quando, e a distância entre paragens é ritmo, não instrução. O Google Maps fica como rede de segurança, um link por troço — nunca o dia inteiro, que o Maps recalcularia pelo mais rápido e dissolveria a estrada escolhida. Ver [docs/decisao-navegacao-caravana.md](docs/decisao-navegacao-caravana.md).

**Voltar é recuar no caminho feito, não subir na hierarquia.** Cada vista declara um ecrã-pai, mas esse só é usado quando não há histórico — o caso do deep link vindo do WhatsApp.

**Cantos redondos, cápsulas e sombra difusa.** Substituiu a regra anterior — *sem sombras, sem cantos redondos* — quando o sistema desenhado em `App - Separadores` passou a ser o da app. A fotografia vive em cartões de 26 px de raio, os grupos de linhas em cartões de 20 px, os botões e os filtros são cápsulas, e a elevação é uma sombra difusa e baixa em vez de uma linha de 1 px. As regras antigas ficam registadas em [BRAND-GUIDELINES.md](BRAND-GUIDELINES.md) §12; é o documento que está por atualizar, não o código.
