import { Mat4 } from "../Math/Mat4.js";
import { AssetManager } from "../Assets/AssetManager.js";

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
 * Prefabs: a node's `prefab` names either an entry of the scene's own `prefabs` (one node
 * template) or a prefab file (`*.gfprefab.json`, format `gameforgejs.prefab`): a node
 * hierarchy saved once and reused by every scene of a game. The instance node keeps its own
 * transform and overrides; the prefab root's components are inherited and its children appear
 * under the instance with ids `<instance>/<child>` (read-only: they are never written back).
 * Prefab files are found in the AssetManager's JSONs (list them in resources.json) or in the
 * `prefabs` option.
 *
 * Transforms are local to the parent node. Games read the
 * nodes they need, usually as plain records with `Items(layer)`, and build their
 * own ECS entities; the format adds no runtime behaviour of its own.
 *
 * Tools (the GameForgeJS Editor) write scenes through the same class:
 * `AddNode`, `RemoveNode`, `SetLocalPosition`, `SetWorldPosition`, `SetTransform`,
 * `SetSize`, `SetComponentField` / `SetComponent` (values equal to the prefab's stay
 * inherited), `SetScripts`, `SetLinks`, then `ToJSON()`. Writes keep the order of
 * existing keys, so saving an unchanged scene reproduces the file exactly.
 *
 * @example
 * const scene = new SceneDocument(context.assets.jsons.level_1);
 * const platforms = scene.Items('platforms');   // [{ id, x, y, width, height, terrain, solid, ... }]
 * const spawn = scene.WorldPosition(scene.Node('spawn'));
 *
 * @example
 * const doc = new SceneDocument(json, { copy: true });          // edit a copy
 * doc.SetWorldPosition(doc.Node('crate_1'), [120, 300]);
 * doc.SetComponentField(doc.Node('crate_1'), 'Sprite', 'asset', 'crate_red');
 * save(doc.ToJSON());
 */
export class SceneDocument {
    /** Current format identifier. */
    static FORMAT = 'gameforgejs.scene';
    /** Earlier identifier, still accepted when reading. */
    static LEGACY_FORMATS = Object.freeze(['gameforge.scene']);
    /** Highest format version this runtime understands. */
    static VERSION = 1;
    /** Prefab file identifier (`*.gfprefab.json`). */
    static PREFAB_FORMAT = 'gameforgejs.prefab';

    /**
     * @param {Object} document - Parsed scene JSON.
     * @param {Object} [options]
     * @param {boolean} [options.copy=false] - Work on a deep copy (use it before writing).
     * @param {Object<string, Object>} [options.prefabs] - Prefab files by id (default: the prefab
     *   documents among the AssetManager's JSONs).
     * @throws {TypeError|RangeError} When the document is not a valid scene.
     */
    constructor(document, { copy = false, prefabs = null } = {}) {
        const validated = SceneDocument.Validate(document);
        this.data = copy ? clone(validated) : validated;
        this.library = prefabs ?? SceneDocument.LoadedPrefabs();
        this.Reindex();
    }

    /** True when a value is a prefab file document. */
    static IsPrefab(value) {
        return Boolean(value) && typeof value === 'object' && value.format === SceneDocument.PREFAB_FORMAT && Array.isArray(value.nodes);
    }

