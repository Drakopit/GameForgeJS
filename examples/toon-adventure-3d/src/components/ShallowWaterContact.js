import { Component } from 'gameforgejs/core';

export class ShallowWaterContact extends Component {
    constructor(zones) {
        super();
        this.zones = zones;
        this.zone = null;
    }

    OnFixedUpdate() {
        this.zone = this.owner.health.IsAlive()
            ? this.zones.find(zone => zone.ContainsFeet(this.owner)) ?? null
            : null;
    }

    get speedMultiplier() {
        return this.zone?.movementMultiplier ?? 1;
    }

    Reset() {
        this.zone = null;
    }

    OnDetach() {
        this.Reset();
        this.zones = [];
        super.OnDetach();
    }
}
