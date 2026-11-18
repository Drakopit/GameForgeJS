# Online Sandbox 2D

Optional networking: BroadcastChannel tabs by default, replicated player state and canvas chat; not a hosted MMO backend.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/online-sandbox-2d/index.html on the printed server address.
node cli/index.cjs build --root examples/online-sandbox-2d
node cli/index.cjs serve --root examples/online-sandbox-2d/dist
```

The launcher also accepts `Main.html?demo=online-sandbox-2d`.

## Controls

Keyboard/gamepad movement plus framework mouse/chat input. Open two tabs with the same room query to test local synchronization.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/OnlineSandboxModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- GameObject/Component classes and explicit domain helpers hold gameplay behavior.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d, network; addons: none.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.
