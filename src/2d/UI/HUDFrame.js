const Theme = Object.freeze({
    panel: 'rgba(13, 18, 28, 0.9)', border: 'rgba(233, 221, 165, 0.55)',
    gold: '#dfc57a', text: '#f8f3da', muted: '#aebbd0', track: '#202a3c',
    green: '#3dd58a', red: '#ed786d', radius: 7, padding: 12,
});

/**
 * Compact Canvas HUD drawing primitives sharing the framework Draw/ScreenUI.
 * Methods restore Canvas state and never create a screen or own a game loop.
 * @param {Draw} draw - The screen's existing drawing helper.
 * @param {Object} [theme={}] - Overrides for panel, border, gold, text and track colors.
 */
export class HUDFrame {
    constructor(draw, theme = {}) {
        this.context = draw.screen.Context;
        this.theme = { ...Theme, ...theme };
    }

    Panel({ x, y, width, height }) {
        const ctx = this.context;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, this.theme.radius);
        ctx.fillStyle = this.theme.panel;
        ctx.fill();
        ctx.strokeStyle = this.theme.border;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.045)';
        ctx.fillRect(x, y, width, 17);
        ctx.restore();
    }

    /** @param {string} text @param {number} x @param {number} y @param {{size?: number, color?: string, align?: CanvasTextAlign, weight?: number, maxWidth?: number}} [options] */
    Text(text, x, y, { size = 12, color = this.theme.text, align = 'left', weight = 400, maxWidth } = {}) {
        const ctx = this.context;
        ctx.save();
        ctx.font = `${weight} ${size}px Arial`;
        ctx.textAlign = align;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y, maxWidth);
        ctx.restore();
    }

    Badge(label, x, y, size = 44) {
        const ctx = this.context;
        ctx.save();
        ctx.fillStyle = '#1a2537';
        ctx.strokeStyle = this.theme.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 5);
        ctx.fill(); ctx.stroke();
        ctx.restore();
        this.Text(label, x + size / 2, y + size * 0.64, { size: 18, color: this.theme.gold, align: 'center', weight: 700 });
    }

    Meter(fraction, { x, y, width, height }, color = this.theme.green) {
        const ctx = this.context;
        const fill = Math.max(0, Math.min(1, fraction));
        ctx.save();
        ctx.fillStyle = this.theme.track;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * fill, height);
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(x, y, width * fill, height / 3);
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.strokeRect(x, y, width, height);
        ctx.restore();
    }
}
