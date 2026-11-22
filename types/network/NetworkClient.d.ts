/**
 * Lifecycle states emitted by `NetworkClient`.
 * @type {Object<string, string>}
 */
export const NETWORK_CLIENT_STATE: {
    [x: string]: string;
};
/**
 * Low-level WebSocket client for message envelopes and optional request/reply calls.
 *
 * Games normally consume `GameNetwork` and an adapter instead of this transport
 * primitive directly.
 *
 * @param {Object} [options] - Client connection settings.
 * @param {string|null} [options.url=null] - WebSocket endpoint.
 * @param {boolean} [options.autoConnect=false] - Connect during construction.
 * @param {boolean} [options.autoReconnect=false] - Retry unexpected connection losses.
 * @param {Function|null} [options.serializer=null] - Envelope-to-wire converter.
 * @param {Function|null} [options.parser=null] - Wire-to-envelope converter.
 */
export class NetworkClient extends EventEmitter {
    /**
     * Constructs a client using `Config.data.network` compatible properties.
     * @param {Object} [config] - Network configuration object.
     * @returns {NetworkClient} Configured client.
     */
    static FromConfig(config?: any): NetworkClient;
    constructor({ url, protocols, autoConnect, autoReconnect, reconnectDelay, maxReconnectDelay, serializer, parser, codec, binaryType, }?: {
        url?: any;
        protocols?: any;
        autoConnect?: boolean;
        autoReconnect?: boolean;
        reconnectDelay?: number;
        maxReconnectDelay?: number;
        serializer?: any;
        parser?: any;
        codec?: any;
        binaryType?: any;
    });
    url: any;
    protocols: any;
    autoReconnect: boolean;
    reconnectDelay: number;
    maxReconnectDelay: number;
    codec: any;
    serializer: any;
    parser: any;
    binaryType: any;
    socket: WebSocket;
    state: string;
    pendingRequests: Map<any, any>;
    reconnectTimer: number;
    currentReconnectDelay: number;
    intentionalClose: boolean;
    get IsConnected(): boolean;
    /**
     * Opens a WebSocket connection.
     * @param {string} [url] - Endpoint override.
     * @param {string|string[]} [protocols] - WebSocket subprotocol override.
     * @returns {NetworkClient} This client.
     */
    Connect(url?: string, protocols?: string | string[]): NetworkClient;
    /**
     * Stops reconnection and closes the socket.
     * @param {number} [code=1000] - WebSocket close code.
     * @param {string} [reason="client disconnect"] - Close reason.
     * @returns {NetworkClient} This client.
     */
    Disconnect(code?: number, reason?: string): NetworkClient;
    /**
     * Sends a message envelope or creates one from a type and payload.
     * @param {string|Object} type - Type name or complete envelope.
     * @param {Object} [payload={}] - Serializable payload.
     * @param {Object} [meta={}] - Envelope metadata.
     * @returns {Object|boolean} Sent envelope, or `false` while disconnected.
     */
    Send(type: string | any, payload?: any, meta?: any): any | boolean;
    /**
     * Sends a correlated message and waits for its matching reply.
     * @param {string} type - Request message type.
     * @param {Object} [payload={}] - Serializable request data.
     * @param {Object} [options] - Timeout and expected response type.
     * @returns {Promise<Object>} Reply envelope.
     */
    Request(type: string, payload?: any, { timeout, responseType }?: any): Promise<any>;
    /**
     * Responds to a previously received request envelope.
     * @param {Object} requestMessage - Envelope carrying correlation metadata.
     * @param {string} type - Response type.
     * @param {Object} [payload={}] - Serializable response data.
     * @param {Object} [meta={}] - Additional response metadata.
     * @returns {Object|boolean} Sent response or `false`.
     */
    Reply(requestMessage: any, type: string, payload?: any, meta?: any): any | boolean;
    HandleOpen(event: any): void;
    HandleMessage(event: any): void;
    HandleError(event: any): void;
    HandleClose(event: any): void;
    ResolvePendingRequest(message: any): void;
    RejectPendingRequests(error: any): void;
    ScheduleReconnect(): void;
    ClearReconnect(): void;
    SetState(state: any): void;
}
import { EventEmitter } from "../core/EventEmitter.js";
