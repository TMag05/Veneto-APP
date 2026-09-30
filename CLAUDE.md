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

**Dentro:** o antes imediato (o briefing, com o Dia 1), o durante (de 1 a 5 de outubro de 2026) e o depois (álbum).

**Fora, e não voltar a trazer:** checkup nas oficinas, transporte da viatura para Itália, inscrições em experiências, concierge (o serviço não existe; saiu a 27.09.2026 — ficam os Contactos e o SOS). Os convidados recebem acesso poucos dias antes de partir.

---

## 4. Regras de identidade que não se negoceiam

- **Escura de origem, clara à escolha.** A app abre escura e assim fica, a não ser que o convidado escolha o claro em **Mais › Aspeto**. A escolha é dele e fica no telemóvel (`Estado.tema`). Decisão de 20.09.2026, que substituiu a regra anterior — "a app é sempre escura". Muda o material, não muda a forma: mesma grelha, mesmo ritmo, mesmas fotografias. O claro é a paleta de `BRAND-GUIDELINES.md` §4, com o cobre escurecido para `#9A5526`, e vive em `tokens.css` sob `:root[data-tema="claro"]` — nenhuma vista sabe qual é o tema.
- **A app não veste a marca Aston Martin, veste a região.** A marca está em três sítios e mais nenhum: a pergunta do carro na criação do acesso (*Qual é o seu Aston Martin?*), as silhuetas dos carros e o rodapé do álbum. **A exceção é o título «Equipa Aston Martin»** em Mais › Contactos e em Contactos na área da organização, que nomeia as pessoas da marca que acompanham o passeio — decisão de 28.09.2026. O nome fica no título dessa secção e não passa para mais nenhum sítio. A outra exceção é «Seguro do Aston Martin», na lista do que levar, pela letra da organização (28.09.2026). A assinatura da entrada saiu a 26.09.2026; no lugar dela, por baixo do logótipo, fica o subtítulo do evento — *Há estradas que só se contam a quem lá esteve.* —, que não diz o percurso nem a marca.
- **O logótipo do passeio** (`assets/img/logo.png`, e a marca sozinha em `logo-marca.png`) vive noutros três: a entrada, a primeira abertura e a capa do álbum. É sempre claro sobre escuro, nunca leva cor de acento nem sombra, e é ele que dá o nome — onde ele está, o nome não se repete em texto. O ícone da app é a montanha sobre `--calce`.
- **Uma cor de acento por ecrã.** O acento geral é o cobre — `--ottone`, #D9915F no escuro e #9A5526 no claro. A tinta por cima de um preenchimento de acento é `--sobre-acento`, e também troca com o tema: no escuro os acentos são cores claras e pedem tinta escura. O álbum é `--radicchio`, o percurso no mapa é `--verde`, o SOS é o único ecrã inteiramente vermelho — e o único sem fotografia.
- **Serif conta, sans instrui.** EB Garamond para o editorial, Instrument Sans para a interface, com `tabular-nums` em horas, distâncias e altitudes. Distinção semântica, sem exceções.
- **Pesos 400 e 500 apenas.** Nunca 600 nem 700.
- **Cantos redondos, cápsulas e sombra difusa.** Capas a 26px, cartões a 20px, filtros e botões em cápsula, elevação por sombra baixa — não por linha de 1px. (Isto substituiu a regra antiga de `BRAND-GUIDELINES.md` §6.)
- **Cada separador abre com uma capa** — cartão de fotografia inserido das margens, com o título assente no fundo dela. A capa é o cabeçalho; os separadores de topo não têm outro.
- **Uma coisa de cada vez.** É a regra do ecrã Hoje e o princípio que governa qualquer ecrã novo. Durante o passeio, o Hoje mostra só o momento em curso — *Agora*, ou *A seguir* se o grupo estiver entre dois —, num cartão sobre a paisagem parada, com o que vem depois por baixo. Tocar abre a página desse momento (`#/momento/dia/n`): com paragem, é a página do sítio com o momento por cima (hora, o que acontece, nota, localização); sem paragem, é o momento sozinho. O dia inteiro está no roadbook, nunca no Hoje. Decisão de 13.09.2026, depois de experimentada a lista do dia.
- **Cada dia revela-se na véspera, depois do jantar.** É o fator surpresa do passeio: o Dia 1 está à vista desde sempre, e cada um dos seguintes abre quinze minutos depois da hora do jantar da véspera — a última refeição marcada a partir das 17:00, e por isso acompanha a hora se a organização a mudar; sem jantar, à meia-noite. Até lá, o convidado vê o número e a data e mais nada, nem o título — e o texto não diz quando nem como se revela: «revelado a seu tempo…» (revelada, numa paragem ou numa estrada): no Roadbook, nas Etapas, na lista do programa, nos links diretos para o dia, o momento, a paragem ou a estrada, e em Hotéis e restaurantes, onde cada sítio aparece com o dia em que lá se vai — o Hotel Villa Soligo desde sempre, o JW Marriott Venice quando o Dia 4 se revelar (28.09.2026). **Antes do passeio, o Hoje abre com o que levar em destaque** — um cartão com a esfera do cobre (`--esfera-luz`, `--ottone`, `--esfera-sombra`), porque é a única coisa que o convidado tem de fazer antes de partir; no Dia 1 desaparece, e a lista fica em Mais. **A capa das Etapas é neutra enquanto o San Boldo não se revelar**: a ilustração reconhece-se. **Entre a revelação e a meia-noite, o separador Hoje chama-se Amanhã** e mostra o dia seguinte inteiro — é a única vez que o dia inteiro vive nesse separador. A organização vê tudo, com a hora a que cada dia se revela. A regra vive só em `store.js` (`revelaEm`, `diaVisivel`, `poiVisivel`, `amanha`), e `app.js` repinta sozinho quando o momento chega. Decisão de 28.09.2026, que substituiu a revelação de uma paragem por dia. Guarda a surpresa, não um segredo: o programa está no telemóvel. **O relógio da app é o de Itália** (`Europe/Rome`, em `Estado.agora()`), seja qual for o fuso do telemóvel: as horas do programa são italianas, e um telemóvel com a hora acertada à mão, ou ainda em Lisboa, andaria uma hora atrás dos outros. Decisão de 28.09.2026.
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

