// @ts-check
import { Component, Vector2D } from 'gameforgejs/core';

const CONTACT_SLOP = 0.05;
const SOLVER_ITERATIONS = 2;

/** Circle impulses after framework VelocityComponent integration; intentionally not a general rigid-body solver. */
export class PropPhysics extends Component {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(world) { super(); this.world = world; this.contacts = 0; }
    OnFixedUpdate() {
        this.contacts = 0;
        const restitution = this.world.settings.current.restitution;
        const actors = this.world.props;
        for (const a of actors) {
            if (!a.active) continue;
            const floor = this.world.surfaceY - a.size.y;
            if (a.position.y >= floor) {
                const speed = Math.max(0, a.velocity.vy);
                a.position.y = floor; a.velocity.vy = speed < 30 ? 0 : -speed * restitution;
                a.velocity.vx *= 0.96; this.contacts++;
                if (speed > 75) this.world.events.emit('impact', { actor: a,
                    point: new Vector2D(a.position.x + a.radius, this.world.surfaceY), speed, surface: true });
            }
            if (a.position.x < 0) { a.position.x = 0; a.velocity.vx = Math.abs(a.velocity.vx) * restitution; }
            if (a.position.x + a.size.x > this.world.width) {
                a.position.x = this.world.width - a.size.x; a.velocity.vx = -Math.abs(a.velocity.vx) * restitution;
            }
        }
        for (let iteration = 0; iteration < SOLVER_ITERATIONS; iteration++) {
            for (let i = 0; i < actors.length; i++) for (let j = i + 1; j < actors.length; j++) {
                if (actors[i].active && actors[j].active) this.Resolve(actors[i], actors[j]);
            }
        }
    }
    /** @param {import('../entities/FoundryProp.js').FoundryProp} a @param {import('../entities/FoundryProp.js').FoundryProp} b */
    Resolve(a, b) {
        const dx = b.position.x + b.radius - a.position.x - a.radius;
        const dy = b.position.y + b.radius - a.position.y - a.radius;
        const distance = Math.hypot(dx, dy), radii = a.radius + b.radius;
        if (distance >= radii) return;
        const nx = distance > 0 ? dx / distance : 1, ny = distance > 0 ? dy / distance : 0;
        const inverseA = 1 / a.mass, inverseB = 1 / b.mass, total = inverseA + inverseB;
        const correction = Math.max(0, radii - distance - CONTACT_SLOP) / total;
        a.position.x -= nx * correction * inverseA; a.position.y -= ny * correction * inverseA;
        b.position.x += nx * correction * inverseB; b.position.y += ny * correction * inverseB;
        const relative = (b.velocity.vx - a.velocity.vx) * nx + (b.velocity.vy - a.velocity.vy) * ny;
        if (relative >= 0) return;
        const impulse = -(1 + this.world.settings.current.restitution) * relative / total;
        a.velocity.AddImpulse(-impulse * nx * inverseA, -impulse * ny * inverseA);
        b.velocity.AddImpulse(impulse * nx * inverseB, impulse * ny * inverseB);
        this.contacts++;
        if (-relative > 75) this.world.events.emit('impact', { actor: a,
            point: new Vector2D(a.position.x + a.radius, a.position.y + a.radius), speed: -relative, surface: false });
    }
}
