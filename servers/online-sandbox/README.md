# Online Sandbox dedicated server

C# / ASP.NET Core **.NET 10**, JSON over WebSocket. The backend owns rooms,
player identities, fixed-step physics, inventories, crystals and world edits.
The browser sends input commands and action requests, never trusted positions.

## Run locally

Install the .NET 10 SDK (or a newer compatible SDK) and Node 22+.
From the repository root, in separate terminals:

```sh
npm run server:online
npm run dev:online
```

Open `http://127.0.0.1:3000/examples/online-sandbox-2d/`.
Create a room, copy its invitation, then open it in another browser/profile.
Default local endpoint: `ws://127.0.0.1:8080/ws`; health: `http://127.0.0.1:8080/health`.
The production frontend needs a deployed **WSS** endpoint; GitHub Pages only hosts
the client. There is no silent local-tab fallback.

The published demo is configured for `wss://gameforgejs.onrender.com/ws`.
For local development, enter `ws://127.0.0.1:8080/ws` in the lobby or pass it in
the `server` query parameter. The public health endpoint is
[https://gameforgejs.onrender.com/health](https://gameforgejs.onrender.com/health).

## Docker on a development machine

From the repository root:

```sh
docker compose -f servers/online-sandbox/compose.yaml up --build -d game
docker compose -f servers/online-sandbox/compose.yaml logs -f game
```

The development port binds to loopback. Use the public proxy for internet access.

## Publish on a VPS

1. Install Docker Engine and Compose on a Linux VPS. Copy/clone this repository.
2. Point a DNS record such as `game.example.com` at the VPS public address.
3. Copy `servers/online-sandbox/.env.example` to `.env` **in that same folder**.
   Set `GAME_DOMAIN` and the exact frontend origin(s) in `ALLOWED_ORIGINS`.
4. Allow inbound TCP ports 80 and 443. Keep port 8080 private. UDP 443 is optional.
5. Start the backend and Caddy proxy:

   ```sh
   docker compose --env-file servers/online-sandbox/.env -f servers/online-sandbox/compose.yaml --profile public up --build -d
   ```

6. Verify `https://game.example.com/health`. Caddy provisions HTTPS for the public
   domain; DNS and ports must be reachable for certificate issuance.
7. Enter `wss://game.example.com/ws` in the game lobby. Alternatively set
   `network.serverUrl` in the demo's `config/game.config.json` before publishing the
   frontend. Invitations preserve the endpoint and room code, never the resume token.
8. Send an invitation to a friend on a different connection and verify movement,
   chat and shared blocks. This last public-network check requires an actual VPS.

## Rules and lifecycle

- Shared tuning: `examples/online-sandbox-2d/config/world.rules.json`, copied into
  the server publish output and loaded by the client's asset manifest. Rebuild both
  sides after changing it.
- Simulation 60 Hz; snapshots 20 Hz; browser batches two sequenced commands at a time.
  Client replays unacknowledged input through the platformer addon. Remote actors
  render from a bounded buffer 100 ms behind the server.
- Eight players per room, 64 rooms, 256 connections per process; random six-character
  room codes. Unoccupied rooms expire five minutes after player removal.
- Reconnect grace: 30 seconds, using a private resume token held only in client memory.
  Positions/inventory resume. Reloading the tab intentionally creates a new identity.
- Maximum frame 8 KB, 100 inbound frames/second, bounded input and reliable-output
  queues. Snapshots coalesce under backpressure. Tools validate reach, line of sight,
  protected spawn, occupied tiles, inventory and cooldown. Action IDs deduplicate retries.
- No accounts, persistence, cross-process rooms or matchmaking in this version.
  Restarting the process loses rooms. Room codes grant access, so share them privately.

## Verification

```sh
npm run test:online
```

Builds the backend and exercises real WebSockets plus two independent browser
contexts, including emulated mobile multitouch. Physical Android/iOS keyboard and
WAN latency still need device testing. Docker image execution needs a running Docker
daemon; compiling the .NET project does not validate the container runtime.
