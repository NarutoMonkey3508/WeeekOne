// Tiny static server for the repo root (used by the ad scripts).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.css':'text/css', '.json':'application/json' };
module.exports = (port = 8799) => new Promise(res => {
  const s = http.createServer((req, rsp) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
    if (!p.startsWith(root)) { rsp.writeHead(403); return rsp.end(); }
    fs.readFile(p, (e, d) => { if (e) { rsp.writeHead(404); return rsp.end(); } rsp.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); rsp.end(d); });
  }).listen(port, () => res(s));
});
