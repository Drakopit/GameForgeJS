// @ts-check
import { BoundsComponent, LifetimeComponent, VelocityComponent } from 'gameforgejs/core';
import { GameObject } from 'gameforgejs/2d';
import { PropForces } from '../components/PropForces.js';
import { WaterContact } from '../components/WaterContact.js';
import { PropVisual } from '../components/PropVisual.js';

const PROP_LIFETIME_SECONDS = 12;

/** Dynamic circle with existing framework velocity/bounds and separate response/render components. */
export class FoundryProp extends GameObject {
    /** @param {import('./FoundryWorld.js').FoundryWorld} world */
    constructor(world) {
        super();
        this.world = world; this.active = false; this.enabled = false; this.radius = 18; this.mass = 1;
        this.rotation = 0; this.spin = 0;
        this.forces = this.AddComponent(new PropForces(this, world));
        /** @type {VelocityComponent} */
        this.velocity = this.AddComponent(new VelocityComponent({ useFixedUpdate: true, friction: 0.13, maxSpeedX: 500, maxSpeedY: 700 }));
        this.bounds = this.AddComponent(new BoundsComponent());
        /** @type {LifetimeComponent} */
        this.lifetime = this.AddComponent(new LifetimeComponent({ duration: PROP_LIFETIME_SECONDS,
            onExpire: () => this.SetActive(false) }));
        this.AddComponent(new WaterContact(this, world));
        this.AddComponent(new PropVisual(this, world));
        this.SetActive(false);
    }
    /** @param {boolean} active */
    SetActive(active) {
        this.active = active; this.enabled = active; this.forces.enabled = active; this.velocity.enabled = active;
        this.lifetime.enabled = active;
    }
    /** @param {number} x @param {number} y @param {number} vx @param {number} vy */
    Launch(x, y, vx, vy) {
        this.radius = this.world.random.Range(13, 24); this.mass = this.radius / 15;
        this.size.Set(this.radius * 2, this.radius * 2);
        this.bounds.width = this.size.x; this.bounds.height = this.size.y;
        this.position.Set(x - this.radius, Math.min(y - this.radius, this.world.surfaceY - this.radius * 2 - 1));
        this.velocity.SetVelocity(vx, vy); this.rotation = 0;
        this.spin = this.world.random.Range(-4, 4); this.lifetime.Reset(); this.SetActive(true);
    }
}
