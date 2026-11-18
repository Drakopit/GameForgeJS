# Solar System 3D

Procedural celestial materials, lighting and coordinated orbit animation.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/solar-system-3d/index.html on the printed server address.
node cli/index.cjs build --root examples/solar-system-3d
node cli/index.cjs serve --root examples/solar-system-3d/dist
```

The launcher also accepts `Main.html?demo=solar-system-3d`.

## Controls

Keyboard/gamepad camera actions are configured in config/game.config.json; orbit animation runs automatically.

H / gamepad Start opens the in-engine controls and scene guide.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/SolarSystemModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- GameObject/Component classes and explicit domain helpers hold gameplay behavior.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d, 3d; addons: none.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.
