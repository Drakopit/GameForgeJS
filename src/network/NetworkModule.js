import { GameNetwork } from "./GameNetwork.js";
import { LocalNetworkAdapter } from "./Adapters/LocalNetworkAdapter.js";

/** Creates a per-game session. Connection is explicit unless autoConnect is requested. */
export function networkModule({ adapter = null, roomId = "main", peer = {}, autoConnect = false } = {}) {
    return {
        id: "network",
        setup(context) {
            const network = new GameNetwork({ adapter: adapter ?? new LocalNetworkAdapter(), roomId, peer });
            context.onDispose(() => {
                try { network.disconnect(); }
                finally { network.unbindAdapter(); network.clear(); context.services.delete("network"); }
            });
            context.services.set("network", network);
            if (autoConnect) network.connect();
        },
    };
}
