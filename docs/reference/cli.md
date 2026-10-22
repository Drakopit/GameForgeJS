# CLI reference

The CLI creates and serves local games, adds supported modules, generates
source files, checks project structure, and builds static output.

From an engine checkout, use `node cli/index.cjs`. Inside a generated
project with its dependency installed, the `gameforge` package executable
provides the same commands. A global npm installation is not required.

## Commands

| Command | Purpose |
| --- | --- |
| `create <directory>` | Generate a new game from a bundled starter. |
| `serve` | Serve a game and its engine import-map paths. |
| `add <module>` | Add a supported module to project configuration. |
| `generate <kind> <Identifier>` | Generate a source file from a supported pattern. |
| `doctor` | Validate project files and report problems. |
| `build` | Produce a static game directory. |
| `update` | Apply a supported local project-schema migration. |

Paths in the following examples are relative to an engine checkout.

## Create

```sh
node cli/index.cjs create ../my-game --template minimal-2d
node cli/index.cjs create ../my-3d-game --template minimal-3d
```

Options:

- `--template minimal-2d|minimal-3d`: select the starter.
- `--engine <directory>`: use a specific local engine package.
- `--dry-run`: preview the proposed changes.

The default engine is the package containing the CLI. Generated project
metadata records the local engine location and package dependency. This
workflow does not download an engine version from a package registry.

## Serve

```sh
node cli/index.cjs serve --root ../my-game --port 8080
node cli/index.cjs serve --root ../my-game --base /game/
```

Options are `--root`, `--host`, `--port`, and `--base`.
The default host is `127.0.0.1`. The server maps the game's `@engine`
URLs to engine source so that browser import maps resolve public modules.

A base path lets you test deployment below a URL prefix. Use the actual
address printed by the command.

## Add a module

```sh
node cli/index.cjs add network --root ../my-game --dry-run
node cli/index.cjs add network --root ../my-game
```

Supported module identifiers are `2d`, `3d`, `network`, and `audio`.
Adding a module configures its availability; the game still owns its scene,
audio playback, multiplayer protocol, and gameplay code.

The minimal starters have one canvas and therefore select either `2d` or
`3d`. Adding the other renderer to the same minimal project is rejected.
Custom games that need separate rendering surfaces must compose them
explicitly.

`--dry-run` previews changes. Repeated addition of an already configured
module should not duplicate configuration. This command does not execute
arbitrary third-party package installation hooks.

The CLI owns `src/modules.js`. If that generated file has been edited by
hand, `add` reports a conflict rather than overwriting the custom changes.
Keep custom modules in separate files and compose them from `main.js`.

## Generate source

```sh
node cli/index.cjs generate level ForestLevel --root ../my-game
node cli/index.cjs generate entity Player --root ../my-game
```

Supported kinds are `level`, `screen`, `entity`, and `module`.
Names must be valid supported identifiers. Use `--dry-run` to inspect
the plan before writing.

Scaffolds follow the selected starter: 2D levels and screens extend `Level`,
2D entities extend `GameObject`, and 3D levels extend `Level3D`. Register a
generated level in `main.js`; add generated 2D entities with `AddEntity`, or
add generated 3D meshes to a level in `BuildScene`. Generation creates source
files but does not silently alter game composition. Module scaffolds subscribe
to the game context and return cleanup. See
[Architecture](../architecture.md#lifecycle-contract).

## Validate

```sh
node cli/index.cjs doctor --root ../my-game
```

Use this before a build or after moving the engine/project. File and schema
checks do not replace running the game in a browser.

## Build

```sh
node cli/index.cjs build --root ../my-game
node cli/index.cjs build --root ../my-game --out dist-preview --dry-run
```

The default output is `dist`. The output includes the runtime under
`@engine` so it can be served independently of the source checkout.
This is a static copy build, not a minifier or a tree-shaking bundler.

`--config <legacy.publisher.json>` selects the compatibility publisher
configuration where supported. Prefer the normal project build for new games.

## Update project metadata

```sh
node cli/index.cjs update --root ../my-game --to 1 --dry-run
node cli/index.cjs update --root ../my-game --to 1
```

This is an offline migration of supported project metadata to a schema
version. It does not download a new engine release or rewrite arbitrary
application code. Check the migration output and run `doctor` afterward.

See [Project creation](../getting-started/new-project.md) for file ownership
and [Repository migration](../migrations/repository-layout.md) for moved
runtime paths and the existing examples.
