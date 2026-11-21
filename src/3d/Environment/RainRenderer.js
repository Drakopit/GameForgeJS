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
            const offset = index * 72;
            if (index >= this.emitter.activeCount) {
                data.fill(0, offset, offset + 72);
                return;
            }
            const p = drop.position, hit = drop.impact;
            const dx = this.emitter.wind.x * 0.035, dz = this.emitter.wind.z * 0.035;
            const age = 1 - drop.splash / 0.2;
            const radius = drop.splash > 0 ? age * 0.18 : 0;
            const lift = drop.splash > 0 ? Math.sin(age * Math.PI) * 0.16 : 0;
            const y = hit.y + 0.015;
            data.set([
                p.x - 0.009, p.y, p.z, p.x + 0.009, p.y, p.z, p.x - dx, p.y + 0.36, p.z - dz,
                p.x + 0.009, p.y, p.z, p.x - dx + 0.005, p.y + 0.31, p.z - dz, p.x - dx, p.y + 0.36, p.z - dz,
                hit.x - radius, y + lift, hit.z, hit.x, y, hit.z, hit.x - radius * 0.75, y + lift * 0.8, hit.z,
                hit.x + radius, y + lift, hit.z + radius, hit.x + radius * 0.72, y + lift * 0.7, hit.z + radius, hit.x, y, hit.z,
            ], offset);
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