    /**
     * A new prefab file document from scene nodes: the first node without a parent (among them)
     * is the root; its position is cleared so instances place it.
     * @param {Object} fields
     * @param {string} fields.id - Prefab id (what nodes write in `prefab`).
     * @param {"2d"|"3d"} fields.dimension
     * @param {Object[]} fields.nodes - The root and its descendants (scene node shape).
     * @param {string} [fields.name]
     * @returns {Object}
     */
    static CreatePrefab({ id, name, dimension, nodes }) {
        if (typeof id !== 'string' || !id) throw new TypeError('A prefab needs a string id.');
        const copy = clone(nodes ?? []);
        const ids = new Set(copy.map(node => node.id));
        const root = copy.find(node => !node.parent || !ids.has(node.parent));
        if (!root) throw new RangeError('A prefab needs a root node.');
        for (const node of copy) if (node !== root && !ids.has(node.parent)) delete node.parent;
        delete root.parent;
        delete root.layer;
        root.transform = { ...(root.transform ?? {}), position: dimension === '3d' ? [0, 0, 0] : [0, 0] };
        // Root first, then the rest in document order.
        const ordered = [root, ...copy.filter(node => node !== root)];
        const document = { format: SceneDocument.PREFAB_FORMAT, version: SceneDocument.VERSION, dimension, id, name: name ?? id, nodes: ordered };
        SceneDocument.Validate({ ...document, format: SceneDocument.FORMAT });
        return document;
    }

    /** Prefab documents loaded as JSON assets, by prefab id (and by resource name). */
    static LoadedPrefabs(assets = AssetManager.instance) {
        const result = {};
        for (const [name, value] of Object.entries(assets?.jsons ?? {})) {
            if (!SceneDocument.IsPrefab(value)) continue;
            result[name] = value;
            result[value.id] ??= value;
        }
        return result;
    }

    /** The root node of a prefab file, or null. */
    PrefabFile(name) {
        const prefab = name ? this.library?.[name] : null;
        return SceneDocument.IsPrefab(prefab) ? prefab : null;
    }

