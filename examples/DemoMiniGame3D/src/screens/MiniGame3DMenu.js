import { MenuSettings } from '../data/TrailSettings.js';
import { ActionManager, AssetManager, Vector3D } from 'gameforgejs/core';
import { Level3D, AmbientLight, DirectionalLight, Skybox } from 'gameforgejs/3d';
import { ListSkyTrailCourses, SelectSkyTrailCourse, LoadSkyTrailCourse } from '../data/SkyTrailCourse.js';
import { TrailPlatforms } from '../entities/TrailPlatforms.js';
import { TrailCoins } from '../entities/TrailCoins.js';
import { TrailGoal } from '../entities/TrailGoal.js';
import { TrailScenery } from '../rendering/TrailScenery.js';
import { TrailMenuNavigation } from '../ui/TrailMenuNavigation.js';
import { TrailMenuHUD } from '../ui/TrailMenuHUD.js';

export class MiniGame3DMenu extends Level3D {
    constructor() {
        super({ width: MenuSettings.width, height: MenuSettings.height, useUI: true });
        this.caption = 'Sky Trail — Expedições';
        this.currentSelected = 0;
    }

    BuildScene() {
        this.courses = ListSkyTrailCourses();
        this.navigation = new TrailMenuNavigation();
        this.hud = new TrailMenuHUD();
        this.time = 0;
        this.previewCache = new Map();
        this.scene.Add(Skybox.FromImage(AssetManager.instance.GetImage('sky_cross')));
        this.scene.Add(new AmbientLight({ intensity: 0.55 }));
        this.scene.Add(new DirectionalLight({ intensity: 1, direction: [-0.5, -1, -0.4] }));
        this.ShowCourse();
    }

    ShowCourse() {
        for (const preview of this.previewCache.values()) {
            for (const mesh of preview.meshes) mesh.visible = false;
        }
        const selected = this.courses[this.currentSelected].name;
        const course = LoadSkyTrailCourse(selected);
        let preview = this.previewCache.get(selected);
        if (!preview) {
            const platforms = this.AddEntity(new TrailPlatforms(this.scene, this.physics, course));
            const coins = this.AddEntity(new TrailCoins(this.scene, platforms, course.coins));
            const goal = this.AddEntity(new TrailGoal(this.scene, course.goal));
            const scenery = this.AddEntity(new TrailScenery(this.scene, platforms, course.theme));
            preview = { platforms, coins, goal, scenery, meshes: [
                ...platforms.platforms.map(platform => platform.mesh),
                ...coins.coins.map(coin => coin.mesh), ...goal.meshes, ...scenery.meshes,
            ] };
            this.previewCache.set(selected, preview);
        }
        this.platforms = preview.platforms;
        this.coins = preview.coins;
        this.goal = preview.goal;
        this.scenery = preview.scenery;
        for (const mesh of preview.meshes) mesh.visible = true;
        const positions = course.platforms.map(platform => platform.position);
        const centerZ = positions.reduce((sum, position) => sum + position.z, 0) / positions.length;
        this.previewTarget = new Vector3D(MenuSettings.targetX, 0, centerZ);
        this.time = 0;
        this.UpdatePreview(0);
    }

    UpdatePreview(dt) {
        this.time += dt;
        this.platforms.Update(this.time);
        this.coins.Update(dt, this.time);
        this.goal.Update(this.time);
        this.scenery.Update();
        const target = this.previewTarget;
        const orbit = Math.sin(this.time * MenuSettings.orbitSpeed) * MenuSettings.orbitAmplitude;
        this.camera.SetPosition(target.x + MenuSettings.orbitX + orbit,
            MenuSettings.orbitHeight, target.z + MenuSettings.orbitDistance);
        this.camera.LookAt(target.ToArray());
    }

    OnUpdate(dt) {
        const step = this.navigation.ReadStep(dt);
        if (step) {
            this.currentSelected = (this.currentSelected + step + this.courses.length) % this.courses.length;
            this.ShowCourse();
        }
        if (ActionManager.IsActionDown('ATTACK')) {
            SelectSkyTrailCourse(this.courses[this.currentSelected].name);
            this.Next = true;
        }
        this.UpdatePreview(dt);
    }

    OnFixedUpdate() {
        // The preview animates authored platforms; it has no simulated player.
    }

    OnGUI() {
        this.hud.Draw(this);
    }
}
