# Enquadramento — documento do DG vs. o que está desenvolvido

Comparação entre `Estrutura-App-Passeio-Dolomitas.docx` (Road Book · Gran Turismo, v1) e o que existe construído a partir de [MANIFESTO.md](MANIFESTO.md) e [BRAND-GUIDELINES.md](BRAND-GUIDELINES.md).

16 de agosto de 2026

> **Atualização.** Depois desta análise ficou decidido: constroem-se **as duas apps sobre a mesma base**, e o âmbito do lado do convidado passa a ser **apenas o evento**. O checkup nas oficinas, o transporte da viatura e as inscrições em experiências saíram do projeto — os clientes recebem acesso à app poucos dias antes de partir. O que a secção 3.3 lista como "não mencionado no documento" reduz-se, por isso, ao que acontece durante o passeio e ao álbum final.

---

## 1. Conclusão

Os dois documentos descrevem **produtos diferentes para utilizadores diferentes**, e não versões diferentes do mesmo produto.

| | Documento do DG | O que está construído |
|---|---|---|
| Quem usa | **Uma pessoa** — o organizador | **Trinta convidados**, nos seus telemóveis |
| Para quê | Registar e gerir o evento | Viver o evento |
| Natureza | Ferramenta de gestão, tudo editável | Roadbook editorial, sobretudo de leitura |
| Dados | Sensíveis (nascimento, carta, apólice) | Mínimos (nome e contacto) |
| Rede | Não é tema | Offline é o estado normal |
| Destino | Dolomitas | Veneto |

Isto **não é um conflito** — é uma peça que faltava. O manifesto já previa esta ferramenta na secção 6: *"backoffice simples para a equipa Aston Martin / concessionário — publicar alterações de programa, conteúdo de POIs e notificações"*. O documento do DG é a especificação desse backoffice, escrita de forma independente e mais detalhada do que a nota do manifesto.

O risco real não é técnico: é de expectativa. Se o DG julga que o documento descreve **toda** a aplicação, então metade do que está feito não estava a ser esperado — e o que ele espera não está feito.

---

## 2. Onde os dois se encontram

Estes pontos do documento já existem, e em geral com mais profundidade:

| Documento do DG | Estado |
|---|---|
| Itinerário por etapas, ordem cronológica | **Feito** — quatro dias, cada um com programa ao minuto, percurso e POIs |
| Etapa com data, título e notas de percurso | **Feito** — `dias[]` em `js/dados.js`, com título, subtítulo, resumo e paragens |
| Associar condutor e acompanhante ao mesmo veículo ("nº do carro") | **Feito** — cada carro admite dois perfis; é o modelo do manifesto |
| Matrícula da viatura | **Feito** — recolhida na marcação do checkup |
| Contactos de emergência com telefone | **Feito** — organização, assistência, carro-vassoura, hotel, 112 |
| Cabeçalho com nome, local e datas do evento | **Parcial** — está na capa do ecrã inicial, não como cabeçalho fixo |
| Gravação automática, sem botão de guardar | **Feito** — escrita local imediata e fila de sincronização |

---

## 3. Onde divergem

### 3.1 Divergências de âmbito — o documento pede o que não existe

| Pedido | Situação |
|---|---|
| **Edição dentro da app** (adicionar, editar, remover etapas e participantes) | Não existe. O conteúdo vive em ficheiros de dados; não há interface de edição |
| **Ficha de participante** com nome, apelido, data de nascimento, papel, foto | Não existe. Há apenas nome e contacto |
| **Carta de condução e apólice de seguro** | Não existe |
| **Hotéis e restaurantes** como lista com tipo, telefone e morada | Não existe como categoria própria |
| **Indicadores no cabeçalho** (nº de etapas, condutores, acompanhantes) | Não existe |
| **Exportar** PDF do road book e Excel de participantes | Existe só GPX por dia |
| **Acesso partilhado** por várias pessoas da organização | Não existe — não há noção de papéis |
| **Ligar cada etapa ao hotel/restaurante correspondente** | Não existe — os momentos ligam a POIs, não a contactos |

### 3.2 Divergências de conceito — o documento contradiz os guidelines

Estas três precisam de decisão, não de programação.

**a) Dados sensíveis no telemóvel do convidado.**
O manifesto é explícito: *"O perfil pede apenas nome e contacto; nada mais."* O documento pede data de nascimento, número de carta de condução e número de apólice. Não são categorias especiais para efeitos do RGPD, mas são dados de identificação que obrigam a minimização, a limitação de finalidade, a prazo de conservação e a controlo de acesso — e que não têm utilidade nenhuma para o convidado. Fazem sentido para o organizador; não fazem sentido no telemóvel de quem viaja.

*Resolução proposta:* estes campos existem **apenas** no módulo do organizador e nunca são apresentados no lado do convidado.

**b) Fotografia do participante.**
O documento quer um cartão tipo "bilhete de rali" com foto da pessoa. Os guidelines dizem o contrário, e por uma razão defensável: *"A identidade na app começa no carro… No mapa mostra-se o carro, não as pessoas."* Não existe construtor de avatares por decisão expressa.

*Resolução proposta:* a foto vive no cartão do organizador — que é, de facto, um documento de trabalho. No lado do convidado a identidade continua a ser a silhueta do carro. Ninguém perde nada.

