import { Component } from 'gameforgejs/core';

/** Scene/physics registration belongs to the owning entity's lifecycle. */
export class MeshBinding extends Component {
    constructor(scene, mesh, physics = null, rigidbody = null, collider = null) {
        super(); Object.assign(this, { scene, mesh, physics, rigidbody, collider }); this.record = null;
    }
    OnStart() {
        this.scene.Add(this.mesh);
        if (this.physics) this.record = this.physics.AddBody({object: this.mesh, rigidbody: this.rigidbody, collider: this.collider});
    }
    OnDestroy() { this.scene.Remove(this.mesh); if (this.record) this.physics.RemoveBody(this.record); }
}
