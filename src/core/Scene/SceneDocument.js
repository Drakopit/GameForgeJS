import { sceneToLevelDocuments, sceneToManifest3D } from './SceneConverters.js';

/**
 * Reader for `gameforgejs.scene` documents: the engine's standard, versioned
 * scene description shared with the GameForgeJS Editor.
 *
 * A scene is a flat list of nodes. Each node has an `id`, a `type`, an optional
 * `layer` and `parent`, a `transform` (position relative to its parent) and named
 * `components` holding game data. Games read the nodes they care about and build
 * their own entities, so the format adds no runtime behaviour of its own.
 *
 * Optional node fields:
 * - `prefab`: name of an entry in `scene.prefabs` (`{ type?, size?, components? }`)
 *   whose components the node inherits (node values win).
 * - `scripts`: project-relative paths of the scripts attached to the node
 *   (e.g. `"src/components/UnitVisual.js"`), shown and opened by the editor.
 * - `links`: ids of nodes this node connects to (routes, paths, graphs).
 *
 * @example
 * const scene = new SceneDocument(context.assets.jsons.stage_movement);
 * const spawn = scene.WorldPosition(scene.Node("spawn"));
 * const coins = scene.Nodes({ layer: "coins" }).map(node => scene.WorldPosition(node));
 */
export class SceneDocument {
    /** Current format identifier. */
    static FORMAT = "gameforgejs.scene";
    /** Earlier identifier, still accepted when reading. */
    static LEGACY_FORMATS = Object.freeze(["gameforge.scene"]);
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
    get name() { return this.data.name ?? this.data.id ?? "Scene"; }

    /** @returns {"2d"|"3d"} Scene dimension. */
    get dimension() { return this.data.dimension; }

    /** @returns {Object} Free-form scene settings (world size, grid, camera...). */
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
        return Boolean(value) && typeof value === "object"
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
        if (!Number.isInteger(version) || version < 1) throw new RangeError("Scene version must be a positive integer.");
        if (version > SceneDocument.VERSION) throw new RangeError(`Scene version ${version} is newer than this runtime supports (${SceneDocument.VERSION}).`);
        if (document.dimension !== "2d" && document.dimension !== "3d") throw new RangeError('Scene dimension must be "2d" or "3d".');
        if (!Array.isArray(document.nodes)) throw new TypeError("Scene nodes must be an array.");
        const size = document.dimension === "3d" ? 3 : 2;
        const ids = new Set();
        for (const [index, node] of document.nodes.entries()) {
            if (!node || typeof node.id !== "string" || !node.id) throw new TypeError(`Scene node ${index} needs a string id.`);
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
        return [...(node?.transform?.position ?? (this.dimension === "3d" ? [0, 0, 0] : [0, 0]))];
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
     * @returns {number[]} [width, height] (2D) or the declared size.
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
     * A named component of a node, or `fallback`.
     * @param {Object} node - Scene node.
     * @param {string} name - Component name (e.g. "Data", "Sprite").
     * @param {Object} [fallback={}] - Returned when the component is missing.
     * @returns {Object}
     */
    Component(node, name, fallback = {}) {
        const own = node?.components?.[name];
        const inherited = this.Prefab(node)?.components?.[name];
        if (own && inherited && typeof own === 'object' && typeof inherited === 'object' && !Array.isArray(own)) return { ...inherited, ...own };
        return own ?? inherited ?? fallback;
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
     * Center of a 2D node's rectangle in scene space (its position when it has no size).
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y].
     */
    Center(node) {
        const { x, y, width, height } = this.Rect(node);
        return [x + width / 2, y + height / 2];
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
     * Rebuilds the keyed runtime documents of a 2D level scene written by the
     * editor from stage/player/enemies manifests (layers with a `source`).
     * @returns {Object<string, Object>} Documents keyed like the level (e.g. stage, player, enemies).
     */
    ToLevelDocuments() {
        if (this.dimension !== '2d') throw new RangeError('ToLevelDocuments needs a 2D scene.');
        return sceneToLevelDocuments(this.data);
    }

    /**
     * Converts a 3D scene to a SceneManifest3D document (`SceneManifest3D.Create` input).
     * Prefab components are merged into each object.
     * @returns {Object}
     */
    ToManifest3D() {
        if (this.dimension !== '3d') throw new RangeError('ToManifest3D needs a 3D scene.');
        return sceneToManifest3D(this.data, { resolvePrefabs: true });
    }
}
