import { Geometry3D, Mesh } from 'gameforgejs/3d';

// Two reusable rings follow the feet; no particle allocation or separate clock.
export class FootstepRipples extends Mesh {
    constructor(scene, actor, pond) {
        const segments = 32;
        const positions = new Float32Array(2 * (segments + 1) * 2 * 3);
        const indices = [];
        for (let ring = 0; ring < 2; ring++) {
            for (let step = 0; step < segments; step++) {
                const start = ring * (segments + 1) * 2 + step * 2;
                indices.push(start, start + 2, start + 1, start + 1, start + 2, start + 3);
            }
        }
        super({ name: 'Footstep ripples', geometry: new Geometry3D({ positions, indices }).EnsureNormals(),
            material: pond.ripples.material, castShadow: false, visible: false });
        this.scene = scene;
        this.actor = actor;
        this.pond = pond;
        this.segments = segments;
        this.transform.SetPosition(...pond.definition.position);
        scene.Add(this);
    }

    OnUpdate() {
        const actor = this.actor;
        this.visible = actor.health.IsAlive() && this.pond.ContainsFeet(actor)
            && Math.hypot(actor.rigidbody.velocity[0], actor.rigidbody.velocity[2]) > 0.1;
        if (!this.visible) return;
        const { position, width, depth } = this.pond.definition;
        const centerX = actor.transform.position[0] - position[0];
        const centerZ = actor.transform.position[2] - position[2];
        const phase = this.pond.surface.phase;
        let index = 0;
        for (let ring = 0; ring < 2; ring++) {
            const progress = (phase / (Math.PI * 2) * 4 + ring * 0.5) % 1;
            const radius = 0.16 + progress * 0.4;
            const thickness = (1 - progress) * 0.035;
            for (let step = 0; step <= this.segments; step++) {
                const angle = step / this.segments * Math.PI * 2;
                for (const offset of [0, thickness]) {
                    const x = Math.max(-width / 2, Math.min(width / 2, centerX + Math.cos(angle) * (radius + offset)));
                    const z = Math.max(-depth / 2, Math.min(depth / 2, centerZ + Math.sin(angle) * (radius + offset)));
                    this.geometry.positions[index++] = x;
                    this.geometry.positions[index++] = this.pond.surface.geometry.HeightAt(x, z, phase) + 0.02;
                    this.geometry.positions[index++] = z;
                }
            }
        }
        this.geometry.MarkUpdated();
    }

    OnDestroy() {
        this.scene.Remove(this);
    }
}
