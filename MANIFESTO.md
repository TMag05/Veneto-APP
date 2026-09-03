# Manifesto — App do Passeio Veneto

**Aston Martin · Encontro anual de clientes · Veneto, Itália**
Versão 1.0 — 9 de agosto de 2026

---

## 1. Em uma frase

Uma aplicação web mobile que acompanha trinta proprietários Aston Martin desde a preparação do seu carro até ao álbum final do passeio pelo Veneto — sendo, em cada momento, o único sítio onde a informação certa vive.

---

## 2. O que esta app é (e o que não é)

**É** um roadbook digital com memória. Tem a estrutura editorial de um roadbook de rally — capítulos, etapas, histórias — e a persistência de um arquivo que fica no telemóvel depois do evento terminar.

**Não é** uma rede social. Não há likes, comentários, contagens ou qualquer mecânica que faça um convidado competir por atenção.

**Não é** um app de turismo genérico. A curadoria dos percursos e dos pontos de interesse é o produto; o mapa é apenas o meio.

**Não é** um substituto do WhatsApp. O grupo de WhatsApp vai existir e é bem-vindo — ver secção 4.

---

## 3. Princípios de design

### 3.1 Offline é o estado normal, não a exceção

As estradas rurais do Veneto têm zonas sem cobertura. A app assume o pior caso: todo o conteúdo do dia — percursos, POIs, programa, contactos — é pré-carregado de manhã e permanece acessível sem rede. As ações do utilizador (fotos, check-ins, pedidos) ficam em fila local e sobem sozinhas quando houver ligação.

O convidado nunca vê um erro de rede. Vê, quando muito, um estado discreto de "a sincronizar".

### 3.2 Nenhuma feature pede desculpa por existir

Cada ecrã responde a uma pergunta que o convidado tem naturalmente. Se não responde a nenhuma, não entra na v1.

### 3.3 Silêncio como qualidade

Tipografia editorial, espaço branco generoso, ausência de ruído visual. A ausência de elementos é tão deliberada quanto a presença. Nenhuma notificação que não seja acionável.

### 3.4 Identidade pelo carro, perfil apenas o essencial

A identidade na app começa no carro — modelo e cor reais, escolhidos uma única vez durante a marcação do checkup. É essa silhueta que representa o carro no mapa.

Cada carro admite **até dois perfis** — tipicamente o casal. Ambos entram com as suas próprias credenciais, partilham o mesmo carro e o mesmo programa, mas as fotos e os pedidos ao concierge são atribuídos individualmente. O perfil pede apenas nome e contacto; nada mais.

No mapa mostra-se o carro, não as pessoas. Na galeria mostra-se quem tirou a foto.

### 3.5 A comunidade respira, mas não domina

O sentido de grupo está presente — ver quem já chegou, ver as fotos dos outros — mas nunca em primeiro plano. É atmosfera, não é o produto.

---

## 4. Relação com o WhatsApp

O grupo de WhatsApp já existe e é uma ferramenta enraizada nesta comunidade. Não competimos com ele — exploramos a sua fraqueza estrutural.

| WhatsApp | App |
|---|---|
| Excelente a notificar | Excelente a arquivar |
| Informação desaparece no scroll | Informação tem endereço fixo |
| É o sino | É o arquivo |

**Regra operacional para a equipa Aston Martin:** informação estruturada — horários, moradas, programas, alterações — nunca é colada no chat. É publicada na app e o WhatsApp recebe apenas o anúncio com o link direto.

> "Programa de amanhã atualizado 👉 [link]"

**Implicação técnica:** cada ecrã da app tem de ter um deep link estável e partilhável.

Esta é a decisão com maior impacto no sucesso do projeto e é inteiramente operacional, não técnica. Se falhar, a app torna-se redundante independentemente da qualidade do software.

---

## 5. Arquitetura da experiência — três fases

### FASE 1 · Pré-evento (semanas antes)

O objetivo é a instalação precoce com motivação própria. A âncora é o **checkup gratuito nas oficinas** — a única interação de todo o projeto com transação real e prazo real.

**Checkup do carro**

- Marcação de slot: escolha de oficina, data e hora
- Estado do processo: `marcado` → `recebido` → `em inspeção` → `pronto a levantar`
- Relatório digital no fim: o que foi verificado, o que está impecável, o que foi corrigido, assinado pelo técnico

O relatório transforma um serviço gratuito numa demonstração de cuidado — e fica no telemóvel do proprietário permanentemente.

**Efeito de composição:** o checkup cria o registo do carro por necessidade operacional. Modelo, cor e matrícula entram no sistema porque a oficina precisa deles — e são exatamente os dados que depois alimentam a silhueta no mapa, a etiqueta nas fotos e a logística do transporte. O convidado personaliza a app sem nunca lhe ter sido pedido que a personalizasse.

Neste momento, quem marca o checkup pode **convidar um segundo perfil** para o mesmo carro — o acompanhante recebe um link e entra com credenciais próprias.

**Transporte do carro para Itália**

- Data e janela de recolha
- Confirmação de recolha com fotografias de estado
- Chegada ao Veneto confirmada

**Briefing do passeio**

- Programa geral dos quatro dias
- O que levar, previsão meteorológica, informação prática
- Lista de participantes (discreta — nomes e carros, nada mais)

### FASE 2 · Durante o passeio (quatro dias)

**Programa vivo — a âncora de utilização diária**

O horário muda: chuva, atrasos, uma vinha que altera a hora da prova. Se a app é onde essa mudança aparece primeiro, torna-se obrigatória. Esta é a funcionalidade mais barata de construir e a mais forte em retenção de todo o projeto.

