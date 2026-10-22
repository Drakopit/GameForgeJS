<p align="center">
  <img src="docs/assets/gameforgejs-banner.png" alt="GameForgeJS" width="100%" />
</p>

# GameForgeJS

GameForgeJS is an experimental JavaScript framework for browser games.
It includes a shared runtime, Canvas 2D and WebGL2 rendering, networking
helpers, a local project CLI, and playable examples.

The browser runtime uses native JavaScript and browser APIs. Node.js runs the
development CLI, validation, documentation generation, and static builds.

## Start here

GameForgeJS runs as native browser JavaScript. Node.js and the CLI are optional
development tools; an ordinary static HTTP server can serve the engine and game.

## Principles

- Keep the runtime independent of external dependencies and build tools.
- Use `BootstrapGame`, `Level` / `Level3D`, and `GameObject` as the main game pattern.
- Let `Screen` and the framework's rendering classes own canvas creation and drawing.
- Keep screen, input, and window configuration owned by each game.
- Describe assets and levels through manifests; evolve inheritance with components.
- Keep authoring tools separate. Optional extensions must reuse framework services.

See [Architecture and ownership](docs/architecture.md) for how these pieces fit.

## Run the examples

From a repository checkout:

```sh
npm ci
npm start
```

Open the URL printed by the server and visit
`/examples/showcase/index.html`. Each example also has its own `index.html`.
Existing `Main.html?demo=advanced` links redirect to the corresponding game.

To create a separate game from this checkout:

```sh
node cli/index.cjs create ../my-game --template minimal-2d
node cli/index.cjs serve --root ../my-game
```

Use `minimal-3d` for a WebGL2 starter. These commands use the local engine
checkout; they do not assume a package has been published to npm.
See [Create a project](docs/getting-started/new-project.md) for the project
layout and [CLI reference](docs/reference/cli.md) for all commands.

## Public imports

CLI-generated games follow the established `BootstrapGame`/`Level` pattern:

```js
import { BootstrapGame, Level } from "gameforgejs/core";
import { GameObject, Screen, Draw } from "gameforgejs/2d";
```

The generated project's import map resolves these public names in the browser.
The separate `createGame` API is also available for projects that need
independent runtime instances. Package exports provide the same public names
for package-aware tooling. Internal implementation files live only in `src/`;
do not import them through deep paths or create a parallel `packages/` facade.

## Repository layout

```text
src/
  core/                 Game lifecycle, configuration, assets, input, math
  2d/                   Canvas rendering and existing 2D game APIs
  3d/                   WebGL2 rendering, scenes, materials, physics
  network/              Transports and synchronization helpers
cli/
  templates/            Minimal executable game starters
examples/
  catalog.json          Metadata consumed by the showcase and this table
  showcase/             Example browser, independent of the runtime
  Demo*/
    index.html          Browser entry
    main.js             Game bootstrap
    config/             Game settings, resource manifest and tooling metadata (migrated projects)
    src/                Levels, screens, entities, and game systems
    assets/             Game resources
scripts/                Repository checks and documentation generation
tests/                  Automated regression and contract checks
docs/                   Canonical English documentation
```

Not every example needs every optional file or source subdirectory.
`resources.json` declares loaded assets; `game.workspace.json`, when
present, is metadata for an external editor.

## Examples

The showcase is intended for exploration and integration examples. New games
start from CLI templates, which contain only the minimum runnable behavior.

<!-- examples:start -->
| Example | Dimension | Purpose |
| --- | --- | --- |
| [Movement and collision](examples/Demo/index.html) | 2D | A compact 2D example for movement, collision, and collection. |
| [Component adventure](examples/DemoAdventure2D/index.html) | 2D | Top-down movement, reusable entity components, and room camera transitions. |
| [Platform adventure](examples/DemoAdvanced/index.html) | 2D | A platform/RPG showcase with composed manifests, inventory, skills, and campaign progression. |
| [Tactical RPG](examples/DemoTacticalRPG/index.html) | 2D | A turn-based grid game with pathfinding, movement range, and combat. |
| [Fighting game](examples/DemoFightingGame2D/index.html) | 2D | Character selection, arcade and versus modes, keyboard controls, and gamepad input. |
| [Street Fight Puzzle](examples/DemoStreetFightPuzzle/index.html) | 2D | An arcade puzzle game with combos and competitive block exchanges. |
| [3D renderer](examples/Demo3D/index.html) | 3D | A Render3D scene exploring cameras, models, lighting, materials, and shadows. |
| [Solar system](examples/DemoSolarSystem/index.html) | 3D | Procedural celestial materials, sunlight, and animated planetary orbits. |
| [Sky Trail](examples/DemoMiniGame3D/index.html) | 3D | A 3D platform game with moving terrain, physics, collectibles, and textured surfaces. |
| [Online sandbox](examples/DemoOnlineMMO/index.html) | 2D | Same-origin multiplayer tabs, synchronized players, and canvas chat; optional external relay. |
| [Addon playground](examples/DemoAddons/index.html) | 2D | Shared parallax layers and a patrol/rest state machine using the standard framework lifecycle. |
<!-- examples:end -->

## Documentation

- [Documentation index](docs/index.md)
- [Create a project](docs/getting-started/new-project.md)
- [Learn from 2D and 3D examples](docs/getting-started/tutorial-demos-2d-3d.md)
- [Architecture and ownership](docs/architecture.md)
- [Migrate existing code](docs/migrations/repository-layout.md)
- [CLI reference](docs/reference/cli.md)
- [Input configuration](docs/getting-started/input-config.md)
- [Components](docs/guides/components.md)
- [3D rendering](docs/guides/render3d.md)
- [Networking](docs/guides/network.md)

English is the canonical documentation language. API reference pages are
generated from public source JSDoc; the example list above is generated from
`examples/catalog.json`. Edit those sources, then run `npm run docs`.

## Validate changes

```sh
npm run check
npm test
npm run test:browser
npm run docs
npm run docs:check
```

Run a changed example in a browser as well. Syntax and resource checks cannot
prove rendering, game input, or GPU behavior.

## Current boundaries

The game-instance API introduces explicit module setup and disposal.
Existing static engine, input, screen, and asset APIs remain available for
older examples; they must not be assumed to support several simultaneous
games in one page. See the architecture guide for the compatibility boundary.

External authoring applications and multiplayer servers are separate
projects. The local development server does not provide a game backend.