**c) Três separadores contra cinco.**
O documento propõe Itinerário · Participantes · Contactos. A app do convidado tem Hoje · Roadbook · Mapa · Galeria · Mais. A estrutura de três separadores é a certa para a ferramenta do organizador; a de cinco é a certa para quem está na estrada. Não há aqui nada a reconciliar — são aplicações diferentes.

### 3.3 O que o documento não menciona

Estas são as funcionalidades que o manifesto identifica como as de maior retenção, e que estão construídas:

Checkup nas oficinas com relatório assinado · transporte do carro para Itália · programa vivo com alterações assinaladas · navegação troço a troço para não perder a curadoria da estrada · histórias dos POIs desbloqueadas à chegada · check-in e presença do grupo no mapa · galeria partilhada · concierge · SOS com localização · álbum final · funcionamento sem rede.

O silêncio do documento sobre estas funcionalidades é provavelmente sinal de que foi escrito a pensar noutra coisa — não de que devam ser retiradas. Vale a pena confirmar.

---

## 4. O destino: Dolomitas ou Veneto

Não são necessariamente incompatíveis. **Cortina d'Ampezzo fica na província de Belluno, que é Veneto.** O passeio do exemplo do documento — Cortina → Passo Falzarego → Passo Gardena — parte do Veneto e entra no Alto Ádige.

O que muda conforme a resposta:

| | Se o passeio for aos Dolomitas |
|---|---|
| Conteúdo dos POIs | **Reescrever por inteiro** — os catorze POIs atuais são Veneto de planície: Prosecco, Palladio, Verona |
| Dias, programa, distâncias | Reescrever |
| Mapa | **Funciona sem alteração** — o enquadramento é calculado a partir das coordenadas |
| Waypoints âncora | Recurar. Nos passos alpinos são ainda mais críticos do que na planície |
| Estrutura da app | **Sem alteração** |
| Identidade `Pietra e Vigna` | **A repensar.** O argumento é pedra de Istria, verde Veronese, villas palladianas e a tipografia aldina de Veneza. Em Cortina o material é dolomia, madeira de larício e cultura ladina. A paleta sobrevive; a fundamentação, não. Fingir que sim seria fazer exatamente o que os guidelines proíbem: escolher cores por gosto e inventar-lhes uma história |

Se o passeio for mesmo aos Dolomitas, o mais honesto é uma revisão do documento de marca — mesma disciplina, mesmas regras de contraste e tipografia, argumento cultural novo. É meio dia de trabalho, não um recomeço.

---

## 5. Alterações necessárias

### Cenário A — as duas aplicações, mesma base de dados *(recomendado)*

A app do convidado mantém-se e ganha um **módulo do organizador**, com os três separadores do documento, acessível apenas a quem tem esse papel.

**No módulo do organizador (novo):**

1. **Itinerário** — lista de etapas por ordem, com adicionar, editar, remover e reordenar. Campos do documento (data, título, notas de percurso) mais os que a app do convidado já consome: horas, POIs, meteorologia.
2. **Participantes** — cartão por pessoa com nome, apelido, data de nascimento, papel, nº do carro, fotografia. Bloco de veículo visível só para condutores: carta, apólice, matrícula.
3. **Contactos** — emergência (nome, telefone, notas) e hotéis/restaurantes (tipo, nome, telefone, morada).
4. **Papéis e acesso** — organizador com escrita, convidado com leitura. Sem isto, os dados sensíveis ficam expostos.
5. **Exportações** — PDF do road book e Excel de participantes.
6. **Publicação** — o botão que empurra uma alteração de programa para os telemóveis e dispara a notificação. É a peça que faz a regra operacional da secção 4 do manifesto funcionar.

**Na app do convidado (acrescentos):**

7. **Hotéis e restaurantes** nos contactos, com morada e ligação ao mapa.
8. **Ligação da etapa ao contacto** — o jantar liga ao restaurante, a chegada liga ao hotel.
9. **Cabeçalho do evento com indicadores** — etapas, condutores, acompanhantes.
10. **Nº do carro (equipa)** visível na ficha do carro, para bater com o roadbook impresso.

**Estimativa grosseira:** o módulo do organizador é o maior bloco de trabalho por fazer, comparável ao que já existe. Os acrescentos à app do convidado (7 a 10) são pequenos — um a dois dias.

### Cenário B — o documento substitui o âmbito

Se a decisão for que o projeto é a ferramenta do organizador e mais nada:

- Constrói-se a app de três separadores tal como especificada.
- **Aproveita-se tudo o que é infraestrutura:** paleta, tipografia, componentes, listas, formulários, silhuetas, navegação, estado local, offline. É trabalho feito e reutilizável quase sem alteração.
- **Fica de fora** a experiência do convidado: programa vivo, roadbook editorial, POIs, mapa de presença, galeria, concierge, SOS, checkup, álbum. É a maior parte do valor identificado no manifesto — e a razão pela qual a app fica instalada depois do evento.

Não recomendo. O documento do DG resolve o problema da organização; o manifesto resolve o problema dos clientes. Só o segundo é que os trinta proprietários chegam a ver.

---

## 6. Perguntas para o DG

1. O documento descreve **toda** a aplicação, ou a parte da organização? (é a pergunta que determina tudo o resto)
2. O destino é Dolomitas, e nesse caso mantém-se a base no Veneto (Belluno) ou passa-se para o Alto Ádige?
3. Os dados de carta e apólice são para uso da organização ou têm de estar acessíveis ao próprio condutor?
4. Quantas pessoas da organização precisam de acesso de escrita?
5. Confirma-se que o passeio mantém trinta proprietários e o formato de quatro dias?
