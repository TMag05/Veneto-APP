# Brand guidelines — App do Passeio Veneto

**Nome de trabalho da identidade: `Pietra e Vigna`**
Versão 1.0 — 9 de agosto de 2026
Companheiro do [MANIFESTO.md](MANIFESTO.md)

---

## 1. Posição de partida

A app não veste a marca Aston Martin. Veste a **região**.

Esta é uma decisão deliberada e defensável: os carros que estão à porta já são a marca. Trinta Aston Martins numa praça de Asolo dizem tudo o que há a dizer sobre a marca — a app não precisa de o repetir. O que a app faz é **enquadrar** esses carros num contexto de rara qualidade cultural.

O resultado pretendido: um convidado abre a app e sente que está a segurar um objeto feito no Veneto — não um folheto de concessionário com fundo preto e verde de corrida.

A presença Aston Martin resume-se a três lugares e mais nenhum: as silhuetas dos carros, uma assinatura discreta no ecrã de abertura, e o rodapé do álbum final.

---

## 2. A ideia central

> **Pedra e vinha.** A matéria dura e clara da arquitetura veneta, contra o verde poeirento das colinas.

Tudo na identidade deriva desta oposição. As superfícies são pedra — calcárias, quentes, quase sem cor. O acento é a vinha — um verde terroso, nunca saturado. Entre os dois, um vermelho de mármore que só aparece quando algo é realmente importante.

Nenhuma cor foi inventada. Cada uma tem origem verificável na região.

---

## 3. Fundamentos de investigação

A paleta e a tipografia não são escolhas estéticas arbitrárias — nascem de quatro factos sobre o Veneto.

### 3.1 As duas pedras de Veneza

A arquitetura histórica veneziana assenta sobre um contraste entre duas pedras: a **pedra de Istria**, branco-sal quando extraída e cinza pálido quando envelhecida, e o **Rosso Ammonitico de Verona**, um calcário nodular vermelho-acobreado. Em 1580, Francesco Sansovino já identificava esta combinação como a assinatura visual da cidade.

**Tradução para a app:** as superfícies são pedra de Istria envelhecida. O vermelho de Verona é o acento raro — nunca decoração.

### 3.2 Um verde que é literalmente daqui

O **verde Veronese** é um pigmento de silicato de ferro e magnésio extraído das colinas em redor de Verona. Ganhou identidade comercial no século XVI e o nome ficou associado ao pintor Paolo Caliari, dito Veronese. Cromaticamente é um verde médio, poeirento, com um ligeiro desvio azul-acinzentado.

**Tradução para a app:** é a cor de acento principal. Um verde que vem do solo da região por onde os carros vão passar.

### 3.3 O reboco, não a pedra

As villas palladianas do Veneto **não são de pedra**. São de tijolo coberto a reboco — marmorino e intonaco — com pedra apenas em molduras de portas e janelas. A riqueza vem da proporção e da luz sobre uma superfície mate, não da ostentação de material.

**Tradução para a app:** superfícies mate, sem gradientes, sem brilhos, sem sombras dramáticas. A qualidade vem do espaçamento e da tipografia. É o princípio palladiano aplicado a uma interface.

### 3.4 Veneza inventou o itálico

Em 1495, Francesco Griffo cortou para Aldus Manutius, em Veneza, o tipo romano que viria a chamar-se Bembo — o desenho mais influente da história da tipografia. Em 1500, o mesmo Griffo cortou o **primeiro tipo itálico da história**, usado pela primeira vez na edição aldina da Eneida de 1501.

Isto não é trivia. Significa que usar um serif de estilo antigo e o seu itálico não é uma escolha decorativa — é **rigor histórico regional**. O tipo é tão veneto quanto a pedra.

**Tradução para a app:** um serif humanista de linhagem aldina para tudo o que é editorial. O itálico é usado com intenção, não como ênfase preguiçosa.

### 3.5 A paisagem que vão atravessar

As Colinas do Prosecco de Conegliano e Valdobbiadene, Património Mundial desde 2019, são colinas alongadas e íngremes com vinhas em terraços estreitos — os *ciglioni* — que criam um padrão de tabuleiro de xadrez na encosta.

