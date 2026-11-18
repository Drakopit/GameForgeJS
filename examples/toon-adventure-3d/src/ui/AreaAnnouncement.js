import { AreaTitleSettings } from '../data/PresentationSettings.js';
export class AreaAnnouncement {
    constructor(draw) {
        this.draw = draw;
        this.name = '';
        this.age = 0;
    }

    Show(name) {
        this.name = name;
        this.age = 0;
    }

    OnUpdate(dt, name) {
        if (name !== this.name) this.Show(name);
        else this.age += dt;
    }

    get opacity() {
        const progress = Math.max(0, Math.min(1, (this.age - AreaTitleSettings.holdSeconds) / AreaTitleSettings.fadeSeconds));
        return 1 - progress * progress * (3 - 2 * progress);
    }

    Draw(width) {
        if (this.opacity <= 0) return;
        this.draw.SetTextAlign('center');
        this.draw.FontSize = '38px';
        this.draw.Color = `rgba(12, 35, 43, ${this.opacity})`;
        this.draw.DrawText(this.name, width / 2 + 2, 164, width - 40);
        this.draw.Color = `rgba(255, 240, 202, ${this.opacity})`;
        this.draw.DrawText(this.name, width / 2, 162, width - 40);
        this.draw.SetTextAlign('left');
    }
}
