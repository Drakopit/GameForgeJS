// @ts-check
import { PlanarReflection2D } from 'gameforgejs/2d';

/** Canvas planar reflection with animated strip displacement, not SSR or fluid simulation. */
export class WaterPass {
    /** @param {import('../entities/FoundryWorld.js').FoundryWorld} world */
    constructor(world) { this.world = world; }
    Draw() {
        const w = this.world, ctx = w.target.Context, floor = Math.round(w.surfaceY);
        const height = w.height - floor, motion = w.settings.reducedMotion ? 0 : w.age;
        ctx.save(); ctx.fillStyle = '#06121a'; ctx.fillRect(0, floor, w.width, height);
        if (w.settings.current.reflection) {
            PlanarReflection2D.Draw(ctx,w.target.Canvas,{width:w.width,height:w.height,waterY:floor,time:motion,
                displacement:row=>w.water.rings.reduce((shift,ring)=>{
                    if(!ring.active||Math.abs(floor+row-ring.y)>ring.radius*ring.stretch)return shift;
                    return shift+Math.sin(row*0.5-ring.age*16)*ring.power*(1-ring.age/ring.life);
                },0)});
        }
        ctx.globalAlpha = 1;
        const tint = ctx.createLinearGradient(0, floor, 0, w.height);
        tint.addColorStop(0, 'rgba(6,24,30,0.2)'); tint.addColorStop(1, 'rgba(2,9,16,0.85)');
        ctx.fillStyle = tint; ctx.fillRect(0, floor, w.width, height);
        ctx.strokeStyle = 'rgba(104,159,159,0.09)'; ctx.lineWidth = 1;
        for (let index = -4; index < 10; index++) {
            ctx.beginPath(); ctx.moveTo(w.width * 0.5 + index * 48, floor);
            ctx.lineTo(w.width * 0.5 + index * 180, w.height); ctx.stroke();
        }
        for (const fraction of [0.12, 0.3, 0.57, 0.93]) {
            ctx.beginPath(); ctx.moveTo(0, floor + height * fraction); ctx.lineTo(w.width, floor + height * fraction); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(248,181,92,0.25)'; ctx.fillRect(0, floor, w.width, 1);
        w.water.Draw(ctx); ctx.restore();
    }
}
