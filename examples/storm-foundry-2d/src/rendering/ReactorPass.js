// @ts-check

/** Procedural emissive industrial fixture; the emitter is a visible interaction target. */
export class ReactorPass {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(world) { this.world = world; }
    /** @param {import('../data/FoundryTypes.js').PaintContext} ctx */
    Draw(ctx) {
        const w = this.world, x = w.emitter.x, y = w.emitter.y;
        const radius = Math.min(82, w.width * 0.11, w.height * 0.12);
        const floor = w.surfaceY;
        ctx.save();
        const column = ctx.createLinearGradient(x - radius, 0, x + radius, 0);
        column.addColorStop(0, '#0b1720'); column.addColorStop(0.45, '#233b44'); column.addColorStop(1, '#08121c');
        ctx.fillStyle = column; ctx.strokeStyle = '#46636b'; ctx.lineWidth = 1;
        ctx.fillRect(x - radius * 0.7, y + radius * 0.6, radius * 1.4, floor - y - radius * 0.6);
        ctx.strokeRect(x - radius * 0.7, y + radius * 0.6, radius * 1.4, floor - y - radius * 0.6);
        for (let index = 0; index < 6; index++) {
            ctx.fillStyle = index % 2 ? '#a77543' : '#24393d';
            ctx.fillRect(x - radius * 0.7, floor - 20 - index * 12, radius * 1.4, 4);
        }
        ctx.fillStyle = '#0b171e'; ctx.strokeStyle = '#779295'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x - radius - 28, floor - 14, radius * 2 + 56, 14, 3); ctx.fill(); ctx.stroke();
        ctx.translate(x, y);
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.6);
        halo.addColorStop(0, 'rgba(95,217,207,0.22)'); halo.addColorStop(1, 'rgba(25,136,148,0)');
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, radius * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#07101a'; ctx.lineWidth = radius * 0.42;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#405962'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2); ctx.stroke();
        for (let index = 0; index < 24; index++) {
            const angle = index / 24 * Math.PI * 2;
            ctx.strokeStyle = index % 3 ? '#588b8d' : '#f4ba6a'; ctx.lineWidth = index % 3 ? 2 : 4;
            ctx.beginPath(); ctx.moveTo(Math.cos(angle) * radius * 0.85, Math.sin(angle) * radius * 0.85);
            ctx.lineTo(Math.cos(angle) * radius * 1.14, Math.sin(angle) * radius * 1.14); ctx.stroke();
        }
        ctx.rotate(w.settings.reducedMotion ? 0 : w.age * 0.3);
        ctx.strokeStyle = '#8ff4dd'; ctx.lineWidth = 3;
        for (let index = 0; index < 3; index++) {
            ctx.beginPath(); ctx.arc(0, 0, radius * 0.62, index * 2.1, index * 2.1 + 1.5); ctx.stroke();
        }
        ctx.fillStyle = '#edcf8d'; ctx.beginPath(); ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}
