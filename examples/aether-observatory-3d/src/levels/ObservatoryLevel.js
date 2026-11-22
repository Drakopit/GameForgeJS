import { GameViewport, SoundEffects } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';
import { Level3D, AmbientLight, HemisphereLight, DirectionalLight, Mesh, PrimitiveMesh, StandardMaterial,
    Transform3D, Rigidbody3D, SphereCollider3D } from 'gameforgejs/3d';
import { ScenarioWithIslands } from '../data/IslandScene.js';
import { ObservatoryWorld } from '../entities/ObservatoryWorld.js';
import { MeshActor } from '../entities/MeshActor.js';
import { ExplorerMotion } from '../components/ExplorerMotion.js';
import { ObservatoryCamera } from '../components/ObservatoryCamera.js';
import { ObservatoryTour } from '../components/ObservatoryTour.js';
import { ObservatoryHUD } from '../ui/ObservatoryHUD.js';

export class ObservatoryLevel extends Level3D {
    constructor() { super({width: 960, height: 640, clearColor: [0.17, 0.28, 0.38, 1]}); this.caption = 'Aether Observatory'; }
    BuildScene() {
        this.rules = ScenarioWithIslands(this.context.assets.jsons.scenario, this.context.assets.jsons.islands); this.subtitle = ''; this.jumpQueued = false;
        this.sound = new SoundEffects(this.context.services.get('audio'),this.context.config.audio?.cues);
        this.scene.fog = this.rules.environment.fog;
        this.scene.Add(new AmbientLight({intensity: 0.22}));
        this.scene.Add(new HemisphereLight({skyColor: [0.6, 0.85, 1], groundColor: [0.3, 0.25, 0.35], intensity: 0.5}));
        this.scene.Add(new DirectionalLight({direction: [-0.7, -1, -0.3], color: [1, 0.83, 0.6], intensity: 1.7,
            castShadow: true, shadowDistance: 45, shadowMapSize: 1024}));
        this.world = this.AddEntity(new ObservatoryWorld(this));
        const mesh = new Mesh({geometry: PrimitiveMesh.Sphere(0.65, {widthSegments: 12, heightSegments: 8}),
            material: new StandardMaterial({albedoColor: '#ecae64', metallic: 0.45, roughness: 0.3}), transform: new Transform3D()});
        this.player = new MeshActor(this.scene, mesh, this.physics, new Rigidbody3D({damping: 1}), new SphereCollider3D({radius: 0.65}));
        this.player.AddComponent(new ExplorerMotion(this, this.player)); this.AddEntity(this.player);
        this.rig = new ObservatoryCamera(this); this.tour = new ObservatoryTour(this);
        const director = new GameObject(); director.AddComponent(this.sound); director.AddComponent(this.rig); director.AddComponent(this.tour); this.AddEntity(director);
        this.hud = new ObservatoryHUD(this); this.ResetPlayer();
        // Suppress the browser menu only on this canvas; Mouse still owns input.
        this.preventContextMenu = event => event.preventDefault();
        this.ui.Screen.Canvas.addEventListener('contextmenu', this.preventContextMenu);
        this.releaseViewport = GameViewport.Bind(this.ui.Screen, {maxWidth: 1440, onResize: () => {
            GameViewport.Align(this.ui.Screen,this.screen3D);
            this.hud.stick.Cancel(); this.rig.pointer = null;
        }});
        this.StartTour();
    }
    ResetPlayer() { this.player.mesh.transform.SetPosition(...this.rules.movement.spawn); this.player.body.velocity.fill(0); this.jumpQueued = false; }
    StartTour() { this.player.body.velocity.fill(0); this.tour.Play(); this.sound.Play('transition'); }
    OnUpdate(dt) { this.hud.Update(dt); if(!this.hud.help.visible)super.OnUpdate(dt); }
    OnFixedUpdate(dt) {if(!this.hud.help.visible)super.OnFixedUpdate(dt);}
    OnGUI() { this.hud.Draw(); }
    OnExit() {
        this.releaseViewport?.(); this.hud?.Dispose();
        this.ui?.Screen.Canvas.removeEventListener('contextmenu', this.preventContextMenu);
        super.OnExit();
    }
}
