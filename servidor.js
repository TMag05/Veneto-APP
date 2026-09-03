/* =========================================================
   Servidor estático de desenvolvimento, sem dependências.
       node servidor.js [porta]
   Serve a pasta app/ em http://localhost:8123
   ========================================================= */

const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'app');
const PORTA = parseInt(process.argv[2], 10) || 8123;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gpx': 'application/gpx+xml'
};

http.createServer(function (req, res) {
  let caminho = decodeURIComponent(req.url.split('?')[0]);
  if (caminho === '/') caminho = '/index.html';

  const ficheiro = path.join(RAIZ, path.normalize(caminho));
  if (!ficheiro.startsWith(RAIZ)) {
    res.writeHead(403).end('Fora do âmbito');
    return;
  }

  fs.readFile(ficheiro, function (erro, dados) {
    if (erro) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(ficheiro)] || 'application/octet-stream',
      'Cache-Control': 'no-store, must-revalidate'
    });
    res.end(dados);
  });
}).listen(PORTA, function () {
  console.log('Veneto em http://localhost:' + PORTA);
});
