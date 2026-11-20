# Puzzle Battle 2D

Grid-based puzzle domain models: falling pairs, rotation, combos, garbage exchanges and a CPU opponent.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/puzzle-battle-2d/index.html on the printed server address.
node cli/index.cjs build --root examples/puzzle-battle-2d
node cli/index.cjs serve --root examples/puzzle-battle-2d/dist
```

The launcher also accepts `Main.html?demo=puzzle-battle-2d`.

## Controls

A/D: move, W: rotate, S: drop, R: retry, P: pause. Gamepad D-pad, A: rotate,
Y: retry, Start: pause. Right board is CPU-controlled. Native touch buttons expose
movement, rotation/drop, pause, retry and help; they stay hidden on desktop unless enabled.

The opening pair includes a red crash core: move it beside the red starter gems
to see a clear and garbage transfer immediately. Glowing cores break connected
same-color gems. Landing ghosts show where a pair will settle. Stones count down
by locked pieces; overflow loses the duel. Retry starts a new match in the same
Screen, with an actual result state rather than reloading the page.

PuzzleLayout adapts cell pixels and board/HUD placement to portrait/landscape;
the rules continue using row/column coordinates. PuzzleHUD restores Canvas state
and uses the native HUDFrame aesthetic. No HTML game overlay is created.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/PuzzleBattleModule.js composes the project's framework services and level classes.
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