**O texto que já está nos telemóveis não muda sozinho.** O itinerário é dado, guardado à primeira abertura. Uma revisão de linguagem à semente entra também na tabela `REVISOES` de `conteudo.js`, que troca só o texto que ainda é, palavra por palavra, o antigo; uma mudança de dados entra em `CORRECOES`, que corre uma vez por telemóvel. **Com os convidados na app, nunca se sobe `VERSAO_DADOS` sem pôr a versão anterior em `COMPATIVEIS`:** subir apaga, em cada telemóvel, os participantes e tudo o que a organização editou.

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
  js/ui.js              datas, distâncias, links do Google Maps e do Waze, campos de edição
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
- **A cada publicação sobe-se o `?v=` de todos os `<link>` e `<script>` de `index.html` e a `VERSAO` de `sw.js`.** Sem isso, o service worker serve o antigo. É também esse `?v=` que a app compara com o publicado, ao voltar a ficar à vista e ao mudar de ecrã, para se recarregar sozinha (`verificarVersao` em `app.js`) — um separador aberto não pede nada ao servidor quando só muda o que vem depois do `#`. **Publicar é fazer merge no `main`:** `.github/workflows/publicar.yml` põe o hosting no Firebase (`dolomitesgt`) a cada push, com a conta de serviço guardada no secret `FIREBASE_SERVICE_ACCOUNT_DOLOMITESGT`. A página sai sempre sem cache, pelo endereço `/` e por `/index.html` (`firebase.json`): com uma hora de cache no `/`, a revalidação do service worker podia repor uma cópia antiga por cima da nova (28.09.2026). As regras do Firestore publicam-se sozinhas quando `firestore.rules` muda no `main` (`.github/workflows/regras.yml`, com a mesma conta de serviço); as do Storage, à mão.
- **Fotografias em `assets/fotos/`,** reduzidas a 1600 px no lado maior e em JPEG de qualidade 72, sem nunca ampliar. Cada uma entra também na `CONCHA` de `sw.js`, para existir sem rede. Um sítio aponta para a sua com `imagem: { foto: 'assets/fotos/…' }`; um momento de logística com `imagem: { grafico: 'chegada' }`.
- **`conteudo.js` é a única peça que muda quando houver servidor** — `carregar()` e `guardar()`. Todo o resto lê `DADOS` e `POIS` e não sabe de onde vêm. Manter essa fronteira.
- **Offline é o estado normal.** Escrita local imediata, fila de sincronização, nunca um erro de rede à vista do convidado. Não existe botão de guardar em lado nenhum.
- **As fotografias do grupo não passam pelo `localStorage`.** O ficheiro sai da câmara e vai inteiro para `js/fotos.js` (IndexedDB, base `veneto-fotos`), sem compressão; ao lado ficam uma miniatura de 320 px e uma vista de 1600 px, geradas no telemóvel numa leitura só, com a orientação da câmara já aplicada. No `localStorage` ficam só os metadados. Uma fotografia só se dá por enviada quando o Storage confirmar — nunca por omissão, nunca por um temporizador. As vistas que mostram fotografias pedem os endereços a `Fotos.pintar` e devolvem-nos em `desmontar`.
- **Há duas peças que mudam quando houver servidor, e só duas:** `conteudo.js` para o conteúdo e `nuvem.js` para as contas e as fotografias. Para as fotografias, `nuvem.js` declara quatro funções — `ligada`, `enviarFoto`, `apagarFoto`, `fotosDoDia` — e enquanto responder que não está ligada, a fila fica parada, de propósito. Com sessão e rede, uma fotografia sobe logo a seguir a ser tirada ou escolhida; sem rede, sobe no primeiro momento em que a ligação voltar — quando o telemóvel o avisa, quando a app volta a ficar à vista e, porque esse aviso nem sempre chega, de 15 em 15 segundos, sem espaçar. **Ao Storage, de um browser, só vão os cabeçalhos `Content-Type` e `Authorization`:** qualquer outro — um `Cache-Control` — faz o browser bloquear o pedido por CORS, sem erro à vista, e foi o que impediu todos os envios até 28.09.2026. Nada fora desse ficheiro conhece o Firestore, o Storage ou o Auth.
- **A Galeria é do grupo, e em tempo real.** Uma fotografia é de todos no momento em que é tirada: quem tiver a Galeria aberta vê-a em poucos segundos (pede as novas ao abrir e de 5 em 5 segundos, pelo campo `enviado`), com quem a tirou — o nome, o carro, o lugar no carro e se é da organização, que viajam no registo da fotografia (`autorNome`, `autorModelo`, `autorFuncao`, `autorPapel`), porque as regras só deixam cada um ler o próprio perfil. **Fotografias novas avisam-se dentro da app**, a quem a tem aberta noutro ecrã: um número a cobre no separador da Galeria, com as que ainda não se viram, e uma linha no fundo — «Marta Sousa juntou 3 fotografias.» — que leva à Galeria e some sozinha. A app pergunta de 15 em 15 segundos; nunca avisa ninguém das próprias, nem na área da organização, e na primeira abertura não conta as que já lá estavam. Não há notificação com a app fechada: o push ficou para depois do passeio (28.09.2026). Na página da fotografia, o carro a traço e, ao lado, o piloto ou o co-piloto; quem não tem carro declarado (a organização) não leva desenho nenhum — não se inventa um Aston Martin a ninguém. A lista vive numa chave própria do `localStorage` (`veneto.grupo.v1`), fora do estado; uma vez por hora lê-se a coleção inteira, que é o que faz sair as apagadas — e antes disso, se a imagem de uma não carregar, pergunta-se ao servidor se ainda existe e, não existindo, sai logo. A grelha é só das fotografias, sem carro nem nome por cima: quem a tirou está na página de cada uma. **Uma fotografia abre como na galeria do iPhone** (`#/foto/id`, 30.09.2026): a ecrã inteiro, com o dia, a hora e o nome em cima e Descarregar, Quem a tirou e Apagar em baixo; um toque esconde as barras e o fundo fica negro (`--visor-negro`), com o do tema enquanto estão à vista; desliza-se para o lado para a anterior e a seguinte, pela ordem e com o filtro da grelha; dois dedos ou dois toques ampliam; deslizar para baixo fecha, e para cima mostra quem a tirou. Os gestos são todos da app, em `js/views/foto.js`, porque o browser não desliza nem amplia a página. O endereço acompanha a fotografia à vista sem encher o histórico, e a grelha reabre na última que se viu. No computador, as setas do teclado e as do ecrã. **As do grupo veem-se com rede**: a lógica de funcionar sem rede não se aplica aqui (decisão de 28.09.2026). As imagens mostram-se pelo endereço do Storage; com o CORS do bucket configurado (`docs/firebase/cors.json`), a miniatura e a vista ficam também guardadas no telemóvel e o álbum em .zip leva os originais do grupo.
- **Entrada com registo aberto.** Um só link para todos, `#/entrar`, partilhado no grupo do WhatsApp. Na primeira vez o convidado cria o acesso — nome, email, palavra-passe, o modelo do carro em que viaja e se vai como piloto ou co-piloto (`funcao`, cujo valor guardado continua a ser `condutor` para o piloto, com a ilustração dada pelo Tiago — o piloto de capacete, com a parte de cima do volante; o co-piloto com o roadbook nas mãos —, em `assets/img/lugar-*.png`, usada como máscara na cor do texto; mudável no Perfil; decisão de 28.09.2026) —; nas seguintes a sessão está no telemóvel e a app abre sem perguntar nada, com ou sem rede. Sem lista de convidados, sem aprovação, sem data de fecho: decisão de 26.09.2026. Volta-se a entrar com email e palavra-passe, e a recuperação é por email do Firebase. A organização vê quem se registou em Pessoas › Acessos criados e pode apagar acessos, mas nunca bloqueia ninguém — um acesso apagado liberta o email para outro. O Firebase Auth fala-se por REST, sem SDK, dentro de `nuvem.js`; com `CONFIG` vazio, as contas vivem num servidor simulado no `localStorage`, com o mesmo contrato e os mesmos erros. O carro do convidado é o que ele escolheu; a ficha da organização com o mesmo email, se existir, junta a matrícula e quem viaja no mesmo carro.
- **A lista de participantes faz-se com os registos.** Cada convidado publica, ao criar o acesso, ao abrir a app e ao mudar o perfil, um cartão público em `participantes/{uid}` — só o nome, o carro e o lugar no carro; o email e o telefone ficam em `contas/{uid}`, que só o próprio e a organização leem. Participantes mostra os cartões por modelo, os pilotos primeiro, e o Hoje diz quantos já entraram. A organização não publica: viaja em carros próprios. Apagar um acesso apaga o cartão. Não se sabe quem viaja no mesmo carro; a numeração dos carros, se vier, é da organização. Decisão de 28.09.2026. **As regras do Firestore (`firestore.rules`) têm de estar publicadas** para isto funcionar: são elas que abrem os cartões a quem tem sessão e que impedem um convidado de mudar o próprio papel.
- **Instalar no ecrã principal é um gesto do convidado, e a app só o guia.** Nenhum browser deixa um site instalar-se sozinho. `#/instalar` (`js/views/instalar.js`) lê o browser e mostra os passos desse. No Safari e no Chrome do iPhone, no Chrome do Android e no Samsung Internet, os passos estão todos numa página só, cada um com uma frase e o desenho esquemático do telemóvel com o que se toca a cobre, e «Não é isto que vejo» para corrigir a deteção: a janela de Partilhar tapa a app, e um passo de cada vez obrigava a sair e a voltar a cada toque (28.09.2026). No iPhone, a folha de Partilhar do iOS 26 esconde «Adicionar ao ecrã principal» atrás de «Ver mais», e esse é um passo próprio. Os browsers dentro de outras apps levam a «abra no Safari/Chrome». No Android com `beforeinstallprompt`, um toque abre a janela do sistema, com os passos como recurso. O Mais mostra-o sempre — instalada, é o tutorial para mostrar a quem não conseguiu à primeira. A entrada sugere-o antes de criar o acesso, porque no iPhone a app do ícone não vê a sessão do browser — num cartão com a esfera do cobre, como o que levar no Hoje, por ser a primeira coisa a fazer (28.09.2026). Abre sem sessão.
- **A organização entra pela sua porta: `#/organizacao`**, um botão discreto em texto, «Organização», no fim da entrada dos convidados. **Antes de tudo, a porta pede a palavra-passe da organização** (28.09.2026): o código guarda só a impressão dela (SHA-256 com o prefixo `dolomitesgt:`, em `entrada.js`), nunca o texto, e a palavra-passe está com a equipa e não se escreve em nenhum ficheiro; aberta, fica aberta até se fechar a app, e cinco enganos fecham-na um minuto. É uma barreira à porta — a segurança está nas regras do Firestore. Depois, a mesma forma, sem a pergunta do carro: a equipa viaja em carros próprios, não Aston Martin, e o perfil dela não tem modelo. O papel (`convidado` ou `organizacao`) é da conta, não do telemóvel (`Estado.perfil.papel`), e sai com a sessão. **Quem abre a porta da organização é a equipa, não o acesso** (29.09.2026): só entra quem tiver o email na equipa, gerida em Pessoas › Equipa da organização, e um acesso de convidado com um email da equipa passa a organização ao entrar por ela — é também assim que volta quem saiu e foi acrescentado de novo, com a palavra-passe que tinha. Retirar um email apaga o acesso com ele e tira os poderes logo, porque as regras pedem as duas coisas, o papel no perfil e o email na equipa; a sessão desse telemóvel fecha-se na ligação seguinte (`confirmarEquipa` em `store.js`). A lista da equipa só a equipa a lê; sem sessão, pergunta-se por um email de cada vez. **Cada pessoa da organização entra com o seu email da empresa e a sua palavra-passe, e prova que o email é seu** (29.09.2026): o Firebase manda-lhe um link, e a área só abre depois de o tocar e de voltar à app com «Já confirmei» — as regras pedem `email_verified` a tudo o que é da organização. Sem isto, quem soubesse um email da equipa ainda sem acesso podia criá-lo. A equipa continua a ser a lista de emails, sem restrição de domínio, e a palavra-passe comum da porta fica. O perfil de organização só se grava depois de confirmado; um acesso anterior a esta regra volta à porta, que lhe manda o link. A organização não passa pela primeira abertura. **Um acesso de organização tem dois modos:** o do convidado, que é o de origem, para usar a app no passeio como toda a gente — a equipa viaja sem Aston Martin —, e o da organização, só para alterar. Passa-se ao segundo em Mais › Modo organização e volta-se ao primeiro pelo ícone do cabeçalho ou em Evento › Modo convidado. A app lembra o último modo (`Estado.modo`) e reabre nele. Decisão de 26.09.2026, que substituiu o código em Mais › Definições.
- **Alterações de última hora, a partir do que o convidado vê.** Com sessão de organização, a página de um momento e a de uma paragem acabam em «Editar a hora e o local» (`#/org/etapa/dia/n`, que abre já no cartão desse momento) e «Editar esta paragem». Cada etapa e cada paragem guardam quem lhes mexeu por último (`editado`), e só a área da organização o mostra.
- **O caminho de uma fotografia é `fotos/{dia}/{idConvidado}/{sha256}-{tamanho}.jpg`**, calculado por `Fotos.caminho()`. O SHA-256 é do ficheiro de origem: a mesma fotografia enviada duas vezes cai no mesmo sítio, e por isso a fila pode repetir sem duplicar. Onde não há `crypto.subtle` — pelo IP da rede local, em http — a conta faz-se em JavaScript, no mesmo ficheiro.
- **Cada ecrã tem endereço fixo e partilhável** (`ROTAS` em `app.js`). É isto que permite ao WhatsApp ser o sino e à app ser o arquivo — e é a decisão com maior impacto no sucesso do projeto.
- **Voltar é recuar no caminho feito, não subir na hierarquia.** O ecrã-pai declarado só serve quando não há histórico — o caso do link vindo do WhatsApp.
- **Os cinco dias têm número, do 1 ao 5.** O convidado vê `etiqueta` («Dia 1»…), calculada em `conteudo.js` a partir de `ordem`; um dia marcado como logística (`logistico`, na edição da etapa) fica sem número, mas hoje nenhum está. Os títulos e os interlúdios dos dias 2 a 4 são os do texto da direção. `numero` é a posição no itinerário e liga o dia ao seu percurso e às suas estradas. Decisão de 27.09.2026, que desfez a numeração só dos dias de estrada do mesmo dia.
- **O grupo segue em caravana: a app explica o dia, não indica o caminho.** Há batedores na estrada e os carros seguem-nos. O ecrã Hoje e o Itinerário dizem primeiro o que vai acontecer — paragem, o que se faz ali. **Sem percurso à vista do convidado:** nem distância nem tempo entre paragens, nem quilómetros por dia no programa (decisão da direção, 27.09.2026). **Só se mostram três horas por dia** — a partida, a chegada ao hotel e o jantar. As outras ficam nos dados com `horaOculta`, porque é por elas que o Hoje sabe o momento em curso e que a história de cada paragem abre; a organização escolhe no cartão do momento. O CTA principal de um ecrã nunca é "abrir no Maps".
- **Não há marcação de chegada.** Os vinte e cinco carros andam juntos, chegam juntos e param juntos: validar a chegada seria validar o que já é evidente, e dependeria de posição em vales sem cobertura. Saiu a 20.09.2026, com tudo o que vivia dela — a presença no mapa, a manchete do grupo e as contagens da certidão. **A história de uma paragem abre pelo relógio do programa** (`Programa.abertoAgora`), que numa caravana sabe onde está toda a gente melhor do que um toque no ecrã. A identidade pelo carro não desapareceu: mudou de sítio, e vive na criação do acesso, na primeira abertura, na lista de participantes e na certidão do álbum.
- **Cada paragem tem a sua localização, no Google Maps e no Waze, e mais nada.** Só o sítio, nunca o percurso (`UI.atalhosLocal`): quem conduz escolhe a aplicação. Vive em texto, no fim da página da paragem e por baixo de cada momento do roadbook — nunca numa barra fixa. Os links por troço com waypoints âncora e o GPX saíram a 27.09.2026, por decisão da direção; substituem a de 12.09.2026 (`docs/decisao-navegacao-caravana.md`).
- **O separador das Etapas (`#/etapas`, que se chamou Estradas até 26.09.2026) é o retrato do que se conduz, não uma ferramenta.** Um traço por estrada, sem preenchimento, na cor do percurso (`--verde`), sobre chapa escura que não muda de tema — como a fotografia. Os traçados são geometria real, projetada uma vez do OpenStreetMap e gravada em `js/estradas.js`; a app continua a não fazer um único pedido externo. **Uma estrada sem traçado confirmado entra sem desenho**, só com o nome e a nota: um traço aproximado é uma mentira mais difícil de apanhar do que um número errado. Sem animação — o manifesto dá 200 ms ao movimento e uma só exceção, que é o álbum.
- **Cada etapa desenha-se duas vezes: vista de cima e vista de lado.** Em cima, a estrada real do dia, de paragem a paragem; por baixo, o perfil de altitude, com as altitudes à direita e os pontos altos com nome e altitude oficial — o ponto assenta na linha do terreno, a etiqueta diz o número oficial. Vive em `js/percursos.js`: geometria do OpenStreetMap pelo OSRM e altitude do EU-DEM (25 m) de 250 em 250 m, calculadas uma vez e gravadas. Um percurso só vale enquanto as paragens do dia forem, pela mesma ordem, as que lá estão; se a organização mudar o dia, volta o desenho de paragem a paragem. **O que é dedução vai a tracejado**, com a frase por baixo. Decisão de 26.09.2026. O 3 de outubro foi recalculado a 28.09.2026 com a Malga Ces e os cinco passos; a ordem da tarde é dedução e vai a tracejado.
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

