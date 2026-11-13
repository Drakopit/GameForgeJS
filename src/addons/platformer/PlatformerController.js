import { Component } from '../../core/Component.js';
import { ActionManager } from '../../core/Input/ActionManager.js';
import { ValidateBody } from './ValidateBody.js';

const DEFAULTS = Object.freeze({
    speed: 260,
    acceleration: 1800,
    deceleration: 2200,
    gravity: 1600,
    jumpSpeed: 560,
    maxFallSpeed: 900,
    coyoteTime: 0.1,
    jumpBufferTime: 0.12,
    jumpCutRatio: 0.5,
});

/**
 * Attach to a GameObject with position and positive size. OnUpdate captures input;
 * OnFixedUpdate owns movement. The supplied world.Move(body, dt) mutates position
 * and velocity and returns grounded/contact flags. No loop or canvas is created.
 * Set input:null and call SetInput for AI, replay or a custom input implementation.
 */
export class PlatformerController extends Component {
    constructor({ world, input = ActionManager, actions = {}, ...settings } = {}) {
        super();
        if (typeof world?.Move !== 'function') throw new TypeError('PlatformerController requires a world with Move(body, dt).');
        this.world = world;
        this.input = input;
        this.actions = { left: 'LEFT', right: 'RIGHT', jump: 'JUMP', ...actions };
        this.settings = { ...DEFAULTS, ...settings };
        for (const [name, value] of Object.entries(this.settings)) {
            if (!(name in DEFAULTS)) throw new Error(`Unknown platformer setting: ${name}`);
            if (!Number.isFinite(value) || value < 0) throw new RangeError(`Platformer ${name} must be finite and nonnegative.`);
        }
        if (this.settings.gravity === 0 || this.settings.jumpSpeed === 0 || this.settings.maxFallSpeed === 0 || this.settings.jumpCutRatio > 1) {
            throw new RangeError('Gravity, jumpSpeed and maxFallSpeed must be positive; jumpCutRatio must be between 0 and 1.');
        }
        this.Reset();
    }

    OnAttach(owner) {
        this.ReadBody(owner);
        super.OnAttach(owner);
    }

    ReadBody(owner = this.owner) {
        const body = {
            x: owner?.position?.x,
            y: owner?.position?.y,
            width: owner?.size?.x,
            height: owner?.size?.y,
            vx: this.vx,
            vy: this.vy,
            grounded: this.grounded,
        };
        ValidateBody(body);
        return body;
    }

    /** Full input snapshot; jumpPressed is an edge, jumpHeld controls jump height. */
    SetInput({ axis = 0, jumpPressed = false, jumpHeld = false } = {}) {
        if (!Number.isFinite(axis)) throw new TypeError('Platformer input axis must be finite.');
        this.axis = Math.max(-1, Math.min(1, axis));
        this.jumpHeld = Boolean(jumpHeld);
        this.jumpPending ||= Boolean(jumpPressed);
    }

    OnUpdate() {
        if (!this.input) return;
        this.SetInput({
            axis: Number(this.input.IsAction(this.actions.right)) - Number(this.input.IsAction(this.actions.left)),
            jumpPressed: this.input.IsActionDown(this.actions.jump),
            jumpHeld: this.input.IsAction(this.actions.jump),
        });
    }

    OnFixedUpdate(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Platformer delta must be finite and nonnegative.');
        if (!this.owner || dt === 0) return;
        let requested = this.UpdateJumpTimers(dt);
        if (requested && (this.grounded || this.coyoteRemaining > 0)) {
            this.Jump();
            requested = false;
        }

        this.UpdateVelocity(dt);
        this.Move(dt);

        // Consume a buffered press on the landing step, not a later render frame.
        if (requested && this.grounded) {
            this.Jump();
        }
    }

    UpdateJumpTimers(dt) {
        const config = this.settings;
        this.coyoteRemaining = this.grounded ? config.coyoteTime : Math.max(0, this.coyoteRemaining - dt);
        const pressed = this.jumpPending;
        this.jumpPending = false;
        this.bufferRemaining = pressed ? config.jumpBufferTime : Math.max(0, this.bufferRemaining - dt);
        return pressed || this.bufferRemaining > 0;
    }

    UpdateVelocity(dt) {
        const config = this.settings;
        const target = this.axis * config.speed;
        const amount = (this.axis === 0 ? config.deceleration : config.acceleration) * dt;
        this.vx += Math.sign(target - this.vx) * Math.min(Math.abs(target - this.vx), amount);
        this.CutJump();
        this.vy = Math.min(config.maxFallSpeed, this.vy + config.gravity * dt);
    }

    Move(dt) {
        const body = this.ReadBody();
        const contact = this.world.Move(body, dt);
        ValidateBody(body);
        this.owner.position.x = body.x;
        this.owner.position.y = body.y;
        this.vx = body.vx;
        this.vy = body.vy;
        this.grounded = Boolean(contact?.grounded);
        this.contacts = contact;
    }

    Jump() {
        this.vy = -this.settings.jumpSpeed;
        this.grounded = false;
        this.coyoteRemaining = 0;
        this.bufferRemaining = 0;
        this.CutJump();
    }

    CutJump() {
        if (!this.jumpHeld) this.vy = Math.max(this.vy, -this.settings.jumpSpeed * this.settings.jumpCutRatio);
    }

    /** Clear motion and pending commands after teleport/respawn. Does not move the owner. */
    Reset() {
        this.vx = 0;
        this.vy = 0;
        this.axis = 0;
        this.grounded = false;
        this.jumpHeld = false;
        this.jumpPending = false;
        this.coyoteRemaining = 0;
        this.bufferRemaining = 0;
        this.contacts = null;
    }

    OnDetach() {
        this.Reset();
        super.OnDetach();
    }
}

