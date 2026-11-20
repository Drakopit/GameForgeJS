// @ts-check
import { Component } from 'gameforgejs/core';

/** A prop's water response subscribes to contacts; collision resolution stays independent. */
export class WaterContact extends Component {
    /** @param {import('../entities/FoundryProp.js').FoundryProp} actor @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(actor, world) {
        super(); this.actor = actor; this.world = world;
        /** @type {(() => void) | null} */ this.remove = null;
    }
    OnStart() {
        this.remove = this.world.events.on('impact', (/** @type {import('../data/FoundryTypes.js').Impact} */ hit) => {
            if (hit.actor !== this.actor || hit.speed < 75) return;
            if (hit.surface) {
                const strength = Math.min(2.5, hit.speed / 260);
                this.world.water.Impact(hit.point.x, hit.point.y + 4, strength, 0.28);
                this.world.Splash(hit.point.x, hit.point.y, strength);
            }
            this.world.trauma = Math.min(1, this.world.trauma + Math.min(0.2, hit.speed / 2200));
        });
    }
    OnDestroy() { this.remove?.(); this.remove = null; }
}