**Tradução para a app:** a grelha. Alinhamentos rigorosos, colunas estreitas, ritmo vertical constante. O layout ecoa a estrutura da vinha em socalco.

---

## 4. Paleta

### 4.1 Superfícies — pedra

| Nome | Hex | Uso |
|---|---|---|
| `Calce` | `#F7F4EE` | Fundo da página. Marmorino, branco quente |
| `Istria` | `#FCFAF6` | Cartões e superfícies elevadas |
| `Intonaco` | `#EFEAE1` | Zonas recuadas, cabeçalhos de secção |
| `Pietra` | `#E0D9CD` | Linhas de separação |
| `Pietra forte` | `#CFC6B6` | Contornos de campos, estados de foco |

Nunca usar branco puro `#FFFFFF` como fundo. O branco puro é ecrã; a calcária é matéria.

### 4.2 Texto — tinta aldina

| Nome | Hex | Contraste sobre Calce | Uso |
|---|---|---|---|
| `Inchiostro` | `#1E1B18` | 15.6:1 · AAA | Texto principal, títulos |
| `Inchiostro medio` | `#6B6459` | 5.3:1 · AA | Texto secundário |
| `Inchiostro chiaro` | `#736B5D` | 4.8:1 · AA | Legendas, metadados |

O preto puro `#000000` está proibido. A tinta de impressão do século XVI é castanha-negra, nunca neutra.

**Nota de legibilidade ao sol:** `Inchiostro chiaro` foi propositadamente escurecido em relação ao habitual cinza-legenda. Esta app é lida ao volante parado, com sol direto, por pessoas maioritariamente acima dos 45 anos. Nenhum texto desce abaixo de 4.5:1.

### 4.3 Acentos

| Nome | Hex | Origem | Contraste sobre Calce | Uso |
|---|---|---|---|---|
| `Verde Veronese` | `#3B4A3E` | Pigmento das colinas de Verona | 8.6:1 · AAA | Acento principal: ações, links, estados ativos |
| `Verde chiaro` | `#6E8069` | — | — | Preenchimentos, ícones decorativos |
| `Rosso Verona` | `#8A4034` | Mármore Ammonitico Rosso | 6.7:1 · AA | Alertas, alterações de programa, SOS |
| `Radicchio` | `#6B2E3E` | Radicchio Tardivo de Treviso | 9.2:1 · AAA | Momentos raros: o álbum final, o fecho |
| `Ottone` | `#7A6234` | Latão das ferragens de villa | 5.3:1 · AA | Distinções, o relatório do checkup |

**Regra de disciplina cromática:** num ecrã típico deve ver-se **uma** cor de acento. Se um ecrã tem verde, vermelho e latão ao mesmo tempo, está errado.

O `Radicchio` é o mais restrito de todos: aparece no máximo duas vezes em toda a app. É a cor do presente final.

### 4.4 Modo escuro — lagoa ao anoitecer

Obrigatório. Os convidados vão usar a app em jantares, garagens e ao anoitecer.

| Nome | Hex | Uso |
|---|---|---|
| `Notte` | `#15171B` | Fundo |
| `Notte alzata` | `#1E2126` | Cartões |
| `Bordo notte` | `#2E3339` | Separadores |
| `Calce` | `#EDE8E0` | Texto principal · 14.7:1 AAA |
| `Calce media` | `#A8A196` | Texto secundário · 7.0:1 AAA |
| `Calce chiara` | `#9A9287` | Legendas · 5.8:1 AA |
| `Verde chiaro` | `#9DB39A` | Acento principal · 8.0:1 AAA |
| `Rosso chiaro` | `#D08C7E` | Alertas · 6.6:1 AA |
| `Ottone chiaro` | `#C9A96A` | Distinções · 8.0:1 AAA |

O modo escuro não é o modo claro invertido. É outro material: pedra à luz de vela.

### 4.5 Botões — texto branco sobre preenchimento

| Preenchimento | Contraste com branco |
|---|---|
| `Verde Veronese` `#3B4A3E` | 9.4:1 |
| `Rosso Verona` `#8A4034` | 7.3:1 |
| `Radicchio` `#6B2E3E` | 10.1:1 |
| `Ottone` `#7A6234` | 5.8:1 |

Todos passam AA para qualquer tamanho.

---

## 5. Tipografia

### 5.1 As duas famílias

