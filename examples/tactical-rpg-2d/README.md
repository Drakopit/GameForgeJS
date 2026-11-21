# Tactical RPG 2D

Turn-based domain models coordinated by framework levels: grid movement, pathfinding, ranges and battle flow.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/tactical-rpg-2d/index.html on the printed server address.
node cli/index.cjs build --root examples/tactical-rpg-2d
node cli/index.cjs serve --root examples/tactical-rpg-2d/dist
```

The launcher also accepts `Main.html?demo=tactical-rpg-2d`.

## Controls

Keyboard/gamepad menu and grid navigation, confirm/cancel; mouse interaction is handled by the framework where available.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/TacticalRpgModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- GameObject/Component classes and explicit domain helpers hold gameplay behavior.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d; addons: none.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.

## Local expedition setup

Choose a battle format, a class for each seat, and a battlefield. Local co-op alternates the allied turns before the enemy round. Player 2 uses I/J/K/L to move the cursor, F to confirm, and G to cancel, or the second connected controller. Open Controls to see both seats side-by-side.
