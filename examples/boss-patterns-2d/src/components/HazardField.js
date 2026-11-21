import { Component, Vector2D } from 'gameforgejs/core';
import { CircleHit } from '../data/CombatMath.js';

export class HazardField extends Component {
    constructor(level) { super(); this.level = level; this.hazards = []; }
    Add(position) {
        if (this.hazards.length < this.level.rules.hazards.capacity) this.hazards.push({position: Vector2D.FromObject(position), age: 0});
    }
    OnFixedUpdate(dt) {
        if (this.level.result) return;
        const rules = this.level.rules.hazards;
        for (const hazard of this.hazards) {
            hazard.age += dt;
            if (hazard.age >= rules.delay && CircleHit(hazard.position, rules.radius, this.level.player.position, this.level.player.radius)) this.level.player.health.Damage(1, hazard);
        }
        this.hazards = this.hazards.filter(hazard => hazard.age < rules.delay + rules.duration);
    }
    Draw(ctx) {
        const rules = this.level.rules.hazards;
        for (const hazard of this.hazards) {
            ctx.fillStyle = hazard.age < rules.delay ? '#efa66a33' : '#e7735377'; ctx.strokeStyle = '#ffd490'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(hazard.position.x, hazard.position.y, rules.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
    }
}