- Vista "hoje" por defeito, com o próximo momento em destaque
- Alterações marcadas visualmente e anunciadas por notificação
- Histórico dos dias anteriores acessível

**Roadbook e percursos**

Os percursos estão previamente definidos e são conteúdo curado — o coração do evento.

- Cada dia é um capítulo; cada POI é uma página com história, não um pin
- **Navegação etapa a etapa:** cada troço entre dois POIs é um deep link individual para o Google Maps, nunca o dia inteiro de uma vez

> **Nota técnica crítica:** o Google Maps recalcula sempre o percurso pelo critério de rapidez. Uma rota panorâmica de 120 km pelo Valpolicella seria silenciosamente substituída por autoestrada, dissolvendo a curadoria. Enviar troços curtos de 20–30 km reduz drasticamente esse risco — e traz o convidado de volta à app em cada paragem, que é onde está o conteúdo.

- **Waypoints âncora:** em troços onde a estrada específica é o ponto (um passo de montanha, uma estrada de cumeada), forçar 2–3 waypoints intermédios no link. Trabalho manual de curadoria, feito uma vez por rota.
- **Exportação GPX:** para proprietários que usem a navegação do próprio carro. Barato de incluir e sinaliza competência automóvel.

**Conteúdo dos POIs**

Histórias, contexto, curadoria local — desbloqueado à chegada, não antes. Cria um pequeno ritual de abrir a app em cada paragem.

**Presença do grupo (check-in por POI)**

Em vez de tracking contínuo — inviável em web app, ver secção 6 — cada convidado marca chegada ao POI. O mapa mostra quem já chegou, quem vem a caminho, quem ficou para trás, representados pelas silhuetas dos respetivos carros.

Dá a sensação de grupo por uma fração da complexidade e sem consumo de bateria.

**Galeria partilhada**

- Botão de captura que abre a **câmara nativa do telemóvel** (`<input capture>`), garantindo qualidade máxima — HDR, modo noturno, estabilização
- O mesmo componente aceita upload de fotos já existentes na galeria pessoal
- Cada foto é automaticamente associada ao dia, ao POI e ao perfil do autor
- Upload em fila offline: nunca falha à vista do convidado
- Sem likes, sem comentários, sem contagens

**Concierge e assistência**

- Pedidos em texto livre à equipa organizadora
- Contactos diretos: organização, assistência técnica, emergência
- Botão SOS com envio de localização

**Reservas e experiências**

Jantares, provas, extras opcionais — consulta e inscrição.

### FASE 3 · Pós-evento

**O álbum**

No último dia, o álbum completo dos quatro dias fica disponível em qualidade original, descarregável na íntegra. É o presente de fecho e a razão pela qual a app permanece instalada.

**Arquivo permanente**

- Roadbook completo dos percursos feitos
- Relatório do checkup
- Registo do transporte de regresso

---

## 6. Decisões técnicas assumidas

**Stack:** web app HTML, mobile-first, instalável como PWA. Backend Firebase (Firestore, Storage, Auth, Cloud Messaging).

**Offline-first:** Service Worker com pré-carregamento do conteúdo diário; fila de escritas locais com sincronização em background.

**Autenticação:** sem palavras-passe. Link mágico por email ou código enviado por SMS/WhatsApp.

**Tracking contínuo — limitação a assumir:** o iOS deixa de reportar geolocalização assim que o ecrã bloqueia ou o browser passa para background. Um mapa de frota em tempo real contínuo **não é fiável em HTML puro**.

Consequências:

- Para os convidados: check-in por POI (manual ou geofence com app aberta)
- Para a equipa de apoio e carro-vassoura: tracking contínuo funciona, porque usam telemóvel dedicado com a app aberta no suporte. O valor aqui é operacional — saber onde está a assistência

**Avatares:** não existe construtor de avatares. O convidado escolhe modelo e cor do seu Aston a partir de uma grelha de silhuetas SVG e da paleta oficial. Legível no mapa, imediatamente reconhecível, profundamente Aston Martin sem o dizer.

**Gestão de conteúdo:** backoffice simples para a equipa Aston Martin / concessionário — publicar alterações de programa, conteúdo de POIs e notificações.

---

## 7. Faseamento sugerido

| Fase | Âmbito | Momento |
|---|---|---|
| **Fase 1** | Checkup: marcação, estados, relatório. Registo do carro e perfis (até 2). Autenticação | Primeiro a entregar — prazo ditado pelas oficinas |
| **Fase 2** | Programa vivo, roadbook, POIs, navegação por etapas, offline | Antes do briefing do passeio |
| **Fase 3** | Galeria, check-in por POI, concierge, SOS | Antes da partida |
| **Fase 4** | Álbum final, arquivo, exportação | Último dia do evento |

---

## 8. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Informação estruturada continua a ser publicada no WhatsApp | **Crítico** — torna a app redundante | Regra operacional na secção 4; deep links por ecrã; formação da equipa |
| Percursos não existem em formato digital utilizável | **Alto** — bloqueia o roadbook | Auditar o formato dos trajetos com urgência; pode ser o verdadeiro caminho crítico do projeto |
| Google Maps recalcula e desfaz a curadoria | Médio | Navegação por etapas curtas + waypoints âncora |
| Adesão baixa à galeria | Médio | Captura em um toque; equipa semeia as primeiras fotos de cada dia |
| Cobertura pior do que esperado | Médio | Arquitetura offline-first já assume o pior caso |

---

## 9. Próximo passo imediato

**Auditar o formato dos percursos.** Se existirem em GPX/KML, o roadbook é trabalho de desenvolvimento. Se existirem como lista de moradas num documento, há trabalho de preparação de conteúdo antes de qualquer código — e essa é, tipicamente, a tarefa que determina o calendário de todo o projeto.
