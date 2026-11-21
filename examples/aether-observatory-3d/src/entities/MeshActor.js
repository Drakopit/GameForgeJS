import { GameObject } from 'gameforgejs/2d';
import { MeshBinding } from '../components/MeshBinding.js';

/** GameObject provides the existing component lifecycle; meshes own 3D transforms. */
export class MeshActor extends GameObject {
    constructor(scene, mesh, physics = null, rigidbody = null, collider = null) {
        super(); this.mesh = mesh; this.body = rigidbody;
        this.AddComponent(new MeshBinding(scene, mesh, physics, rigidbody, collider));
    }
}
