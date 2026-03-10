const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
	// Define o caminho do arquivo (padrão index.html)
	let filePath = '.' + req.url;
	if (filePath === './') filePath = './index.html';

	const extname = String(path.extname(filePath)).toLowerCase();
	const contentType = MIME_TYPES[extname] || 'application/octet-stream';

	fs.readFile(filePath, (error, content) => {
		if (error) {
			if (error.code == 'ENOENT') {
				res.writeHead(404);
				res.end('Arquivo não encontrado');
			} else {
				res.writeHead(500);
				res.end('Erro no servidor: ' + error.code);
			}
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
}).listen(PORT);

console.log(`Server rodando em http://localhost:${PORT}`);