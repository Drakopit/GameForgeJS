# Online Sandbox: playable multiplayer plan

Status: first playable implementation completed, 19 November 2026. The findings
below record the original source review. The client now uses a dedicated .NET 10
server, sequenced input replay, remote interpolation, canvas lobby/chat, mobile
controls and a shared cooperative objective. See the [demo guide](../../examples/online-sandbox-2d/README.md)
and [deployment guide](../../servers/online-sandbox/README.md). Docker/VPS configuration
is included; no public backend or domain has been provisioned yet.

## Findings

- OnlineMMOLevel combines networking, physics, map changes, camera, drawing and chat.
  Movement runs in OnUpdate; horizontal speed switches immediately and camera
  smoothing uses a frame-dependent factor.
- The default LocalNetworkAdapter uses BroadcastChannel: same-origin browser tabs,
  not different devices on the internet. WebSocketClientAdapter exists, but the
  compatible server is not included in this repository.
- Clients send final positions and directly accept peer-authored map changes.
  Any peer can answer a snapshot request; there is no authoritative world revision.
- OnlinePlayerManager eases toward the newest packet without a timestamped buffer.
  Its display-state merge also retains stale nonnumeric fields such as facing.
- OnlineEntitySync caches lastState before checking send success, potentially
  suppressing retries of an unchanged state after a failed send.
- ChatManager already emits join/leave notices. ChatWindow already opens on Enter,
  but stays visible and retains input focus after submission.
- TextBox handles keydown characters/backspace, without native mobile keyboard,
  composition or clipboard integration. World targeting currently depends on Mouse
  even when actions come from a keyboard/gamepad.

## Server and protocol

Recommend C# / .NET 10 LTS, ASP.NET Core/Kestrel and WSS, with a versioned JSON
protocol. Start with one server process and bounded rooms. Use released SDK/runtime
container images; the installed local SDK is an 11 preview.

This is a maintainability/operations choice, not a claim that a language alone
fixes latency. Node reduces duplication of JavaScript simulation. C# requires
cross-language movement fixtures. Rust/C++ add cost without an identified CPU
bottleneck for this demo. Raw WebSockets preserve NetworkClient and an explicit
protocol; SignalR is valid but requires its own client/protocol integration.
WebRTC adds signaling/ICE and potentially TURN infrastructure without being needed
for this initial dedicated server. WebSocket/TCP stalls and buffering must be tested.

The static frontend may stay on GitHub Pages. The server requires separate hosting,
TLS and a configured public WSS endpoint. Docker preparation is not public deployment.

## Framework boundaries

- Preserve BootstrapGame, class Module, Level, Screen, GameObject and Component.
  Use the engine's existing client update/fixed-update loop.
- Reuse ActionManager, Input-owned Touch, Touch.ToScreen, GameViewport, Sprite,
  HUDFrame, InfoPanel, TextBox, ChatWindow and AudioManager.
- Reuse PlatformerController with SetInput and TilePlatformerWorld. Add small
  capture/restore support for complete movement state if prediction needs it.
- Use NetworkClient/NetworkMessage for transport. A demo-owned OnlineSession
  implements the authoritative room protocol. Preserve peer-based GameNetwork
  compatibility instead of presenting server state as another client's state.
- The module owns one session across lobby/world levels. Leaving disposes subscriptions
  and the connection. No second input device, browser animation loop or client timer.
- Extract reusable touch widgets into engine UI; do not import another demo's code.
- Keep world/movement rules as canonical versioned JSON owned by the example and
  copied into the server output during packaging. Avoid hand-maintained constants
  in two languages. Keep configuration under config/ and backend source under
  servers/online-sandbox/.
- Split client levels, entities, components, network, UI and data. Split server
  Transport, Protocol, Rooms, Simulation and Gameplay; Program.cs composes services.

## Authority and smooth state

- Server assigns player/session identity and room codes. Invite links carry the
  room code and use the configured endpoint; they do not contain resume credentials.
- Clients send sequenced input and action requests, not trusted position/inventory.
  Validate values, rate, reach, material costs, occupied tiles and spawn protection.
- Initial tuning targets: 60 Hz simulation, 20 Hz snapshots, 30 Hz command batches
  containing individually sequenced fixed-step inputs. Measure before promising scale.
- Predict the local player immediately. Server snapshots acknowledge commands;
  restore full controller state and replay unacknowledged input. Smooth presentation
  correction, not physics positions through walls.
- JS/C# share rules and trajectory fixtures for acceleration, collisions, jump
  grace/buffering/height and respawn. Do not assume bit-identical floating point.
