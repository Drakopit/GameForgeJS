/** Small native Canvas backdrop; camera parallax does not alter physics coordinates. */
export class PlatformerScenery {
    Draw(level) {
        const ctx = level.screen.Context, w = level.screen.Width, h = level.screen.Height;
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#173d58');
        sky.addColorStop(1, '#9dc8af');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#f9dfa6';
        ctx.beginPath();
        ctx.arc(w * 0.77, h * 0.27, 34, 0, Math.PI * 2);
        ctx.fill();
        for (let layer = 0; layer < 2; layer++) {
            ctx.fillStyle = layer ? '#356c73' : '#60938c';
            for (let i = -1; i < 6; i++) {
                const x = i * 280 - (level.player.position.x * (layer ? 0.13 : 0.06)) % 280;
                ctx.beginPath();
                ctx.moveTo(x - 120, h);
                ctx.lineTo(x + 100, h * (layer ? 0.55 : 0.36));
                ctx.lineTo(x + 350, h);
                ctx.fill();
            }
        }
    }
}
