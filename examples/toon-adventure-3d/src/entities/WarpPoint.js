import { Vector3D } from 'gameforgejs/core';
import { Mesh, Geometry3D, PrimitiveMesh, UnlitMaterial } from 'gameforgejs/3d';
import { WarpSettings as Settings } from '../data/WarpSettings.js';

export class WarpPoint extends Mesh {
    constructor(scene, definition) {
        const positions = [], indices = [];
        for (let step = 0; step <= Settings.ringSegments; step++) {
            const angle = step / Settings.ringSegments * Math.PI * 2;
            for (const radius of [Settings.radius - Settings.ringThickness, Settings.radius]) {
                positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            }
            if (step < Settings.ringSegments) {
                const start = step * 2;
                indices.push(start, start + 2, start + 1, start + 1, start + 2, start + 3);
            }
        }
        super({ name: definition.name, geometry: new Geometry3D({ positions, indices }).EnsureNormals(),
            material: new UnlitMaterial({ color: definition.color }), castShadow: false });
        this.definition = definition;
        this.position = Vector3D.FromArray(definition.position);
        this.scene = scene;
        this.elapsed = 0;
        this.transform.SetPosition(this.position.x, Settings.ringHeight, this.position.z);
        this.beacons = [-1, 1].map(side => {
            const mesh = new Mesh({ geometry: PrimitiveMesh.Cube(1), material: this.material, castShadow: false });
            mesh.transform.SetPosition(this.position.x + side * Settings.radius, Settings.pillarHeight / 2, this.position.z);
            mesh.transform.SetScale(Settings.ringThickness, Settings.pillarHeight, Settings.ringThickness);
            scene.Add(mesh);
            return mesh;
        });
        scene.Add(this);
    }

    Contains(actor) {
        const position = Vector3D.FromArray(actor.transform.position);
        return Math.hypot(position.x - this.position.x, position.z - this.position.z) <= Settings.radius
            && Math.abs(position.y - this.position.y) <= Settings.heightTolerance;
    }

    OnUpdate(dt) {
        this.elapsed += dt;
        const scale = 1 + Math.sin(this.elapsed * Settings.pulseSpeed) * Settings.pulseAmount;
        this.transform.SetScale(scale, 1, scale);
        this.transform.rotation.y += dt;
    }

    OnDestroy() {
        for (const mesh of [this, ...this.beacons]) this.scene.Remove(mesh);
    }
}
