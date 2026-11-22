/**
 * Converters from `gameforgejs.scene` documents to the runtime documents the
 * engine already consumes: keyed 2D level documents (stage/player/enemies...)
 * and SceneManifest3D. They mirror the GameForgeJS Editor's writers exactly, so a
 * scene saved by the editor loads into the same data the game used before.
 *
 * Pure data module: no DOM, no engine state.
 */

const clone = value => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function getPath(root, path) {
    if (!path) return root;
    return String(path).split('.').filter(Boolean).reduce((current, key) => current?.[key], root);
}

function setPath(root, path, value) {
    const parts = String(path).split('.').filter(Boolean);
    const last = parts.pop();
    let current = root;
    for (const part of parts) {
        if (!isPlainObject(current[part])) current[part] = {};
        current = current[part];
    }
    current[last] = value;
}

function ordered(values, keys, strict = false) {
    if (!keys) return values;
    const result = {};
    for (const key of keys) if (Object.prototype.hasOwnProperty.call(values, key)) result[key] = values[key];
    if (!strict) for (const [key, value] of Object.entries(values)) if (!(key in result)) result[key] = value;
    return result;
}

/* -------------------------------------------------------------------------- */
/* 2D                                                                          */
/* -------------------------------------------------------------------------- */

function nodeToItem(node) {
    const keys = node.source?.keys ?? [];
    const values = {};
    if (node.sourceId !== undefined) values.id = node.sourceId;
    else if (!keys.length) values.id = node.name ?? node.id;
    const [x, y] = node.transform?.position ?? [0, 0];
    values.x = x;
    values.y = y;
    if (Array.isArray(node.size)) {
        if (node.size[0] !== null && node.size[0] !== undefined) values.width = node.size[0];
        if (node.size[1] !== null && node.size[1] !== undefined) values.height = node.size[1];
    }
    if (node.zIndex !== undefined) values.zIndex = node.zIndex;
    if (node.visible !== undefined) values.visible = node.visible;
    for (const component of Object.values(node.components ?? {})) Object.assign(values, clone(component));
    if (Array.isArray(node.scripts) && node.scripts.length) values.scripts = clone(node.scripts);

    const item = {};
    const hadPosition = keys.includes('x') || keys.includes('y');
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(values, key)) item[key] = values[key];
    }
    for (const [key, value] of Object.entries(values)) {
        if (Object.prototype.hasOwnProperty.call(item, key)) continue;
        if ((key === 'x' || key === 'y') && !hadPosition && keys.length && x === 0 && y === 0) continue;
        item[key] = value;
    }
    return item;
}

function playerFromNode(node) {
    const fields = nodeToItem({ ...node, transform: { position: [0, 0] }, source: { keys: node.source?.keys ?? [] } });
    delete fields.x;
    delete fields.y;
    if (!(node.source?.keys ?? []).includes('id') && (fields.id === node.name || fields.id === node.id)) delete fields.id;
    const [x, y] = node.transform?.position ?? [0, 0];
    const spawnValues = { x, y, ...(node.components?.Spawn ?? {}) };
    const spawnKeys = node.source?.spawnKeys ?? ['x', 'y'];
    const spawn = {};
    for (const key of spawnKeys) if (key in spawnValues) spawn[key] = spawnValues[key];
    for (const [key, value] of Object.entries(spawnValues)) if (!(key in spawn)) spawn[key] = value;
    delete fields.Spawn;
    for (const key of Object.keys(node.components?.Spawn ?? {})) delete fields[key];

    const order = node.source?.playerKeys ?? [...Object.keys(fields), 'spawn'];
    const player = {};
    for (const key of order) {
        if (key === 'spawn') player.spawn = spawn;
        else if (key in fields) player[key] = fields[key];
    }
    for (const [key, value] of Object.entries(fields)) if (!(key in player)) player[key] = value;
    if (!('spawn' in player)) player.spawn = spawn;
    return player;
}

/**
 * Rebuilds the keyed runtime documents of a 2D level scene. Each layer with a
 * `source: { document, path }` receives its nodes, in scene order; `extras`
 * holds the rest of each document.
 * @param {Object} scene - Validated 2D scene document.
 * @returns {Object<string, Object>} Documents keyed like the original level (e.g. stage, player, enemies).
 */
