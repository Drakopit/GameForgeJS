/**
 * Attach to a GameObject with position and positive size. OnUpdate captures input;
 * OnFixedUpdate owns movement. The supplied world.Move(body, dt) mutates position
 * and velocity and returns grounded/contact flags. No loop or canvas is created.
 * Set input:null and call SetInput for AI, replay or a custom input implementation.
 */
export class PlatformerController extends Component {
    constructor({ world, input, actions, ...settings }?: {
        input?: typeof ActionManager;
        actions?: {};
    });
    world: any;
    input: typeof ActionManager;
    actions: {
        left: string;
        right: string;
        jump: string;
    };
    settings: {
        speed: 260;
        acceleration: 1800;
        deceleration: 2200;
        gravity: 1600;
        jumpSpeed: 560;
        maxFallSpeed: 900;
        coyoteTime: 0.1;
        jumpBufferTime: 0.12;
        jumpCutRatio: 0.5;
    };
    OnAttach(owner: any): void;
    ReadBody(owner?: any): any;
    /** Full input snapshot; jumpPressed is an edge, jumpHeld controls jump height. */
    SetInput({ axis, jumpPressed, jumpHeld }?: {
        axis?: number;
        jumpPressed?: boolean;
        jumpHeld?: boolean;
    }): void;
    axis: number;
    jumpHeld: boolean;
    OnUpdate(): void;
    UpdateJumpTimers(dt: any): boolean;
    coyoteRemaining: any;
    jumpPending: boolean;
    bufferRemaining: any;
    UpdateVelocity(dt: any): void;
    vy: any;
    Move(dt: any): void;
    vx: any;
    grounded: boolean;
    contacts: any;
    Jump(): void;
    CutJump(): void;
    /** Capture the full fixed-step motion state for prediction/replay or checkpoints. */
    CaptureState(): {
        [k: string]: any;
    };
    /** Restore motion without moving the owner; the caller restores its position. */
    RestoreState(state: any): void;
    /** Clear motion and pending commands after teleport/respawn. Does not move the owner. */
    Reset(): void;
}
import { Component } from '../../core/Component.js';
import { ActionManager } from '../../core/Input/ActionManager.js';
