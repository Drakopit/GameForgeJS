import { GameObject } from 'gameforgejs/2d';

export class CrossingLandscape extends GameObject {
    constructor(level) { super(); this.level = level; }
    OnDrawn() {
        const level = this.level, ctx = level.screen.Context;
        const sky = ctx.createLinearGradient(0, 0, 0, level.screen.Height);
        sky.addColorStop(0, '#23334e'); sky.addColorStop(0.65, '#ba776c'); sky.addColorStop(1, '#e6b780');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, level.screen.Width, level.screen.Height);
        level.camera.Begin();
        ctx.fillStyle = '#efd5a0'; ctx.beginPath(); ctx.arc(1240, 150, 65, 0, Math.PI * 2); ctx.fill();
        for (let layer = 0; layer < 3; layer++) {
            ctx.fillStyle = ['#5f6576', '#46576a', '#263f51'][layer];
            for (let index = 0; index < 18; index++) {
                const x = index * 140 - 220, top = 210 + layer * 55 + Math.sin(index * 2.3) * 70;
                ctx.beginPath(); ctx.moveTo(x - 120, 480); ctx.lineTo(x, top); ctx.lineTo(x + 140, 480); ctx.fill();
            }
        }
        ctx.fillStyle = '#1c3d4f'; ctx.fillRect(-100, 450, 2000, 200);
        ctx.fillStyle = '#66a1a0';
        for (let line = 0; line < 9; line++) ctx.fillRect(560 + line % 3 * 70, 480 + line * 13, 400 - line * 20, 2);
        ctx.fillStyle = '#1e323b'; ctx.fillRect(-100, 420, 680, 200); ctx.fillRect(1160, 420, 800, 200);
        for (let plank = 0; plank < 30; plank++) {
            ctx.fillStyle = plank % 2 ? '#c1966c' : '#ae805d'; ctx.fillRect(570 + plank * 20, 417, 18, 14);
        }
        ctx.strokeStyle = '#e0ba83'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(560, 370); ctx.quadraticCurveTo(880, 432, 1180, 370); ctx.stroke();
        for (const x of [180, 480, 1230, 1530]) {
            ctx.fillStyle = '#283c45'; ctx.fillRect(x, 250, 12, 170); ctx.fillRect(x - 12, 250, 36, 5);
            ctx.fillStyle = '#ffe4a0'; ctx.fillRect(x - 3, 265, 18, 25);
        }
        ctx.fillStyle = '#d2b68b'; ctx.fillRect(1450, 275, 20, 145); ctx.fillRect(1550, 275, 20, 145); ctx.fillRect(1440, 270, 140, 20);
        level.camera.End();
    }
}
