export class HealthBar {
    constructor(frame, bounds) {
        this.frame = frame;
        this.bounds = bounds;
    }

    Draw(health) {
        const fraction = health.hp / health.maxHp;
        this.frame.Meter(fraction, this.bounds, fraction <= 0.4 ? this.frame.theme.red : this.frame.theme.green);
        const { x, y, width, height } = this.bounds;
        this.frame.Text(`${health.hp} / ${health.maxHp}`, x + width / 2, y + height - 2,
            { size: 10, weight: 700, align: 'center' });
    }
}
