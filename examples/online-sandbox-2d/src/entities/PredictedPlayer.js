import { GameObject } from 'gameforgejs/2d';
import { PlatformerController } from 'gameforgejs/addons/platformer';

const MAX_UNACKNOWLEDGED_INPUTS = 120;

/** Reuses the platformer component for prediction and acknowledged-input replay. */
export class PredictedPlayer extends GameObject {
    constructor(world, rules, session) {
        super();
        this.size.Set(rules.playerWidth, rules.playerHeight);
        this.position.Set(rules.spawnX, rules.spawnY);
        this.rules = rules; this.session = session;
        this.motion = this.AddComponent(new PlatformerController({ world, input: null, ...rules.movement }));
        this.history = []; this.seq = 0; this.command = {}; this.jumpPending = false;
    }
    SetCommand(command) { this.command = command; this.jumpPending ||= command.jumpPressed; }
    OnFixedUpdate(dt) {
        if (this.session.status !== 'online' || this.history.length >= MAX_UNACKNOWLEDGED_INPUTS) return;
        const command = { ...this.command, jumpPressed: this.jumpPending, seq: ++this.seq };
        this.jumpPending = false;
        this.motion.SetInput(command);
        super.OnFixedUpdate(dt);
        this.history.push(command); this.session.outbound.push(command);
    }
    Reconcile(state, reset = false) {
        if (!state) return;
        if (reset || this.spawn !== state.spawn) {
            this.history = []; this.session.outbound = [];
            this.seq = reset ? state.ack : Math.max(this.seq, state.ack);
            this.jumpPending = false;
        }
        this.spawn = state.spawn; this.state = state;
        this.history = this.history.filter(command => command.seq > state.ack);
        this.position.Set(state.x, state.y);
        this.motion.RestoreState({ ...state, jumpPending: false });
        for (const command of this.history) {
            this.motion.SetInput(command);
            this.motion.OnFixedUpdate(1 / this.rules.tickRate);
        }
    }
    GetDisplayState() {
        return { ...this.state, x: this.position.x, y: this.position.y, vx: this.motion.vx, vy: this.motion.vy,
            grounded: this.motion.grounded, facingRight: this.motion.vx ? this.motion.vx > 0 : this.state?.facingRight };
    }
}
