# App do Passeio — versão de trabalho

Aplicação web mobile, instalável como PWA, para o passeio anual de clientes Aston Martin. Edição de 2026: **Dolomitas**.

São **duas apps sobre a mesma base de dados**:

- **A app do convidado** — trinta telemóveis, offline, roadbook editorial. Nasce de [MANIFESTO.md](MANIFESTO.md) e [BRAND-GUIDELINES.md](BRAND-GUIDELINES.md).
- **A área da organização** — itinerário, participantes e contactos, tudo editável. Nasce do documento do diretor-geral. A comparação entre os dois está em [ENQUADRAMENTO.md](ENQUADRAMENTO.md).

O conteúdo do passeio **não vive em ficheiros**: é criado dentro da app, na área da organização, e aparece de imediato no telemóvel do convidado.

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

**Nos dias anteriores** — o briefing, e uma **revelação por dia**: uma paragem do percurso que se abre, com fotografia e três linhas. É o que faz a app abrir-se todos os dias antes de partir.

**Durante** — o ecrã "Hoje" é imersivo: sem cabeçalho, sem navegação normal, **uma coisa de cada vez** a ecrã inteiro sobre a paisagem — o momento em curso, a hora, a altitude, a distância. Tocar na fotografia avança para o momento seguinte; tocar na pauta em baixo convoca o dia inteiro numa folha, com os totais da etapa. A navegação sobre a fotografia usa um sinal próprio — cinco punções desenhados do vocabulário do passeio (sol nascente, gancho de rota, retícula com curvas de nível, provas empilhadas, filetes em degradé), gravados em latão sobre o escuro; é a única navegação da app que não usa os ícones gerais. Roadbook por etapas, com cada troço a abrir individualmente no Google Maps e exportação GPX; a história de cada paragem apresentada como **promessa** — um excerto sobre a fotografia do sítio — que se revela à chegada; mapa monocromático com os carros a cores reais e uma **manchete** quando o grupo se junta num sítio; galeria com câmara nativa; concierge com cara, nome e promessa de resposta; contactos e SOS.

**Depois** — o álbum abre com uma **certidão do percurso**: quilómetros, etapas, paragens visitadas, ponto mais alto com altitude, viatura, matrícula e número de edição, seguida dos passos ordenados por altitude e das fotografias.

Não há checkup, não há transporte de viatura e não há inscrições — essas fases não fazem parte do âmbito.

**Sempre** — funciona sem rede, com fila local de escritas; cada ecrã tem endereço fixo e partilhável; modo escuro; alvos de 44 px e contrastes AA/AAA.

Enquanto a organização não publicar itinerário, o convidado vê estados de espera legíveis — nunca um ecrã partido.

---

## A área da organização

Três separadores, como no documento, mais os dados do evento.

**Itinerário** — etapas com data, título, subtítulo e notas de percurso; reordenáveis. Dentro de cada etapa: as paragens (ordenáveis) e o programa do dia ao minuto. Alterar a hora de um momento marca-o como alterado no telemóvel de toda a gente, com a razão à vista.

**Paragens** — criadas de raiz ou escolhidas de uma **biblioteca de sugestões da região** com coordenadas já preenchidas (28 sítios das Dolomitas). Aceita-se um endereço colado do Google Maps: as coordenadas são extraídas automaticamente. Cada paragem tem subtítulo, história em parágrafos e nota prática.

**Pessoas** — cartão por participante com nome, apelido, data de nascimento, papel, nº do carro, email e fotografia. O bloco do veículo — carta, apólice, matrícula, modelo e cor — só aparece para condutores. Os carros são derivados do nº de equipa: quem partilha o número, partilha o carro.

**É o email que liga as duas apps.** Quando o convidado entra, a app procura a ficha com esse email: dela vêm o nome e o carro. Quem não estiver na lista entra na mesma, mas sem carro associado — e o ecrã diz-lhe porquê.

**Fotografias** — cada etapa e cada paragem aceitam uma fotografia, carregada do telemóvel e reduzida automaticamente. Sem fotografia, fica o desenho gerado. É o campo com mais efeito de toda a área.

**Revelação** — cada paragem pode ter uma data em que se revela ao convidado, nos dias antes de partir. Uma por dia é o ritmo certo.

**Contactos** — emergência (nome, telefone, notas) e hotéis/restaurantes (tipo, nome, telefone, morada). Cada etapa pode apontar para o hotel do fim do dia.

**Concierge** — retrato, nome, função e promessa de resposta. Sem resposta automática: um pedido fica *entregue* e é uma pessoa que responde. Fingir uma resposta é pior do que não ter nenhuma.

**Evento** — nome, base, datas, o briefing (o que levar e as notas práticas) e cópia de segurança: descarregar tudo em JSON, restaurar de ficheiro, e exportar os participantes em CSV para Excel.

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
    icones.js           conjunto outline de 1.5px
    imagens.js          imagens de reserva, a substituir por fotografia
    app.js              encaminhamento, histórico e chrome
    views/              ecrãs do convidado; org*.js são a área da organização
  exemplos/veneto/      conteúdo da edição do Veneto, guardado para referência
