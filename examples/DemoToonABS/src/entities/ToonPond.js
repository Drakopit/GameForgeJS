import { Mesh, PrimitiveMesh, ToonMaterial, BoxCollider3D } from 'gameforgejs/3d';
import { WaterSurface } from '../rendering/WaterSurface.js';
import { WaterRipples } from '../rendering/WaterRipples.js';

export class ToonPond {
    constructor(scene, physics, definition) {
        this.definition = definition;
        this.movementMultiplier = definition.movementMultiplier;
        this.bodies = [];
        this.scene = scene;
        this.physics = physics;
        this.surface = new WaterSurface(definition);
        this.ripples = new WaterRipples(this.surface, definition);
        this.meshes = [this.surface, this.ripples];
        const { width, depth, bankWidth, bankHeight, position } = definition;
        const bankMaterial = new ToonMaterial({ albedoColor: definition.bankColor });
        const edges = [
            { offset: [width / 2 + bankWidth / 2, 0], size: [bankWidth, bankHeight, depth + bankWidth * 2] },
            { offset: [0, -depth / 2 - bankWidth / 2], size: [width, bankHeight, bankWidth] },
            { offset: [0, depth / 2 + bankWidth / 2], size: [width, bankHeight, bankWidth] },
        ];
        for (const edge of edges) {
            const bank = new Mesh({ geometry: PrimitiveMesh.Cube(1), material: bankMaterial });
            bank.transform.SetPosition(position[0] + edge.offset[0], bankHeight / 2, position[2] + edge.offset[1]);
            bank.transform.SetScale(...edge.size);
            this.meshes.push(bank);
            this.bodies.push(physics.AddBody({ object: bank, collider: new BoxCollider3D({ size: edge.size }) }));
        }
        this.materials = [this.surface.material, this.ripples.material, bankMaterial];
        for (const mesh of this.meshes) scene.Add(mesh);
    }

    ContainsFeet(actor) {
        const [x, y, z] = actor.transform.position;
        const { position, width, depth, floorY } = this.definition;
        const feetY = y - actor.body.collider.radius;
        return Math.abs(x - position[0]) < width / 2
            && Math.abs(z - position[2]) < depth / 2
            && feetY >= floorY - 0.08 && feetY < position[1];
    }

    OnUpdate(dt) {
        this.surface.OnUpdate(dt);
        this.ripples.OnUpdate();
    }

    OnDestroy() {
        for (const body of this.bodies) this.physics.RemoveBody(body);
        for (const mesh of this.meshes) this.scene.Remove(mesh);
    }
}
