import { Component } from 'gameforgejs/core';
import { WarpSettings as Settings } from '../data/WarpSettings.js';

export class WarpTravel extends Component {
    constructor(points, onTravel) {
        super();
        this.points = points;
        this.onTravel = onTravel;
        this.Reset();
    }

    Reset() {
        this.cooldown = 0;
        this.arrival = null;
        this.trips = 0;
    }

    OnFixedUpdate(dt) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (!this.owner.health.IsAlive()) return;
        if (this.arrival) {
            if (!this.arrival.Contains(this.owner)) this.arrival = null;
            return;
        }
        if (this.cooldown > 0) return;
        const origin = this.points.find(point => point.Contains(this.owner));
        const destination = origin && this.points.find(point => point.definition.id === origin.definition.destination);
        if (!destination) return;
        const actor = this.owner;
        actor.transform.SetPosition(destination.position.x, actor.body.collider.radius, destination.position.z);
        actor.rigidbody.velocity.fill(0);
        actor.moveX = actor.moveZ = 0;
        actor.attackRequested = false;
        actor.attack.Reset();
        actor.waterContact.Reset();
        this.arrival = destination;
        this.cooldown = Settings.cooldownSeconds;
        this.trips++;
        this.onTravel(destination.name);
    }

    OnDetach() {
        this.points = [];
        this.onTravel = null;
        super.OnDetach();
    }
}
