import { Mesh, PrimitiveMesh, StandardMaterial, UnlitMaterial } from 'gameforgejs/3d';

export class TrailScenery {
    constructor(scene, platforms, theme) {
        this.scene = scene;
        this.attachments = [];
        this.meshes = [];
        const rock = PrimitiveMesh.Sphere(1, { widthSegments: 7, heightSegments: 4 });
        const cube = PrimitiveMesh.Cube(1);
        const stone = new StandardMaterial({ albedoColor: theme.stone, roughness: 1 });
        const accent = new UnlitMaterial({ color: theme.accent });
        for (const platform of platforms.platforms) {
            const { size } = platform.definition;
            this.Attach(platform, rock, stone, [0, -size.y / 2 - 0.55, 0], [size.x * 0.45, 1, size.z * 0.43]);
            // Narrow colored rails make landing surfaces readable against the sky.
            for (const side of [-1, 1]) {
                this.Attach(platform, cube, accent, [side * (size.x / 2 - 0.1), size.y / 2 + 0.015, 0], [0.07, 0.025, size.z * 0.85]);
            }
        }
        const cloudGeometry = PrimitiveMesh.Sphere(1, { widthSegments: 10, heightSegments: 6 });
        const cloudMaterial = new UnlitMaterial({ color: '#d9eafa' });
        for (let i = 0; i < 8; i++) {
            const cloud = new Mesh({ geometry: cloudGeometry, material: cloudMaterial, castShadow: false });
            cloud.transform.SetPosition(i % 2 ? -11 : 12, -3 - i % 3, 4 - i * 4);
            cloud.transform.SetScale(3 + i % 3, 0.7, 1.7);
            this.Add(cloud);
        }
        this.Update();
    }

    Add(mesh) {
        this.scene.Add(mesh);
        this.meshes.push(mesh);
    }

    Attach(platform, geometry, material, offset, scale) {
        const mesh = new Mesh({ geometry, material, castShadow: false });
        mesh.transform.SetScale(...scale);
        this.attachments.push({ platform, mesh, offset });
        this.Add(mesh);
    }

    Update() {
        for (const { platform, mesh, offset } of this.attachments) {
            const position = platform.mesh.transform.position;
            mesh.transform.SetPosition(position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]);
            mesh.visible = platform.active;
        }
    }

    OnDestroy() {
        for (const mesh of this.meshes) this.scene.Remove(mesh);
    }
}