export function sceneToLevelDocuments(scene) {
    const docs = clone(scene.extras ?? {});
    const layersById = new Map((scene.layers ?? []).map(layer => [layer.id, layer]));

    for (const layer of scene.layers ?? []) {
        if (layer.type === 'TileMap2D' || layer.source?.path === 'player') continue;
        const target = layer.source;
        if (!target) continue;
        docs[target.document] ??= {};
        if (!Array.isArray(getPath(docs[target.document], target.path))) setPath(docs[target.document], target.path, []);
    }

    if (docs.enemies?.enemyDefaults === '$prefab') {
        docs.enemies.enemyDefaults = clone(scene.prefabs?.['enemies.enemyDefaults'] ?? {});
    }

    for (const node of scene.nodes ?? []) {
        if (node.role === 'player') {
            docs.player ??= {};
            docs.player.player = playerFromNode(node);
            continue;
        }
        const layer = layersById.get(node.layer);
        const target = layer?.source ?? node.source;
        if (!target?.document || !target?.path) continue;
        docs[target.document] ??= {};
        let collection = getPath(docs[target.document], target.path);
        if (!Array.isArray(collection)) {
            setPath(docs[target.document], target.path, []);
            collection = getPath(docs[target.document], target.path);
        }
        collection.push(nodeToItem(node));
    }

    if (docs.player?.player === '$player') delete docs.player.player;
    return docs;
}

/* -------------------------------------------------------------------------- */
/* 3D                                                                          */
/* -------------------------------------------------------------------------- */

const LIGHT_POSITION_TYPES = new Set(['point', 'spot']);

/**
 * Components of a node merged over its prefab's (node values win).
 * @param {Object} node - Scene node.
 * @param {Object<string, Object>} prefabs - Scene prefabs.
 * @returns {Object<string, Object>}
 */
export function resolvedComponents(node, prefabs = {}) {
    const inherited = (node.prefab && prefabs?.[node.prefab]?.components) || {};
    const result = clone(inherited);
    for (const [name, value] of Object.entries(node.components ?? {})) {
        result[name] = isPlainObject(value) && isPlainObject(result[name]) ? { ...result[name], ...clone(value) } : clone(value);
    }
    return result;
}

/**
 * Converts a 3D scene to a SceneManifest3D document (lights and objects).
 * Node `scripts` and `parent` are kept on the object. With `resolvePrefabs`,
 * prefab components are merged in; otherwise the `prefab` name is kept.
 * @param {Object} scene - Validated 3D scene document.
 * @param {Object} [options]
 * @param {boolean} [options.resolvePrefabs=false]
 * @returns {Object} SceneManifest3D document.
 */
export function sceneToManifest3D(scene, { resolvePrefabs = false } = {}) {
    const { $keys, ...extras } = clone(scene.extras ?? {});
    const lights = [];
    const objects = [];
    for (const source of scene.nodes ?? []) {
        const node = resolvePrefabs && source.prefab ? { ...source, components: resolvedComponents(source, scene.prefabs) } : source;
        if (node.type === 'Light3D') {
            const { type, ...rest } = node.components?.Light ?? {};
            const values = { type: type ?? 'directional', ...rest };
            if (LIGHT_POSITION_TYPES.has(values.type) || (node.source?.keys ?? []).includes('position')) {
                values.position = clone(node.transform?.position ?? [0, 0, 0]);
            }
            if (!(node.source?.keys ?? []).length && node.name) values.name = node.name;
            lights.push(ordered(values, node.source?.keys));
            continue;
        }
        const transformValues = {
            position: clone(node.transform?.position ?? [0, 0, 0]),
            rotation: clone(node.transform?.rotation ?? [0, 0, 0]),
            scale: clone(node.transform?.scale ?? [1, 1, 1]),
        };
        const values = {
            id: node.id,
            name: node.name,
            ...(node.components?.Data ?? {}),
            transform: node.source?.transformKeys ? ordered(transformValues, node.source.transformKeys, true) : transformValues,
        };
        if (node.components?.Mesh !== undefined) values.primitive = clone(node.components.Mesh);
        if (node.components?.Material !== undefined) values.material = clone(node.components.Material);
        if (node.prefab !== undefined && !resolvePrefabs) values.prefab = node.prefab;
        if (node.parent) values.parent = node.parent;
        if (Array.isArray(node.scripts) && node.scripts.length) values.scripts = clone(node.scripts);
        const keys = node.source?.keys;
        if (keys && !keys.includes('id')) delete values.id;
        if (keys && !keys.includes('name')) delete values.name;
        if (keys && !keys.includes('transform')) delete values.transform;
        objects.push(ordered(values, keys));
    }
    const values = {
        ...extras,
        name: scene.name,
        backgroundColor: scene.settings?.backgroundColor,
        camera: scene.settings?.camera,
        lights,
        objects,
    };
    if (values.backgroundColor === null || values.backgroundColor === undefined) delete values.backgroundColor;
    if (values.camera === null || values.camera === undefined) delete values.camera;
    return ordered(values, $keys);
}
