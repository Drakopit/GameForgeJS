# Toon Adventure 3D

An incremental Toon ABS adventure: animated imported characters, five sentries, three connected areas and shallow-water interaction.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/toon-adventure-3d/index.html on the printed server address.
node cli/index.cjs build --root examples/toon-adventure-3d
node cli/index.cjs serve --root examples/toon-adventure-3d/dist
```

The launcher also accepts `Main.html?demo=toon-adventure-3d`.

## Controls

WASD/arrows or left stick: move; Space/left face button: attack; H/Start: help; R/top face: reset; B/Select: lighting.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/ToonAdventureModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- GameObject/Component classes and explicit domain helpers hold gameplay behavior.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d, 3d; addons: state-machine.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.

See [lakes and warp gates](../../docs/getting-started/toon-sandbox-checkpoint.md) for the expanded sandbox, travel behavior and current water limitations.
