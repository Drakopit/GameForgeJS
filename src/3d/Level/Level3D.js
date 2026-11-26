import { Level } from "../../core/Level/Level.js";
import { Screen3D } from "../Window/Screen3D.js";
import { PerspectiveCamera, Scene3D, WebGL3DRenderer } from "../Render3D/index.js";
import { PhysicsWorld3D } from "../Physics/PhysicsWorld3D.js";
import { SceneManifest3D } from "../Render3D/Scene/SceneManifest3D.js";
import { ParticleRenderer3D } from "../Effects/ParticleRenderer3D.js";
import { SceneDocument } from "../../core/Scene/SceneDocument.js";
import { SceneSystems } from "../../core/Scene/SceneSystems.js";

/**
 * Base level for current Render3D games with optional canvas UI and physics.
 *
 * Extend this class and implement `BuildScene()` to add objects, lights and
 * skyboxes; the standard level lifecycle renders and disposes the scene.
 *
 * @param {Object} [options] - Canvas, rendering and simulation settings.
 * @param {string} [options.canvasId="gameCanvas3D"] - Render canvas identifier.
 * @param {string} [options.uiCanvasId="gameCanvasUI"] - Overlay UI canvas identifier.
 * @param {number} [options.width=960] - Logical render width.
 * @param {number} [options.height=540] - Logical render height.
 * @param {number[]} [options.clearColor] - RGBA clear color.
 * @param {boolean} [options.useUI=true] - Whether to create `ScreenUI`.
 * @param {boolean} [options.usePhysics=true] - Whether to create `PhysicsWorld3D`.
 * @example
 * class FirstLevel extends Level3D {
 *     BuildScene() {
 *         this.scene.Add(new DirectionalLight({ castShadow: true }));
 *     }
 * }
 */
export class Level3D extends Level {
    constructor({
        canvasId = "gameCanvas3D",
        uiCanvasId = "gameCanvasUI",
        width = 960,
        height = 540,
        clearColor = [0.02, 0.025, 0.04, 1],
        useUI = true,
        usePhysics = true,
    } = {}) {
        super();
        this.canvasId = canvasId;
        this.uiCanvasId = uiCanvasId;
        this.width = width;
        this.height = height;
        this.clearColor = clearColor;
        this.useUI = useUI;
        this.usePhysics = usePhysics;
    }

    OnStart(context = this.context) {
        this.context = context;
        document.title = this.caption ?? document.title;
        this.screen3D = new Screen3D(this.canvasId, this.width, this.height, { config: context?.config });
        if (!this.screen3D.Canvas.style.position) Object.assign(this.screen3D.Canvas.style,{position:'absolute',left:'0px',top:'0px'});
        this.screen3D.Canvas.style.zIndex = "1";

        if (this.useUI) {
            const createUI = context?.services.get("createUI");
            if (!createUI) throw new Error("Level3D with useUI requires module2D(), or set useUI: false.");
            this.ui = createUI(this.uiCanvasId, this.width, this.height, 2);
        }

        this.renderer = new WebGL3DRenderer(this.screen3D.Canvas, {
            clearColor: this.clearColor,
            assets: context?.assets,
        });
        this.scene = new Scene3D({ backgroundColor: this.clearColor });
        this.camera = new PerspectiveCamera({
            aspect: this.width / this.height,
            position: [0, 4, 10],
            target: [0, 0, 0],
        });
        this.scene.Add(this.camera);
        this.physics = this.usePhysics ? new PhysicsWorld3D() : null;

        this.BuildScene();
        super.OnStart(context);
    }

    /**
     * Scene construction hook implemented by a game level.
     * @returns {void}
     */
    BuildScene() {}

    /**
     * Builds the level from a scene file, exactly as the editor's 3D view draws it
     * (SceneManifest3D.Create: camera, background, fog, skybox, lights, objects), and starts the
     * scene's systems: animations, particle emitters, audio sources and UI canvases
     * (SceneSystems; each is the runtime class a game can also create in code). UI draws on the
     * level's UI screen (`useUI`). Positional audio hears from the camera.
     * @param {SceneDocument|Object|string} source - A scene, its JSON, or its resources.json name.
     * @returns {Object} SceneManifest3D content plus `systems` and `document`.
     * @example
     * BuildScene() {
     *     const { systems } = this.BuildFromScene("first_scene");
     *     this.hud = systems.Find("hud").canvas;
     * }
     */
    BuildFromScene(source) {
        const assets = this.context?.assets ?? null;
        const data = typeof source === "string" ? assets?.jsons?.[source] : source;
        if (!data) throw new Error(`Scene "${source}" is not loaded (list it in resources.json).`);
        const document = data instanceof SceneDocument ? data : new SceneDocument(data);
        const content = SceneManifest3D.Create(document.ToManifest3D(), { aspect: this.width / this.height, assets });
        this.scene = content.scene;
        this.camera = content.camera;
        const systems = SceneSystems.Attach(this, document, {
            // A node's runtime object: its built meshes ({ root, meshes, model }) or, for group
            // and effect nodes, its Transform3D.
            target: node => content.nodes.get(node.id) ?? content.transforms?.get(node.id) ?? null,
            particles: emitter => new ParticleRenderer3D(this.scene, emitter),
        });
        if (systems.audio.some(source => source.settings.spatial)) {
            const camera = () => this.camera;
            this.AddEntity({
                OnUpdate: () => {
                    const view = camera(), audio = systems.audio[0]?.audio;
                    if (!view || !audio) return;
                    const forward = view.target ? view.target.map((value, index) => value - view.position[index]) : [0, 0, -1];
                    audio.SetListener(view.position, forward);
                },
            });
        }
        this.sceneSystems = systems;
        return { ...content, systems, document };
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
    }

    OnFixedUpdate(dt) {
        this.physics?.Step(dt);
        super.OnFixedUpdate(dt);
    }

    OnDrawn() {
        this.renderer.Render(this.scene, this.camera);
        this.ui?.Refresh();
    }

    OnExit() {
        this.renderer?.Dispose();
        if (this.screen3D?.Canvas) this.screen3D.Canvas.remove();
        this.ui?.Dispose();
        super.OnExit();
    }
}