servidor.js             servidor estático de desenvolvimento
```

`conteudo.js` é a única peça que muda quando houver Firestore: `carregar()` e `guardar()`. Todo o resto lê `DADOS` e `POIS` e não sabe de onde vêm.

---

## Demonstração

Em **Mais › Definições › Demonstração** salta-se entre os dias anteriores, cada etapa e o pós-evento, e carrega-se um **passeio de exemplo** — quatro etapas nas Dolomitas, com participantes e contactos — para mostrar a app sem escrever um itinerário à mão. Serve para demonstrar fora das datas do evento e **não deve existir na versão entregue aos convidados** — apagar a secção `Demonstração` em `js/views/mais.js` e o campo `demoFase` em `js/store.js`.

---

## O que ainda é provisório

| O quê | Onde | Nota |
|---|---|---|
| Coordenadas da biblioteca de sugestões | `semente.js` | Aproximadas ao centro do local — **confirmar antes de publicar os percursos** |
| Distâncias e tempos dos troços | `ui.js` › `troco()` | Linha reta com fator de sinuosidade. Nos passos alpinos erram por defeito; devem vir dos GPX reais |
| Waypoints âncora | `ui.js` › `ANCORAS` | Ainda são os do Veneto. **Recurar para as Dolomitas** — nos passos é onde mais importa |
| Fotografias | `imagens.js` | Desenhos de dolomia gerados por hora do dia (alvorada, dia, poente, noite). **A organização já pode carregar fotografias reais** em cada etapa e cada paragem; assim que existem, substituem o desenho |
| Silhuetas dos carros | `silhuetas.js` › `FORMAS` | Cinco arquétipos. A versão final deve ter um perfil por modelo |
| Cores de carroçaria | `silhuetas.js` › `CORES` | Nomes reais, hexadecimais aproximados — pedir os códigos à marca |
| Código de acesso da organização | `js/views/mais.js` | Um código partilhado. Não é autenticação |

---

## O que veio da pesquisa

Os oito movimentos de [O Luxo é Atmosfera](PESQUISA-LUXO.html) estão implementados: fotografia a toda a largura com carregamento pela organização, a chegada, um momento de cada vez, o concierge com cara, a revelação diária, a manchete do grupo, a história como recompensa e o álbum como certidão. O que continua a faltar é a fotografia real — nenhum desenho gerado substitui uma sessão nas Dolomitas.

---

## Por fazer, por ordem

1. **Sessão fotográfica, ou arquivo licenciado.** É o único movimento que não se resolve com código, e é o de maior efeito.
2. **Recurar os waypoints âncora para as Dolomitas.** Sem eles, o Google Maps troca o Giau pela autoestrada. É trabalho manual, uma vez por rota.
3. **Servidor.** Firestore para conteúdo, chegadas e pedidos; Storage para fotografias; Auth por link mágico; papéis de organização e convidado com regras de segurança a sério; Cloud Messaging para as notificações de alteração de programa.
4. **Publicação e notificação.** O botão que empurra uma alteração para os telemóveis. Sem isto a regra operacional da secção 4 do manifesto não se cumpre.
5. **Revisão da identidade para as Dolomitas.** `Pietra e Vigna` foi deduzida do Veneto de planície — pedra de Istria, verde Veronese, villas palladianas, tipografia aldina. Em Cortina o material é dolomia, larício e cultura ladina. A paleta e as regras sobrevivem; a fundamentação precisa de ser reescrita. Ver [ENQUADRAMENTO.md](ENQUADRAMENTO.md) §4.
6. **Exportação em PDF** do roadbook (o CSV de participantes já existe).

---

## Decisões que vale a pena conhecer

**O conteúdo é dado, não é código.** Foi a alteração estrutural desta ronda. O itinerário não existia quando a app foi feita e passou a poder ser criado dentro dela, sem programador no meio.

**A app não veste a marca Aston Martin, veste a região.** A presença da marca está em três sítios: a assinatura no ecrã de entrada, as silhuetas dos carros e o rodapé do álbum.

**Uma cor de acento por ecrã.** O álbum é o momento `Radicchio`, as alterações de programa são `Rosso Verona`, o SOS é o único ecrã inteiramente vermelho. Tudo o resto é `Verde Veronese`.

**Serif conta, sans instrui.** EB Garamond para o editorial, Instrument Sans para a interface, com algarismos tabulares. Servidas localmente: a app não faz um único pedido a servidores externos.

**Navegação troço a troço.** O Google Maps recalcula sempre pelo critério mais rápido; enviar o dia inteiro dissolveria a curadoria.

**Voltar é recuar no caminho feito, não subir na hierarquia.** Cada vista declara um ecrã-pai, mas esse só é usado quando não há histórico — o caso do deep link vindo do WhatsApp.

**Sem sombras, sem cantos redondos, sem gradientes em superfícies.** A elevação exprime-se por mudança de superfície e por linha de 1 px.
