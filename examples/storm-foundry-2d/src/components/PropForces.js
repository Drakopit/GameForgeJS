// @ts-check
import { Component } from 'gameforgejs/core';

/** Applies wind/drag before the existing fixed-step VelocityComponent integrates. */
export class PropForces extends Component {
    /** @param {import('../entities/FoundryProp.js').FoundryProp} actor @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(actor, world) { super(); this.actor = actor; this.world = world; }
    /** @param {number} dt */
    OnFixedUpdate(dt) {
        const actor = this.actor;
        if (!actor.active) return;
        actor.rotation += actor.spin * dt;
        actor.velocity.gravity = this.world.settings.current.propGravity;
        actor.velocity.AddImpulse((this.world.settings.current.wind + this.world.gust * 3) * dt / actor.mass, 0);
    }
}
