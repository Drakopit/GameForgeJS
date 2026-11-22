#!/usr/bin/env node
/**
 * Writes examples/demos.index.json: the `gameforgejs.demos` index the GameForgeJS
 * Editor's Project Hub reads to list and download demos.
 *
 *   { "format": "gameforgejs.demos", "version": 1, "baseUrl": "./",
 *     "demos": [{ "id", "name", "description", "dimension", "category",
 *                 "screenshot", "root": "<id>/", "files": ["index.html", ...] }] }
 *
 * `root` and `files` are relative to `baseUrl`, itself relative to the index URL,
 * so the same file works from a local checkout, GitHub raw URLs or a CDN.
 * Run with --check to fail when the committed index is out of date.
 */
const fs = require('node:fs');
const path = require('node:path');

const examples = path.resolve(__dirname, '..', 'examples');
const output = path.join(examples, 'demos.index.json');
const catalog = JSON.parse(fs.readFileSync(path.join(examples, 'catalog.json'), 'utf8'));
const IGNORED = new Set(['node_modules', 'dist', 'publish', '.git', 'test-results']);

function listFiles(root) {
    const files = [];
    const walk = relative => {
        for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
            if (entry.name.startsWith('.') || IGNORED.has(entry.name)) continue;
            const child = relative ? `${relative}/${entry.name}` : entry.name;
            if (entry.isDirectory()) walk(child);
            else files.push(child);
        }
    };
    walk('');
    return files.sort();
}

const demos = catalog
    .filter(entry => fs.existsSync(path.join(examples, entry.id, 'game.workspace.json')))
    .map(entry => ({
        id: entry.id,
        name: entry.name,
        description: entry.description,
        dimension: String(entry.dimension ?? '').toLowerCase(),
        category: entry.category,
        screenshot: entry.screenshot ? `../${entry.screenshot}` : undefined,
        root: `${entry.id}/`,
        files: listFiles(path.join(examples, entry.id)),
    }));

const index = { format: 'gameforgejs.demos', version: 1, baseUrl: './', demos };
const text = `${JSON.stringify(index, null, 2)}\n`;
if (process.argv.includes('--check')) {
    const current = fs.existsSync(output) ? fs.readFileSync(output, 'utf8').replace(/\r\n/g, '\n') : '';
    if (current !== text) {
        console.error('examples/demos.index.json is out of date: run node scripts/generate-demo-index.cjs');
        process.exit(1);
    }
    console.log(`Demo index is current: ${demos.length} demos.`);
} else {
    fs.writeFileSync(output, text);
    console.log(`Wrote examples/demos.index.json: ${demos.length} demos, ${demos.reduce((sum, demo) => sum + demo.files.length, 0)} files.`);
}
