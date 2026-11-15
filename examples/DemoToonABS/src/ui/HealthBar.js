export class HealthBar {
    constructor(draw) {
        this.draw = draw;
    }

    Draw(health, x, y, width = 180) {
        const fraction = Math.max(0, Math.min(1, health.hp / health.maxHp));
        this.draw.Color = '#fff0ca';
        this.draw.DrawRect(x, y, width, 18);
        this.draw.Color = '#342f3d';
        this.draw.DrawRect(x + 2, y + 2, width - 4, 14);
        this.draw.Color = fraction <= 0.4 ? '#f07868' : '#64d99b';
        this.draw.DrawRect(x + 2, y + 2, (width - 4) * fraction, 14);
    }
}