**Editorial — `EB Garamond`**
Revivalismo de estilo antigo em linha direta com o que Griffo cortou em Veneza. Disponível no Google Fonts, com itálico verdadeiro e algarismos de estilo antigo.

Usado em: títulos de POI, histórias, textos do roadbook, capas de dia, citações, o álbum.

**Interface — `Instrument Sans`**
Grotesco neutro com proporções ligeiramente humanistas. Não compete com o serif; desaparece.

Usado em: navegação, botões, etiquetas, horas, distâncias, formulários, tabelas, estados.

Alternativa segura se houver problema de disponibilidade: `Inter`.

### 5.2 Regra de fronteira

A distinção não é decorativa — é semântica, e deve ser aplicada sem exceções:

> **Serif conta. Sans instrui.**

Uma história sobre uma vinha do século XV é serif. O botão "abrir no Google Maps" é sans. Um POI tem título em serif e distância em sans, lado a lado. Esta consistência é o que faz a app parecer desenhada em vez de montada.

### 5.3 Escala

| Nível | Família | Tamanho | Peso | Entrelinha |
|---|---|---|---|---|
| Capa de dia | EB Garamond | 40px | 400 | 1.15 |
| Título de POI | EB Garamond | 28px | 400 | 1.25 |
| Subtítulo | EB Garamond italic | 20px | 400 | 1.4 |
| Corpo editorial | EB Garamond | 19px | 400 | 1.65 |
| Título de interface | Instrument Sans | 17px | 500 | 1.3 |
| Corpo de interface | Instrument Sans | 16px | 400 | 1.5 |
| Etiqueta | Instrument Sans | 13px | 500 | 1.4 |
| Metadados | Instrument Sans | 12px | 400 | 1.4 |

Nada abaixo de 12px. Corpo editorial a 19px, não 16px — leitura ao sol, ao ar livre, sem óculos de leitura à mão.

**Pesos: apenas 400 e 500.** Nunca 600 nem 700. Peso pesado é a forma mais rápida de uma interface parecer barata.

### 5.4 Algarismos

O EB Garamond tem algarismos de estilo antigo — bonitos em prosa, ilegíveis em tabelas.

- Horas, distâncias, temperaturas, contagens → **Instrument Sans com `font-variant-numeric: tabular-nums`**
- Números dentro de texto corrido em serif → algarismos de estilo antigo, aceitáveis

### 5.5 Maiúsculas

Nunca CAIXA ALTA em frases. Permitido apenas em etiquetas curtas de uma ou duas palavras, com `letter-spacing: 0.08em`.

Títulos e botões em **sentence case**, sempre. Nunca Title Case — é anglo-saxónico e destoa numa app em português e italiano.

---

## 6. Layout e forma

### 6.1 A grelha em socalco

Uma coluna. Margem lateral de 20px. Ritmo vertical em múltiplos de 8px. O conteúdo empilha-se em faixas horizontais de altura variável, como os *ciglioni* na encosta.

Nada de cartões flutuantes com sombra. Separação faz-se por linha `Pietra` de 1px ou por mudança de superfície.

### 6.2 Cantos

- Cartões e contentores: `12px`
- Botões e campos: `8px`
- Fotografias: `4px` — quase reto, respeita o formato original
- Silhuetas de carro e avatares: sem raio

Nada é redondo. Nada é pílula. A arquitetura veneta é ortogonal.

### 6.3 Sombras

Não existem. Elevação exprime-se por superfície mais clara e linha de contorno.

A única exceção tolerada: a barra de navegação inferior pode ter `0 -1px 0 var(--pietra)` — uma linha, não uma sombra.

### 6.4 Espaço

Generoso ao ponto de parecer quase vazio. Entre uma secção e a seguinte, 48px. Entre um título e o seu corpo, 12px.

Se um ecrã parece "com espaço a mais", provavelmente está certo.

---

## 7. Fotografia e imagem

**Origem:** paisagem, arquitetura, mesa, detalhe. Os carros aparecem, mas nunca em pose de catálogo.

**Tratamento:** nenhum filtro. As fotos dos convidados entram exatamente como foram tiradas — é o que as torna verdadeiras.

**Formatos:** 3:2 para paisagem, 4:5 para retrato, quadrado apenas em miniaturas de galeria.

