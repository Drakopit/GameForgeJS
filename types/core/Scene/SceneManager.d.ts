/**
 * Switches a game between its scenes (levels) at runtime: `context.scenes`.
 *
 * Games register their levels (`BootstrapGame({ levels })` or `new Game({ levels })`); each one is a
 * scene the game can load by name. A level's name is, in order: its `id`, its `scene` (the
 * resources.json name of the `.gfscene.json` it builds), its class name or its `caption`.
 * The switch happens at the start of the next frame: the current level's `OnExit` runs, then
 * the new one starts with `level.sceneParams` (and `context.scenes.params`) set to `params`.
 * Loading the current scene again restarts it.
 *
 * @example
 * // From a level (shortcut for this.context.scenes.Load):
 * this.LoadScene('level_2', { score: this.score });
 * // In the next level:
 * OnStart(context) { super.OnStart(context); this.score = this.sceneParams.score ?? 0; }
 *
 * @example
 * context.scenes.Load('menu');            // by id / scene / class name / caption
 * context.scenes.Load(1);                 // by index
 * context.scenes.Next(); context.scenes.Back();
 * context.scenes.names;                   // ["menu", "level_1", ...]
 */
export class SceneManager {
    /** The name a level answers to: `id`, `scene`, class name or `caption`. */
    static Name(level: any): any;
    /**
     * @param {Object} host - The game loop that owns the levels.
     * @param {() => Object[]} host.levels - Registered levels, in order.
     * @param {() => number} host.getIndex - Current level index.
     * @param {(index: number) => void} host.setIndex - Moves the current index.
     * @param {(level: Object) => void} host.enter - Starts a level (sets its context, calls OnStart).
     * @param {(level: Object) => void} [host.exit] - Leaves a level (default: calls OnExit).
     */
    constructor(host: {
        levels: () => any[];
        getIndex: () => number;
        setIndex: (index: number) => void;
        enter: (level: any) => void;
        exit?: (level: any) => void;
    });
    host: {
        levels: () => any[];
        getIndex: () => number;
        setIndex: (index: number) => void;
        enter: (level: any) => void;
        exit?: (level: any) => void;
    };
    pending: {
        index: number;
        params: any;
    };
    params: {};
    /** @returns {Object[]} Registered levels. */
    get levels(): any[];
    /** @returns {Object|null} The running level. */
    get current(): any | null;
    /** @returns {string[]} The name each level answers to (see `Name`). */
    get names(): string[];
    /**
     * Index of a level by index, level object or name (any of `id`, `scene`, class name, `caption`).
     * @param {number|string|Object} target
     * @returns {number} -1 when unknown.
     */
    Find(target: number | string | any): number;
    /**
     * Loads a scene at the start of the next frame (before the game starts: makes it the first scene).
     * @param {number|string|Object} target - Index, level or name.
     * @param {Object} [params={}] - Values for the new level (`level.sceneParams`).
     * @returns {Object} The level that will run.
     * @throws {RangeError} For an unknown scene.
     */
    Load(target: number | string | any, params?: any): any;
    /** Loads the next registered scene (wraps around). */
    Next(params: any): any;
    /** Loads the previous registered scene (wraps around). */
    Back(params: any): any;
    /** Reloads the current scene. */
    Reload(params?: {}): any;
    /**
     * Performs a pending switch; the game loop calls it at the start of each frame. The older
     * `level.Next = true` / `level.Back = true` flags still work and mean `Next()` / `Back()`.
     * @returns {boolean} True when the scene changed.
     */
    Apply(): boolean;
}
