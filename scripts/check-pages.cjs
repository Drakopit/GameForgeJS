// Audit the real public module graph, including MIME responses and exact paths.
const assert = require('node:assert/strict');
const { parse } = require('acorn');

async function audit(base) {
    const root = new URL(base.endsWith('/') ? base : `${base}/`);
    const pending = ['src/core/index.js', 'src/2d/index.js', 'src/3d/index.js', 'src/network/index.js'];
    const visited = new Set();
    while (pending.length) {
        const batch = pending.splice(0, 8).filter(file => !visited.has(file));
        batch.forEach(file => visited.add(file));
        await Promise.all(batch.map(async file => {
            const url = new URL(file, root);
            const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
            assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
            assert.match(response.headers.get('content-type') || '', /(?:application|text)\/(?:java|ecma)script/i, `${url}: not JavaScript`);
            const source = await response.text();
            const tree = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
            for (const statement of tree.body) {
                if (!['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(statement.type) || !statement.source) continue;
                const specifier = statement.source.value;
                assert(specifier.startsWith('.'), `${file}: unexpected external runtime import ${specifier}`);
                const dependency = new URL(specifier, url);
                assert(dependency.href.startsWith(root.href), `${file}: import escapes hosted subpath`);
                const relative = dependency.href.slice(root.href.length);
                if (!visited.has(relative)) pending.push(relative);
            }
        }));
    }
    console.log(`Pages module audit: ${visited.size} modules returned JavaScript under ${root.href}`);
}

if (require.main === module) audit(process.argv[2] || 'https://drakopit.github.io/GameForgeJS/').catch(error => {
    console.error(error.message); process.exitCode = 1;
});
module.exports = { audit };
