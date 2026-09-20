# Firebase — os passos que só se fazem na consola

Escrito a 20.09.2026, depois de fechada a Fase 1 (as fotografias saíram do
`localStorage`). Esta é a parte da Fase 2 que precisa da conta Google da
organização. O resto do código espera por estes valores.

Consola: <https://console.firebase.google.com>

---

## 1. Criar o projeto

**Adicionar projeto** → nome `dolomites-grand-tour` (o identificador fica
`dolomites-grand-tour` ou com um sufixo, se já existir; não faz diferença).

**Desligar o Google Analytics.** Não se usa, e traz um segundo contrato de
dados por cima de fotografias de trinta pessoas.

## 2. Passar ao plano Blaze, antes de mais nada

Roda dentada → **Utilização e faturação** → **Modificar plano** → **Blaze**.

Não é opcional: desde 30 de outubro de 2024 um bucket novo de Storage exige
plano Blaze, e desde 2 de fevereiro de 2026 qualquer bucket exige conta de
faturação ligada, seja qual for o volume. A região europeia que escolhemos
paga desde o primeiro byte — está decidido.

Ainda nesse ecrã, **definir um alerta de orçamento** (10 € chega para ver
movimento; 45 GB de fotografias num mês ficam abaixo de 2 €).

## 3. Firestore, em Milão

**Criar base de dados** → **Modo de produção** → localização
**`europe-west8` (Milão)**.

Escolher a região com cuidado: **não se muda depois**. `europe-west1`
(Bélgica) também serve; `us-central1` e companhia não, por mais barato que
o ecrã as faça parecer.

As regras ficam fechadas até eu as escrever (Fase 4). O ecrã avisa que
ninguém lê nem escreve — está certo assim.

## 4. Storage, no mesmo sítio

**Storage** → **Começar** → localização **`europe-west8`**.

Desde outubro de 2024 o bucket já não herda a região do Firestore: é
preciso escolhê-la outra vez, e tem de ser a mesma.

Anotar o nome do bucket que aparece no topo — é algo como
`dolomites-grand-tour.firebasestorage.app`.

## 5. Entrada por link no email

**Authentication** → **Começar** → **Sign-in method** →
**Email/Password** → **Ativar**, e dentro desse mesmo cartão ligar também
**Email link (passwordless sign-in)**. São dois interruptores no mesmo
ecrã; o segundo é o que interessa e é fácil de deixar desligado.

Em **Settings** → **Authorized domains**, acrescentar o domínio onde a app
vai ser servida. `localhost` já lá está, para eu poder testar.

## 6. Registar a app web

Na página inicial do projeto, o ícone **`</>`** → alcunha
`Dolomites Grand Tour` → **não** ativar o Firebase Hosting agora.

O ecrã seguinte mostra um bloco `const firebaseConfig = { … }` com seis
linhas: `apiKey`, `authDomain`, `projectId`, `storageBucket`,
`messagingSenderId`, `appId`.

**É isso que preciso que me envies.** Copia o bloco inteiro.

Estes valores não são segredo — vão dentro da app, em claro, em todos os
trinta telemóveis, e é assim que a Google os desenhou. O que protege os
dados são as regras da Fase 4, não o esconder desta chave.

## 7. O papel de administração — só depois do primeiro login

O papel fica num documento `utilizadores/{uid}` com um campo `papel`, e não
num *custom claim*. Um claim só se escreve com o Admin SDK, que exige uma
chave de serviço e um sítio onde a correr — e não há servidor nenhum neste
projeto. Um documento escreve-se à mão, na consola, e lê-se nas regras.

Isto faz-se **depois** de entrares na app pela primeira vez com o teu
email, porque é esse login que cria o `uid`:

1. Abrir a app, pedir o link, entrar pelo email.
2. **Authentication** → **Users** → copiar o **User UID**.
3. **Firestore** → **Iniciar coleção** → `utilizadores` → ID do documento =
   esse UID → campo `papel` (string) = `admin`.

Enquanto isto não estiver feito, entras na app como convidado. O código
`2026` continua a funcionar e só sai quando o link mágico funcionar de
ponta a ponta.

---

## O que me tens de mandar

1. O bloco `firebaseConfig` do passo 6.
2. O nome do bucket do passo 4, se for diferente do que está no config.
3. O domínio onde a app vai ficar publicada, se já souberes — senão fico
   por `localhost` e acrescenta-se depois.

Com isso escrevo a camada de nuvem, troco a porta do código `2026` pela
entrada por email e sigo para a Fase 3.
