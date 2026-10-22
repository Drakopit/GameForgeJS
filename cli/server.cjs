const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { inside } = require('./lib/files.cjs');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.glsl': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mpeg': 'audio/mpeg', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.woff2': 'font/woff2' };

function normalizeBase(value = '/') {
    if (typeof value !== 'string' || !value.startsWith('/') || /[\\?#%]/.test(value) || value.split('/').some(part => part === '.' || part === '..')) throw new Error('Serve base must be an absolute URL path such as /game/.');
    return `${value.replace(/\/+$/, '')}/`;
}

function createServer({ root = process.cwd(), engineRoot, basePath = '/' } = {}) {
    root = fs.realpathSync(root);
    const base = normalizeBase(basePath);
    const engineSource = engineRoot ? fs.realpathSync(path.join(engineRoot, 'src')) : null;
    return http.createServer((request, response) => {
        const send = (status, message) => { response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }); response.end(request.method === 'HEAD' ? undefined : message); };
        if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); send(405, 'Method not allowed'); return; }
        let pathname;
        try { pathname = decodeURIComponent(request.url.split('?')[0]); }
        catch { send(400, 'Malformed URL'); return; }
        if (!pathname.startsWith('/') || /[\\\0]/.test(pathname) || pathname.split('/').some(part => part === '..' || part.startsWith('.'))) { send(403, 'Forbidden'); return; }
        if (base !== '/' && pathname === base.slice(0, -1)) { response.writeHead(308, { Location: base }); response.end(); return; }
        if (!pathname.startsWith(base)) { send(404, 'Not found'); return; }
        let relative = pathname.slice(base.length);
        let boundary = root;
        if (relative.startsWith('@engine/') && engineSource) { boundary = engineSource; relative = relative.slice('@engine/'.length); }
        if (relative.split('/').includes('node_modules')) { send(403, 'Forbidden'); return; }
        if (!relative || relative.endsWith('/')) relative += fs.existsSync(path.join(boundary, relative, 'index.html')) ? 'index.html' : 'Main.html';
        const target = path.resolve(boundary, relative);
        if (!inside(boundary, target)) { send(403, 'Forbidden'); return; }
        fs.realpath(target, (error, real) => {
            if (error) { send(error.code === 'ENOENT' ? 404 : 500, 'Not found'); return; }
            if (!inside(boundary, real)) { send(403, 'Forbidden'); return; }
            fs.stat(real, (statError, stat) => {
                if (statError || !stat.isFile()) { send(404, 'Not found'); return; }
                response.writeHead(200, { 'Content-Type': MIME[path.extname(real).toLowerCase()] || 'application/octet-stream', 'Content-Length': stat.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
                if (request.method === 'HEAD') { response.end(); return; }
                const stream = fs.createReadStream(real);
                stream.on('error', () => response.destroy());
                stream.pipe(response);
            });
        });
    });
}

async function startServer(options = {}) {
    const host = options.host || '127.0.0.1';
    const port = options.port === undefined ? Number(process.env.PORT || 8080) : Number(options.port);
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer from 0 through 65535.');
    const server = createServer(options);
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
    return server;
}

if (require.main === module) startServer({ root: path.resolve(__dirname, '..') }).then(server => console.log(`GameForgeJS: http://127.0.0.1:${server.address().port}/`)).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { normalizeBase, createServer, startServer };
