import { GameObject } from 'gameforgejs/2d';
import { Mesh, PrimitiveMesh, SurfaceMaterial, SurfaceAnimator, RainEmitter, RainRenderer } from 'gameforgejs/3d';
/** Materials and weather compose native components; the level still owns rendering. */
export class SurfaceGallery extends GameObject {
    constructor(scene) {
        super();
        this.scene = scene;
        this.meshes = [];
        this.water = new SurfaceMaterial({ preset: 'water' });
        for (const [preset, x, z] of [['wood', -2.8, 0], ['metal', 2.8, 0], ['water', 0, 2.5]]) {
            const material = preset === 'water' ? this.water : new SurfaceMaterial({ preset });
            const mesh = new Mesh({ name: preset, geometry: PrimitiveMesh.Cube(1), material });
            mesh.transform.SetPosition(x, preset === 'water' ? -0.65 : 0.05, z);
            mesh.transform.SetScale(preset === 'water' ? 5 : 1, preset === 'water' ? 0.06 : 1, preset === 'water' ? 1.7 : 1);
            this.meshes.push(mesh);
            scene.Add(mesh);
        }
        this.AddComponent(new SurfaceAnimator(this.meshes.map(mesh => mesh.material)));
        this.rain = this.AddComponent(new RainEmitter({ count: 80, bounds: { width: 9, depth: 7, height: 7 }, heightAt: () => -0.62, onImpact: point => {
                if (Math.abs(point.x) < 2.5 && point.z > 1.65 && point.z < 3.35)
                    this.water.AddRipple(point);
            } }));
        this.batch = this.AddComponent(new RainRenderer(scene, this.rain));
    }
    ToggleRain() { this.rain.enabled = !this.rain.enabled; this.batch.enabled = this.rain.enabled; this.batch.mesh.visible = this.rain.enabled; }
    OnDestroy() { for (const mesh of this.meshes)
        this.scene.Remove(mesh); super.OnDestroy(); }
}
