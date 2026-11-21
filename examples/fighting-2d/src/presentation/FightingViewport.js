import { GameViewport, Input, Touch, ResponsiveLayout } from 'gameforgejs/core';
/** Keep the authored arena coordinates while fitting a native responsive Screen. */
export class FightingViewport {
    constructor(screen, { combat = false } = {}) {
        this.screen = screen;
        this.combat = combat;
        this.layout = new ResponsiveLayout(960, 540);
        this.release = GameViewport.Bind(screen, { maxWidth: 1440 });
    }
    Layout() {
        const reserve = Input.instance.presentation.TouchVisible ? (this.combat ? 220 : 120) : 0;
        return this.layout.Fit(this.screen.Width, this.screen.Height, { reserveBottom: Math.min(reserve, this.screen.Height * 0.45) });
    }
    Begin() { const v = this.Layout(), ctx = this.screen.Context; ctx.save(); ctx.translate(v.x, v.y); ctx.scale(v.scale, v.scale); }
    End() { this.screen.Context.restore(); }
    PointerStarts() {
        const input = Input.instance, points = input.touch.GetStartedTouches().map(contact => contact.startPosition);
        if (input.mouse.buttonsDown[0])
            points.push(input.mouse.position);
        const v = this.Layout();
        return points.map(point => Touch.ToScreen(point, this.screen)).map(point => this.layout.ToWorld(point, v));
    }
    Dispose() { this.release(); }
}
