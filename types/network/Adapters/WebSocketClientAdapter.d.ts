/**
 * Adapter that carries `GameNetwork` messages through an external WebSocket relay.
 *
 * The relay is optional and replaceable; the game still owns world state and rules.
 *
 * @param {Object} [options] - Adapter settings.
 * @param {string|null} [options.url=null] - WebSocket relay URL.
 * @param {string} [options.roomId="main"] - Logical room identifier.
 * @param {Object} [options.peer={}] - Local peer profile.
 * @param {boolean} [options.autoReconnect=true] - Whether the low-level client reconnects.
 */
export class WebSocketClientAdapter extends EventEmitter {
    constructor({ url, roomId, peer, autoReconnect, }?: {
        url?: any;
        roomId?: string;
        peer?: {};
        autoReconnect?: boolean;
    });
    url: any;
    roomId: string;
    peer: {};
    autoReconnect: boolean;
    client: NetworkClient;
    get IsConnected(): boolean;
    setPeer(peer: any): this;
    setRoom(roomId: any): this;
    /**
     * Creates and connects the underlying WebSocket client.
     * @returns {WebSocketClientAdapter} This adapter.
     */
    connect(): WebSocketClientAdapter;
    /**
     * Sends a room-aware message envelope to the relay.
     * @param {string} type - Message type.
     * @param {Object} [payload={}] - Serializable message body.
     * @returns {boolean|Object} `false` while offline, otherwise the sent envelope.
     */
    send(type: string, payload?: any): boolean | any;
    /**
     * Gracefully closes the underlying client.
     * @returns {WebSocketClientAdapter} This adapter.
     */
    disconnect(): WebSocketClientAdapter;
}
import { EventEmitter } from "../../core/EventEmitter.js";
import { NetworkClient } from "../NetworkClient.js";
