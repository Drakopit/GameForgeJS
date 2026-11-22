/**
 * Reader for `gameforgejs.scene` documents (`*.gfscene.json`): the one scene
 * format shared by the engine and the GameForgeJS Editor, for 2D and 3D.
 *
 * ```json
 * {
 *   "format": "gameforgejs.scene", "version": 1, "dimension": "2d" | "3d",
 *   "id": "level_1", "name": "Level 1",
 *   "settings": { ...plain game settings: world size, camera, rules... },
 *   "layers":   [{ "id": "platforms", "name": "Platforms", "type": "Platform2D" }],
 *   "prefabs":  { "enemy": { "type": "Actor2D", "components": { ... } } },
 *   "nodes": [{
 *     "id": "ground", "name": "Ground", "type": "Platform2D", "layer": "platforms",
 *     "transform": { "position": [0, 480] },        // 2D: top-left corner; 3D: also rotation/scale
 *     "size": [416, 64],                             // 2D rectangle size (optional)
 *     "components": { "Sprite": { "terrain": "snow" }, "Collider": { "solid": true } },
 *     "prefab": "enemy", "parent": "room_1",        // optional
 *     "scripts": ["src/entities/Enemy.js"],         // optional, attached scripts
 *     "links": ["other_node"]                       // optional, routes / graphs
 *   }]
 * }
 * ```
 *
 * Positions are relative to the parent node (translation only). Games read the
 * nodes they need, usually as plain records with `Items(layer)`, and build their
 * own ECS entities; the format adds no runtime behaviour of its own.
 *
 * @example
 * const scene = new SceneDocument(context.assets.jsons.level_1);
 * const platforms = scene.Items('platforms');   // [{ id, x, y, width, height, terrain, solid, ... }]
 * const spawn = scene.WorldPosition(scene.Node('spawn'));
 */
export class SceneDocument {
    /** Current format identifier. */
    static FORMAT = 'gameforgejs.scene';
    /** Earlier identifier, still accepted when reading. */
    static LEGACY_FORMATS = Object.freeze(['gameforge.scene']);
    /** Highest format version this runtime understands. */
    static VERSION = 1;

    /**
     * @param {Object} document - Parsed scene JSON.
     * @throws {TypeError|RangeError} When the document is not a valid scene.
     */
    constructor(document) {
        this.data = SceneDocument.Validate(document);
        this.byId = new Map(this.data.nodes.map(node => [node.id, node]));
    }

    /** @returns {string} Scene display name. */
    get name() { return this.data.name ?? this.data.id ?? 'Scene'; }

    /** @returns {"2d"|"3d"} Scene dimension. */
    get dimension() { return this.data.dimension; }

    /** @returns {Object} Free-form scene settings (world size, camera, rules...). */
    get settings() { return this.data.settings ?? {}; }

    /** @returns {Object[]} Declared layers, in draw order. */
    get layers() { return this.data.layers ?? []; }

    /** @returns {Object<string, Object>} Prefabs nodes can inherit from. */
    get prefabs() { return this.data.prefabs ?? {}; }

    /**
     * Returns true when a value looks like a scene document (any supported format id).
     * @param {*} value - Candidate JSON value.
     * @returns {boolean}
     */
    static IsScene(value) {
        return Boolean(value) && typeof value === 'object'
            && (value.format === SceneDocument.FORMAT || SceneDocument.LEGACY_FORMATS.includes(value.format));
    }

    /**
     * Validates a scene document and returns it upgraded to the current format id.
     * @param {Object} document - Parsed scene JSON.
     * @returns {Object} The validated document (never mutated; legacy ids are normalized on a copy).
     */
    static Validate(document) {
        if (!SceneDocument.IsScene(document)) throw new TypeError(`Not a ${SceneDocument.FORMAT} document.`);
        const version = Number(document.version ?? 0);
        if (!Number.isInteger(version) || version < 1) throw new RangeError('Scene version must be a positive integer.');
        if (version > SceneDocument.VERSION) throw new RangeError(`Scene version ${version} is newer than this runtime supports (${SceneDocument.VERSION}).`);
        if (document.dimension !== '2d' && document.dimension !== '3d') throw new RangeError('Scene dimension must be "2d" or "3d".');
        if (!Array.isArray(document.nodes)) throw new TypeError('Scene nodes must be an array.');
        const size = document.dimension === '3d' ? 3 : 2;
        const ids = new Set();
        for (const [index, node] of document.nodes.entries()) {
            if (!node || typeof node.id !== 'string' || !node.id) throw new TypeError(`Scene node ${index} needs a string id.`);
            if (ids.has(node.id)) throw new RangeError(`Scene node id "${node.id}" is duplicated.`);
            ids.add(node.id);
            const position = node.transform?.position;
            if (position !== undefined && (!Array.isArray(position) || position.length !== size || !position.every(Number.isFinite))) {
                throw new TypeError(`Scene node "${node.id}" position must be ${size} finite numbers.`);
            }
        }
        for (const node of document.nodes) {
            if (node.parent !== undefined && node.parent !== null && !ids.has(node.parent)) {
                throw new RangeError(`Scene node "${node.id}" has an unknown parent "${node.parent}".`);
            }
        }
        return document.format === SceneDocument.FORMAT ? document : { ...document, format: SceneDocument.FORMAT };
    }

