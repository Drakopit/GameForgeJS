# Online Sandbox 2D

Cooperative mining/building with an authoritative C#/.NET 10 server, room codes,
invitation links, local prediction and interpolated remote players. Collect six
crystals, build across the chasm and restore the eastern beacon together. Play
continues after completing the objective.

## Run and publish

From the repository root:

```sh
npm run server:online
# In a second terminal:
npm run dev:online
# Open /examples/online-sandbox-2d/index.html on the printed server address.
node cli/index.cjs build --root examples/online-sandbox-2d
node cli/index.cjs serve --root examples/online-sandbox-2d/dist
```

The launcher also accepts `Main.html?demo=online-sandbox-2d`. Create a room and use
**Invite** to send the link. The local endpoint only works on your computer; friends
on the internet need a deployed WSS backend. The lobby accepts its address and
invites include it automatically. There is no public backend provisioned yet.
See the [server guide](../../servers/online-sandbox/README.md) for Docker and VPS setup.

## Controls

| Action | Keyboard/mouse | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | A/D or arrows | Left stick / D-pad | Left virtual stick |
| Variable-height jump | Space / W / Up | A | Hold JUMP |
| Mine | Q / left click | X | MINE |
| Place selected block | F / right click | B | BUILD |
| Deliver crystals | E near beacon | RB | USE |
| Cycle material | R | Y | Material button |
| Aim | Mouse | Right stick | Tap a world tile; nearby front tile is the fallback |
| Chat | Enter; Enter submits and closes | Select | Chat button opens OS keyboard |
| Pause/settings | Escape | Start | Ⅱ button |
| Menu selection | Up/Down + Enter | D-pad + A | Tap a button |

Pause neutralizes your input while the online world continues. Settings toggle
sound and enlarge touch controls. Chat fades after six seconds of inactivity and
includes server-authored join/disconnect/reconnect notices. Name and chat fields
use the framework TextBox's optional native input bridge for IME/mobile keyboard;
all visible panels, fields, labels and controls are drawn in the engine canvas.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/OnlineSandboxModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- `src/entities/PredictedPlayer.js` owns a PlatformerController component and bounded
  acknowledged-input replay. `src/network/` owns the dedicated protocol and remote
  snapshot buffer. `src/input/`, `src/ui/`, `src/world/` and `src/audio/` own their
  respective responsibilities.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/world.rules.json is shared with the server, so physics and map tuning have
  one source. Rebuild both client and server when changing it.
- config/gameforgejs.package.json selects runtime groups: core, 2d, network; addon: platformer.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

Run `npm run test:online` from the repository root for real WebSocket protocol,
physics parity and browser multiplayer/mobile tests. Rooms live in memory and reset
when the server restarts. Physical phone testing and public-network testing remain
separate from browser emulation. See the [examples catalog](../README.md) for the
learning order and architecture conventions.