    /**
     * Rebuilds the node index: the document's nodes plus, right after each instance of a prefab
     * file, that prefab's children (ids `<instance>/<child>`, `instance` set to the instance id).
     * Called by the write methods; call it after editing `data.nodes` directly.
     */
    Reindex() {
        const nodes = [];
        const expand = (node, depth) => {
            nodes.push(node);
            const prefab = this.data.prefabs?.[node.prefab] ? null : this.PrefabFile(node.prefab);
            if (!prefab || depth > 8) return;
            const [root, ...children] = prefab.nodes;
            const idOf = id => (id === root.id ? node.id : `${node.id}/${id}`);
            for (const child of children) {
                const copy = clone(child);
                copy.id = idOf(child.id);
                copy.parent = idOf(child.parent ?? root.id);
                copy.instance = node.instance ?? node.id;
                if (node.layer && !copy.layer) copy.layer = node.layer;
                expand(copy, depth + 1);
            }
        };
        for (const node of this.data.nodes) expand(node, 0);
        this.nodes = nodes;
        this.byId = new Map(nodes.map(node => [node.id, node]));
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
     * A new, empty scene document (plain JSON, ready for `new SceneDocument(...)`).
     * @param {Object} fields
     * @param {"2d"|"3d"} fields.dimension
     * @param {string} [fields.id="scene"]
     * @param {string} [fields.name]
     * @param {Object} [fields.settings]
     * @param {Object[]} [fields.layers]
     * @param {Object<string, Object>} [fields.prefabs]
     * @param {Object[]} [fields.nodes]
     * @returns {Object}
     */
    static Create({ dimension, id = 'scene', name, settings, layers, prefabs, nodes = [] }) {
        const document = { format: SceneDocument.FORMAT, version: SceneDocument.VERSION, dimension, id, name: name ?? id };
        if (settings) document.settings = clone(settings);
        if (layers) document.layers = clone(layers);
        if (prefabs) document.prefabs = clone(prefabs);
        document.nodes = clone(nodes);
        return SceneDocument.Validate(document);
    }

    /**
     * Prefab components merged under own components (own values win per field).
     * The same rule `Components(node)` applies; exposed for tools working on copies.
     * @param {Object<string, Object>} [inherited={}] - Prefab components.
     * @param {Object<string, Object>} [own={}] - Node components.
     * @returns {Object<string, Object>}
     */
    static MergeComponents(inherited = {}, own = {}) {
        const result = clone(inherited ?? {});
        for (const [name, value] of Object.entries(own ?? {})) {
            result[name] = isPlainObject(value) && isPlainObject(result[name]) ? { ...result[name], ...clone(value) } : clone(value);
        }
        return result;
    }

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
        const byId = new Map(document.nodes.map(node => [node.id, node]));
        for (const node of document.nodes) {
            if (node.parent !== undefined && node.parent !== null && !ids.has(node.parent)) {
                throw new RangeError(`Scene node "${node.id}" has an unknown parent "${node.parent}".`);
            }
        }
        for (const node of document.nodes) {
            const seen = new Set();
            for (let ancestor = node; ancestor; ancestor = byId.get(ancestor.parent)) {
                if (seen.has(ancestor.id)) throw new RangeError(`Scene hierarchy contains a cycle at "${ancestor.id}".`);
                seen.add(ancestor.id);
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
        return this.nodes.filter(node => (layer === undefined || node.layer === layer)
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
     * Composes the local transform and every ancestor into a scene-space matrix.
     * Children inherit their parent's full transform, scale included (as in most engines):
     * a part authored under a scaled parent keeps its proportions relative to that parent.
     */
    WorldMatrix(node) {
        const matrix = Mat4.identity(new Float64Array(16));
        const chain = [];
        const seen = new Set();
        for (let ancestor = node; ancestor; ancestor = ancestor.parent ? this.Node(ancestor.parent) : null) {
            if (seen.has(ancestor.id)) throw new RangeError(`Scene hierarchy contains a cycle at "${ancestor.id}".`);
            seen.add(ancestor.id);
            chain.unshift(ancestor.transform ?? {});
        }
        const local = new Float64Array(16);
        chain.forEach(({ position = [], rotation = 0, scale = [] }, index) => {
            Mat4.identity(local);
            Mat4.translate(local, local, [position[0] ?? 0, position[1] ?? 0, position[2] ?? 0]);
            if (this.dimension === "3d") {
                Mat4.rotateX(local, local, rotation[0] ?? 0);
                Mat4.rotateY(local, local, rotation[1] ?? 0);
            }
            Mat4.rotateZ(local, local, typeof rotation === "number" ? rotation : rotation[2] ?? 0);
            Mat4.scale(local, local, [scale[0] ?? 1, scale[1] ?? 1, scale[2] ?? 1]);
            if (index === 0) Mat4.copy(matrix, local);
            else Mat4.multiply(matrix, matrix, local);
        });
        return matrix;
    }

    /** Transforms a point using a scene matrix. */
    static TransformPoint(matrix, [x, y, z = 0]) {
        return [
            matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
            matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
            matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
        ];
    }

    /** Returns the scene-space origin of a local node. */
    WorldPosition(node) {
        if (!node?.parent) return this.LocalPosition(node);
        const position = SceneDocument.TransformPoint(this.WorldMatrix(this.Node(node.parent)), this.LocalPosition(node));
        return this.dimension === "2d" ? position.slice(0, 2) : position;
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
        if (!node?.prefab) return null;
        return this.prefabs[node.prefab] ?? this.PrefabFile(node.prefab)?.nodes[0] ?? null;
    }

    /**
     * All components of a node, merged over its prefab's (node values win per field).
     * @param {Object} node - Scene node.
     * @param {Object} [options]
     * @param {boolean} [options.inherit=true] - Include the prefab's components.
     * @returns {Object<string, Object>}
     */
    Components(node, { inherit = true } = {}) {
        return SceneDocument.MergeComponents(inherit ? this.Prefab(node)?.components : {}, node?.components);
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

    /* ------------------------------------------------------------------ */
    /* Writing                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Adds a node (at `index`, default last) and returns it.
     * @param {Object} node - At least `{ id, type }`.
     * @param {Object} [options]
     * @param {number} [options.index]
     * @returns {Object} The stored node.
     */
    AddNode(node, { index } = {}) {
        if (!node || typeof node.id !== 'string' || !node.id) throw new TypeError('A scene node needs a string id.');
        if (this.byId.has(node.id)) throw new RangeError(`Scene node id "${node.id}" is duplicated.`);
        const stored = clone(node);
        const at = Number.isInteger(index) ? Math.max(0, Math.min(index, this.data.nodes.length)) : this.data.nodes.length;
        this.data.nodes.splice(at, 0, stored);
        this.Reindex();
        return stored;
    }

    /**
     * Removes a node; its children are re-parented to its parent (keeping their scene position).
     * @param {string} id
     * @returns {boolean} True when a node was removed.
     */
    RemoveNode(id) {
        const node = this.Node(id);
        // Prefab children belong to the prefab file: remove the instance instead.
        if (!node || node.instance) return false;
        for (const child of this.data.nodes.filter(item => item.parent === id)) this.SetParent(child, node.parent ?? null);
        this.data.nodes.splice(this.data.nodes.indexOf(node), 1);
        this.Reindex();
        return true;
    }

    /**
     * Sets or clears a node's parent.
     * @param {Object} node
     * @param {string|null} parentId
     * @param {Object} [options]
     * @param {boolean} [options.keepWorld=true] - Keep the node's scene position.
     */
    SetParent(node, parentId, { keepWorld = true } = {}) {
        if (parentId && !this.Node(parentId)) throw new RangeError(`Unknown scene parent "${parentId}".`);
        for (let ancestor = this.Node(parentId); ancestor; ancestor = this.Node(ancestor.parent)) {
            if (ancestor.id === node.id) throw new RangeError("A node cannot be parented to itself or its descendants.");
        }
        const world = keepWorld ? this.WorldPosition(node) : null;
        if (world && parentId && !Mat4.invert(new Float64Array(16), this.WorldMatrix(this.Node(parentId)))) throw new RangeError("Cannot reparent under a singular transform.");
        if (parentId) node.parent = parentId;
        else delete node.parent;
        if (world) this.SetWorldPosition(node, world);
    }

    /** Sets a node's position relative to its parent. */
    SetLocalPosition(node, position) {
        node.transform = { ...(node.transform ?? {}), position: [...position] };
    }

    /**
     * Sets a node's scene-space position.
     * Axes that only differ by floating-point rounding keep their stored value.
     */
    SetWorldPosition(node, position) {
        const parent = node.parent ? this.Node(node.parent) : null;
        const inverse = parent && Mat4.invert(new Float64Array(16), this.WorldMatrix(parent));
        if (parent && !inverse) throw new RangeError("Cannot position a child under a singular transform.");
        const local = inverse ? SceneDocument.TransformPoint(inverse, position) : position;
        const current = node.transform?.position;
        this.SetLocalPosition(node, local.slice(0, position.length).map((value, index) =>
            current && Math.abs(current[index] - value) < 1e-8 ? current[index] : value));
    }

    /**
     * Sets transform fields (position, rotation, scale) without touching the others.
     * @param {Object} node
     * @param {{position?: number[], rotation?: number[]|number, scale?: number[]}} transform
     */
    SetTransform(node, transform) {
        node.transform = { ...(node.transform ?? {}) };
        for (const key of ['position', 'rotation', 'scale']) {
            if (transform[key] !== undefined) node.transform[key] = clone(transform[key]);
        }
    }

    /** Sets (or, with null, removes) a 2D node's size. */
    SetSize(node, size) {
        if (size) node.size = [...size];
        else delete node.size;
    }

    /**
     * Sets one component field. A value equal to the node's prefab value stays
     * inherited (it is not written) unless the node already overrides that field.
     * `undefined` removes the node's own value.
     * @returns {boolean} True when the node's own data changed.
     */
    SetComponentField(node, component, field, value) {
        const own = node.components?.[component];
        const inherited = this.Prefab(node)?.components?.[component];
        const before = JSON.stringify(own?.[field]);
        if (value === undefined || (own?.[field] === undefined && isPlainObject(inherited) && field in inherited && sameJson(inherited[field], value))) {
            if (own && field in own) {
                delete own[field];
                if (!Object.keys(own).length) this.RemoveComponent(node, component);
            }
        } else {
            node.components ??= {};
            node.components[component] ??= {};
            node.components[component][field] = clone(value);
        }
        return JSON.stringify(node.components?.[component]?.[field]) !== before;
    }

    /**
     * Replaces a component with `values`, writing only what differs from the prefab
     * (so an instance stores its overrides). Existing key order is kept.
     */
    SetComponent(node, component, values) {
        const inherited = this.Prefab(node)?.components?.[component];
        if (!isPlainObject(values)) {
            if (values === undefined || sameJson(values, inherited)) this.RemoveComponent(node, component);
            else (node.components ??= {})[component] = clone(values);
            return;
        }
        const own = node.components?.[component] ?? {};
        for (const field of Object.keys(own)) if (!(field in values)) delete own[field];
        if (node.components?.[component]) node.components[component] = own;
        for (const [field, value] of Object.entries(values)) this.SetComponentField(node, component, field, value);
        if (node.components?.[component] && !Object.keys(node.components[component]).length) this.RemoveComponent(node, component);
    }

    /** Removes a node's own component (prefab components stay inherited). */
    RemoveComponent(node, component) {
        if (!node.components) return;
        delete node.components[component];
        if (!Object.keys(node.components).length) delete node.components;
    }

    /** Sets the attached scripts (project-relative paths); an empty list removes the field. */
    SetScripts(node, scripts) {
        const list = (scripts ?? []).map(String).filter(Boolean);
        if (list.length) node.scripts = list;
        else delete node.scripts;
    }

    /** Sets the linked node ids (unknown ids are dropped); an empty list removes the field. */
    SetLinks(node, links) {
        const list = (links ?? []).map(String).filter(id => this.byId.has(id) && id !== node.id);
        if (list.length) node.links = list;
        else delete node.links;
    }

    /** A deep copy of the scene as plain JSON. */
    ToJSON() {
        return clone(this.data);
    }

    /**
     * Converts a 3D scene to a SceneManifest3D document (`SceneManifest3D.Create` input):
     * `Light3D` nodes become lights; other nodes with a `Mesh` (or a `Data.model` / `Data.parts`)
     * become objects (`Mesh` -> primitive, `Material` -> material, `Data` fields copied).
     * Prefab-file children are included. `settings.skybox` names a resources.json image.
     * @returns {Object}
     */
    ToManifest3D() {
        if (this.dimension !== '3d') throw new RangeError('ToManifest3D needs a 3D scene.');
        const objects = [];
        for (const node of this.nodes) {
            if (node.type === 'Light3D') continue;
            const components = this.Components(node);
            if (!components.Mesh && !components.Data?.model && !components.Data?.parts) continue;
            objects.push({
                id: node.id,
                ...(node.parent ? { parent: node.parent } : {}),
                name: node.name ?? node.id,
                ...(components.Data ?? {}),
                ...(components.Mesh ? { primitive: components.Mesh } : {}),
                ...(components.Material ? { material: components.Material } : {}),
                transform: {
                    position: this.WorldPosition(node),
                    ...(node.parent ? { matrix: [...this.WorldMatrix(node)] } : {}),
                    rotation: [...(node.transform?.rotation ?? [0, 0, 0])],
                    scale: [...(node.transform?.scale ?? [1, 1, 1])],
                },
            });
        }
        const manifest = { name: this.name, lights: this.Lights(), objects };
        if (objects.some(object => object.parent)) manifest.transforms = this.nodes.map(node => ({
            id: node.id, parent: node.parent, transform: clone(node.transform ?? {}),
        }));
        if (this.settings.backgroundColor) manifest.backgroundColor = clone(this.settings.backgroundColor);
        if (this.settings.fog) manifest.fog = clone(this.settings.fog);
        if (this.settings.planarReflection) manifest.planarReflection = clone(this.settings.planarReflection);
        if (this.settings.camera) manifest.camera = clone(this.settings.camera);
        if (this.settings.skybox) manifest.skybox = this.settings.skybox;
        return manifest;
    }
}

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function sameJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
