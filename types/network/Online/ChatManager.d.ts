/**
 * Reusable online text chat service connected to a `GameNetwork` session.
 *
 * It owns message normalization and system notices, while a game supplies its
 * own canvas UI such as `ChatWindow`.
 *
 * @param {GameNetwork} network - Active high-level network session.
 * @param {Object} [options] - Chat constraints.
 * @param {number} [options.maxLength=120] - Maximum transmitted text length.
 */
export class ChatManager extends EventEmitter {
    constructor(network: any, { maxLength }?: {
        maxLength?: number;
    });
    network: any;
    maxLength: number;
    unsubscribe: any[];
    /**
     * Emits a local chat message and relays it to connected peers.
     * @param {string} text - User-entered message.
     * @returns {boolean} Whether non-empty text was accepted.
     */
    sendMessage(text: string): boolean;
    /**
     * Subscribes to local, remote and system chat messages.
     * @param {Function} callback - Receives a normalized chat message.
     * @returns {Function} Unsubscribe callback.
     */
    onMessageReceived(callback: Function): Function;
    /**
     * Emits an informational message without transmitting it.
     * @param {string} text - Notice content.
     * @returns {void}
     */
    addSystemMessage(text: string): void;
    receiveMessage(peerId: any, payload: any, peer: any): void;
    normalizeText(text: any): string;
    /**
     * Releases subscriptions created by this service.
     * @returns {void}
     */
    dispose(): void;
}
import { EventEmitter } from "../../core/EventEmitter.js";
