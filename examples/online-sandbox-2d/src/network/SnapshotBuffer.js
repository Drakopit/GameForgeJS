import { MathExt } from 'gameforgejs/core';

const RENDER_DELAY_MS = 100;
const MAX_SNAPSHOTS = 32;

/** Interpolate past snapshots rather than chasing the newest packet every frame. */
export class SnapshotBuffer {
    constructor() { this.frames = []; }
    Push(snapshot, now = performance.now()) {
        this.offset ??= snapshot.serverTime - now;
        this.frames.push(snapshot);
        if (this.frames.length > MAX_SNAPSHOTS) this.frames.shift();
    }
    Sample(now = performance.now()) {
        if (!this.frames.length) return [];
        const time = now + this.offset - RENDER_DELAY_MS;
        while (this.frames.length > 2 && this.frames[1].serverTime <= time) this.frames.shift();
        const first = this.frames[0];
        const next = this.frames[1] ?? first;
        const fraction = Math.max(0, Math.min(1, (time - first.serverTime) / (next.serverTime - first.serverTime || 1)));
        return next.players.map(player => {
            const before = first.players.find(candidate => candidate.id === player.id);
            if (!before || before.spawn !== player.spawn) return player;
            return { ...(fraction < 1 ? before : player), x: MathExt.Lerp(before.x, player.x, fraction),
                y: MathExt.Lerp(before.y, player.y, fraction) };
        });
    }
    Clear() { this.frames = []; this.offset = undefined; }
}
