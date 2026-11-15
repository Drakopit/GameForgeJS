import { Geometry3D, Mesh, ToonMaterial } from 'gameforgejs/3d';

export class WaterRipples extends Mesh {
    constructor(surface, definition) {
        const segments = 20;
        const positions = new Float32Array(3 * (segments + 1) * 2 * 3);
        const indices = [];
        for (let strip = 0; strip < 3; strip++) {
            for (let segment = 0; segment < segments; segment++) {
                const start = strip * (segments + 1) * 2 + segment * 2;
                indices.push(start, start + 1, start + 2, start + 2, start + 1, start + 3);
            }
        }
        super({
            name: 'Pond ripple highlights',
            geometry: new Geometry3D({ positions, indices }).EnsureNormals(),
            material: new ToonMaterial({ albedoColor: definition.foamColor }),
            castShadow: false,
        });
        this.surface = surface;
        this.segments = segments;
        this.width = definition.width;
        this.depth = definition.depth;
        this.transform.SetPosition(...definition.position);
        this.OnUpdate();
    }

    OnUpdate() {
        const phase = this.surface.phase;
        const positions = this.geometry.positions;
        let index = 0;
        for (let strip = 0; strip < 3; strip++) {
            for (let segment = 0; segment <= this.segments; segment++) {
                const along = segment / this.segments;
                const x = (along - 0.5) * this.width * 0.65;
                const centerZ = (strip - 1) * this.depth * 0.25 + Math.sin(x * 3 + phase + strip) * 0.1;
                const thickness = Math.sin(along * Math.PI) * 0.035;
                for (const side of [-1, 1]) {
                    const z = centerZ + side * thickness;
                    positions[index++] = x;
                    positions[index++] = this.surface.geometry.HeightAt(x, z, phase) + 0.012;
                    positions[index++] = z;
                }
            }
        }
        this.geometry.MarkUpdated();
    }
}
