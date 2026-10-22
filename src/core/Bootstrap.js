import { Engine, LevelHandler } from "./Engine.js";
import { Config } from "./Config.js";
import { Input } from "./Input/Input.js";
import { ActionManager } from "./Input/ActionManager.js";
import { AssetManager } from "./Assets/AssetManager.js";
import { AudioManager } from "./Audio/AudioManager.js";
import { Logger } from "./Logger.js";
import { ResourceManifestLoader } from "./Assets/ResourceManifestLoader.js";
import { resolveModules } from "./Game.js";

/**
 * Loads a game's configuration and assets, registers its levels and starts the engine.
 *
 * @param {Object} [options] - Game startup values.
 * Uses the framework's Engine, Input and AudioManager services. Levels own their screens.
 * @param {string|string[]|null} [options.configPath=null] - Config manifest paths.
 * @param {string|string[]|null} [options.manifestPath=null] - Resource manifest paths.
 * @param {Level[]} [options.levels=[]] - Levels registered before startup.
 * @param {Function|null} [options.beforeStart=null] - Async customization hook.
 * @returns {Promise<Object>} Loaded config, assets, manifest and levels.
 */
export async function BootstrapGame({
    configPath = null,
    manifestPath = null,
    levels = [],
    beforeStart = null,
    modules = [],
} = {}) {
    try {
        await Engine.Dispose();
        Input.instance?.Dispose();
        const orderedModules = resolveModules(modules);
        const config = await Config.Load(configPath);

        ApplyWindowConfig(config);
        Input.Initialize();
        Engine.cleanups.push(() => Input.instance?.Dispose());
        ActionManager.LoadMappings(config?.input?.actionMappings);

        const audio = AudioManager.instance;
        audio.Initialize();
        Engine.cleanups.push(() => audio.Dispose());
        if (config?.audio) {
            AudioManager.instance.SetGlobalVolume(config.audio.masterVolume);
        }

        const assets = new AssetManager();
        assets.audio = audio;
        Engine.cleanups.push(() => assets.Dispose());
        const context = {
            game: { stop: () => Engine.Stop(), dispose: () => Engine.Dispose() },
            canvas: null, config, assets, events: Engine.events,
            services: new Map([["audio", audio]]),
            onDispose: cleanup => {
                if (typeof cleanup !== "function") throw new TypeError("onDispose requires a function.");
                Engine.cleanups.push(cleanup);
                return cleanup;
            },
            registerAssetLoader: (type, loader) => {
                const cleanup = assets.RegisterLoader(type, loader);
                Engine.cleanups.push(cleanup);
                return cleanup;
            },
        };
        Engine.context = context;
        Engine.cleanups.push(() => context.services.clear());
        for (const module of orderedModules) {
            const cleanup = await module.setup(context);
            if (cleanup !== undefined && typeof cleanup !== "function") throw new TypeError(`Module '${module.id}' returned an invalid cleanup.`);
            if (cleanup) Engine.cleanups.push(cleanup);
        }
        const manifest = manifestPath
            ? await ResourceManifestLoader.Load(manifestPath, assets)
            : null;

        if (typeof beforeStart === "function") {
            await beforeStart({ ...context, manifest, LevelHandler });
        }

        levels.forEach(level => LevelHandler.addLevel(level));
        Engine.OnStart();

        const projectName = config?.project?.name ?? "GameForgeJS";
        const projectVersion = config?.project?.version ?? "1.0.0";
        Logger.log("info", `${projectName} v${projectVersion}: Engine started.`);

        return { config, assets, manifest, levels, context, stop: () => Engine.Stop(), dispose: () => Engine.Dispose() };
    } catch (exception) {
        try { await Engine.Dispose(); } catch (cleanupError) { console.error("Bootstrap cleanup failed:", cleanupError); }
        Logger.log("error", "Critical bootstrap error.", exception);
        console.error("Critical bootstrap error:", exception);
        throw exception;
    }
}

function ApplyWindowConfig(config) {
    if (!config?.window) return;

    document.title = config.window.title;
    document.body.style.backgroundColor = config.window.backgroundColor;
    document.body.style.cursor = config.window.cursor;
}
