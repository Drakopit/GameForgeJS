import { Component } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, ToonMaterial, Transform3D } from 'gameforgejs/3d';
/** Original low-poly pawns with a cape, shield and forward-pointing weapon. */
export class UnitVisual extends Component {
    constructor(scene, color) {
        super();
        this.scene = scene;
        this.root = new Transform3D();
        this.meshes = [];
        const cloth = new ToonMaterial({ albedoColor: color }), skin = new ToonMaterial({ albedoColor: '#f4d7aa' }), steel = new ToonMaterial({ albedoColor: '#c1d4d7' });
        const parts = [
            { p: [0, 0.37, 0], s: [0.35, 0.44, 0.27], m: cloth },
            { p: [0, 0.74, 0], s: [0.3, 0.3, 0.3], m: skin },
            { p: [0, 0.91, 0.02], s: [0.4, 0.12, 0.34], m: cloth },
            { p: [-0.12, 0.08, 0], s: [0.12, 0.18, 0.17], m: steel },
            { p: [0.12, 0.08, 0], s: [0.12, 0.18, 0.17], m: steel },
            { p: [0, 0.38, 0.17], s: [0.43, 0.5, 0.06], m: cloth },
            { p: [-0.26, 0.4, -0.06], s: [0.08, 0.3, 0.27], m: steel },
            { p: [0.25, 0.4, -0.27], s: [0.055, 0.055, 0.55], m: steel },
        ];
        for (const part of parts) {
            const mesh = new Mesh({ geometry: PrimitiveMesh.Cube(1), material: part.m, transform: new Transform3D({ parent: this.root, position: part.p, scale: part.s }) });
            this.meshes.push(mesh);
        }
        this.cloth = cloth;
        this.original = [...cloth.albedoColor];
    }
    OnStart() { for (const mesh of this.meshes)
        this.scene.Add(mesh); }
    OnUpdate() {
        const stats = this.owner.stats, p = this.owner.travel.position;
        this.root.SetPosition(p.x, p.y, p.z);
        this.root.rotation.y = -stats.facing * Math.PI / 2;
        this.cloth.albedoColor = stats.flash > 0 ? [1, 0.8, 0.6, 1] : this.original;
        for (const mesh of this.meshes)
            mesh.visible = stats.hp > 0;
    }
    OnDestroy() { for (const mesh of this.meshes)
        this.scene.Remove(mesh); }
}
