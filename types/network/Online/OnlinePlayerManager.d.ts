/**
 * Stores remote peer render state and smooths numeric movement fields.
 *
 * The manager is intentionally representation-neutral: the demo decides how
 * each returned remote player is rendered.
 *
 * @param {GameNetwork} network - Session supplying peer and player-state events.
 * @param {Object} [options] - Remote state settings.
 * @param {number} [options.smoothing=16] - Interpolation response per second.
 */
export class OnlinePlayerManager {
    constructor(network: any, { smoothing }?: {
        smoothing?: number;
    });
    network: any;
    smoothing: number;
    players: Map<any, any>;
    unsubscribe: any[];
    /**
     * Creates or refreshes a remote player profile.
     * @param {Object} peer - Peer with a stable `id`.
     * @returns {Object|null} Stored player entry.
     */
    spawn(peer: any): any | null;
    remove(peerId: any): void;
    /**
     * Stores the newest target state received from a remote player.
     * @param {string} peerId - Remote peer identifier.
     * @param {Object} [state={}] - Target render state.
     * @param {Object} [peer={}] - Updated peer profile.
     * @returns {void}
     */
    updateState(peerId: string, state?: any, peer?: any): void;
    /**
     * Interpolates displayed numeric position and velocity fields.
     * @param {number} [deltaTime=0.0166667] - Frame time in seconds.
     * @returns {void}
     */
    update(deltaTime?: number): void;
    /**
     * Returns render-ready remote player records.
     * @returns {Object[]} Visible interpolated player entries.
     */
    getPlayers(): any[];
    /**
     * Removes subscriptions and known remote peers.
     * @returns {void}
     */
    dispose(): void;
}
