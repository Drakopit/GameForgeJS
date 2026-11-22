/**
 * Rate-limited sender for one game's local entity state.
 *
 * The game supplies `readState`, choosing the compact fields that remote peers
 * need to render; unchanged snapshots are not resent.
 *
 * @param {GameNetwork} network - Session used to send player state.
 * @param {Object} options - Entity synchronization settings.
 * @param {Function} options.readState - Returns serializable local state.
 * @param {number} [options.syncRate=12] - Maximum sends per second.
 */
export class OnlineEntitySync {
    constructor(network: any, { readState, syncRate, }?: {
        syncRate?: number;
    });
    network: any;
    readState: any;
    syncRate: number;
    elapsed: number;
    lastState: any;
    /**
     * Advances the rate limiter and sends changed state when due.
     * @param {number} [deltaTime=0.0166667] - Frame time in seconds.
     * @returns {boolean} Whether state was sent.
     */
    update(deltaTime?: number): boolean;
    /**
     * Immediately evaluates and optionally sends local state.
     * @param {boolean} [force=false] - Send even when fields did not change.
     * @returns {boolean} Whether the network accepted a state message.
     */
    send(force?: boolean): boolean;
    changed(state: any): boolean;
}