**Sem texto sobre fotografia.** Se for preciso legenda, vai por baixo, em `Instrument Sans` 12px. Um título branco sobre uma foto é linguagem de brochura de agência.

---

## 8. Iconografia

Traço de 1.5px, cantos vivos, sem preenchimento. Biblioteca base: qualquer conjunto outline consistente (Tabler, Lucide).

Tamanhos: 20px em linha, 24px em navegação. Nunca maiores.

**Exceção — as silhuetas dos carros.** Estas são desenhos próprios: perfil lateral de cada modelo Aston Martin em SVG, preenchido a sólido com a cor real do carro do proprietário. São o único elemento gráfico com personalidade forte em toda a app, e funcionam precisamente porque tudo o resto é sóbrio.

Requisito: contorno de 1px em `Inchiostro` a 20% de opacidade, para que carros de cor clara continuem legíveis sobre `Calce`.

---

## 9. Movimento

Discreto ao ponto de mal se notar.

- Transições: 200ms, `cubic-bezier(0.4, 0, 0.2, 1)`
- Entradas de conteúdo: fade simples, sem deslocação
- Sem bounce, sem elástico, sem parallax, sem confetti

**Uma exceção autorizada:** a revelação do álbum no último dia pode ter uma transição mais lenta e cerimoniosa — cerca de 600ms. É o único momento em que a app se permite um gesto.

---

## 10. Tom de voz

**Português europeu**, com italiano usado apenas para nomes próprios — `Colline del Prosecco`, `Valpolicella`, `Ciglioni`. Nunca traduzir topónimos.

**Curto.** Nenhum ecrã tem mais de duas frases de instrução.

**Sem exclamações.** Sem "Bem-vindo!", sem "Ótimo!", sem "Vamos lá!".

**Sem emoji** dentro da app. No WhatsApp, à vontade — são registos diferentes.

| Não | Sim |
|---|---|
| Bem-vindo à sua aventura Aston Martin! 🚗 | Veneto. Quatro dias. |
| Ups! Algo correu mal | Sem ligação. Guardámos para enviar depois |
| Partilhe os seus momentos incríveis! | Adicionar fotografia |
| Clique aqui para navegar | Abrir no Google Maps |
| A sua viatura está pronta 🎉 | O seu DB12 está pronto a levantar |

**Nunca dizer "utilizador", "conteúdo", "experiência" ou "jornada"** em texto visível. São palavras de quem faz o produto, não de quem o usa.

---

## 11. Aplicação aos ecrãs do manifesto

| Ecrã | Tratamento |
|---|---|
| **Checkup** | Instrument Sans. Estados como linha temporal vertical com marcadores em `Verde Veronese`. Sóbrio, quase clínico — é confiança, não emoção |
| **Relatório do checkup** | Momento `Ottone`. Título em EB Garamond, assinatura do técnico em itálico. Deve parecer um documento, não um ecrã |
| **Capa de dia** | Fotografia a toda a largura, título em EB Garamond 40px por baixo. Data em algarismos de estilo antigo |
| **Programa vivo** | Lista vertical com horas em tabular-nums à esquerda. Alterações marcadas com barra lateral `Rosso Verona` de 3px e etiqueta "alterado" |
| **POI** | Fotografia, título serif, distância e tempo em sans, corpo editorial a 19px. Botão "abrir no Google Maps" fixo em baixo |
| **Mapa** | Base monocromática em tons de `Intonaco`. Silhuetas dos carros a cores reais são o único elemento cromático — daí virem a ler-se de imediato |
| **Galeria** | Grelha de três colunas, gaps de 2px, fotos a `4px` de raio. Sem sobreposições. Autor identificado por silhueta minúscula do carro |
| **Concierge** | Campo único de texto livre. Sem menus, sem categorias. Uma frase de instrução |
| **SOS** | Único ecrã com preenchimento `Rosso Verona` a toda a largura. Sem ambiguidade |
| **Álbum final** | Momento `Radicchio`. Capa editorial, transição lenta, botão único de descarga |

---

## 12. Tokens CSS

