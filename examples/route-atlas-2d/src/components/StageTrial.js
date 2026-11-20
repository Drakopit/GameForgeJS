import { Component, Vector2D } from 'gameforgejs/core';

/** A small playable stage proves entry, completion and graph-unlock events. */
export class StageTrial extends Component {
    constructor(level) { super(); this.level = level; this.position = new Vector2D(150, 340); this.collected = new Set(); this.time = 0; }
    OnStart() { this.removeListener = this.level.events.on('stage:entered', () => this.Start()); }
    Start() { this.position.Set(150, 340); this.collected.clear(); this.time = 0; }
    GetShards() { return [new Vector2D(350, 220), new Vector2D(620, 420), new Vector2D(800, 250)]; }
    GetHazards() { return [new Vector2D(480, 310 + Math.sin(this.time * 1.6) * 150), new Vector2D(720 + Math.sin(this.time) * 130, 340)]; }
    OnUpdate(dt) {
        if (this.level.mode !== 'stage') return;
        this.time += dt;
        const direction = this.level.hud.Direction();
        this.position.Copy(this.position.Add(direction.MultiplyScalar(this.level.rules.trialSpeed * dt)));
        this.position.Set(Math.max(105, Math.min(875, this.position.x)), Math.max(150, Math.min(510, this.position.y)));
        this.GetShards().forEach((point, index) => { if (!this.collected.has(index) && point.DistanceTo(this.position) < 32) {this.collected.add(index);this.level.sound.Play('collect');} });
        if (this.GetHazards().some(point => point.DistanceTo(this.position) < 34)) {this.position.Set(150, 340);this.level.sound.Play('hit');}
        if (this.collected.size === 3) {
            this.level.mode = 'map'; this.level.events.emit('stage:cleared', this.level.progress.current);
        }
    }
    OnDestroy() { this.removeListener?.(); }
}
