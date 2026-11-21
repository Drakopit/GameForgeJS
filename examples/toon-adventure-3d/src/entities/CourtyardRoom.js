import { Mesh, PrimitiveMesh, ToonMaterial, BoxCollider3D } from 'gameforgejs/3d';

export class CourtyardRoom {
    constructor(scene, physics, definition) {
        this.scene = scene;
        this.physics = physics;
        this.meshes = [];
        this.bodies = [];
        this.materials = [];

        for (const solid of definition.solids) {
            const mesh = this.CreateMesh(PrimitiveMesh.Cube(1), solid.color, solid.position);
            mesh.transform.SetScale(...solid.size);
            this.bodies.push(physics.AddBody({
                object: mesh,
                collider: new BoxCollider3D({ size: solid.size }),
            }));
        }
        for (const path of definition.paths) {
            const mesh = this.CreateMesh(PrimitiveMesh.Cube(1), '#b4aa80', path.position);
            mesh.transform.SetScale(...path.size);
            mesh.castShadow = false;
        }
    }

    CreateMesh(geometry, color, position) {
        const material = new ToonMaterial({ albedoColor: color });
        const mesh = new Mesh({ geometry, material });
        mesh.transform.SetPosition(...position);
        this.scene.Add(mesh);
        this.meshes.push(mesh);
        this.materials.push(material);
        return mesh;
    }

    OnDestroy() {
        for (const body of this.bodies) this.physics.RemoveBody(body);
        for (const mesh of this.meshes) this.scene.Remove(mesh);
        this.bodies = [];
        this.meshes = [];
    }
}
