import { ActionManager, Input, Mouse, Touch } from 'gameforgejs/core';

const MATERIALS = ['wood', 'dirt', 'stone', 'grass'];
const JOYSTICK_RADIUS = 44;
const BUTTON_SIZE = 52;
const JOYSTICK_DEAD_ZONE = 0.15;

export class OnlineControls {
    constructor(level) {
        this.level = level; this.screen = level.screen; this.touch = Input.instance.touch;
        this.materialIndex = 0; this.axis = 0; this.jumpPressed = false;
        this.target = null; this.stickId = null; this.buttons = {};
        this.mousePosition = { x: 0, y: 0 };
        this.Layout();
    }
    get Material() { return MATERIALS[this.materialIndex]; }
    get mobile() { return Boolean(Input.instance?.presentation?.TouchVisible); }
    Layout() {
        const scale = this.level.ui.controlScale;
        const size = BUTTON_SIZE * scale, h = this.screen.Height, w = this.screen.Width;
        const landscape = w > h;
        this.stick = { x: 76 * scale, y: h - 85 * scale, radius: JOYSTICK_RADIUS * scale };
        this.buttons = {
            jump: { x: w - size - 18, y: h - size - 20, width: size, height: size, label: 'JUMP' },
            mine: { x: w - size * 2 - 30, y: h - size - 20, width: size, height: size, label: 'MINE' },
            place: { x: w - size - 18, y: h - size * 2 - 32, width: size, height: size, label: 'BUILD' },
            interact: { x: w - size * 2 - 30, y: h - size * 2 - 32, width: size, height: size, label: 'USE' },
            cycle: { x: landscape ? (w - 104) / 2 : 12, y: landscape ? h - 62 : h - 190 * scale,
                width: 104, height: 42, label: this.Material.toUpperCase() },
        };
    }
    Inside(point, box) { return point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height; }
    Update() {
        this.Layout();
        const ui = this.level.ui;
        this.axis = 0; this.jumpPressed = false; this.jumpHeld = false;
        this.pressed = new Set(); this.held = new Set();
        if (!this.level.playing || ui.paused || ui.help.visible || ui.IsTyping || document.hidden || !document.hasFocus()) {
            this.stickId = null; return;
        }
        for (const contact of this.touch.GetStartedTouches()) {
            const point = Touch.ToScreen(contact.position, this.screen);
            const button = this.mobile && Object.entries(this.buttons).find(([, box]) => this.Inside(point, box));
            if (button) this.pressed.add(button[0]);
            else if (this.mobile && point.x < this.screen.Width * 0.45 && point.y > this.screen.Height * 0.55 && this.stickId === null) {
                this.stickId = contact.identifier;
                this.origin = point;
            } else if (point.y > 150) this.target = this.level.WorldTile(point);
        }
        for (const contact of this.touch.GetActiveTouches()) {
            const point = Touch.ToScreen(contact.position, this.screen);
            for (const [id, box] of Object.entries(this.buttons)) if (this.mobile && this.Inside(point, box)) this.held.add(id);
        }
        const stickContact = this.stickId === null ? null : this.touch.GetTouch(this.stickId);
        if (stickContact) {
            const point = Touch.ToScreen(stickContact.position, this.screen);
            const value = (point.x - this.origin.x) / this.stick.radius;
            this.axis = Math.abs(value) < JOYSTICK_DEAD_ZONE ? 0 : Math.max(-1, Math.min(1, value));
        } else this.stickId = null;
        const analog = Input.GetGamepadAxis(0, 'LEFT_X');
        this.axis ||= Math.abs(analog) > JOYSTICK_DEAD_ZONE ? analog
            : Number(ActionManager.IsAction('RIGHT')) - Number(ActionManager.IsAction('LEFT'));
        this.jumpPressed = this.pressed.has('jump') || ActionManager.IsActionDown('JUMP');
        this.jumpHeld = this.held.has('jump') || ActionManager.IsAction('JUMP');
        if (this.pressed.has('cycle') || ActionManager.IsActionDown('NEXT_BLOCK')) this.materialIndex = (this.materialIndex + 1) % MATERIALS.length;
        const mouse = Mouse.instance, point = mouse.getPositionRelative(this.screen.Canvas);
        if (!this.mobile && (point.x !== this.mousePosition.x || point.y !== this.mousePosition.y)) this.target = this.level.WorldTile(point);
        this.mousePosition = point;
        const playerPosition = this.level.player.position;
        const tileSize = this.level.rules.tileSize;
        const targetDistance = this.target ? Math.hypot((this.target.x + 0.5) * tileSize - playerPosition.x,
            (this.target.y + 0.5) * tileSize - playerPosition.y) : Infinity;
        if (!this.target || (this.mobile && targetDistance > this.level.rules.actionReach)) this.target = this.FrontTile();
        const pointerWorld = point.y > 150 && !this.mobile;
        if (ActionManager.IsActionDown('MINE') || this.pressed.has('mine') || (pointerWorld && mouse.buttonsDown?.[0])) this.level.session.Action('mine', this.target);
        if (ActionManager.IsActionDown('PLACE') || this.pressed.has('place') || (pointerWorld && mouse.buttonsDown?.[2])) this.level.session.Action('place', this.target, this.Material);
        if (ActionManager.IsActionDown('INTERACT') || this.pressed.has('interact')) this.level.session.Action('interact');
        if (ActionManager.IsActionDown('AIM_UP')) this.target = { ...this.FrontTile(), y: this.FrontTile().y - 1 };
        if (ActionManager.IsActionDown('AIM_DOWN')) this.target = { ...this.FrontTile(), y: this.FrontTile().y + 1 };
        if (ActionManager.IsActionDown('AIM_FORWARD')) this.target = this.FrontTile();
    }
    FrontTile() {
        const player = this.level.player, rules = this.level.rules;
        const direction = player.GetDisplayState().facingRight ? 1 : -1;
        return { x: Math.floor((player.position.x + rules.playerWidth / 2 + direction * rules.tileSize) / rules.tileSize),
            y: Math.floor((player.position.y + rules.playerHeight / 2) / rules.tileSize) };
    }
    Draw() {
        if (!this.level.playing || !this.mobile || this.level.ui.paused || this.level.ui.IsTyping) return;
        const frame = this.level.ui.frame, ctx = this.screen.Context;
        ctx.save(); ctx.globalAlpha = 0.75;
        const stick = this.stick;
        ctx.fillStyle = '#14293b'; ctx.strokeStyle = '#d5dbac'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(stick.x, stick.y, stick.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(stick.x + this.axis * stick.radius * 0.55, stick.y, stick.radius * 0.4, 0, Math.PI * 2); ctx.fillStyle = '#76d4c8'; ctx.fill();
        for (const box of Object.values(this.buttons)) {
            frame.Panel(box); frame.Text(box.label, box.x + box.width / 2, box.y + box.height / 2 + 4, { align: 'center', size: 11 });
        }
        ctx.restore();
    }
}