    /**
     * @param {string} id - Node id.
     * @returns {Object|null} The node, or null.
     */
    Node(id) {
        return this.byId.get(id) ?? null;
    }

    /**
     * Nodes filtered by layer, type and/or parent, in document order.
     * @param {Object} [filter] - Optional filters.
     * @param {string} [filter.layer] - Layer id.
     * @param {string} [filter.type] - Node type (e.g. "Prop2D").
     * @param {string|null} [filter.parent] - Parent id; null selects root nodes.
     * @returns {Object[]}
     */
    Nodes({ layer, type, parent } = {}) {
        return this.data.nodes.filter(node => (layer === undefined || node.layer === layer)
            && (type === undefined || node.type === type)
            && (parent === undefined || (node.parent ?? null) === parent));
    }

    /**
     * Local position of a node (relative to its parent).
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y] or [x, y, z].
     */
    LocalPosition(node) {
        return [...(node?.transform?.position ?? (this.dimension === '3d' ? [0, 0, 0] : [0, 0]))];
    }

    /**
     * Position of a node in scene space: its local position plus every ancestor's.
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y] or [x, y, z].
     */
    WorldPosition(node) {
        const position = this.LocalPosition(node);
        const seen = new Set([node?.id]);
        let parent = node?.parent ? this.Node(node.parent) : null;
        while (parent && !seen.has(parent.id)) {
            seen.add(parent.id);
            this.LocalPosition(parent).forEach((value, index) => { position[index] += value; });
            parent = parent.parent ? this.Node(parent.parent) : null;
        }
        return position;
    }

    /**
     * Size of a node: `size` when present, otherwise `fallback`.
     * @param {Object} node - Scene node.
     * @param {number[]} [fallback=[0, 0]] - Size used when the node has none.
     * @returns {number[]}
     */
    Size(node, fallback = [0, 0]) {
        return Array.isArray(node?.size) ? node.size.map((value, index) => value ?? fallback[index] ?? 0) : [...fallback];
    }

    /**
     * Axis-aligned rectangle of a 2D node in scene space.
     * @param {Object} node - Scene node.
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    Rect(node) {
        const [x, y] = this.WorldPosition(node);
        const [width, height] = this.Size(node);
        return { x, y, width, height };
    }

    /**
     * Center of a 2D node's rectangle in scene space (its position when it has no size).
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y].
     */
    Center(node) {
        const { x, y, width, height } = this.Rect(node);
        return [x + width / 2, y + height / 2];
    }

    /**
     * The prefab a node inherits from, or null.
     * @param {Object} node - Scene node.
     * @returns {Object|null}
     */
    Prefab(node) {
        return node?.prefab ? this.prefabs[node.prefab] ?? null : null;
    }

    /**
     * All components of a node, merged over its prefab's (node values win per field).
     * @param {Object} node - Scene node.
     * @param {Object} [options]
     * @param {boolean} [options.inherit=true] - Include the prefab's components.
     * @returns {Object<string, Object>}
     */
    Components(node, { inherit = true } = {}) {
        const result = inherit ? clone(this.Prefab(node)?.components ?? {}) : {};
        for (const [name, value] of Object.entries(node?.components ?? {})) {
            result[name] = isPlainObject(value) && isPlainObject(result[name]) ? { ...result[name], ...clone(value) } : clone(value);
        }
        return result;
    }

    /**
     * A named component of a node (merged over its prefab's), or `fallback`.
     * @param {Object} node - Scene node.
     * @param {string} name - Component name (e.g. "Data", "Sprite").
     * @param {Object} [fallback={}] - Returned when the component is missing.
     * @returns {Object}
     */
    Component(node, name, fallback = {}) {
        return this.Components(node)[name] ?? fallback;
    }

