# Addon Building Blocks 2D

Consume shared parallax and state-machine addons while retaining the existing level/entity lifecycle.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/addons-2d/index.html on the printed server address.
node cli/index.cjs build --root examples/addons-2d
node cli/index.cjs serve --root examples/addons-2d/dist
```

The launcher also accepts `Main.html?demo=addons-2d`.

## Controls

Automatic parallax and patrol/rest demonstration; no gameplay input is required.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/AddonsModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- GameObject/Component classes and explicit domain helpers hold gameplay behavior.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d; addons: parallax, state-machine.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.
