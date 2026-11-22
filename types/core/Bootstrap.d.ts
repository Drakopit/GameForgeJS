/**
 * Loads a game's configuration and assets, registers its levels and starts the engine.
 *
 * @param {Object} [options] - Game startup values.
 * Uses the framework's Engine, Input and AudioManager services. Levels own their screens.
 * @param {string|string[]|null} [options.configPath=null] - Config manifest paths.
 * @param {string|string[]|null} [options.manifestPath=null] - Resource manifest paths.
 * @param {import("./Level/Level.js").Level[]} [options.levels=[]] - Levels registered before startup.
 * @param {(Function | import('./Module.js').Module | {id: string, setup: Function})[]} [options.modules=[]] - Root feature modules.
 * @param {Function|null} [options.beforeStart=null] - Async customization hook.
 * @returns {Promise<Object>} Loaded config, assets, manifest and levels.
 */
export function BootstrapGame({ configPath, manifestPath, levels, beforeStart, modules, }?: {
    configPath?: string | string[] | null;
    manifestPath?: string | string[] | null;
    levels?: import("./Level/Level.js").Level[];
    modules?: (Function | import("./Module.js").Module | {
        id: string;
        setup: Function;
    })[];
    beforeStart?: Function | null;
}): Promise<any>;