```css
:root {
  /* Superfícies */
  --calce: #F7F4EE;
  --istria: #FCFAF6;
  --intonaco: #EFEAE1;
  --pietra: #E0D9CD;
  --pietra-forte: #CFC6B6;

  /* Texto */
  --inchiostro: #1E1B18;
  --inchiostro-medio: #6B6459;
  --inchiostro-chiaro: #736B5D;

  /* Acentos */
  --verde: #3B4A3E;
  --verde-chiaro: #6E8069;
  --rosso: #8A4034;
  --radicchio: #6B2E3E;
  --ottone: #7A6234;

  /* Tipografia */
  --font-editorial: "EB Garamond", Georgia, serif;
  --font-ui: "Instrument Sans", Inter, system-ui, sans-serif;

  /* Forma */
  --raio-cartao: 12px;
  --raio-controlo: 8px;
  --raio-foto: 4px;

  /* Ritmo */
  --esp-1: 8px;
  --esp-2: 16px;
  --esp-3: 24px;
  --esp-4: 32px;
  --esp-5: 48px;

  /* Movimento */
  --transicao: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --calce: #15171B;
    --istria: #1E2126;
    --intonaco: #1A1D21;
    --pietra: #2E3339;
    --pietra-forte: #3D434A;

    --inchiostro: #EDE8E0;
    --inchiostro-medio: #A8A196;
    --inchiostro-chiaro: #9A9287;

    --verde: #9DB39A;
    --verde-chiaro: #7E8F7A;
    --rosso: #D08C7E;
    --radicchio: #C08494;
    --ottone: #C9A96A;
  }
}
```

---

## 13. Acessibilidade

Todos os pares de cor deste documento foram verificados contra a WCAG 2.1.

- Texto principal: AAA em ambos os modos
- Texto secundário e legendas: AA mínimo, sem exceções
- Acentos sobre superfície: AA mínimo
- Botões preenchidos com texto branco: AA para qualquer tamanho

**Alvos de toque:** mínimo 44×44px. Estes ecrãs são usados de pé, ao ar livre, por vezes com luvas de condução.

**Sem informação transmitida apenas por cor.** Uma alteração de programa tem barra vermelha **e** a etiqueta "alterado".

---

## 14. Teste de aprovação

Antes de aprovar qualquer ecrã, três perguntas:

1. **Se retirasse as silhuetas dos carros, isto passaria por uma app de um hotel de cinco estrelas em Asolo?** Se sim, está certo.
2. **Consigo ler tudo com sol direto, ao meio-dia, de pé?** Se hesitar, o contraste ou o tamanho estão errados.
3. **Há mais do que uma cor de acento neste ecrã?** Se sim, retirar uma.

---

## Fontes

- [Istrian stone — Wikipedia](https://en.wikipedia.org/wiki/Istrian_stone)
- [Rosso Verona Marble — StoneContact](https://www.stonecontact.com/rosso-verona-marble/s740)
- [The Legacy of Verona Marble — Electrum Magazine](https://www.electrummagazine.com/2012/03/the-legacy-of-verona-marble/)
- [Mapping of stones and their deterioration forms: the Clock Tower, Venice — npj Heritage Science](https://www.nature.com/articles/s40494-023-00909-4)
- [Veronese Green — Storied Colors](https://www.storiedcolors.com/color/veronese-green/)
- [Venetian Red: the Red Earth Pigment of the Italian Renaissance — Jackson's Art](https://www.jacksonsart.com/blog/2022/08/31/venetian-red-the-red-earth-pigment-that-evokes-the-italian-renaissance/)
- [The Venetian Color Box — DailyArt Magazine](https://www.dailyartmagazine.com/venetian-renaissance-pigments-color-box/)
- [Palladian villas of the Veneto — Wikipedia](https://en.wikipedia.org/wiki/Palladian_villas_of_the_Veneto)
- [Francesco Griffo — Wikipedia](https://en.wikipedia.org/wiki/Francesco_Griffo)
- [Bembo — Wikipedia](https://en.wikipedia.org/wiki/Bembo)
- [Aldus Manutius — Britannica](https://www.britannica.com/biography/Aldus-Manutius)
- [Le Colline del Prosecco di Conegliano e Valdobbiadene — UNESCO](https://whc.unesco.org/en/list/1571/)
- [EB Garamond — Google Fonts](https://fonts.google.com/specimen/EB+Garamond)
