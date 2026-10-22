import { ScreenUI } from "./Window/ScreenUI.js";

/** Optional Canvas 2D renderer and overlay factory, owned by one game. */
export function module2D({ contextAttributes = {} } = {}) {
    return {
        id: "2d",
        setup(context) {
            const overlays = new Set();
            context.onDispose(() => {
                for (const overlay of overlays) overlay.Dispose();
                overlays.clear();
                context.services.delete("createUI");
                context.services.delete("renderer2d");
            });
            context.services.set("createUI", (id, width, height, zIndex) => {
                const overlay = new ScreenUI(id, width, height, zIndex, { config: context.config });
                const dispose = overlay.Dispose.bind(overlay);
                overlay.Dispose = () => { dispose(); overlays.delete(overlay); };
                overlays.add(overlay);
                return overlay;
            });
            if (context.canvas) {
                const renderer = context.canvas.getContext("2d", contextAttributes);
                if (!renderer) throw new Error("module2D requires a canvas supporting Canvas 2D.");
                context.services.set("renderer2d", renderer);
            }
        },
    };
}
