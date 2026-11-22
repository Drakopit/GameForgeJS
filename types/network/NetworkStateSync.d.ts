/**
 * Periodically broadcasts snapshots of small tracked objects through a network client.
 *
 * This generic helper reads and writes selected fields only; it has no knowledge
 * of entities, maps or simulation.
 *
 * @param {Object} [options] - Synchronization settings.
 * @param {NetworkClient|null} [options.client=null] - Client used to send snapshots.
 * @param {string} [options.channel="state:sync"] - Envelope type for snapshots.
 * @param {string} [options.id] - Local source identifier.
 * @param {number} [options.tickRate=20] - Snapshot broadcasts per second.
 */
export class NetworkStateSync {
    constructor({ client, channel, id, tickRate, listen, }?: {
        client?: any;
        channel?: string;
        id?: string;
        tickRate?: number;
        listen?: boolean;
    });
    client: any;
    channel: string;
    id: string;
    tickRate: number;
    tracked: Map<any, any>;
    timer: number;
    lastSnapshot: {
        source: string;
        sentAt: number;
        entities: {};
    };
    /**
     * Tracks state with game-provided reader and optional writer callbacks.
     * @param {string} id - Entity identifier inside snapshots.
     * @param {Object} callbacks - State callbacks.
     * @param {Function} callbacks.read - Produces serializable state.
     * @param {Function|null} [callbacks.write=null] - Applies remote state.
     * @returns {NetworkStateSync} This synchronizer.
     */
    Track(id: string, { read, write }?: {
        read: Function;
        write?: Function | null;
    }): NetworkStateSync;
    /**
     * Tracks common fields on a plain target object.
     * @param {string} id - Entity identifier.
     * @param {Object} target - Target object.
     * @param {string[]} [fields] - Replicated property names.
     * @returns {NetworkStateSync} This synchronizer.
     */
    TrackObject(id: string, target: any, fields?: string[]): NetworkStateSync;
    Untrack(id: any): this;
    /**
     * Produces the current serializable entity snapshot.
     * @returns {Object} Snapshot containing source, timestamp and entities.
     */
    Snapshot(): any;
    /**
     * Sends one current snapshot.
     * @param {Object} [meta={}] - Message envelope metadata.
     * @returns {Object|boolean} Sent envelope or `false` without a client.
     */
    Broadcast(meta?: any): any | boolean;
    Apply(snapshot: any): void;
    Start(): this;
    Stop(): this;
    ReadFields(target: any, fields: any): any;
    WriteFields(target: any, state: any): void;
    ClonePlainValue(value: any): any;
    IsPlainObject(value: any): boolean;
}
