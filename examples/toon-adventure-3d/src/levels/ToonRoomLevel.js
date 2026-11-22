import { GameObject } from 'gameforgejs/2d';
import { FootstepRipples } from '../rendering/FootstepRipples.js';
import { ToonPond } from '../entities/ToonPond.js';
import { WarpPoint } from '../entities/WarpPoint.js';
import { WarpTravel } from '../components/WarpTravel.js';
import { ActionManager, AssetManager, Vector3D, SoundEffects } from 'gameforgejs/core';
import { Level3D, PerspectiveCamera, SceneManifest3D, Skybox } from 'gameforgejs/3d';
import { CourtyardFromScene } from '../data/CourtyardScene.js';
import { CourtyardRoom } from '../entities/CourtyardRoom.js';
import { Explorer } from '../entities/Explorer.js';
import { ToonRoomHUD } from '../ui/ToonRoomHUD.js';
import { Sentry } from '../entities/Sentry.js';
import { AttackIndicator } from '../rendering/AttackIndicator.js';
import { CharacterVisual } from '../rendering/CharacterVisual.js';
import { SceneryProp } from '../entities/SceneryProp.js';
import { ExplorationCamera } from '../rendering/ExplorationCamera.js';

export class ToonRoomLevel extends Level3D {
    constructor() {
        super({ useUI: true, clearColor: [0.09, 0.18, 0.2, 1] });
        this.caption = 'Toon adventure — forest encounters';
    }

    BuildScene() {
        this.bands = 3;
        this.hud = new ToonRoomHUD(this.ui);
        // Layout, camera and lights come from scenes/courtyard.gfscene.json.
        const { courtyard: Courtyard, lakes, scenery, characters, warpPoints, lights } = CourtyardFromScene(this.context.assets.jsons.courtyard);
        this.courtyard = Courtyard;
        this.physics.bounds = Courtyard.bounds;
        this.camera = new PerspectiveCamera({ ...Courtyard.camera, aspect: this.width / this.height });
        this.scene.Add(this.camera);
        for (const light of lights) this.scene.Add(SceneManifest3D.CreateLight(light));
        this.room = this.AddEntity(new CourtyardRoom(this.scene, this.physics, Courtyard));
        this.lakes = lakes.map(definition => this.AddEntity(new ToonPond(this.scene, this.physics, definition)));
        this.pond = this.lakes[0];
        this.player = this.AddEntity(new Explorer(this.physics, Courtyard.spawn, this.lakes));
        this.waterRipples = this.lakes.map(lake => this.AddEntity(new FootstepRipples(this.scene, this.player, lake)));
        this.footstepRipples = this.waterRipples[0];
        this.warpPoints = warpPoints.map(definition => this.AddEntity(new WarpPoint(this.scene, definition)));
        this.warpTravel = new WarpTravel(this.warpPoints, name => this.hud.ShowTravel(name)).Attach(this.player);
        this.enemies = Courtyard.areas.flatMap(area => area.enemies.map(spawn =>
            this.AddEntity(new Sentry(this.physics, spawn))));
        this.actors = [this.player, ...this.enemies];
        this.scenery = scenery.map(definition =>
            this.AddEntity(new SceneryProp(this.scene, this.physics, definition)));
        this.explorationCamera = new ExplorationCamera(this.camera, this.player, Courtyard.bounds);
        const assets = this.context.assets ?? AssetManager.instance;
        this.scene.Add(Skybox.FromImage(assets.GetImage('sky_cross'), { name: 'Daylight' }));
        this.visuals = this.actors.map(actor => this.AddEntity(new CharacterVisual(
            actor, actor === this.player ? characters.player : characters.enemy,
            this.scene, assets, characters.scale)));
        const director = this.AddEntity(new GameObject());
        this.sound = director.AddComponent(new SoundEffects(this.context.services.get('audio')));
        for (const actor of this.actors) actor.attack.onHit = () => this.sound.Play('hit');
        this.player.targets = this.enemies;
        for (const enemy of this.enemies) {
            enemy.target = this.player;
            enemy.targets = [this.player];
        }
        this.indicators = this.actors.map(actor => new AttackIndicator(actor));
        for (const indicator of this.indicators) this.scene.Add(indicator);
        this.result = null;
        this.hud.ShowArea(this.areaName);
    }

    OnUpdate(dt) {
        if (ActionManager.IsActionDown('RESET')) this.RestartEncounter();
        if (ActionManager.IsActionDown('HELP')) this.hud.ToggleHelp();
        if (ActionManager.IsActionDown('BANDS')) {
            this.bands = this.bands === 4 ? 2 : this.bands + 1;
            for (const material of [...this.room.materials, ...this.lakes.flatMap(lake => lake.materials), ...this.scenery.flatMap(prop => prop.materials)]) {
                material.bands = this.bands;
            }
            for (const visual of this.visuals) {
                for (const mesh of visual.model.meshes) mesh.material.bands = this.bands;
            }
        }
        if(this.hud.helpVisible)return;
        super.OnUpdate(dt);
        this.hud.OnUpdate(dt, this.areaName);
    }

    OnFixedUpdate(dt) {
        if (this.result || this.hud.helpVisible) return;
        super.OnFixedUpdate(dt);
        this.warpTravel.OnFixedUpdate(dt);
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
        this.hud.ShowArea(this.areaName);
        for (const visual of this.visuals) visual.Reset();
        this.warpTravel.Reset();
        this.hud.ClearTravel();
        for (const ripple of this.waterRipples) ripple.OnUpdate();
    }

    get defeatedCount() {
        return this.enemies.filter(enemy => !enemy.health.IsAlive()).length;
    }

    get areaName() {
        const position = Vector3D.FromArray(this.player.transform.position);
        const lakeside = this.lakes.find(lake => {
            if (!lake.definition.openBanks) return false;
            const center = Vector3D.FromArray(lake.definition.position);
            const { width, depth, areaMargin } = lake.definition;
            return Math.abs(position.x - center.x) <= width / 2 + areaMargin
                && Math.abs(position.z - center.z) <= depth / 2 + areaMargin;
        });
        if (lakeside) return lakeside.definition.name;
        const z = position.z;
        return this.courtyard.areas.find(area => z >= area.minZ)?.name ?? 'Old grove';
    }

    OnDrawn() {
        this.explorationCamera.Follow();
        for (const visual of this.visuals) visual.SyncTransform();
        for (const indicator of this.indicators) indicator.OnUpdate();
        super.OnDrawn();
    }

    OnExit() {
        this.hud?.Dispose();
        this.warpTravel?.Detach();
        super.OnExit();
    }

    OnGUI() {
        super.OnGUI();
        this.hud.Draw(this);
    }
}