- Remote players render from a timestamped snapshot buffer, initially around 100 ms
  behind server time. Tune under jitter; reset the buffer for teleport/respawn.
- Version world edits. Late join receives a baseline and subsequent deltas;
  reconnect requests a missing revision range or a fresh baseline.
- Use request IDs to avoid duplicate rewards/edits after retries. Derive chat identity
  and join/leave notices from the server session, not client-supplied author fields.
- Bound queues/message sizes, coalesce obsolete movement snapshots, preserve action
  acknowledgements, expire stale movement and implement heartbeat/resume/room expiry.
- Initial rooms are in-memory sessions with a documented lifetime. Durable worlds
  and accounts can extend that later without changing the rendering framework.

## Controls, mobile and UI

Lobby: name, create/join, invitation copy/share, roster and explicit error/reconnect
states. A failed internet connection must not silently become isolated local play.
Keep local/offline testing an explicitly labelled mode.

Use fixed-step movement with acceleration/deceleration and existing jump features.
Mouse targets tiles on desktop; right stick/facing-based aim supports gamepad.
Touch captures independent fingers for steering, jump/actions and world targeting.
UI touches never edit a world tile underneath a button.

Extend GameViewport fitting and use responsive layout, safe areas, orientation,
camera zoom and physical button sizes. Stretching the current 800x480 canvas is
insufficient. Blur, touch cancellation, pause and backgrounding neutralize input.
Pause/settings affects this player's input; it cannot freeze the shared world.

Chat uses engine UI with wrapped messages/history and server notices. Proposed
defaults: hold 6 seconds, fade 0.5 seconds, stay visible while editing. Enter opens,
submits and returns to gameplay; Escape cancels. Mobile has a chat button.

Add a framework-owned native text-input bridge for the OS keyboard, IME and paste.
TextBox/ChatWindow still draw the visible UI on Canvas. Focus happens in a user
gesture; keyboard/viewport changes reposition controls. Adapt the project gate
narrowly for this engine-owned platform input and test its disposal. Do not scatter
HTML HUD overlays through the game. Text/menu input takes priority over gameplay.

## First gameplay objective

Build on mining/construction: collect materials, build a crossing and activate a
shared beacon. The server owns inventory, pickups, edits and objective progress.
Late arrivals see the edited world and current progress. Show named animated avatars,
target/reach feedback, hotbar, room/player/ping HUD and short AudioManager cues.
Exploration/building continue after objective completion.

## Delivery sequence

| Step | Deliverable | Acceptance |
| --- | --- | --- |
| 1 | Separate the scene, fix generic sync defects, define protocol/rules and movement fixtures | Existing local behavior stays usable; stale flags/failed sends have regression coverage |
| 2 | Dedicated C# room simulation, minimal client and development Docker entry point | Two isolated browser contexts join one WebSocket room; distinct rooms remain isolated; fabricated edits/positions are rejected |
| 3 | Prediction/reconciliation and snapshot-buffered remote rendering | Immediate local response and bounded correction/history under latency/jitter |
| 4 | Lobby, invites, pause/settings and reconnect | A second player joins through a shared link without entering a server URL |
| 5 | Touch widgets, responsive layout and mobile chat | Portrait/landscape multitouch, keyboard/IME, focus isolation, fading chat and no stuck input |
| 6 | Cooperative objective and audiovisual feedback | Both players see accepted edits, rewards/progress and correct late-join state |
| 7 | Production Docker/VPS, WSS and public verification | Desktop on Wi-Fi and phone on mobile data can play together through the public endpoint |

The first implementation milestone combines step 1 and the smallest useful step 2:
one room, two authoritative players, movement, join/leave and validated world edits.
Establish that path before broadening presentation and gameplay.

## Verification

Use protocol/room/simulation tests, cross-language movement fixtures, real WebSocket
connections and isolated browser contexts. Test malformed/rate-limited commands,
duplicate actions, edit conflicts, late join and reconnect. Simulate 100-250 ms RTT,
jitter, slow consumers and disconnect/backgrounding, respecting TCP semantics.
Automate mobile emulation and separately check physical Android/iOS input/keyboard.
Keep project/docs/build checks and prefix-hosted portable builds passing.

Ship Compose, example environment settings, reverse-proxy/TLS instructions and a
health endpoint. Hosting/domain and a live external-device test are required before
claiming that an internet friend can join. No provider has been selected yet.

## References

- [.NET support](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)
- [ASP.NET WebSockets](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/websockets?view=aspnetcore-10.0)
- [Browser WebSocket buffering](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebRTC connectivity](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
- [Mobile keyboard and viewport](https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API)
- [GitHub Pages static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