O código da organização (`2026`, `CODIGO_EQUIPA` em `js/nuvem.js`) só existe no servidor simulado e só serve enquanto a equipa estiver vazia: é o que deixa entrar a primeira pessoa. Com o Firebase, a primeira entrada de `equipa/{email}` escreve-se à mão na consola, e são as regras que decidem quem tem papel de organização.

**A equipa tem um master** (29.09.2026): o email profissional do Tiago, com `master: true` no seu documento de `equipa`. Só o master acrescenta e retira pessoas da equipa; os outros veem a lista e o nome de quem a gere. O campo escreve-se na consola, nunca pela app — as regras não deixam ninguém fazer-se master nem retirar o master. O email não se escreve no repositório, que é público: vive só no Firestore. O Gmail do Tiago saiu da equipa no mesmo dia; o perfil antigo ficou, sem poderes, e apaga-se em Pessoas › Acessos.

---

## 9. O que é provisório

| O quê | Onde |
|---|---|
| Coordenadas dos sítios | `semente.js` › `biblioteca` — do OpenStreetMap; a do LO.VE. é a da rua, não a do portão |
| Distâncias e tempos dos troços | `ui.js` › `troco()` — linha reta com fator de sinuosidade; erram por defeito nos passos alpinos. O total de cada dia já vem da estrada real, em `percursos.js` |
| Percursos dos dias | `js/percursos.js` — estrada calculada pelo OSRM com as âncoras do programa. No 3 de outubro, os cinco passos do texto da direção entram pela ordem que fecha o anel sem repetir estrada — Croce d'Aune de manhã; Rolle, Valles, Forcella Aurine e Cereda à tarde. A ordem da tarde é dedução e está a tracejado. Tudo por confirmar com a Stappando |
| Malga Ces | `semente.js` › `biblioteca` — coordenadas do OpenStreetMap, sem fotografia |
| Horas da chegada | `semente.js` › `roteiro` — o dia 1 tem hora no hotel (20:30) e no jantar (21:00), que dependem da pontualidade dos voos; a chegada ao Marco Polo não tem hora, e sem hora a app não mostra nenhuma |
| Fotografias | `assets/fotos/` — as oficiais de cada sítio (hotéis, restaurantes, museus, ateliê) e Pixabay para Veneza e San Boldo, usadas sem créditos por decisão da organização, que trata da autorização. Sem fotografia, fica o desenho de `imagens.js`. A capa das Etapas é uma ilustração do San Boldo, dada pelo Tiago a 26.09.2026 (`san-boldo-ilustracao.jpg`), cortada por cima da placa, que tinha o nome errado |
| Condutor e co-piloto | `assets/img/lugar-*.png` — ilustração dada pelo Tiago a 28.09.2026, com o emblema da marca no capacete e no roadbook; origem e licença por confirmar |
| Silhuetas dos carros | `silhuetas.js` — em tamanho de leitura, desenho a traço na cor do texto; em etiqueta, o perfil cheio na mesma cor. Não há escolha de cor: saiu a 26.09.2026, por não acrescentar nada; o carro diz-se pelo modelo. Há traço do DB12, do DB11, do Vanquish, do DBS, do Vantage, do V12 Vantage, do DB7, do DB5 e do DBX707, vetorizados de desenhos de terceiros — licença por confirmar. Nas jantes de arame do DB5, os raios foram redesenhados, e a figura do condutor saiu. As versões Volante e o Valhalla saíram da lista a 26.09.2026; um acesso antigo com um deles aparece como DB12 |
| Código da organização | `js/nuvem.js` › `CODIGO_EQUIPA` — só no servidor simulado, e só para a primeira pessoa da equipa. Sem servidor, a equipa vive em cada browser |
| Traçados das estradas | `js/estradas.js` — só o San Boldo está confirmado. Ver a tabela abaixo |
| Envio das fotografias | `js/nuvem.js` — ligado ao Storage e ao Firestore do projeto `dolomitesgt` e verificado de ponta a ponta a 28.09.2026 |
| Álbum em .zip com as do grupo | O bucket precisa do CORS de `docs/firebase/cors.json` (ver README). Até lá, o .zip leva só as fotografias do próprio telemóvel; na Galeria veem-se todas |
| Contas dos convidados | `js/nuvem.js` › `CONFIG` — preenchido com o projeto `dolomitesgt`: as contas vivem no Firebase Auth. Vazio, voltariam a um servidor simulado em cada browser. Falta uma Cloud Function que apague do Auth a conta cujo perfil a organização apagou. Sem servidor, a recuperação da palavra-passe não envia email, e o ecrã diz isso |
| Fotografias de abertura | `js/views/org-fotos.js` — ficam no telemóvel de quem organiza, como o resto do conteúdo |

