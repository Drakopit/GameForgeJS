import { Vector3D } from 'gameforgejs/core';
import { ScenerySettings as Settings } from '../data/TrailSettings.js';
import { Mesh, PrimitiveMesh, StandardMaterial, UnlitMaterial } from 'gameforgejs/3d';

export class TrailScenery {
    constructor(scene, platforms, theme) {
        this.scene = scene;
        this.attachments = [];
        this.meshes = [];
        const rock = PrimitiveMesh.Sphere(1, Settings.rockSegments);
        const cube = PrimitiveMesh.Cube(1);
        const stone = new StandardMaterial({ albedoColor: theme.stone, roughness: 1 });
        const accent = new UnlitMaterial({ color: theme.accent });
        for (const platform of platforms.platforms) {
            const { size } = platform.definition;
            this.Attach(platform, rock, stone, [0, -size.y / 2 - Settings.rockDrop, 0], [size.x * Settings.rockScale.x, Settings.rockScale.y, size.z * Settings.rockScale.z]);
            // Narrow colored rails make landing surfaces readable against the sky.
            for (const side of [-1, 1]) {
                this.Attach(platform, cube, accent, [side * (size.x / 2 - Settings.railInset), size.y / 2 + Settings.railLift, 0], [Settings.railScale.x, Settings.railScale.y, size.z * Settings.railScale.z]);
            }
        }
        const cloudGeometry = PrimitiveMesh.Sphere(1, Settings.cloudSegments);
        const cloudMaterial = new UnlitMaterial({ color: Settings.cloudColor });
        for (let i = 0; i < Settings.cloudCount; i++) {
            const cloud = new Mesh({ geometry: cloudGeometry, material: cloudMaterial, castShadow: false });
            cloud.transform.SetPosition(i % 2 ? Settings.cloudLeft : Settings.cloudRight, Settings.cloudHeight - i % Settings.cloudVariation, Settings.cloudStartZ - i * Settings.cloudSpacing);
            cloud.transform.SetScale(Settings.cloudScale.x + i % Settings.cloudVariation, Settings.cloudScale.y, Settings.cloudScale.z);
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
        this.attachments.push({ platform, mesh, offset: Vector3D.FromArray(offset) });
        this.Add(mesh);
    }

    Update() {
        for (const { platform, mesh, offset } of this.attachments) {
            const position = Vector3D.FromArray(platform.mesh.transform.position);
            mesh.transform.SetPosition(position.x + offset.x, position.y + offset.y, position.z + offset.z);
            mesh.visible = platform.active;
        }
    }

    OnDestroy() {
        for (const mesh of this.meshes) this.scene.Remove(mesh);
    }
}
