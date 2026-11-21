import { OBJLoader } from "./Assets/OBJLoader.js";
import { ModelLoader } from "./Assets/ModelLoader.js";
import { WebGL3DRenderer } from "./Render3D/Renderer/WebGL3DRenderer.js";

/** Optional model loading and WebGL2 rendering; no implicit dependency on 2D UI. */
export function module3D(options = {}) {
    return {
        id: "3d",
        setup(context) {
            context.registerAssetLoader("model", entry => {
                return String(entry.path).split(/[?#]/, 1)[0].toLowerCase().endsWith(".obj")
                    ? OBJLoader.Load(entry.path) : ModelLoader.Load(entry.path);
            });
            const renderers = new Set();
            context.onDispose(() => {
                for (const renderer of renderers) renderer.Dispose();
                renderers.clear();
                context.services.delete("renderer3d");
                context.services.delete("createRenderer3d");
            });
            const createRenderer = (canvas, overrides = {}) => {
                const renderer = new WebGL3DRenderer(canvas, { ...options, ...overrides, assets: context.assets });
                renderers.add(renderer);
                return renderer;
            };
            context.services.set("createRenderer3d", createRenderer);
            if (context.canvas) context.services.set("renderer3d", createRenderer(context.canvas));
        },
    };
}
