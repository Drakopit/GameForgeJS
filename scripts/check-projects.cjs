const fs = require('node:fs');
const path = require('node:path');
const { ROOT, walk } = require('./lib/files.cjs');
const { pathToFileURL } = require('node:url');
const { configFile } = require('../cli/lib/config-paths.cjs');
const errors = [];
const fail = (file, message) => errors.push(`${path.relative(ROOT, file)}: ${message}`);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const allowedRoots = new Set(['main.js', 'index.html', 'style.css', 'game.config.json', 'resources.json', 'game.workspace.json', 'gameforge.project.json', 'gameforgejs.package.json', 'package.json', 'README.md', '.gitignore']);
function reference(root, owner, value) {
    if (typeof value !== 'string' || /^(https?:|data:)/.test(value)) return;
    const target = path.resolve(root, value);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { fail(owner, `Reference escapes this project: ${value}`); return; }
    if (!fs.existsSync(target)) fail(owner, `Missing file: ${value}`);
    else {
        let current = root;
        for (const segment of relative.split(path.sep).filter(Boolean)) {
            if (!fs.readdirSync(current).includes(segment)) { fail(owner, `Filename case does not match: ${value}`); break; }
            current = path.join(current, segment);
        }
    }
}
async function main() {
    const { ResourceManifestLoader } = await import(pathToFileURL(path.join(ROOT, 'src/core/Assets/ResourceManifestLoader.js')));
    const projects = [
        ...fs.readdirSync(path.join(ROOT, 'examples'), { withFileTypes: true }).filter(d => d.isDirectory() && d.name.startsWith('Demo')).map(d => path.join(ROOT, 'examples', d.name)),
        ...['minimal-2d', 'minimal-3d'].map(name => path.join(ROOT, 'cli/templates', name)),
    ];
    for (const root of projects) {
        for (const essential of ['index.html', 'main.js']) reference(root, root, essential);
        for (const essential of ['game.config.json', 'resources.json']) reference(root, root, path.relative(root, configFile(root, essential)));
        for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
            if (!entry.isDirectory() && !allowedRoots.has(entry.name)) fail(root, `Non-essential file at project root: ${entry.name}`);
        }
        const resourcesFile = configFile(root, 'resources.json');
        if (fs.existsSync(resourcesFile)) {
            const manifest = read(resourcesFile);
            try { ResourceManifestLoader.Validate(manifest); } catch (error) { fail(resourcesFile, error.message); }
            for (const group of ['images', 'audios', 'shaders', 'models', 'jsons']) {
                for (const resource of manifest[group] ?? []) reference(root, resourcesFile, path.relative(root, path.resolve(path.dirname(resourcesFile), resource.path)));
            }
        }
        const workspaceFile = path.join(root, 'game.workspace.json');
        if (fs.existsSync(workspaceFile)) {
            const workspace = read(workspaceFile);
            reference(root, workspaceFile, workspace.resources);
            for (const level of workspace.levels2D ?? []) for (const value of Object.values(level.documents ?? {})) reference(root, workspaceFile, value);
            for (const scene of workspace.scenes3D ?? []) reference(root, workspaceFile, scene.path ?? scene.manifestPath);
        }
        for (const file of walk(root, new Set(['.js']))) {
            const source = fs.readFileSync(file, 'utf8');
            if (/['"](?:\.\.\/)+src\/(core|2d|3d|network)/.test(source)) fail(file, 'Consume the public gameforgejs entry points, not engine internals.');
            if (/examples\/Demo/.test(source)) fail(file, 'Example code must not depend on another demo or repository-root URLs.');
        }
    }
    const catalogFile = path.join(ROOT, 'examples/catalog.json');
    const catalog = read(catalogFile);
    const ids = new Set();
    for (const entry of catalog) {
        if (ids.has(entry.id)) fail(catalogFile, `Duplicate example id: ${entry.id}`);
        ids.add(entry.id);
        reference(path.join(ROOT, 'examples'), catalogFile, entry.path);
    }
    const docs = [...walk(path.join(ROOT, 'docs'), new Set(['.md'])), path.join(ROOT, 'README.md')];
    for (const file of docs) {
        const source = fs.readFileSync(file, 'utf8');
        for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
            let link = match[1].trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0];
            if (!link || /^(?:[a-z]+:|\/)/i.test(link) || link.includes('${')) continue;
            link = decodeURIComponent(link);
            if (!fs.existsSync(path.resolve(path.dirname(file), link))) fail(file, `Broken documentation link: ${link}`);
        }
    }
    errors.forEach(message => console.error(message));
    console.log(`Project contracts: ${projects.length} projects, ${catalog.length} catalog entries, ${docs.length} docs; ${errors.length} errors.`);
    if (errors.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });

