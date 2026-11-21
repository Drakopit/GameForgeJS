// @ts-check
import { ActionManager, Input, Touch, Vector2D } from 'gameforgejs/core';

/** Framework-owned devices only. A drag's displacement becomes a bounded launch impulse. */
export class FoundryInput {
    /** @param {import('../levels/FoundryLevel.js').FoundryLevel} level */
    constructor(level) {
        this.level = level;
        this.aim = new Vector2D(level.world.emitter.x, level.world.emitter.y - 80);
        /** @type {Vector2D | null} */ this.dragStart = null;
        /** @type {number | null} */ this.finger = null;
    }
    /** @param {number} dt @param {boolean} wasOpen */
    Update(dt, wasOpen) {
        const level = this.level, world = level.world;
        if (ActionManager.IsActionDown('DEBUG')) level.model.debug = !level.model.debug;
        if (ActionManager.IsActionDown('TELEMETRY')) level.model.telemetry = !level.model.telemetry;
        if (ActionManager.IsActionDown('HELP')) level.hud.help = !level.hud.help;
        if (ActionManager.IsActionDown('PREVIOUS')) level.SetPreset(level.model.presetIndex - 1);
        if (ActionManager.IsActionDown('NEXT')) level.SetPreset(level.model.presetIndex + 1);
        if (ActionManager.IsActionDown('RESET')) level.Reset();
        if (level.hud.panel.open || wasOpen || level.hud.help || !document.hasFocus()) { this.Cancel(); return; }
        if (ActionManager.IsActionDown('DROP')) world.Drop(this.aim.x, this.aim.y);
        if (ActionManager.IsActionDown('BURST')) world.Burst();
        if (ActionManager.IsActionDown('GUST')) world.Gust();
        const input = Input.instance;
        const mouse = input?.mouse, touch = input?.touch;
        if (!mouse || !touch) return;
        const axisX = Input.GetGamepadAxis(0, 'RIGHT_X'), axisY = Input.GetGamepadAxis(0, 'RIGHT_Y');
        if (Math.abs(axisX) + Math.abs(axisY) > 0.2) {
            this.aim.x = Math.max(20, Math.min(world.width - 20, this.aim.x + axisX * dt * 350));
            this.aim.y = Math.max(120, Math.min(world.surfaceY - 25, this.aim.y + axisY * dt * 350));
        }
        const point = mouse.getPositionRelative(level.screen.Canvas);
        if (mouse.buttonsDown?.[0] && !level.hud.panel.Contains(point)) this.dragStart = point.Clone();
        if (this.dragStart && this.finger === null) this.aim.Copy(point);
        if (mouse.buttonsUp?.[0] && this.dragStart && this.finger === null) this.Release(point);
        for (const contact of touch.GetStartedTouches()) {
            const position = Touch.ToScreen(contact.position, level.screen);
            if (!level.hud.panel.Contains(position) && this.finger === null) { this.finger = contact.identifier; this.dragStart = position; }
        }
        if (this.finger !== null) {
            const contact = touch.GetTouch(this.finger);
            if (contact) this.aim.Copy(Touch.ToScreen(contact.position, level.screen));
            for (const ended of touch.GetEndedTouches()) if (ended.identifier === this.finger) {
                if (ended.cancelled) this.Cancel(); else this.Release(Touch.ToScreen(ended.position, level.screen));
            }
            if (!contact && this.finger !== null) this.Cancel();
        }
    }
    /** @param {Vector2D} point */
    Release(point) {
        if (!this.dragStart) return;
        const dx = point.x - this.dragStart.x, dy = point.y - this.dragStart.y;
        const moving = Math.abs(dx) + Math.abs(dy) > 12;
        this.level.world.Drop(this.dragStart.x, this.dragStart.y,
            moving ? Math.max(-500, Math.min(500, dx * 3)) : 70,
            moving ? Math.max(-550, Math.min(550, dy * 3)) : -180);
        this.aim.Copy(point); this.Cancel();
    }
    Cancel() { this.dragStart = null; this.finger = null; }
    Draw() {
        if (!this.dragStart) return;
        const ctx = this.level.screen.Context;
        if (!ctx) return;
        ctx.save(); ctx.strokeStyle = '#f4cb92'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(this.dragStart.x, this.dragStart.y); ctx.lineTo(this.aim.x, this.aim.y); ctx.stroke();
        ctx.setLineDash([]); ctx.beginPath(); ctx.arc(this.dragStart.x, this.dragStart.y, 14, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
}
