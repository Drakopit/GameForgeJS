const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('acorn');
const { readJson, walk, inside, assertNoLinks } = require('./files.cjs');
const { configFile } = require('./config-paths.cjs');

const PACKAGE_FILE = 'gameforgejs.package.json';
const GROUPS = ['core', '2d', '3d', 'network', 'compat'];
const ADDONS = ['parallax', 'state-machine', 'platformer'];
const PUBLIC_GROUPS = [...GROUPS, ...ADDONS.map(name => `addons/${name}`)];

function loadPackage(root) {
    const file = configFile(root, PACKAGE_FILE);
    if (!fs.existsSync(file)) return null;
    assertNoLinks(file);
    const value = readJson(file);
    if (!value || value.schemaVersion !== 1 || !Array.isArray(value.modules)
        || value.modules.length === 0 || value.modules.some(name => !GROUPS.includes(name))
        || new Set(value.modules).size !== value.modules.length) {
        throw new Error(`${PACKAGE_FILE}: expected schemaVersion 1 and a nonempty list of unique modules (${GROUPS.join(', ')}).`);
    }
    if (value.addons !== undefined && (!Array.isArray(value.addons) || value.addons.some(name => !ADDONS.includes(name)) || new Set(value.addons).size !== value.addons.length)) {
        throw new Error(`${PACKAGE_FILE}: addons must be a unique list of supported names (${ADDONS.join(', ')}).`);
    }
    const unknown = Object.keys(value).filter(key => !['schemaVersion', 'modules', 'addons'].includes(key));
    if (unknown.length) throw new Error(`${PACKAGE_FILE}: unsupported fields: ${unknown.join(', ')}.`);
    return value;
}

function imports(source, file) {
    const result = [];
    let ast;
    try { ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' }); }
    catch (error) { throw new Error(`${file}: ${error.message}`); }
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(node.type) && node.source) {
            if (typeof node.source.value !== 'string') throw new Error(`${file}: computed import cannot be verified for selective publication. Use literal import paths or omit ${PACKAGE_FILE} for a full build.`);
            result.push(node.source.value);
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === 'object') visit(value);
        }
    }
    visit(ast);
    return result;
}

function publicGroup(specifier) {
    if (specifier === 'gameforgejs') return 'core';
    if (!specifier.startsWith('gameforgejs/')) return null;
    const group = specifier.slice('gameforgejs/'.length);
    if (!PUBLIC_GROUPS.includes(group)) throw new Error(`Unsupported runtime import: ${specifier}`);
    return group;
}

// Follow actual imports across directory boundaries, retaining entire groups.
// No source rewriting, execution hooks or symbol-level tree shaking.
function selectRuntime(engineSource, manifest) {
    const selected = new Set([...manifest.modules, ...(manifest.addons ?? []).map(name => `addons/${name}`)]);
    const files = [];
    for (const group of selected) {
        for (const file of walk(path.join(engineSource, group))) {
            files.push({ ...file, relative: `${group}/${file.relative}` });
            if (!file.relative.endsWith('.js')) continue;
            for (const specifier of imports(fs.readFileSync(file.source, 'utf8'), file.source)) {
                const named = publicGroup(specifier);
                if (named) { selected.add(named); continue; }
                if (!specifier.startsWith('.')) throw new Error(`${file.source}: external runtime dependency ${specifier} is unsupported in selective publication.`);
                const target = path.resolve(path.dirname(file.source), specifier);
                assertNoLinks(target);
                if (!inside(engineSource, target) || !fs.existsSync(target) || !fs.statSync(target).isFile()) throw new Error(`${file.source}: missing or invalid runtime dependency ${specifier}`);
                const segments = path.relative(engineSource, target).split(path.sep);
                const dependency = segments[0] === 'addons' ? segments.slice(0, 2).join('/') : segments[0];
                if (!PUBLIC_GROUPS.includes(dependency)) throw new Error(`${file.source}: unclassified runtime dependency ${specifier}`);
                selected.add(dependency);
            }
        }
    }
    // Retain the source package's ESM marker for non-browser tooling.
    const marker = path.join(engineSource, 'package.json');
    if (fs.existsSync(marker)) files.push({ source: marker, relative: 'package.json' });
    return { modules: [...selected].sort(), files };
}

function validateGameImports(files, modules, output) {
    const selected = new Set(modules);
    const aliases = new Map();
    for (const file of files.filter(file => file.relative.endsWith('.html'))) {
        const html = file.content ?? fs.readFileSync(file.source, 'utf8');
        for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']importmap["'][^>]*>([\s\S]*?)<\/script>/gi)) {
            const map = JSON.parse(match[1]);
            if (map.scopes && Object.keys(map.scopes).length) throw new Error(`${file.relative}: scoped import maps are not supported by selective publication yet.`);
            for (const [name, value] of Object.entries(map.imports ?? {})) {
                if (typeof value !== 'string') throw new Error(`${file.relative}: invalid import map target for ${name}`);
                if (value.startsWith('.') || value.startsWith('/@engine/')) {
                    const target = value.startsWith('/') ? path.join(output, value.slice(1)) : path.resolve(output, path.dirname(file.relative), value);
                    if (aliases.has(name) && aliases.get(name) !== target) throw new Error(`Conflicting import map alias: ${name}`);
                    aliases.set(name, target);
                }
            }
        }
    }
    function check(source, file) {
        for (const specifier of imports(source, file.relative)) {
            let group = publicGroup(specifier);
            let target = aliases.get(specifier);
            if (!target) for (const [name, mapped] of [...aliases].sort((a, b) => b[0].length - a[0].length)) {
                if (name.endsWith('/') && specifier.startsWith(name)) { target = path.resolve(mapped, specifier.slice(name.length)); break; }
            }
            if (!target && specifier.startsWith('.')) target = path.resolve(output, path.dirname(file.relative), specifier);
            if (!target && specifier.startsWith('/@engine/')) target = path.join(output, specifier.slice(1));
            if (!group && target) {
                const relative = path.relative(path.join(output, '@engine'), target);
                if (inside(path.join(output, '@engine'), target)) {
                    const parts = relative.split(path.sep);
                    group = parts[0] === 'addons' ? parts.slice(0, 2).join('/') : parts[0];
                }
            }
            if (group && !selected.has(group)) throw new Error(`${file.relative}: ${specifier} requires '${group}' in ${PACKAGE_FILE}.`);
        }
    }
    for (const file of files) {
        if (file.relative.endsWith('.js') || file.relative.endsWith('.mjs')) check(file.content ?? fs.readFileSync(file.source, 'utf8'), file);
        if (file.relative.endsWith('.html')) {
            const html = file.content ?? fs.readFileSync(file.source, 'utf8');
            for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
                if (/\btype\s*=\s*["']module["']/i.test(match[1])) {
                    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(match[1]);
                    if (src) check(`import ${JSON.stringify(src[1])};`, file);
                    else check(match[2], file);
                }
            }
        }
    }
}

module.exports = { PACKAGE_FILE, GROUPS, ADDONS, PUBLIC_GROUPS, loadPackage, selectRuntime, validateGameImports };
