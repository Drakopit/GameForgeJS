/** Creates a per-game session. Connection is explicit unless autoConnect is requested. */
export function networkModule({ adapter, roomId, peer, autoConnect }?: {
    adapter?: any;
    roomId?: string;
    peer?: {};
    autoConnect?: boolean;
}): {
    id: string;
    setup(context: any): void;
};
