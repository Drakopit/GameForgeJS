import { AudioManager } from "./AudioManager.js";

/** Optional, per-game Web Audio service and asset decoding. */
export function audioModule({ initialize = true } = {}) {
    return {
        id: "audio",
        setup(context) {
            // BootstrapGame already owns this service. Extensions must share it
            // with existing entities and asset loading, without disposing it twice.
            if (context.services.has("audio")) return;
            const audio = new AudioManager();
            context.onDispose(async () => {
                await audio.Dispose();
                context.assets.audio = null;
                context.services.delete("audio");
            });
            context.assets.audio = audio;
            context.services.set("audio", audio);
            if (initialize) {
                audio.Initialize();
                if (!audio.isInitialized) throw new Error("audioModule could not initialize Web Audio.");
                audio.SetGlobalVolume(context.config.audio?.masterVolume ?? 0.8);
            }
        },
    };
}
