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
    static FORMAT: string;
    /** Earlier identifier, still accepted when reading. */
    static LEGACY_FORMATS: readonly string[];
    /** Highest format version this runtime understands. */
    static VERSION: number;
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
    static Create({ dimension, id, name, settings, layers, prefabs, nodes }: {
        dimension: "2d" | "3d";
        id?: string;
        name?: string;
        settings?: any;
        layers?: any[];
        prefabs?: {
            [x: string]: any;
        };
        nodes?: any[];
    }): any;
    /**
     * Prefab components merged under own components (own values win per field).
     * The same rule `Components(node)` applies; exposed for tools working on copies.
     * @param {Object<string, Object>} [inherited={}] - Prefab components.
     * @param {Object<string, Object>} [own={}] - Node components.
     * @returns {Object<string, Object>}
     */
    static MergeComponents(inherited?: {
        [x: string]: any;
    }, own?: {
        [x: string]: any;
    }): {
        [x: string]: any;
    };
    /**
     * Returns true when a value looks like a scene document (any supported format id).
     * @param {*} value - Candidate JSON value.
     * @returns {boolean}
     */
    static IsScene(value: any): boolean;
    /**
     * Validates a scene document and returns it upgraded to the current format id.
     * @param {Object} document - Parsed scene JSON.
     * @returns {Object} The validated document (never mutated; legacy ids are normalized on a copy).
     */
    static Validate(document: any): any;
    /**
     * @param {Object} document - Parsed scene JSON.
     * @param {Object} [options]
     * @param {boolean} [options.copy=false] - Work on a deep copy (use it before writing).
     * @throws {TypeError|RangeError} When the document is not a valid scene.
     */
    constructor(document: any, { copy }?: {
        copy?: boolean;
    });
    data: any;
    byId: Map<any, any>;
    /** @returns {string} Scene display name. */
    get name(): string;
    /** @returns {"2d"|"3d"} Scene dimension. */
    get dimension(): "2d" | "3d";
    /** @returns {Object} Free-form scene settings (world size, camera, rules...). */
    get settings(): any;
    /** @returns {Object[]} Declared layers, in draw order. */
    get layers(): any[];
    /** @returns {Object<string, Object>} Prefabs nodes can inherit from. */
    get prefabs(): {
        [x: string]: any;
    };
    /**
     * @param {string} id - Node id.
     * @returns {Object|null} The node, or null.
     */
    Node(id: string): any | null;
    /**
     * Nodes filtered by layer, type and/or parent, in document order.
     * @param {Object} [filter] - Optional filters.
     * @param {string} [filter.layer] - Layer id.
     * @param {string} [filter.type] - Node type (e.g. "Prop2D").
     * @param {string|null} [filter.parent] - Parent id; null selects root nodes.
     * @returns {Object[]}
     */
    Nodes({ layer, type, parent }?: {
        layer?: string;
        type?: string;
        parent?: string | null;
    }): any[];
    /**
     * Local position of a node (relative to its parent).
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y] or [x, y, z].
     */
    LocalPosition(node: any): number[];
    /**
     * Position of a node in scene space: its local position plus every ancestor's.
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y] or [x, y, z].
     */
    WorldPosition(node: any): number[];
    /**
     * Size of a node: `size` when present, otherwise `fallback`.
     * @param {Object} node - Scene node.
     * @param {number[]} [fallback=[0, 0]] - Size used when the node has none.
     * @returns {number[]}
     */
    Size(node: any, fallback?: number[]): number[];
    /**
     * Axis-aligned rectangle of a 2D node in scene space.
     * @param {Object} node - Scene node.
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    Rect(node: any): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Center of a 2D node's rectangle in scene space (its position when it has no size).
     * @param {Object} node - Scene node.
     * @returns {number[]} [x, y].
     */
    Center(node: any): number[];
    /**
     * The prefab a node inherits from, or null.
     * @param {Object} node - Scene node.
     * @returns {Object|null}
     */
    Prefab(node: any): any | null;
    /**
     * All components of a node, merged over its prefab's (node values win per field).
     * @param {Object} node - Scene node.
     * @param {Object} [options]
     * @param {boolean} [options.inherit=true] - Include the prefab's components.
     * @returns {Object<string, Object>}
     */
    Components(node: any, { inherit }?: {
        inherit?: boolean;
    }): {
        [x: string]: any;
    };
    /**
     * A named component of a node (merged over its prefab's), or `fallback`.
     * @param {Object} node - Scene node.
     * @param {string} name - Component name (e.g. "Data", "Sprite").
     * @param {Object} [fallback={}] - Returned when the component is missing.
     * @returns {Object}
     */
    Component(node: any, name: string, fallback?: any): any;
    /**
     * A node as one plain record: identity, transform and every component field.
     * 2D: `{ id, name?, x, y, width?, height?, ...fields }` (x/y in scene space).
     * 3D: `{ id, name?, position, rotation, scale, ...fields }` (position in scene space).
     * @param {Object} node - Scene node.
     * @param {Object} [options]
     * @param {boolean} [options.inherit=true] - Include the prefab's component fields.
     * @returns {Object}
     */
    Item(node: any, { inherit }?: {
        inherit?: boolean;
    }): any;
    /**
     * The nodes of a layer as plain records (see `Item`), in document order.
     * @param {string} layer - Layer id.
     * @param {Object} [options] - Passed to `Item`.
     * @returns {Object[]}
     */
    Items(layer: string, options?: any): any[];
    /**
     * A prefab's component fields as one plain record (e.g. enemy defaults).
     * @param {string} name - Prefab name.
     * @returns {Object}
     */
    PrefabItem(name: string): any;
    /**
     * Scripts attached to a node (project-relative paths).
     * @param {Object} node - Scene node.
     * @returns {string[]}
     */
    Scripts(node: any): string[];
    /**
     * Nodes a node links to (`links` ids that exist in the scene), in order.
     * @param {Object} node - Scene node.
     * @returns {Object[]}
     */
    Links(node: any): any[];
    /**
     * Light definitions of a 3D scene (`Light3D` nodes), ready for
     * `SceneManifest3D.CreateLight`: the `Light` component plus `position`.
     * @returns {Object[]}
     */
    Lights(): any[];
    /**
     * Adds a node (at `index`, default last) and returns it.
     * @param {Object} node - At least `{ id, type }`.
     * @param {Object} [options]
     * @param {number} [options.index]
     * @returns {Object} The stored node.
     */
    AddNode(node: any, { index }?: {
        index?: number;
    }): any;
    /**
     * Removes a node; its children are re-parented to its parent (keeping their scene position).
     * @param {string} id
     * @returns {boolean} True when a node was removed.
     */
    RemoveNode(id: string): boolean;
    /**
     * Sets or clears a node's parent.
     * @param {Object} node
     * @param {string|null} parentId
     * @param {Object} [options]
     * @param {boolean} [options.keepWorld=true] - Keep the node's scene position.
     */
    SetParent(node: any, parentId: string | null, { keepWorld }?: {
        keepWorld?: boolean;
    }): void;
    /** Sets a node's position relative to its parent. */
    SetLocalPosition(node: any, position: any): void;
    /**
     * Sets a node's scene-space position (translation only, like `WorldPosition`).
     * Axes that only differ by floating-point rounding keep their stored value.
     */
    SetWorldPosition(node: any, position: any): void;
    /**
     * Sets transform fields (position, rotation, scale) without touching the others.
     * @param {Object} node
     * @param {{position?: number[], rotation?: number[]|number, scale?: number[]}} transform
     */
    SetTransform(node: any, transform: {
        position?: number[];
        rotation?: number[] | number;
        scale?: number[];
    }): void;
    /** Sets (or, with null, removes) a 2D node's size. */
    SetSize(node: any, size: any): void;
    /**
     * Sets one component field. A value equal to the node's prefab value stays
     * inherited (it is not written) unless the node already overrides that field.
     * `undefined` removes the node's own value.
     * @returns {boolean} True when the node's own data changed.
     */
    SetComponentField(node: any, component: any, field: any, value: any): boolean;
    /**
     * Replaces a component with `values`, writing only what differs from the prefab
     * (so an instance stores its overrides). Existing key order is kept.
     */
    SetComponent(node: any, component: any, values: any): void;
    /** Removes a node's own component (prefab components stay inherited). */
    RemoveComponent(node: any, component: any): void;
    /** Sets the attached scripts (project-relative paths); an empty list removes the field. */
    SetScripts(node: any, scripts: any): void;
    /** Sets the linked node ids (unknown ids are dropped); an empty list removes the field. */
    SetLinks(node: any, links: any): void;
    /** A deep copy of the scene as plain JSON. */
    ToJSON(): any;
    /**
     * Converts a 3D scene to a SceneManifest3D document (`SceneManifest3D.Create` input):
     * `Light3D` nodes become lights; other nodes with a `Mesh` become objects
     * (`Mesh` -> primitive, `Material` -> material, `Data` fields copied).
     * @returns {Object}
     */
    ToManifest3D(): any;
}
