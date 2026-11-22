/**
 * Small attack-chain state machine driven by a game's animation frames.
 *
 * @param {Object} owner - Combatant owning optional box data.
 * @param {Object[]} [attacks=[]] - Ordered combo attack definitions.
 * @param {Object} [options={}] - Input-buffer settings.
 */
export class ComboController {
    constructor(owner: any, attacks?: any[], options?: {});
    owner: any;
    attacks: any[];
    inputBufferTime: any;
    Start(): any;
    active: boolean;
    index: number;
    queued: boolean;
    bufferTimer: any;
    Update(dt: any): void;
    QueueNext(): boolean;
    ConsumeNextIfReady(frame: any): any;
    Current(): any;
    CurrentAnimation(): any;
    Reset(): void;
}
