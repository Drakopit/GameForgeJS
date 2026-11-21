const fs = require('node:fs');
const path = require('node:path');
const { builtinModules, createRequire } = require('node:module');
const acorn = require('acorn');
const { ROOT, sourceFiles } = require('./lib/files.cjs');
const pkg = require('../package.json');
const cache = new Map();
const builtins = new Set(builtinModules.flatMap(name => [name, `node:${name}`]));
function ast(file) {
    if (!cache.has(file)) cache.set(file, acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, allowReturnOutsideFunction: file.endsWith('.cjs') }));
    return cache.get(file);
}
function resolve(file, specifier, cjs = false) {
    if (builtins.has(specifier) || /^(https?:|data:)/.test(specifier)) return null;
    if (specifier === pkg.name || specifier.startsWith(`${pkg.name}/`)) {
        const key = specifier === pkg.name ? '.' : `.${specifier.slice(pkg.name.length)}`;
        const target = pkg.exports[key];
        if (typeof target !== 'string') throw new Error(`Unknown public entry '${specifier}'.`);
        return path.resolve(ROOT, target);
    }
    if (specifier.startsWith('.')) {
        const candidate = path.resolve(path.dirname(file), specifier);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
        if (cjs) return createRequire(file).resolve(specifier);
        throw new Error(`Missing module '${specifier}'. Browser imports require explicit filenames.`);
    }
    return createRequire(file).resolve(specifier);
}
function names(pattern) {
    if (!pattern) return [];
    if (pattern.type === 'Identifier') return [pattern.name];
    if (pattern.type === 'ObjectPattern') return pattern.properties.flatMap(p => names(p.value ?? p.argument));
    if (pattern.type === 'ArrayPattern') return pattern.elements.flatMap(names);
    if (pattern.type === 'AssignmentPattern') return names(pattern.left);
    if (pattern.type === 'RestElement') return names(pattern.argument);
    return [];
}
function exported(file, ancestors = new Set()) {
    if (file.endsWith('.cjs') || file.endsWith('.json') || file.includes(`${path.sep}node_modules${path.sep}`)) return null;
    if (ancestors.has(file)) return new Set();
    const seen = new Set([...ancestors, file]);
    const result = new Set();
    for (const node of ast(file).body) {
        if (node.type === 'ExportDefaultDeclaration') result.add('default');
        if (node.type === 'ExportNamedDeclaration') {
            for (const s of node.specifiers) result.add(s.exported.name ?? s.exported.value);
            const d = node.declaration;
            if (d?.id) result.add(d.id.name);
            for (const declaration of d?.declarations ?? []) for (const name of names(declaration.id)) result.add(name);
        }
        if (node.type === 'ExportAllDeclaration') {
            if (node.exported) result.add(node.exported.name);
            else {
                const target = resolve(file, node.source.value);
                for (const name of target ? exported(target, seen) ?? [] : []) if (name !== 'default') result.add(name);
            }
        }
    }
    return result;
}
function visit(node, fn) {
    if (!node || typeof node !== 'object') return;
    if (typeof node.type === 'string') fn(node);
    for (const [key, value] of Object.entries(node)) {
        if (key === 'start' || key === 'end') continue;
        if (Array.isArray(value)) value.forEach(child => visit(child, fn));
        else if (value && typeof value === 'object') visit(value, fn);
    }
}
const errors = [];
const files = sourceFiles();
for (const file of files) {
    try {
        visit(ast(file), node => {
            let specifier, cjs = false;
            if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(node.type)) specifier = node.source?.value;
            if (node.type === 'CallExpression' && node.callee.name === 'require') { specifier = node.arguments[0]?.value; cjs = true; }
            if (typeof specifier !== 'string') return;
            const target = resolve(file, specifier, cjs);
            if (!target) return;
            if (!fs.existsSync(target)) throw new Error(`Missing module '${specifier}' → ${target}`);
            if (node.type === 'ImportDeclaration' || (node.type === 'ExportNamedDeclaration' && node.source)) {
                const available = exported(target);
                if (!available) return;
                for (const item of node.specifiers) {
                    if (item.type === 'ImportNamespaceSpecifier') continue;
                    const name = item.type === 'ImportDefaultSpecifier' ? 'default' : (item.imported ?? item.local)?.name;
                    if (name && !available.has(name)) throw new Error(`'${specifier}' does not export '${name}'.`);
                }
            }
        });
    } catch (error) { errors.push(`${path.relative(ROOT, file)}: ${error.message}`); }
}
errors.forEach(error => console.error(error));
console.log(`Module contract check: ${files.length} files; ${errors.length} errors.`);
if (errors.length) process.exitCode = 1;
