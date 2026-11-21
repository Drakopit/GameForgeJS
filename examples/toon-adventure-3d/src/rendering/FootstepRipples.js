import { WaterVisualSettings as Settings } from '../data/PresentationSettings.js';
import { CombatVisualSettings } from '../data/PresentationSettings.js';
import { Vector3D } from 'gameforgejs/core';
import { Geometry3D, Mesh } from 'gameforgejs/3d';

// Two reusable rings follow the feet; no particle allocation or separate clock.
export class FootstepRipples extends Mesh {
    constructor(scene, actor, pond) {
        const segments = Settings.footstepSegments;
        const positions = new Float32Array(Settings.footstepRings * (segments + 1) * 2 * 3);
        const indices = [];
        for (let ring = 0; ring < Settings.footstepRings; ring++) {
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
        const velocity = Vector3D.FromArray(actor.rigidbody.velocity);
        this.visible = actor.health.IsAlive() && this.pond.ContainsFeet(actor)
            && Math.hypot(velocity.x, velocity.z) > CombatVisualSettings.movementThreshold;
        if (!this.visible) return;
        const { position, width, depth } = this.pond.definition;
        const center = Vector3D.FromArray(actor.transform.position).Subtract(Vector3D.FromArray(position));
        const phase = this.pond.surface.phase;
        let index = 0;
        for (let ring = 0; ring < Settings.footstepRings; ring++) {
            const progress = (phase / (Math.PI * 2) * Settings.footstepCycles + ring * Settings.footstepPhaseOffset) % 1;
            const radius = Settings.footstepStartRadius + progress * Settings.footstepExpansion;
            const thickness = (1 - progress) * Settings.footstepThickness;
            for (let step = 0; step <= this.segments; step++) {
                const angle = step / this.segments * Math.PI * 2;
                for (const offset of [0, thickness]) {
                    const x = Math.max(-width / 2, Math.min(width / 2, center.x + Math.cos(angle) * (radius + offset)));
                    const z = Math.max(-depth / 2, Math.min(depth / 2, center.z + Math.sin(angle) * (radius + offset)));
                    this.geometry.positions[index++] = x;
                    this.geometry.positions[index++] = this.pond.surface.geometry.HeightAt(x, z, phase) + Settings.footstepLift;
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