    /**
     * A node as one plain record: identity, transform and every component field.
     * 2D: `{ id, name?, x, y, width?, height?, ...fields }` (x/y in scene space).
     * 3D: `{ id, name?, position, rotation, scale, ...fields }` (position in scene space).
     * @param {Object} node - Scene node.
     * @param {Object} [options]
     * @param {boolean} [options.inherit=true] - Include the prefab's component fields.
     * @returns {Object}
     */
    Item(node, { inherit = true } = {}) {
        const item = { id: node.id };
        if (node.name !== undefined) item.name = node.name;
        if (this.dimension === '3d') {
            item.position = this.WorldPosition(node);
            item.rotation = [...(node.transform?.rotation ?? [0, 0, 0])];
            item.scale = [...(node.transform?.scale ?? [1, 1, 1])];
        } else {
            const [x, y] = this.WorldPosition(node);
            item.x = x;
            item.y = y;
            if (Array.isArray(node.size)) {
                if (node.size[0] !== null && node.size[0] !== undefined) item.width = node.size[0];
                if (node.size[1] !== null && node.size[1] !== undefined) item.height = node.size[1];
            }
        }
        for (const fields of Object.values(this.Components(node, { inherit }))) {
            if (isPlainObject(fields)) Object.assign(item, fields);
        }
        return item;
    }

    /**
     * The nodes of a layer as plain records (see `Item`), in document order.
     * @param {string} layer - Layer id.
     * @param {Object} [options] - Passed to `Item`.
     * @returns {Object[]}
     */
    Items(layer, options) {
        return this.Nodes({ layer }).map(node => this.Item(node, options));
    }

    /**
     * A prefab's component fields as one plain record (e.g. enemy defaults).
     * @param {string} name - Prefab name.
     * @returns {Object}
     */
    PrefabItem(name) {
        const item = {};
        for (const fields of Object.values(this.prefabs[name]?.components ?? {})) {
            if (isPlainObject(fields)) Object.assign(item, clone(fields));
        }
        return item;
    }

    /**
     * Scripts attached to a node (project-relative paths).
     * @param {Object} node - Scene node.
     * @returns {string[]}
     */
    Scripts(node) {
        return Array.isArray(node?.scripts) ? [...node.scripts] : [];
    }

    /**
     * Nodes a node links to (`links` ids that exist in the scene), in order.
     * @param {Object} node - Scene node.
     * @returns {Object[]}
     */
    Links(node) {
        return (Array.isArray(node?.links) ? node.links : []).map(id => this.Node(id)).filter(Boolean);
    }

    /**
     * Light definitions of a 3D scene (`Light3D` nodes), ready for
     * `SceneManifest3D.CreateLight`: the `Light` component plus `position`.
     * @returns {Object[]}
     */
    Lights() {
        return this.Nodes({ type: 'Light3D' }).map(node => {
            const light = { type: 'directional', ...this.Component(node, 'Light') };
            if (light.type === 'point' || light.type === 'spot') light.position = this.WorldPosition(node);
            return light;
        });
    }

    /**
     * Converts a 3D scene to a SceneManifest3D document (`SceneManifest3D.Create` input):
     * `Light3D` nodes become lights; other nodes with a `Mesh` become objects
     * (`Mesh` -> primitive, `Material` -> material, `Data` fields copied).
     * @returns {Object}
     */
    ToManifest3D() {
        if (this.dimension !== '3d') throw new RangeError('ToManifest3D needs a 3D scene.');
        const objects = [];
        for (const node of this.data.nodes) {
            if (node.type === 'Light3D') continue;
            const components = this.Components(node);
            if (!components.Mesh) continue;
            objects.push({
                id: node.id,
                name: node.name ?? node.id,
                ...(components.Data ?? {}),
                primitive: components.Mesh,
                ...(components.Material ? { material: components.Material } : {}),
                transform: {
                    position: this.WorldPosition(node),
                    rotation: [...(node.transform?.rotation ?? [0, 0, 0])],
                    scale: [...(node.transform?.scale ?? [1, 1, 1])],
                },
            });
        }
        const manifest = { name: this.name, lights: this.Lights(), objects };
        if (this.settings.backgroundColor) manifest.backgroundColor = clone(this.settings.backgroundColor);
        if (this.settings.camera) manifest.camera = clone(this.settings.camera);
        return manifest;
    }
}

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
