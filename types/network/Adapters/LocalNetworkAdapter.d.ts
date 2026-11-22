/**
 * Same-origin multiplayer transport implemented with `BroadcastChannel`.
 *
 * It is useful for local demos and testing two browser tabs without an MMO
 * backend. Messages remain scoped to a room and do not leave the browser.
 *
 * @param {Object} [options] - Adapter settings.
 * @param {string} [options.roomId="main"] - Channel room identifier.
 * @param {Object} [options.peer={}] - Local public peer profile.
 * @param {string} [options.channelPrefix="gameforgejs-online"] - Browser channel namespace.
 */
export class LocalNetworkAdapter extends EventEmitter {
    constructor({ roomId, peer, channelPrefix, }?: {
        roomId?: string;
        peer?: {};
        channelPrefix?: string;
    });
    roomId: string;
    peer: {};
    channelPrefix: string;
    channel: BroadcastChannel;
    pageHideHandler: () => LocalNetworkAdapter;
    messageHandler: (event: any) => void;
    get IsConnected(): boolean;
    setPeer(peer: any): this;
    setRoom(roomId: any): this;
    /**
     * Opens the browser broadcast channel.
     * @returns {LocalNetworkAdapter} This adapter.
     */
    connect(): LocalNetworkAdapter;
    /**
     * Broadcasts an envelope to the other tabs in this room.
     * @param {string} type - Message type.
     * @param {Object} [payload={}] - Serializable message body.
     * @returns {boolean} Whether the channel was open.
     */
    send(type: string, payload?: any): boolean;
    /**
     * Announces departure and releases the browser channel.
     * @returns {LocalNetworkAdapter} This adapter.
     */
    disconnect(): LocalNetworkAdapter;
}
import { EventEmitter } from "../../core/EventEmitter.js";
