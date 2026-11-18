import { AssetManager, Vector3D } from "gameforgejs/core";
import {
    Level3D,
    SceneManifest3D,
    Texture,
} from "gameforgejs/3d";

const Motion = Object.freeze({ sphereHeight: -0.15, bobSpeed: 1.8, bobDistance: 0.18,
    orbitSpeed: 0.35, orbitWidth: 1.2, cameraDistance: 8.5, orbitDepth: 0.7 });

export class TechDemo3DLevel extends Level3D {
    constructor() {
        super({
            width: 960,
            height: 540,
            clearColor: [0.035, 0.045, 0.065, 1],
            usePhysics: false,
        });
        this.TelaId = "renderer-3d";
        this.caption = "GameForgeJS - Render3D";
        this.time = 0;
    }

    BuildScene() {
        this.time = 0;
        const assets = AssetManager.instance;
        const sceneManifest = assets.GetJson("render3d_showcase_scene");
        this.scene.backgroundColor = [...sceneManifest.backgroundColor];
        this.camera = SceneManifest3D.CreateCamera(sceneManifest.camera, this.width / this.height);
        this.scene.Add(this.camera);
        const content = SceneManifest3D.Populate(this.scene, sceneManifest);

        const albedoImage = assets.GetImage("grid_albedo") ?? assets.GetImage("textura_player");
        const albedo = albedoImage ? Texture.FromImage(albedoImage) : null;
        const normal = assets.HasImage("grid_normal")
            ? Texture.FromImage(assets.GetImage("grid_normal"))
            : null;
        const floor = content.objects.find(object => object.name === "NormalMappedFloor");
        this.cube = content.objects.find(object => object.name === "RotatingCube");
        this.sphere = content.objects.find(object => object.name === "SpecularSphere");

        for (const object of [floor, this.cube]) {
            if (!object?.material) continue;
            object.material.albedoMap = albedo;
            object.material.normalMap = normal;
        }
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        this.time += dt;

        if (this.cube) {
            this.cube.transform.rotation.x += dt * 0.55;
            this.cube.transform.rotation.y += dt * 0.9;
        }

        if (this.sphere) {
            const position = Vector3D.FromArray(this.sphere.transform.position);
            position.y = Motion.sphereHeight + Math.sin(this.time * Motion.bobSpeed) * Motion.bobDistance;
            this.sphere.transform.SetPosition(position.x, position.y, position.z);
            this.sphere.transform.rotation.y += dt * 0.65;
        }

        if (this.camera) {
            const position = Vector3D.FromArray(this.camera.position);
            position.x = Math.sin(this.time * Motion.orbitSpeed) * Motion.orbitWidth;
            position.z = Motion.cameraDistance + Math.cos(this.time * Motion.orbitSpeed) * Motion.orbitDepth;
            this.camera.SetPosition(position.x, position.y, position.z);
            this.camera.LookAt([0, 0.05, 0]);
        }
    }

    OnGUI() {
        super.OnGUI();
        if (!this.ui) return;

        const draw = this.ui.Draw;

        draw.Color = "#9FE7FF";
        draw.FontSize = "22px";
        draw.DrawText("Render3D: WebGL2 + luz + normal map + sombra", 20, 38);
        draw.Color = "#FFFFFF";
        draw.FontSize = "15px";
        draw.DrawText(`FPS: ${this.FPS}`, 20, 64);
        draw.DrawText("Camada 2D/UI continua por cima do canvas 3D.", 20, 88);
    }
}
