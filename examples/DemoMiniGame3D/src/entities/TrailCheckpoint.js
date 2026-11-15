import { Vector3D } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, UnlitMaterial } from 'gameforgejs/3d';

export class TrailCheckpoint {
    constructor(scene, platform, playerDefinition) {
        if (platform.definition.motion || platform.definition.blink) {
            throw new Error(`Checkpoint '${platform.definition.id}' requires a permanent, stationary platform.`);
        }
        this.scene = scene;
        this.platform = platform;
        const position = Vector3D.FromArray(platform.mesh.transform.position);
        position.y += platform.definition.size.y / 2;
        this.respawn = position.AddValue(new Vector3D(0,
            playerDefinition.collider.radius - playerDefinition.collider.offset.y + 0.08, 0));
        this.mesh = new Mesh({ name: 'Checkpoint', geometry: PrimitiveMesh.Ring(0.6, 0.72),
            material: new UnlitMaterial({ color: '#ffc66b' }), castShadow: false });
        this.mesh.transform.SetPosition(position.x, position.y + 0.025, position.z);
        scene.Add(this.mesh);
        this.Reset();
    }

    TryActivate(player) {
        if (this.active || !player.body.grounded || player.body.groundBody !== this.platform.body) return false;
        this.active = true;
        this.mesh.material.albedoColor = [0.2, 1, 0.65, 1];
        return true;
    }

    Reset() {
        this.active = false;
        this.mesh.material.albedoColor = [1, 0.75, 0.2, 1];
    }

    OnDestroy() {
        this.scene.Remove(this.mesh);
    }
}
