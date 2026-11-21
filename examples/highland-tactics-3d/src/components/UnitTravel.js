import { Component, Vector3D } from 'gameforgejs/core';
import { MapScale, BattleRules } from '../data/BattleRules.js';
/** Path animation is an ECS component; turn rules commit only on arrival. */
export class UnitTravel extends Component {
    constructor(grid) { super(); this.grid = grid; this.path = []; this.position = new Vector3D(); }
    World(tile) { return new Vector3D((tile.col - (this.grid.cols - 1) / 2) * MapScale.tile, MapScale.base + tile.h * MapScale.elevation, (tile.row - (this.grid.rows - 1) / 2) * MapScale.tile); }
    Snap() { this.position.Copy(this.World(this.grid.Get(this.owner.stats.col, this.owner.stats.row))); this.path = []; this.done = null; }
    OnStart() { this.Snap(); }
    Follow(path, done) { this.path = [...path]; this.done = done; this.progress = 0; this.legStart = this.position.Clone(); }
    OnUpdate(dt) {
        if (!this.path.length)
            return;
        const tile = this.path[0], target = this.World(tile), delta = target.Subtract(this.legStart), distance = delta.Length();
        this.owner.stats.facing = BattleRules.Facing(this.owner.stats, tile);
        this.progress = Math.min(1, this.progress + dt * 3.8 / Math.max(0.01, distance));
        this.position.Copy(this.legStart.Add(delta.MultiplyScalar(this.progress)));
        const gap = Math.abs(tile.col - this.owner.stats.col) + Math.abs(tile.row - this.owner.stats.row) > 1;
        if (gap)
            this.position.y += Math.sin(this.progress * Math.PI) * 0.65;
        if (this.progress === 1) {
            this.position.Copy(target);
            this.owner.stats.col = tile.col;
            this.owner.stats.row = tile.row;
            this.path.shift();
            this.legStart = this.position.Clone();
            this.progress = 0;
            if (!this.path.length) {
                const done = this.done;
                this.done = null;
                done?.();
            }
        }
    }
}
