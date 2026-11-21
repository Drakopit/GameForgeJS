import { GameObject } from 'gameforgejs/2d';
import { RunRules } from '../data/TrailSettings.js';
import { TrailScenery } from '../rendering/TrailScenery.js';
import { ActionManager, AssetManager, Vector3D, SoundEffects } from 'gameforgejs/core';
import { AmbientLight, DirectionalLight, HemisphereLight, Level3D, PerspectiveCamera, PointLight, Skybox } from 'gameforgejs/3d';
import { LoadSkyTrailCourse, ListSkyTrailCourses } from '../data/SkyTrailCourse.js';
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
        this.route = ListSkyTrailCourses().map(course => course.name);
        this.startSegment = this.route.indexOf(this.course.assetName);
        this.segment = this.startSegment;
        this.handoff = 0;
        this.pendingSegment = null;
        this.hud = new SkyTrailHUD();
        this.CreateEnvironment();
        this.platforms = this.AddEntity(new TrailPlatforms(this.scene, this.physics, this.course));
        this.scenery = this.AddEntity(new TrailScenery(this.scene, this.platforms, this.course.theme));
        this.player = this.AddEntity(new TrailPlayer(this.scene, this.physics, this.course.player));
        const director = this.AddEntity(new GameObject());
        this.sound = director.AddComponent(new SoundEffects(this.context.services.get('audio')));
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
        if(this.hud.helpVisible)return;
        if (ActionManager.IsActionDown('RESET') || (this.gameState === 'WON' && ActionManager.IsActionDown('ATTACK'))) {
            if (this.segment !== this.startSegment) this.LoadSegment(this.startSegment, false);
            this.ResetGame();
        }
        this.handoff = Math.max(0, this.handoff - dt);
        if (this.pendingSegment !== null && this.handoff === 0) {
            this.LoadSegment(this.pendingSegment, true);
            this.pendingSegment = null;
        }
        super.OnUpdate(dt);
        this.followCamera.Update(dt);
    }

    OnFixedUpdate(dt) {
        if (this.gameState !== 'PLAYING' || this.hud.helpVisible || this.pendingSegment !== null) return;
        this.time += dt;
        const segmentTime = this.time - this.segmentStart;
        // Update moving solids and carry their passenger before the framework physics step.
        this.platforms.Update(segmentTime);
        this.scenery.Update();
        this.platforms.Carry(this.player);
        this.player.Move(dt, this.followCamera.cameraYaw);
        super.OnFixedUpdate(dt);
        this.RecoverPlayerIfNeeded();
        for (const checkpoint of this.checkpoints) {
            if (!checkpoint.TryActivate(this.player)) continue;
            this.checkpoint = checkpoint;
            this.sound.Play('transition');
        }
        this.coins.Update(dt, segmentTime);
        const center = Vector3D.FromArray(this.player.model.transform.position).AddValue(this.course.player.collider.offset);
        for (const coin of this.coins.Collect(center)) {
            this.score += coin.value;
            this.collectedCoins++;
            this.sound.Play('collect');
        }
        this.goal.SetGoalUnlocked(this.collectedCoins === this.goalCoins);
        this.goal.Update(segmentTime);
        if (this.goalUnlocked && Vector3D.FromArray(this.player.model.transform.position).DistanceTo(this.course.goal.trigger) <= this.course.goal.radius) {
            this.score += RunRules.finishBonus;
            this.bestTimes.set(this.course.assetName, Math.min(this.time - this.segmentStart, this.bestTime ?? Infinity));
            if (this.segment + 1 < this.route.length) {
                this.pendingSegment = this.segment + 1;
                this.handoff = 0.32;
            } else {
                this.gameState = 'WON';
                this.sound.Play('success');
                this.player.body.velocity.fill(0);
            }
        }
    }

    LoadSegment(index, retainMomentum) {
        const momentum = this.player.body.velocity.slice();
        const facing = this.player.facing;
        for (const entity of [...this.checkpoints, this.goal, this.coins, this.scenery, this.platforms]) this.RemoveEntity(entity);
        this.segment = index;
        this.course = LoadSkyTrailCourse(this.route[index]);
        this.physics.bounds = this.course.world.bounds;
        this.physics.gravity = this.course.world.gravity.ToArray();
        this.player.definition = this.course.player;
        this.platforms = this.AddEntity(new TrailPlatforms(this.scene, this.physics, this.course));
        this.scenery = this.AddEntity(new TrailScenery(this.scene, this.platforms, this.course.theme));
        this.coins = this.AddEntity(new TrailCoins(this.scene, this.platforms, this.course.coins));
        this.goal = this.AddEntity(new TrailGoal(this.scene, this.course.goal));
        this.checkpoints = this.platforms.platforms.filter(platform => platform.definition.checkpoint)
            .map(platform => this.AddEntity(new TrailCheckpoint(this.scene, platform, this.course.player)));
        this.followCamera.config = this.course.camera.follow;
        const input = this.player.input;
        this.player.Reset(this.course.player.spawn);
        if (retainMomentum) {
            this.player.body.velocity[0] = momentum[0];
            this.player.body.velocity[2] = momentum[2];
            this.player.input = input;
            this.player.facing = facing;
            this.player.model.transform.rotation.y = facing;
            this.sound.Play('transition');
        }
        this.checkpoint = null;
        this.collectedCoins = 0;
        this.segmentStart = this.time;
        this.handoff = 0.55;
        this.followCamera.cameraReady = false;
        this.followCamera.Update(0);
    }

    RecoverPlayerIfNeeded() {
        const position = Vector3D.FromArray(this.player.model.transform.position);
        if (position.ToArray().every(Number.isFinite) && position.y >= this.course.world.fallLimit) return;
        this.falls++;
        this.score = Math.max(0, this.score - RunRules.fallPenalty);
        this.player.Reset(this.checkpoint?.respawn ?? this.course.player.spawn);
        this.followCamera.cameraReady = false;
    }

    ResetGame() {
        this.pendingSegment = null;
        this.handoff = 0;
        this.score = 0;
        this.falls = 0;
        this.collectedCoins = 0;
        this.time = 0;
        this.segmentStart = 0;
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
        super.OnGUI();
        this.hud.Draw(this);
    }
    OnExit() { this.hud?.help?.Dispose(); super.OnExit(); }
}
