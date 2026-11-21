import { Module } from './Module.js';

/** Resolve module imports/dependencies and validate declarations before setup. */
export function resolveModules(modules = []) {
    const byId = new Map();
    const instances = new Map();
    const imported = new Map();
    function instance(entry) {
        if (typeof entry !== 'function') return entry;
        if (!(entry.prototype instanceof Module)) throw new TypeError('Module imports must be Module classes or module instances.');
        if (!instances.has(entry)) instances.set(entry, new entry());
        return instances.get(entry);
    }
    function collect(entry, root = false) {
        const module = instance(entry);
        if (!module || typeof module.id !== 'string' || !module.id || typeof module.setup !== 'function') {
            throw new TypeError('A game module needs a non-empty id and setup(context) function.');
        }
        if (byId.has(module.id)) {
            if (root || byId.get(module.id) !== module) throw new Error(`Duplicate game module: ${module.id}.`);
            return module;
        }
        if (module.requires !== undefined && !Array.isArray(module.requires)) throw new TypeError(`Module '${module.id}' requires must be an array.`);
        byId.set(module.id, module);
        imported.set(module, (module instanceof Module ? module.imports : []).map(entry => collect(entry)));
        return module;
    }
    modules.forEach(entry => collect(entry, true));
    const ordered = [];
    const visiting = new Set();
    const visited = new Set();
    function visit(id, path = []) {
        if (visiting.has(id)) throw new Error(`Game module dependency cycle: ${[...path, id].join(' -> ')}.`);
        if (visited.has(id)) return;
        const module = byId.get(id);
        if (!module) throw new Error(`Missing game module '${id}' required by '${path.at(-1)}'.`);
        visiting.add(id);
        for (const dependency of imported.get(module)) visit(dependency.id, [...path, id]);
        for (const dependency of module.requires ?? []) visit(dependency, [...path, id]);
        visiting.delete(id);
        visited.add(id);
        ordered.push(module);
    }
    for (const id of byId.keys()) visit(id);
    const owners = new Map();
    for (const module of ordered) {
        if (!(module instanceof Module)) continue;
        for (const declaration of module.declarations) {
            if (owners.has(declaration)) throw new Error(`Declaration '${declaration.name}' belongs to both '${owners.get(declaration)}' and '${module.id}'.`);
            owners.set(declaration, module.id);
        }
        const available = new Set([...module.declarations, ...imported.get(module).flatMap(item => item.exports ?? [])]);
        for (const declaration of module.exports) {
            if (!available.has(declaration)) throw new Error(`Module '${module.id}' exports an undeclared or private class '${declaration.name}'.`);
        }
    }
    return ordered;
}
