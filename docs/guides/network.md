# Networking

The network module provides browser transports and reusable synchronization
helpers. It does not define game rules or provide a game server.

## Responsibilities

| API | Responsibility |
| --- | --- |
| `GameNetwork` | Rooms, peers, messages, and connection lifecycle. |
| `LocalNetworkAdapter` | Same-origin browser tabs connected through `BroadcastChannel`. |
| `WebSocketClientAdapter` | Connection to a separately hosted WebSocket service. |
| `OnlinePlayerManager` | Peer registration and interpolation of remote state. |
| `OnlineEntitySync` | Sending changed entity state at a controlled rate. |
| `ChatManager` | Chat messages and join/leave notifications. |

The local development server serves files. It does not manage peers, chat,
rooms, authentication, persistence, or authoritative simulation.

## Try the local example

Run `npm start` from the repository and open the Online MMO example in two
browser tabs. Use the same `room` query parameter and different `name` values.
The default adapter uses `BroadcastChannel`, so both pages must have the same
origin. This mode does not connect two computers.

The example owns its map, block rules, appearance, and canvas chat UI. Its
`/name NewName` command changes the local player's display name. None of these
game-specific rules belong to the network module.

## Connect a transport

```js
import {
    ChatManager,
    GameNetwork,
    LocalNetworkAdapter,
    OnlinePlayerManager,
} from "gameforgejs/network";

const network = new GameNetwork({
    adapter: new LocalNetworkAdapter({ roomId: "main" }),
    roomId: "main",
    peer: { name: "Player" },
});
const players = new OnlinePlayerManager(network);
const chat = new ChatManager(network);

network.onConnected(() => console.log("Connected"));
chat.onMessageReceived(message => console.log(message.playerName, message.text));

network.connect();
network.sendPlayerState({ x: 120, y: 80 });
chat.sendMessage("Hello!");
```

This is a transport example, not a complete game. Subscribe to the events your
game needs and release its subscriptions and connection when the game closes.

## Connect different computers

Host a compatible WebSocket service separately, then replace the adapter:

```js
import { GameNetwork, WebSocketClientAdapter } from "gameforgejs/network";

const network = new GameNetwork({
    adapter: new WebSocketClientAdapter({
        url: "wss://example.com/relay",
        roomId: "main",
    }),
    roomId: "main",
    peer: { name: "Player" },
});
```

`wss://example.com/relay` is a placeholder. The service must implement the
protocol expected by the adapter; an arbitrary WebSocket endpoint is not
interchangeable with a compatible relay. The Online MMO example also accepts
the service URL through its `server` query parameter.

The optional relay in the separate `GameForgeJsTools/NodeWebSocketRelay`
project is a testing tool. Refer to that project's own instructions to install
and run it; it is not shipped by this repository.

## Server authority

A production multiplayer game needs a server that validates player intentions,
simulates or validates rules, and distributes the accepted state. The client
handles rendering, input, UI, and interpolation. Account data, inventory
persistence, authentication, rate limits, and authoritative combat belong to
the server. A message-forwarding relay alone does not provide these features.
