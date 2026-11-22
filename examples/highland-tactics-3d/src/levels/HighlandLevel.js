import { ActionManager, Input, Touch, GameViewport, MathExt, SoundEffects } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';
import { Level3D, OrthographicCamera, HeightGrid, AmbientLight, HemisphereLight, DirectionalLight } from 'gameforgejs/3d';
import { BattleFromScene } from '../data/BattleScene.js';
import { TacticalPawn } from '../entities/TacticalPawn.js';
import { HighlandEnvironment } from '../entities/HighlandEnvironment.js';
import { TerrainView } from '../rendering/TerrainView.js';
import { TurnSystem } from '../components/TurnSystem.js';
import { TacticalControls } from '../input/TacticalControls.js';
import { TacticalHUD } from '../ui/TacticalHUD.js';
/** Scene composition only. Gameplay values live in ECS components, not the HUD. */
export class HighlandLevel extends Level3D {
    constructor() { super({ width: 1100, height: 760, usePhysics: false, clearColor: [0.09, 0.16, 0.2, 1] }); this.caption = 'Highland Tactics 3D'; }
    BuildScene() {
        const data = BattleFromScene(this.context.assets.jsons.battlefield);
        this.grid = new HeightGrid(data.heights);
        this.scene.fog = { color: [0.13, 0.23, 0.26], near: 25, far: 65 };
        this.camera = new OrthographicCamera({ position: [16, 14, 16], target: [0, 0.7, 0], viewHeight: 13, far: 100 });
        this.scene.Add(this.camera);
        this.scene.Add(new AmbientLight({ intensity: 0.18 }));
        this.scene.Add(new HemisphereLight({ skyColor: [0.8, 0.9, 1], groundColor: [0.3, 0.23, 0.15], intensity: 0.28 }));
        this.scene.Add(new DirectionalLight({ direction: [-0.5, -1, -0.3], color: [1, 0.9, 0.72], intensity: 0.65, castShadow: true, shadowMapSize: 1024, shadowDistance: 20 }));
        this.terrain = this.AddEntity(new TerrainView(this.scene, this.grid));
        this.environment = this.AddEntity(new HighlandEnvironment(this.scene, this.grid, this.terrain.stone));
        this.pawns = data.units.map(unit => this.AddEntity(new TacticalPawn(this.grid, this.scene, unit)));
        const director = new GameObject();
        this.sound = director.AddComponent(new SoundEffects(this.context.services.get('audio')));
        this.turn = director.AddComponent(new TurnSystem(this.grid, this.pawns, this.sound));
        this.AddEntity(director);
        this.hud = new TacticalHUD(this);
        this.controls = new TacticalControls(this);
        this.exploring = 'title';
        this.turn.enabled = false;
        this.turn.phase = 'explore';
        this.turn.message = 'Highland Watch / follow the patrol signal.';
        this.cameraStep = 0;
        this.cameraAngle = Math.PI / 4;
        this.releaseViewport = GameViewport.Bind(this.ui.Screen, { maxWidth: 1440, onResize: () => GameViewport.Align(this.ui.Screen, this.screen3D) });
    }
    StartPatrol() {
        if (this.exploring !== 'title') return;
        const scout = this.pawns[0];
        const reachable = [...this.turn.Range(scout).values()];
        this.encounter = reachable.filter(tile => tile.path.length && tile.path.every((step, i) =>
            Math.abs(step.col - (tile.path[i - 1] ?? scout.stats).col) + Math.abs(step.row - (tile.path[i - 1] ?? scout.stats).row) === 1))
            .sort((a, b) => b.cost - a.cost)[0];
        if (!this.encounter) return;
        this.exploring = 'patrol';
        this.turn.message = 'Move the scout onto the patrol signal.';
        this.sound.Play('select');
    }
    UpdatePatrol() {
        if (this.exploring === 'title') {
            if (ActionManager.IsActionDown('CONFIRM')) this.StartPatrol();
            return;
        }
        const scout = this.pawns[0];
        if (scout.travel.path.length) return;
        const step = [['UP', 0, -1], ['RIGHT', 1, 0], ['DOWN', 0, 1], ['LEFT', -1, 0]]
            .find(([action]) => ActionManager.IsActionDown(action));
        const screen = this.ui.Screen;
        const contact = Input.instance?.touch.GetStartedTouches()[0];
        const mouse = Input.instance?.mouse;
        const point = contact ? Touch.ToScreen(contact.startPosition, screen)
            : mouse?.buttonsDown[0] ? mouse.getPositionRelative(screen.Canvas) : null;
        const tile = step ? this.grid.Get(scout.stats.col + step[1], scout.stats.row + step[2])
            : point && this.terrain.Pick(point, this.camera, screen);
        if (!tile) return;
        const entry = this.turn.Range(scout).get(this.grid.Key(tile));
        if (!entry?.path.length || (step && entry.path.length !== 1)) return;
        scout.travel.Follow(entry.path, () => {
            if (this.grid.Key(tile) !== this.grid.Key(this.encounter)) return;
            this.exploring = null;
            this.turn.enabled = true;
            this.turn.Reset();
            this.sound.Play('warning');
        });
    }
    ResetBattle() { for (const pawn of this.pawns) {
        pawn.stats.Reset();
        pawn.travel.Snap();
    } this.exploring = null; this.turn.enabled = true; this.turn.Reset(); this.hud.help.visible = false; }
    ToggleWeather() { this.environment.ToggleRain(); }
    OnUpdate(dt) {
        if (this.exploring && !this.hud.help.visible) this.UpdatePatrol();
        this.controls.Update(dt);
        this.cameraAngle = MathExt.LerpAngle(this.cameraAngle, Math.PI / 4 + this.cameraStep * Math.PI / 2, Math.min(1, dt * 8));
        this.camera.SetPosition(Math.cos(this.cameraAngle) * 20, 14, Math.sin(this.cameraAngle) * 20);
        this.camera.viewHeight = Math.max(13, 15 * this.ui.Screen.Height / this.ui.Screen.Width);
        if (!this.hud.help.visible)
            super.OnUpdate(dt);
        this.terrain.Highlights(this.turn);
    }
    OnGUI() { this.hud.Draw(); }
    OnExit() { this.releaseViewport?.(); this.hud?.Dispose(); super.OnExit(); }
}
