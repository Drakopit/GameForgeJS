import { Component } from '../../core/Component.js';
import { Geometry3D } from '../Render3D/Mesh/Geometry3D.js';
import { Mesh } from '../Render3D/Mesh/Mesh.js';
import { UnlitMaterial } from '../Render3D/Material/UnlitMaterial.js';
/** One dynamic native mesh for a bounded RainEmitter; no per-drop draw calls. */
export class RainRenderer extends Component {
    constructor(scene, emitter) {
        super();
        this.scene = scene;
        this.emitter = emitter;
        const positions = new Float32Array(emitter.drops.length * 72);
        this.geometry = new Geometry3D({ positions });
        this.mesh = new Mesh({ name: 'Rain batch', geometry: this.geometry, material: new UnlitMaterial({ color: [0.65, 0.84, 0.91, 0.34], transparent: true }), castShadow: false, frustumCulled: false });
    }
    OnStart() { this.scene.Add(this.mesh); }
    OnUpdate() {
        if (!this.mesh.visible)
            return;
        const data = this.geometry.positions;
        this.emitter.drops.forEach((drop, index) => {
            const p = drop.position, dx = this.emitter.wind.x * 0.035, dz = this.emitter.wind.z * 0.035;
            const offset = index * 72, hit = drop.impact, age = 1 - drop.splash / 0.2, r = drop.splash > 0 ? age * 0.22 : 0, y = hit.y + 0.04 + Math.sin(age * Math.PI) * 0.09;
            data.set([p.x - 0.014, p.y, p.z, p.x + 0.014, p.y, p.z, p.x + dx, p.y + 0.36, p.z + dz,
                p.x + 0.014, p.y, p.z, p.x + dx + 0.028, p.y + 0.36, p.z + dz, p.x + dx, p.y + 0.36, p.z + dz,
                hit.x - r, y, hit.z, hit.x, y, hit.z + r, hit.x + r, y, hit.z,
                hit.x - r, y, hit.z, hit.x + r, y, hit.z, hit.x, y, hit.z - r], offset);
            // Reverse faces keep narrow streaks visible from every orbit angle.
            for (let triangle = 0; triangle < 4; triangle++)
                for (let vertex = 0; vertex < 3; vertex++)
                    for (let axis = 0; axis < 3; axis++)
                        data[offset + 36 + triangle * 9 + vertex * 3 + axis] = data[offset + triangle * 9 + (2 - vertex) * 3 + axis];
        });
        this.geometry.MarkUpdated();
    }
    OnDestroy() { this.scene.Remove(this.mesh); }
}
