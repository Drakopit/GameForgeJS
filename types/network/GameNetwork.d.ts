/**
 * High-level multiplayer session API built on a replaceable transport adapter.
 *
 * `GameNetwork` discovers peers in a room and forwards game-defined messages.
 * It does not contain maps, entities or gameplay rules.
 *
 * @param {Object} [options] - Initial network settings.
 * @param {Object|null} [options.adapter=null] - Adapter implementing connect, disconnect and send.
 * @param {string} [options.roomId="main"] - Logical room shared by connected peers.
 * @param {Object} [options.peer={}] - Local peer profile such as a display name.
 * @example
 * const network = new GameNetwork({
 *     adapter: new LocalNetworkAdapter(),
 *     peer: { name: "Ada" },
 * });
 * network.onPlayerStateReceived((peerId, state) => players.updateState(peerId, state));
 * network.connect();
 */
export class GameNetwork extends EventEmitter {
    constructor({ adapter, roomId, peer, }?: {
        adapter?: any;
        roomId?: string;
        peer?: {};
    });
    roomId: string;
    peer: {
        name: any;
        id: any;
    };
    peers: Map<any, any>;
    adapter: any;
    unsubscribe: any[];
    get IsConnected(): boolean;
    /**
     * Selects the transport used by this session.
     * @param {Object} adapter - A LocalNetworkAdapter, WebSocketClientAdapter or compatible adapter.
     * @returns {GameNetwork} This network instance.
     */
    useAdapter(adapter: any): GameNetwork;
    /**
     * Opens the selected adapter and starts peer discovery.
     * @returns {GameNetwork} This network instance.
     */
    connect(): GameNetwork;
    /**
     * Closes the adapter and forgets discovered remote peers.
     * @returns {GameNetwork} This network instance.
     */
    disconnect(): GameNetwork;
    createRoom(roomId: any): this;
    joinRoom(roomId: any): this;
    /**
     * Updates the local public identity and informs connected peers.
     * @param {Object} profile - Public peer fields such as `name`.
     * @returns {GameNetwork} This network instance.
     */
    setPeerProfile(profile?: any): GameNetwork;
    /**
     * Sends an application message to peers in the current room.
     * @param {string} type - Message channel name.
     * @param {Object} [payload={}] - Game-owned serializable payload.
     * @returns {boolean} Whether an adapter accepted the message.
     */
    send(type: string, payload?: any): boolean;
    /**
     * Sends the local player's small replicated state payload.
     * @param {Object} state - Game-selected state such as position and animation.
     * @returns {boolean} Whether the message was submitted.
     */
    sendPlayerState(state: any): boolean;
    onConnected(callback: any): () => void;
    onPeerJoined(callback: any): () => void;
    onPeerLeft(callback: any): () => void;
    onPeerUpdated(callback: any): () => void;
    onPlayerStateReceived(callback: any): () => void;
    handleOpen(): void;
    handleMessage(message: any): void;
    registerPeer(peer: any): void;
    removePeer(peerId: any): void;
    unbindAdapter(): void;
}
import { EventEmitter } from "../core/EventEmitter.js";
