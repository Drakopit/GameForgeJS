const fs = require('node:fs');
const path = require('node:path');
const { ROOT, walk } = require('./lib/files.cjs');
const { pathToFileURL } = require('node:url');
const { loadPackage } = require('../cli/lib/package.cjs');
const { parse } = require('acorn');
const { configFile } = require('../cli/lib/config-paths.cjs');
const errors = [];
const fail = (file, message) => errors.push(`${path.relative(ROOT, file)}: ${message}`);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const allowedRoots = new Set(['main.js', 'index.html', 'style.css', 'game.workspace.json', 'package.json', 'README.md', '.gitignore']);
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
        ...read(path.join(ROOT, 'examples/catalog.json')).map(entry => path.join(ROOT, 'examples', path.dirname(entry.path))),
        ...['minimal-2d', 'minimal-3d'].map(name => path.join(ROOT, 'cli/templates', name)),
    ];
    for (const root of projects) {
        for (const essential of ['index.html', 'main.js']) reference(root, root, essential);
        const configFiles = ['game.config.json', 'resources.json', 'gameforgejs.package.json'];
        if (!root.startsWith(path.join(ROOT, 'cli/templates'))) configFiles.push('gameforge.project.json');
        for (const essential of configFiles) reference(root, root, `config/${essential}`);
        try { loadPackage(root); } catch (error) { fail(root, error.message); }
        const mainSource = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
        const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
        const content = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();
        if (content) fail(root, 'Render game information/UI with Screen or ScreenUI, not HTML body overlays.');
        if (!mainSource.includes('BootstrapGame') || !/modules:\s*\[/.test(mainSource)) fail(root, 'Entry must use BootstrapGame with a declared root module.');
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
            if (/requestAnimationFrame\s*\(|setInterval\s*\(|document\.createElement\s*\(/.test(source)) fail(file, 'Gameplay must use framework loops and screens.');
            if (/new\s+(?:Input|Touch|Mouse|GamePad)\s*\(/.test(source)) fail(file, 'Use the Input-owned devices instead of creating duplicate input listeners.');
            const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
            const classes = ast.body.filter(node => node.type === 'ClassDeclaration' || node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'ClassDeclaration');
            if (classes.length > 1) fail(file, 'Keep each class in its own file.');
            if (/['"](?:\.\.\/)+src\/(core|2d|3d|network)/.test(source)) fail(file, 'Consume the public gameforgejs entry points, not engine internals.');
            if (/examples\/[a-z0-9-]+\//.test(source)) fail(file, 'Example code must not depend on another demo or repository-root URLs.');
        }
    }
    const catalogFile = path.join(ROOT, 'examples/catalog.json');
    const catalog = read(catalogFile);
    const ids = new Set();
    const allNames = new Set(catalog.map(entry => entry.id));
    const registeredFolders = new Set(catalog.map(entry => path.dirname(entry.path)));
    for (const folder of fs.readdirSync(path.join(ROOT, 'examples'), { withFileTypes: true }).filter(entry => entry.isDirectory())) {
        if (folder.name !== 'showcase' && !registeredFolders.has(folder.name)) fail(catalogFile, `Unregistered example folder: ${folder.name}`);
    }
    for (const entry of catalog) {
        if (ids.has(entry.id)) fail(catalogFile, `Duplicate example id: ${entry.id}`);
        ids.add(entry.id);
        if (!/^[a-z]+(?:-[a-z0-9]+)*-(2d|3d)$/.test(entry.id) || path.dirname(entry.path) !== entry.id) fail(catalogFile, `Noncanonical example name/path: ${entry.id}`);
        if (!entry.id.endsWith(entry.dimension.toLowerCase())) fail(catalogFile, `Dimension does not match example name: ${entry.id}`);
        for (const alias of entry.aliases ?? []) {
            if (allNames.has(alias)) fail(catalogFile, `Duplicate alias: ${alias}`);
            allNames.add(alias);
        }
        reference(path.join(ROOT, 'examples'), catalogFile, `${entry.id}/README.md`);
        reference(path.join(ROOT, 'examples'), catalogFile, entry.path);
    }
    const docs = [...walk(path.join(ROOT, 'docs'), new Set(['.md'])), path.join(ROOT, 'README.md'), path.join(ROOT, 'examples/README.md'), ...catalog.map(entry => path.join(ROOT, 'examples', entry.id, 'README.md'))];
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

