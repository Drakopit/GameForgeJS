import { Vector2D, Vector3D } from 'gameforgejs/core';
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
        const { width, depth, bankWidth, bankHeight } = definition;
        const position = Vector3D.FromArray(definition.position);
        const bankMaterial = new ToonMaterial({ albedoColor: definition.bankColor });
        if (definition.openBanks) {
            const shore = new Mesh({ geometry: PrimitiveMesh.Cube(1), material: bankMaterial, castShadow: false });
            shore.transform.SetPosition(position.x, bankHeight / 8, position.z);
            shore.transform.SetScale(width + bankWidth * 4, bankHeight / 4, depth + bankWidth * 4);
            this.meshes.push(shore);
        }
        const edges = [
            { offset: [width / 2 + bankWidth / 2, 0], size: [bankWidth, bankHeight, depth + bankWidth * 2] },
            { offset: [0, -depth / 2 - bankWidth / 2], size: [width, bankHeight, bankWidth] },
            { offset: [0, depth / 2 + bankWidth / 2], size: [width, bankHeight, bankWidth] },
        ];
        for (const edge of definition.openBanks ? [] : edges) {
            const bank = new Mesh({ geometry: PrimitiveMesh.Cube(1), material: bankMaterial });
            const offset = Vector2D.FromArray(edge.offset);
            bank.transform.SetPosition(position.x + offset.x, bankHeight / 2, position.z + offset.y);
            bank.transform.SetScale(...edge.size);
            this.meshes.push(bank);
            this.bodies.push(physics.AddBody({ object: bank, collider: new BoxCollider3D({ size: edge.size }) }));
        }
        this.materials = [this.surface.material, this.ripples.material, bankMaterial];
        for (const mesh of this.meshes) scene.Add(mesh);
    }

    ContainsFeet(actor) {
        const feet = Vector3D.FromArray(actor.transform.position);
        const { width, depth, floorY, contactTolerance } = this.definition;
        const position = Vector3D.FromArray(this.definition.position);
        const feetY = feet.y - actor.body.collider.radius;
        return Math.abs(feet.x - position.x) < width / 2
            && Math.abs(feet.z - position.z) < depth / 2
            && feetY >= floorY - contactTolerance && feetY < position.y;
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
