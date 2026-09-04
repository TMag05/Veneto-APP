/* =========================================================
   Service worker
   Offline é o estado normal, não a exceção. Todo o conteúdo
   do dia é pré-carregado; as estradas de montanha têm
   zonas sem cobertura e o convidado nunca deve ver um erro.
   ========================================================= */

/* Subir esta versão sempre que se publica: força a reinstalação do
   cache e é o que faz chegar conteúdo novo aos telemóveis. Deve
   acompanhar o ?v= dos ficheiros em index.html. */
const VERSAO = 'passeio-v25';

const CONCHA = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/app.css',
  './assets/fonts/fonts.css',
  './assets/fonts/EBGaramond-normal-latin.woff2',
  './assets/fonts/EBGaramond-normal-latin-ext.woff2',
  './assets/fonts/EBGaramond-italic-latin.woff2',
  './assets/fonts/EBGaramond-italic-latin-ext.woff2',
  './assets/fonts/InstrumentSans-normal-latin.woff2',
  './assets/fonts/InstrumentSans-normal-latin-ext.woff2',
  './assets/img/icone-192.png',
  './assets/img/icone-512.png',
  './assets/img/icone-180.png',
  './js/silhuetas.js',
  './js/icones.js',
  './js/imagens.js',
  './js/semente.js',
  './js/conteudo.js',
  './js/store.js',
  './js/ui.js',
  './js/app.js',
  './js/views/entrada.js',
  './js/views/chegada.js',
  './js/views/hoje.js',
  './js/views/roadbook.js',
  './js/views/poi.js',
  './js/views/mapa.js',
  './js/views/galeria.js',
  './js/views/concierge.js',
  './js/views/carro.js',
  './js/views/album.js',
  './js/views/mais.js',
  './js/views/org.js',
  './js/views/org-etapa.js',
  './js/views/org-pessoas.js',
  './js/views/org-contactos.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSAO).then(function (c) { return c.addAll(CONCHA); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chaves) {
      return Promise.all(chaves.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Cache primeiro para a concha; rede com reserva para o resto.
   O conteúdo do dia vem do cache e a app abre sempre. */
self.addEventListener('fetch', function (e) {
  const pedido = e.request;
  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(pedido, { ignoreSearch: true }).then(function (resposta) {
      if (resposta) {
        /* Revalidação silenciosa em segundo plano. */
        fetch(pedido).then(function (nova) {
          if (nova && nova.status === 200) caches.open(VERSAO).then(function (c) { c.put(pedido, nova); });
        }).catch(function () {});
        return resposta;
      }
      return fetch(pedido).then(function (nova) {
        if (nova && nova.status === 200 && nova.type === 'basic') {
          const copia = nova.clone();
          caches.open(VERSAO).then(function (c) { c.put(pedido, copia); });
        }
        return nova;
      }).catch(function () {
        if (pedido.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'Sem ligação' });
      });
    })
  );
});
