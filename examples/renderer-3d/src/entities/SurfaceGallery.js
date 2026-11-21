import { SoundEffects } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';
import { Mesh, PrimitiveMesh, SurfaceMaterial, SurfaceAnimator, RainEmitter, RainRenderer,
    WetSurfaceResponse, UnlitMaterial } from 'gameforgejs/3d';

const basin = { width: 11, depth: 8 };
const block = PrimitiveMesh.BeveledCube(0.045);
const orb = PrimitiveMesh.Sphere(0.75, { widthSegments: 48, heightSegments: 24 });

export class SurfaceGallery extends GameObject {
    constructor(scene, audio) {
        super();
        this.scene = scene;
        this.meshes = [];
        this.sound = this.AddComponent(new SoundEffects(audio));
        this.water = new SurfaceMaterial({ preset: 'water', albedoColor: '#184650', metallic: 0, reflection: 1, planarReflection: true, waterDepth: 0.55 });
        const stone = new SurfaceMaterial({ preset: 'stone', albedoColor: '#606c70', scale: 3, wetness: 0.45 });
        const timber = new SurfaceMaterial({ preset: 'wood', albedoColor: '#a36739', scale: 2, wetness: 0.25 });
        const chrome = new SurfaceMaterial({ preset: 'metal', albedoColor: '#bcc9d2', roughness: 0.14 });
        const bronze = new SurfaceMaterial({ preset: 'metal', albedoColor: '#ac7350', roughness: 0.29 });
        const lamp = new UnlitMaterial({ color: '#ffc582' });

        const water = this.AddMesh('Water', this.water, [0, 0, 0], [1, 1, 1],
            PrimitiveMesh.Plane(basin.width, basin.depth));
        water.castShadow = false;
        this.AddMesh('Basin bed', stone, [0, -0.62, 0], [14, 0.6, 11]);
        for (const x of [-5.95, 5.95]) {
            this.AddMesh('Sea wall', stone, [x, 0.05, 0], [0.95, 0.72, 9]);
        }
        this.AddMesh('Quay', stone, [0, 0.15, -4.68], [13, 0.9, 1.4]);
        this.AddMesh('Quay lip', stone, [0, 0.18, 4.35], [12, 0.45, 0.7]);
        this.AddMesh('Breakwater', stone, [0, -0.2, -9], [29, 1.8, 3.5]);
        this.AddMesh('Breakwater coping', stone, [0, 0.78, -7.4], [29, 0.21, 0.65]);
        this.AddMesh('Guardrail', bronze, [0, 1.86, -7.45], [28, 0.08, 0.09]);
        for (let n = -8; n <= 8; n++) {
            this.AddMesh('Rail post', bronze, [n * 1.65, 1.34, -7.45], [0.085, 1.05, 0.085]);
        }
        for (const x of [-11, -7.5, 7.5, 11]) {
            this.AddMesh('Breakwater pier', stone, [x, 1.1, -9.2], [0.9, 3.6, 0.9]);
            this.AddMesh('Pier cap', stone, [x, 2.93, -9.2], [1.2, 0.24, 1.2]);
        }
        for (let n = 0; n < 19; n++) {
            const x = (n - 9) * 0.6;
            this.AddMesh('Deck plank', timber, [x, 0.66, -4.66], [0.58, 0.15, 1.15]);
        }
        for (const x of [-4.8, 4.8]) {
            this.AddMesh('Light stanchion', bronze, [x, 1.8, -4.65], [0.17, 2.4, 0.18]);
            this.AddMesh('Beacon', lamp, [x, 3.08, -4.65], [0.47, 0.2, 0.36]).castShadow = false;
        }

        this.samples = ['Metal', 'Stone', 'Wood'].map((name, i) => {
            const x = (i - 1) * 2.9;
            this.AddMesh('Plinth', stone, [x, 0.25, -1.38], [1.8, 1.05, 1.8]);
            this.AddMesh('Sample mount', bronze, [x, 0.8, -1.38], [1.48, 0.16, 1.48]);
            return this.AddMesh(name, [chrome, stone, timber][i], [x, i === 1 ? 1.46 : 1.63, -1.38],
                i === 1 ? [1.16, 1.16, 1.16] : [1, 1, 1], i === 1 ? block : orb);
        });
        for (const sample of this.samples) sample.transform.rotation.y = 0.3;

        const onWater = (x, z) => Math.abs(x) < basin.width / 2 && Math.abs(z) < basin.depth / 2;
        const heightAt = (x, z) => {
            if (!onWater(x, z)) return 0.55;
            for (const sample of this.samples) {
                const [cx, cy, cz] = sample.transform.position;
                const dx = Math.abs(x - cx), dz = Math.abs(z - cz);
                if (dx >= 0.9 || dz >= 0.9) continue;
                if (sample.name === 'Stone' && dx < 0.58 && dz < 0.58) return cy + 0.58;
                const radiusSquared = 0.75 ** 2 - dx ** 2 - dz ** 2;
                if (sample.name !== 'Stone' && radiusSquared > 0) return cy + Math.sqrt(radiusSquared);
                return 0.88;
            }
            return 0;
        };
        this.AddComponent(new SurfaceAnimator([this.water]));
        this.rain = this.AddComponent(new RainEmitter({
            count: 360, seed: 61, bounds: { width: 14, depth: 11, height: 10 },
            speed: 16,
            heightAt,
            onImpact: point => {
                if (point.y === 0 && this.rain.impacts % 19 === 0) this.water.AddRipple(point, 0.32);
            },
        }));
        this.batch = this.AddComponent(new RainRenderer(scene, this.rain));
        this.batch.mesh.reflect = false;
        this.wet = this.AddComponent(new WetSurfaceResponse(this.rain, [stone, timber], { drying: 0.12 }));
        this.SetRain(0.62);
    }

    AddMesh(name, material, position, scale, geometry = block) {
        const mesh = new Mesh({ name, geometry, material });
        mesh.transform.SetPosition(...position);
        mesh.transform.SetScale(...scale);
        this.meshes.push(this.scene.Add(mesh));
        return mesh;
    }

    SetRain(intensity) {
        this.intensity = intensity;
        this.rain.enabled = this.batch.mesh.visible = intensity > 0;
        this.rain.SetIntensity(intensity);
        this.wet.wetting = intensity * 0.25;
    }

    ToggleRain() {
        this.SetRain(this.rain.enabled ? 0 : 0.62);
    }

    OnDestroy() {
        for (const mesh of this.meshes) this.scene.Remove(mesh);
        super.OnDestroy();
    }
}