**Traçados por confirmar.** Só se desenha o que estiver confirmado; as outras quatro aparecem no ecrã como entrada de texto, sem desenho:

| Estrada | Dias | Estado |
|---|---|---|
| Passo di San Boldo | 2 e 4 | **Confirmado.** Geometria do OpenStreetMap: 796 m medidos, cinco troços marcados como túnel. Bate com a pesquisa — seis curvas, cinco túneis, ~800 m para 100 m de desnível, 10% |
| Strada Cadorna (subida a Cima Grappa) | 2 | Por confirmar — há mais do que um traçado possível a partir de Possagno |
| As passagens das Dolomitas | 3 out | Por confirmar — os cinco passos são do texto da direção; falta a ordem e as estradas entre eles. A Val Canali saiu com o Chalet Piereni |
| Altopiano del Cansiglio (subida ao Monte Pizzoc) | 4 | Por confirmar |

A secção **Demonstração**, o endereço `#/demo/n` e o campo `demoFase` **saíram a 20.09.2026** (commit `bc18040`). «Repor tudo» passou para a área da organização, em Evento › Cópia de segurança. O carregador do passeio de exemplo, com pessoas falsas, saiu no lançamento aos convidados (28.09.2026).

---

## 10. Por fazer, por ordem

1. **Sessão fotográfica, ou arquivo licenciado.** As fotografias oficiais dos sítios já estão na app; o que falta é o passeio em si — os carros na estrada, o grupo, a luz de outubro.
2. **Pedir à Stappando o traçado real dos quatro troços por confirmar** — a subida a Cima Grappa, as passagens das Dolomitas de 3 de outubro (e a ordem dos cinco passos) e a subida ao Cansiglio. Basta o GPX ou o nome das estradas: o traçado projeta-se do OpenStreetMap, como se fez ao San Boldo. Sem isto, três das quatro estradas do passeio ficam sem desenho. É a par com a sessão fotográfica.
3. **Servidor** — Firestore para conteúdo e pedidos; Storage para fotografias; o projeto Firebase para as contas, que já falam REST (`nuvem.js` › `CONFIG`); papéis com regras a sério; Cloud Messaging.
4. **Publicação e notificação** — o botão que empurra uma alteração para os telemóveis. Sem isto, a regra operacional do manifesto §4 não se cumpre.
5. **Revisão da identidade para a rota real.** `Pietra e Vigna` foi deduzida do Veneto — pedra, vinha, Veneza — e a rota de 2026 passa a maior parte do tempo precisamente aí: Possagno, as colinas do Prosecco, o Cansiglio, a laguna. O que a fundamentação ainda não tem são os dois fios que o passeio acrescenta: a Grande Guerra (o Grappa e San Boldo) e a dolomia das Pale di San Martino. A paleta e as regras ficam; a revisão acrescenta, não substitui — ver `ENQUADRAMENTO.md` §4.
6. **Exportação do roadbook em PDF** (o CSV de participantes já existe).

---

## 11. Como correr

```bash
node servidor.js     # http://localhost:8124
```

Sem dependências, sem build. Instalar no telemóvel pelo *Adicionar ao ecrã principal*. Entrar na organização pelo botão «Organização», no fim da entrada (`#/organizacao`).

---

## 12. Antes de dar por feito

1. Se retirasse as silhuetas dos carros, isto passaria por uma app de um hotel de cinco estrelas no Veneto?
2. Lê-se ao sol, de pé, ao meio-dia?
3. Há mais do que uma cor de acento neste ecrã? Se sim, retirar uma.
4. Entrou alguma cor, raio ou espaçamento fora de `tokens.css`?
5. Funciona sem rede, e o ecrã tem endereço próprio?
6. Subiu-se o `?v=` e a `VERSAO` do service worker?
7. Viu-se nos dois temas? O que assenta sobre fotografia não muda; tudo o resto tem de passar AA nos dois.
