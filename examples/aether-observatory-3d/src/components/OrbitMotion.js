import { Component, Vector3D } from 'gameforgejs/core';

export class OrbitMotion extends Component {
    constructor(mesh, {center = new Vector3D(), radius = 0, speed = 0.3, phase = 0, bob = 0} = {}) {
        super(); Object.assign(this, {mesh, center, radius, speed, phase, bob}); this.time = 0;
    }
    OnUpdate(dt) {
        this.time += dt;
        const angle = this.phase + this.time * this.speed;
        this.mesh.transform.SetPosition(this.center.x + Math.cos(angle) * this.radius,
            this.center.y + Math.sin(angle * 2) * this.bob, this.center.z + Math.sin(angle) * this.radius);
        this.mesh.transform.rotation.y = angle;
    }
}
