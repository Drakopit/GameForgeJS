# Architecture and ownership

GameForgeJS separates the browser runtime, developer tooling, and games.
The directory boundaries express those responsibilities; there is one
implementation tree for the runtime.

## Framework first

The supported default is `BootstrapGame` with `Level` / `Level3D` and
`GameObject` subclasses. Bootstrap initializes configuration, input, audio,
assets and the engine loop. A 2D level owns a `Screen`, passes it to `Draw`
and its entities, and uses `AddEntity` to participate in the existing lifecycle.
In 3D, extend `Level3D` and build the scene in `BuildScene`.
Games do not need to create a raw canvas or implement their own rendering loop.

Native ES module imports organize code; runtime extension registration is a
separate, optional concern. Importing `Screen` does not require `module2D()`.
Extensions must reuse services already initialized by bootstrap. In particular,
`audioModule()` reuses bootstrap's audio manager so decoding and playback share
the same service. Bootstrap remains responsible for disposing that service.

`createGame` is an alternative instance API, not a replacement or a migration
requirement. Its isolated services do not automatically replace static services
used by existing framework classes. Keep it opt-in until integration is proven
with real levels, entities, screens, input and asset playback.

Node.js, CLI metadata and generated registries are tooling conveniences. Browser
games can use relative ES module imports and any static HTTP server without a
package install or build step.

## Repository boundaries

| Directory | Owns | Must not own |
| --- | --- | --- |
| `src/core` | Game lifecycle, services, events, configuration, shared primitives. | Example catalogs or game-specific rules. |
| `src/2d` | Canvas and reusable 2D APIs. | A particular game's player or inventory. |
| `src/3d` | WebGL2, scenes, materials, model loading, and 3D physics. | Showcase navigation or authoring UI. |
| `src/network` | Browser transports and synchronization helpers. | Authoritative server state or game protocols. |
| `cli` | Project creation, module registration, serving, generation, validation, builds, and local migrations. | Runtime dependencies on Node.js. |
| `examples` | Complete games and the showcase application. | Copies of the runtime implementation. |
| `scripts` | Maintenance of this repository, including checks and documentation generation. | A second user-facing project CLI. |
| `docs` | Canonical English guides and generated public API reference. | Hand-maintained copies of generated API data. |

The public surface is defined by package exports and module entry points.
Consumers use `gameforgejs/core`, `gameforgejs/2d`,
`gameforgejs/3d`, and `gameforgejs/network`. A directory under
`src/` is not automatically a public module.

## Bootstrap games and game instances

The established game pattern uses `BootstrapGame` to load configuration,
initialize the shared engine services, and register levels before startup.
Levels extend `Level` (or `Level3D`), while 2D entities extend `GameObject`
and are composed into levels with `AddEntity`. This is the pattern used by
the CLI's default project templates and the repository's main examples.

The separate `createGame` API supports independent game instances with an
explicit module list. Its module setup receives a game context. The context
supplies configuration, the canvas, an event bus, asset storage, services, and
disposal registration.

The context is scoped to the game instance. Module setup should register
resources with that instance and return or register cleanup for listeners,
timers, subscriptions, and other owned resources. Starting and disposing a
game must not leave a second loop or stale module subscriptions behind.

Official module factories are:

| Factory | Public entry point |
| --- | --- |
| `module2D` | `gameforgejs/2d` |
| `module3D` | `gameforgejs/3d` |
| `networkModule` | `gameforgejs/network` |
| `audioModule` | `gameforgejs/core` |
| `inputModule` | `gameforgejs/core` |

The CLI currently exposes `add` for `2d`, `3d`, `network`, and `audio`.
The established bootstrap pattern initializes shared static input services
from game configuration. Compose `inputModule` directly when a `createGame`
project needs an instance-based input service.

The CLI's `add` command edits project module registration. Runtime module
setup and CLI project modification are different responsibilities: adding a
module does not invent game-specific behavior or install an authoritative
server.

The runtime validates unique module IDs, required dependencies, and dependency
cycles before running setup. `requires` lists module IDs and determines setup
order. A missing dependency is an error, rather than an implicit installation.

## Lifecycle contract

| Operation | Behavior |
| --- | --- |
| `await game.start()` | Sets up modules, loads declared resources, enters the level, and starts the loop. Repeated calls do not create another loop. |
| `game.stop()` | Pauses the loop while retaining initialized resources. A later `start()` resumes. |
| `await game.dispose()` | Stops the loop and releases resources; the instance cannot be restarted. Create a new instance to start over. |

Modules listen to `context.events`: `update` and `fixedUpdate` receive time
in seconds; `render` receives the interpolation fraction. Register cleanup
through `context.onDispose(fn)` or return a cleanup function from `setup`.
Cleanup runs in reverse registration order, including when startup fails.

Levels receive the context through `OnStart(context)` and `level.context`.
The existing level hooks are `OnUpdate`, `OnFixedUpdate`, `OnDrawn`, `OnGUI`,
and `OnDestroy`. `OnStart` and frame hooks are synchronous; perform awaited
preparation in module setup or `beforeStart` instead. Do not assume methods
named `OnRender` or `OnStop` are dispatched by this runtime.

A `createGame` application may have no levels and implement its behavior
through modules. Use the starter and generated API reference for current
method signatures.

## Compatibility boundary

Existing examples use APIs such as `Engine`, `Screen`, `Input`,
`ActionManager`, and `AssetManager.instance` that carry shared static
state. Moving them into a new folder does not make that state instance-local.

The game-instance lifecycle does not imply that arbitrary old game code can
run concurrently in the same page. Keep legacy games isolated per document
until their state and resources have been migrated to explicit contexts.
The showcase opens each example's own HTML document.

Deprecated 3D compatibility APIs remain separate from the recommended
rendering surface. See [3D rendering](./guides/render3d.md) and the
[public API reference](./reference/api/index.md).

## Configuration has one owner per concern

- Runtime defaults live in source and are extended by a game's configuration.
- `game.config.json` holds game-specific runtime settings.
- `gameforge.project.json` holds CLI metadata and selected modules.
- `resources.json` lists loaded assets.
- `game.workspace.json` is optional editor metadata.

These files are separate contracts, not interchangeable sources of settings.
Do not copy screen/input defaults into several independent files and expect
them to stay synchronized. A new field belongs to the contract that actually
consumes it.

## Game code layout

Keep `index.html` and `main.js` at the game root. New projects place runtime
configuration, resource manifests and CLI metadata in `config/`; older root
layouts remain supported. The external editor's workspace discovery file stays
at the root until its discovery contract is updated. See
[configuration ownership](guides/configuration-layout.md).
Put implementation under `src/`, using directories such as `levels`,
`screens`, `entities`, `components`, and `systems` only when needed.
Keep media and authored data under `assets/`.

A minimal starter demonstrates one executable path. A showcase can contain
several game systems. They have different purposes and should not be copied
over one another to simulate template generation.

## Sources of truth

| Concern | Source |
| --- | --- |
| Runtime implementation | `src/` |
| Public module names | Package exports and the corresponding entry points |
| Public API reference | JSDoc on exported code |
| Example names, descriptions, and links | `examples/catalog.json` |
| Generated starter contents | `cli/templates/` |
| Project module registration | Project metadata and the CLI-generated `src/modules.js` |

Generated artifacts must be reproducible from these sources. When two files
represent the same contract, define which is generated and check for drift
instead of expecting both to be edited manually.
