import { TrailScenery } from '../rendering/TrailScenery.js';
import { ActionManager, AssetManager, Vector3D } from 'gameforgejs/core';
import { AmbientLight, DirectionalLight, HemisphereLight, Level3D, PerspectiveCamera, PointLight, Skybox } from 'gameforgejs/3d';
import { LoadSkyTrailCourse } from '../data/SkyTrailCourse.js';
import { TrailPlatforms } from '../entities/TrailPlatforms.js';
import { TrailPlayer } from '../entities/TrailPlayer.js';
import { TrailCoins } from '../entities/TrailCoins.js';
import { TrailGoal } from '../entities/TrailGoal.js';
import { TrailCheckpoint } from '../entities/TrailCheckpoint.js';
import { TrailCamera } from '../rendering/TrailCamera.js';
import { SkyTrailHUD } from '../ui/SkyTrailHUD.js';

export class CubeGameLevel extends Level3D {
    constructor() {
        super({ width: 720, height: 480, clearColor: [0.32, 0.62, 0.9, 1], usePhysics: true });
        this.TelaId = 'CubeGame';
        this.caption = 'GameForgeJS - Sky Trail 3D';
        this.bestTimes = new Map();
    }

    BuildScene() {
        this.course = LoadSkyTrailCourse();
        this.hud = new SkyTrailHUD();
        this.CreateEnvironment();
        this.platforms = this.AddEntity(new TrailPlatforms(this.scene, this.physics, this.course));
        this.scenery = this.AddEntity(new TrailScenery(this.scene, this.platforms, this.course.theme));
        this.player = this.AddEntity(new TrailPlayer(this.scene, this.physics, this.course.player));
        this.coins = this.AddEntity(new TrailCoins(this.scene, this.platforms, this.course.coins));
        this.goal = this.AddEntity(new TrailGoal(this.scene, this.course.goal));
        this.checkpoints = this.platforms.platforms.filter(platform => platform.definition.checkpoint)
            .map(platform => this.AddEntity(new TrailCheckpoint(this.scene, platform, this.course.player)));
        this.followCamera = new TrailCamera(this.camera, this.player, this.course.camera.follow);
        this.ResetGame();
    }

    CreateEnvironment() {
        const { camera, lighting, world } = this.course;
        this.physics.gravity = world.gravity.ToArray();
        this.physics.bounds = world.bounds;
        this.camera = new PerspectiveCamera({ ...camera, aspect: this.width / this.height,
            position: camera.position.ToArray(), target: camera.target.ToArray() });
        this.scene.Add(this.camera);
        const image = AssetManager.instance.GetImage('sky_cross');
        if (image) this.scene.Add(Skybox.FromImage(image, { name: 'SunnySky' }));
        this.scene.Add(new AmbientLight(lighting.ambient));
        this.scene.Add(new HemisphereLight(lighting.hemisphere));
        this.scene.Add(new DirectionalLight({ ...lighting.sun, direction: lighting.sun.direction.ToArray(), castShadow: true }));
        this.scene.Add(new PointLight({ ...lighting.goalLight,
            position: this.course.goal.trigger.AddValue(lighting.goalLight.offset).ToArray() }));
    }

    OnUpdate(dt) {
        if (ActionManager.IsActionDown('CANCEL')) { this.Back = true; return; }
        if (ActionManager.IsActionDown('HELP')) this.hud.helpVisible = !this.hud.helpVisible;
        if (ActionManager.IsActionDown('RESET') || (this.gameState === 'WON' && ActionManager.IsActionDown('ATTACK'))) this.ResetGame();
        super.OnUpdate(dt);
        this.followCamera.Update(dt);
    }

    OnFixedUpdate(dt) {
        if (this.gameState !== 'PLAYING') return;
        this.time += dt;
        // Update moving solids and carry their passenger before the framework physics step.
        this.platforms.Update(this.time);
        this.scenery.Update();
        this.platforms.Carry(this.player);
        this.player.Move(dt, this.followCamera.cameraYaw);
        super.OnFixedUpdate(dt);
        this.RecoverPlayerIfNeeded();
        for (const checkpoint of this.checkpoints) {
            if (checkpoint.TryActivate(this.player)) this.checkpoint = checkpoint;
        }
        this.coins.Update(dt, this.time);
        const center = Vector3D.FromArray(this.player.model.transform.position).AddValue(this.course.player.collider.offset);
        for (const coin of this.coins.Collect(center)) {
            this.score += coin.value;
            this.collectedCoins++;
        }
        this.goal.SetGoalUnlocked(this.collectedCoins === this.goalCoins);
        this.goal.Update(this.time);
        if (this.goalUnlocked && Vector3D.FromArray(this.player.model.transform.position).DistanceTo(this.course.goal.trigger) <= this.course.goal.radius) {
            this.gameState = 'WON';
            this.score += 100;
            this.player.body.velocity.fill(0);
            this.bestTimes.set(this.course.assetName, Math.min(this.time, this.bestTime ?? Infinity));
        }
    }

    RecoverPlayerIfNeeded() {
        const position = this.player.model.transform.position;
        if (position.every(Number.isFinite) && position[1] >= this.course.world.fallLimit) return;
        this.falls++;
        this.score = Math.max(0, this.score - 5);
        this.player.Reset(this.checkpoint?.respawn ?? this.course.player.spawn);
        this.followCamera.cameraReady = false;
    }

    ResetGame() {
        this.score = 0;
        this.falls = 0;
        this.collectedCoins = 0;
        this.time = 0;
        this.gameState = 'PLAYING';
        this.checkpoint = null;
        this.platforms.Update(0);
        this.scenery.Update();
        this.player.Reset(this.course.player.spawn);
        this.coins.Reset();
        this.goal.SetGoalUnlocked(false);
        this.goal.Update(0);
        for (const checkpoint of this.checkpoints) checkpoint.Reset();
        this.followCamera.cameraYaw = 0;
        this.followCamera.cameraReady = false;
        this.followCamera.Update(0);
    }

    get goalCoins() { return this.course.coins.items.length; }
    get goalUnlocked() { return this.goal.goalUnlocked; }
    get playerModel() { return this.player.model; }
    get bestTime() { return this.bestTimes.get(this.course.assetName); }

    OnGUI() {
        this.hud.Draw(this);
    }
}
