/**
 * Minimal synchronous event publisher used across engine services.
 */
export class EventEmitter {
    listeners: {};
    /**
     * Registers a listener for an event name.
     * @param {string} event - Event name.
     * @param {Function} callback - Listener callback.
     * @returns {() => void} Unsubscribe callback.
     */
    on(event: string, callback: Function): () => void;
    once(event: any, callback: any): () => void;
    off(event: any, callback: any): void;
    emit(event: any, ...args: any[]): void;
    clear(): void;
}
