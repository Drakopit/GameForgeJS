import { ActionManager, GameViewport, SceneDocument } from 'gameforgejs/core';
import { Level3D, PerspectiveCamera, SceneManifest3D } from 'gameforgejs/3d';
import { RendererHUD } from '../ui/RendererHUD.js';
import { SurfaceGallery } from '../entities/SurfaceGallery.js';

export class TechDemo3DLevel extends Level3D {
    constructor() {
        super({ width: 960, height: 540, clearColor: [0.17, 0.23, 0.29, 1], usePhysics: false });
        this.TelaId = 'renderer-3d';
        this.caption = 'GameForgeJS - Render3D';
    }

    BuildScene() {
        this.time = 0;
        // Camera, fog and lights come from scenes/gallery.gfscene.json (editable in the editor).
        const gallery = new SceneDocument(this.context.assets.jsons.gallery_scene);
        const settings = gallery.settings;
        this.scene.backgroundColor = [...settings.backgroundColor];
        this.scene.fog = { color: this.scene.backgroundColor.slice(0, 3), ...settings.fog };
        this.scene.planarReflection = { ...settings.planarReflection };
        this.camera = this.scene.Add(new PerspectiveCamera({ ...settings.camera }));
        const lights = gallery.Lights();
        gallery.Nodes({ type: 'Light3D' }).forEach((node, index) => {
            const light = this.scene.Add(SceneManifest3D.CreateLight(lights[index]));
            if (node.id === 'key') this.key = light;
        });
        this.gallery = this.AddEntity(new SurfaceGallery(this.scene, this.context.services.get('audio')));
        this.hud = new RendererHUD(this);
        this.releaseViewport = GameViewport.Bind(this.ui.Screen, { maxWidth: 1440,
            onResize: () => GameViewport.Align(this.ui.Screen, this.screen3D) });
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        this.time += dt;
        if (ActionManager.IsActionDown('HELP')) this.hud.Toggle();
        if (ActionManager.IsActionDown('WEATHER')) {
            this.gallery.ToggleRain();
            this.hud.rain.SetValue(this.gallery.intensity);
        }
        this.hud.Update();
        const angle = Number(this.hud.orbit.value);
        const focus = this.hud.sample - 1;
        const center = this.gallery.samples[focus]?.transform.position ?? [0, 0.6, -0.6];
        const { Width, Height } = this.ui.Screen;
        const framing = Math.sqrt(Math.max(1, 1.25 * Height / Width));
        const distance = (focus < 0 ? 11.5 : 3.4) * framing;
        this.camera.fov = Math.min(72, 43 * framing);
        this.scene.fog.near = 12 * framing;
        this.scene.fog.far = 36 * framing;
        this.camera.SetPosition(center[0] + Math.sin(angle) * distance,
            focus < 0 ? 4.5 : 2.75, center[2] + Math.cos(angle) * distance);
        this.camera.LookAt(center);
        const light = Number(this.hud.light.value) + (this.hud.animate ? this.time * 0.22 : 0);
        this.key.SetDirection([Math.sin(light), -0.72, Math.cos(light)]);
        this.frameTime = dt * 1000;
    }

    OnGUI() {
        super.OnGUI();
        this.hud.Draw(this);
    }

    OnExit() {
        this.releaseViewport?.();
        this.hud?.Dispose();
        super.OnExit();
    }
}
