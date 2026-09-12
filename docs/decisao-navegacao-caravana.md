---
title: Decisão — navegação em caravana com batedores
estado: Decisão tomada (12.09.2026), a aplicar no código pelo Claude Code
afeta: CLAUDE.md §6 (Arquitetura e regras de código), §9 (O que é provisório), §10 (Por fazer)
---

# Decisão: navegação em caravana com batedores (substitui a navegação troço a troço como mecanismo principal)

## Contexto

O `CLAUDE.md` atual assume que cada convidado navega o seu próprio troço com um link individual do Google Maps ("Navegação troço a troço", §6) — mecanismo pensado para carros a percorrerem o percurso de forma independente. Isso já não corresponde à operação real: **há batedores na estrada e os carros seguem em caravana**. Ninguém precisa de seguir instruções de condução — precisa de saber o que vai acontecer no dia e para onde vai o grupo.

## O que muda

- A app deixa de ser, em primeiro lugar, "quem indica o caminho" e passa a ser "quem explica o dia" — o que vai acontecer, em que ordem, a que horas.
- O link de Google Maps por troço deixa de ser o mecanismo principal do ecrã. Passa a **rede de segurança secundária**, para quem se atrasar ou se separar da caravana — continua a existir, mas já não é a razão de ser do ecrã.

## O que fica (confirmado com o TMag, 12.09.2026)

1. **Distância e tempo estimado até à próxima paragem mantêm-se como informação de ritmo do dia** — não como instrução de condução. Ex.: "42 km até Cima Grappa, chegada prevista 12:30." É contexto, não navegação.
2. **Mantém-se um link de Google Maps por troço**, como recurso de emergência — a mesma regra do §6 aplica-se (um link por troço, nunca o dia inteiro, para não perder a curadoria: "o Maps recalcula sempre pelo mais rápido").

## O que isto implica no código (para o Claude Code aplicar)

- **§6 do CLAUDE.md precisa de reescrita** na secção "Navegação troço a troço": o link de Maps já não é a função central do ecrã, é acompanhamento secundário. A regra de um-link-por-troço mantém-se, mas a justificação muda — deixa de ser "para o convidado conduzir" e passa a ser "para quem perder a caravana".
- **O ecrã Hoje e o Itinerário devem comunicar primeiro a sequência do dia** — paragem, hora, o que vai acontecer ali — com a distância/tempo como dado ambiente, não como CTA principal. O CTA principal do ecrã deixa de ser "abrir no Maps".
- **Os waypoints âncora (`ui.js` › `ANCORAS`, listados como provisórios no §9) continuam a precisar de correção para a rota real de 2026** (Val Canali / San Martino di Castrozza, não Cortina — ver `informacao-base-passeio-dolomitas-2026.md` §0). A prioridade desce — já não sustentam a navegação principal — mas a tarefa não desaparece: o link de recurso só é útil se apontar para o sítio certo.
- Vale a pena introduzir, no briefing diário ou num ecrã de "como funciona o passeio", uma frase curta a explicar o formato aos convidados: seguem os batedores, a app é o guia de conteúdo do dia, não de condução. Ficar dentro do tom do §5 (frases curtas, sem explicar demasiado).

## O que não muda

- Cada ecrã continua a ter endereço fixo e partilhável (`ROTAS`, §6) — isso é independente do mecanismo de navegação.
- O princípio "uma coisa de cada vez" do ecrã Hoje mantém-se.
