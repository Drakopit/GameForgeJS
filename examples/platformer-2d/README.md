# Platformer Building Blocks 2D

Reusable addon mechanics: solid tiles, coyote time, buffered/variable jumps, animation and two collection stages.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/platformer-2d/index.html on the printed server address.
node cli/index.cjs build --root examples/platformer-2d
node cli/index.cjs serve --root examples/platformer-2d/dist
```

The launcher also accepts `Main.html?demo=platformer-2d`.

## Controls

A/D/arrows or left stick/D-pad: move; Space/A: jump; R/Y: reset; Enter/Start: next stage after collecting all coins.

H / gamepad Select opens the in-engine field guide.

Mobile uses native VirtualStick and jump/help buttons. NEXT appears only after
stage completion. The existing PlatformerController receives an input facade;
physics, jump buffering, coyote time and variable jump height remain addon-owned.
GameViewport updates the native camera/HUD, with a clipped world view above the
reserved touch area. Help and the clear state freeze gameplay until continued.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/PlatformerModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- GameObject/Component classes and explicit domain helpers hold gameplay behavior.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d; addons: platformer.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.
