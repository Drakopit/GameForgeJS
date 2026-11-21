import { GameObject } from 'gameforgejs/2d';
import { Mesh, PrimitiveMesh, SurfaceMaterial, SurfaceAnimator, RainEmitter, RainRenderer, WetSurfaceResponse } from 'gameforgejs/3d';
import { MapScale } from '../data/BattleRules.js';
export class HighlandEnvironment extends GameObject {
    constructor(scene, grid, stone) {
        super();
        this.scene = scene;
        this.water = new SurfaceMaterial({ preset: 'water', albedoColor: '#2c697e' });
        this.lake = new Mesh({ name: 'Highland tarn', geometry: PrimitiveMesh.Cube(1), material: this.water, castShadow: false });
        this.lake.transform.SetPosition(0, 0.08, 0);
        this.lake.transform.SetScale(12, 0.1, 12);
        scene.Add(this.lake);
        this.AddComponent(new SurfaceAnimator([this.water]));
        this.rain = this.AddComponent(new RainEmitter({ count: 96, bounds: { width: 12, depth: 12, height: 9 }, heightAt: (x, z) => {
                const tile = grid.Get(Math.round(x / MapScale.tile + (grid.cols - 1) / 2), Math.round(z / MapScale.tile + (grid.rows - 1) / 2));
                return tile ? MapScale.base + tile.h * MapScale.elevation : 0.13;
            }, onImpact: p => { if (p.y < 0.2)
                this.water.AddRipple(p, 0.3); } }));
        this.AddComponent(new WetSurfaceResponse(this.rain, [stone]));
        this.batch = this.AddComponent(new RainRenderer(scene, this.rain));
        this.ToggleRain();
    }
    ToggleRain() { this.rain.enabled = !this.rain.enabled; this.batch.mesh.visible = this.rain.enabled; }
    OnDestroy() { this.scene.Remove(this.lake); super.OnDestroy(); }
}
