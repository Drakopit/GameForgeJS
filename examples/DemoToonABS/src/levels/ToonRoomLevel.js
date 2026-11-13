import { ActionManager, AssetManager } from 'gameforgejs/core';
import { Level3D, PerspectiveCamera, AmbientLight, DirectionalLight } from 'gameforgejs/3d';
import { Courtyard } from '../data/Courtyard.js';
import { CourtyardRoom } from '../entities/CourtyardRoom.js';
import { Explorer } from '../entities/Explorer.js';
import { ToonRoomHUD } from '../ui/ToonRoomHUD.js';
import { Sentry } from '../entities/Sentry.js';
import { AttackIndicator } from '../rendering/AttackIndicator.js';
import { CharacterVisual } from '../rendering/CharacterVisual.js';
import { ForestScenery } from '../data/ForestScenery.js';
import { SceneryProp } from '../entities/SceneryProp.js';
import { ExplorationCamera } from '../rendering/ExplorationCamera.js';
import { CharacterAssets } from '../data/CharacterAssets.js';

export class ToonRoomLevel extends Level3D {
    constructor() {
        super({ useUI: true, clearColor: [0.09, 0.18, 0.2, 1] });
        this.caption = 'Toon adventure — forest encounters';
    }

    BuildScene() {
        this.bands = 3;
        this.hud = new ToonRoomHUD(this.ui);
        this.physics.bounds = Courtyard.bounds;
        this.camera = new PerspectiveCamera({ ...Courtyard.camera, aspect: this.width / this.height });
        this.scene.Add(this.camera);
        this.scene.Add(new AmbientLight({ intensity: 0.3 }));
        this.scene.Add(new DirectionalLight({ ...Courtyard.sunlight, castShadow: true }));
        this.room = this.AddEntity(new CourtyardRoom(this.scene, this.physics, Courtyard));
        this.player = this.AddEntity(new Explorer(this.physics, Courtyard.spawn));
        this.enemies = Courtyard.areas.flatMap(area => area.enemies.map(spawn =>
            this.AddEntity(new Sentry(this.physics, spawn))));
        this.actors = [this.player, ...this.enemies];
        this.scenery = ForestScenery.map(definition =>
            this.AddEntity(new SceneryProp(this.scene, this.physics, definition)));
        this.explorationCamera = new ExplorationCamera(this.camera, this.player, Courtyard.bounds);
        const assets = this.context.assets ?? AssetManager.instance;
        this.visuals = this.actors.map(actor => this.AddEntity(new CharacterVisual(
            actor, actor === this.player ? CharacterAssets.player : CharacterAssets.enemy,
            this.scene, assets, this.player)));
        this.player.targets = this.enemies;
        for (const enemy of this.enemies) {
            enemy.target = this.player;
            enemy.targets = [this.player];
        }
        this.indicators = this.actors.map(actor => new AttackIndicator(actor));
        for (const indicator of this.indicators) this.scene.Add(indicator);
        this.result = null;
    }

    OnUpdate(dt) {
        if (ActionManager.IsActionDown('RESET')) this.RestartEncounter();
        if (ActionManager.IsActionDown('HELP')) this.hud.ToggleHelp();
        if (ActionManager.IsActionDown('BANDS')) {
            this.bands = this.bands === 4 ? 2 : this.bands + 1;
            for (const material of [...this.room.materials, ...this.scenery.flatMap(prop => prop.materials)]) {
                material.bands = this.bands;
            }
            for (const visual of this.visuals) {
                for (const mesh of visual.model.meshes) mesh.material.bands = this.bands;
            }
        }
        super.OnUpdate(dt);
    }

    OnFixedUpdate(dt) {
        if (this.result) return;
        super.OnFixedUpdate(dt);
        if (!this.player.health.IsAlive()) this.FinishEncounter('defeat');
    }

    FinishEncounter(result) {
        this.result = result;
        for (const actor of this.actors) {
            actor.attack.Reset();
            actor.rigidbody.velocity.fill(0);
        }
    }

    RestartEncounter() {
        for (const actor of this.actors) actor.Reset();
        this.result = null;
        for (const visual of this.visuals) visual.Reset();
    }

    get defeatedCount() {
        return this.enemies.filter(enemy => !enemy.health.IsAlive()).length;
    }

    get areaName() {
        const z = this.player.transform.position[2];
        return Courtyard.areas.find(area => z >= area.minZ)?.name ?? 'Old grove';
    }

    OnDrawn() {
        this.explorationCamera.Follow();
        for (const visual of this.visuals) visual.SyncTransform();
        for (const indicator of this.indicators) indicator.OnUpdate();
        super.OnDrawn();
    }

    OnGUI() {
        super.OnGUI();
        this.hud.Draw(this);
    }
}
