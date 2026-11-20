import { Base } from './Base.js';

/**
 * Class-based feature composition with imports, declarations, exports and lifecycle. Levels, entities and
 * components remain the owners of scene/gameplay behavior; the package manifest
 * separately selects which framework source groups are distributed.
 * @param {string} id - Unique module identifier.
 * @param {Object} [options] - Dependency and enablement settings.
 * @param {Array} [options.imports=[]] - Imported module classes or instances.
 * @param {Function[]} [options.declarations=[]] - Classes owned by this module.
 * @param {Function[]} [options.exports=[]] - Public classes, declared here or exported by imports.
 * @param {string[]} [options.requires=[]] - Required module identifiers.
 * @param {boolean} [options.enabled=true] - Whether frame hooks run.
 */
export class Module extends Base {
    /**
     * @param {string} id
     * @param {{imports?: (Function | Module | {id: string, setup: Function})[], declarations?: Function[], exports?: Function[], requires?: string[], enabled?: boolean}} [options]
     */
    constructor(id, { imports = [], declarations = [], exports = [], requires = [], enabled = true } = {}) {
        super();
        this.id = id;
        for (const [name, values] of Object.entries({ imports, declarations, exports, requires })) {
            if (!Array.isArray(values)) throw new TypeError(`Module '${id}' ${name} must be an array.`);
        }
        for (const declaration of [...declarations, ...exports]) {
            if (typeof declaration !== 'function') throw new TypeError(`Module '${id}' declarations/exports must contain classes.`);
        }
        this.imports = [...imports];
        this.declarations = [...declarations];
        this.exports = [...exports];
        this.requires = [...requires];
        this.enabled = enabled;
        this.context = null;
        this.started = false;
    }

    /** Register services/loaders before the resource manifest is loaded. */
    OnSetup() {}

    /** Internal adapter retained for the existing module dependency graph. */
    async setup(context) {
        if (this.context) throw new Error(`Module '${this.id}' is already attached to a game.`);
        this.context = context;
        const unsubscribe = [];
        let disposed = false;
        context.onDispose(async () => {
            if (disposed) return;
            disposed = true;
            for (const remove of unsubscribe) remove();
            try { await this.OnDestroy(); }
            finally { this.started = false; this.context = null; }
        });
        for (const [event, hook] of Object.entries({
            update: 'OnUpdate', fixedUpdate: 'OnFixedUpdate', draw: 'OnDrawn', gui: 'OnGUI',
        })) {
            unsubscribe.push(context.events.on(event, dt => {
                if (this.started && this.enabled) this[hook](dt);
            }));
        }
        await this.OnSetup(context);
    }

    /** Starts once, after assets and before the first level starts. */
    async Start() {
        if (this.started) return;
        if (!this.context) throw new Error(`Module '${this.id}' must be attached before starting.`);
        await this.OnStart(this.context);
        this.started = true;
    }
}

// Shared by BootstrapGame and isolated Game sessions; factories stay compatible.
export async function startModules(modules) {
    for (const module of modules) {
        if (module instanceof Module) await module.Start();
    }
}
