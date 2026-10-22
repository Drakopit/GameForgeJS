# Migrate an existing project

The runtime now has one source tree, the developer CLI has one home, and
games own their entries and implementation folders.

This is a source migration. Old deep filesystem imports are not a stable
public API and are not all retained as compatibility shims.

## Runtime imports

| Previous location | Public import |
| --- | --- |
| `src/CoreCross/index.js` or `packages/core/index.js` | `gameforgejs/core` |
| `src/Core2D/index.js` or `packages/2d/index.js` | `gameforgejs/2d` |
| `src/Core3D/index.js` or `packages/3d/index.js` | `gameforgejs/3d` |
| `src/CoreNetwork/index.js` or `packages/network/index.js` | `gameforgejs/network` |

Implementation directories are now `src/core`, `src/2d`, `src/3d`,
and `src/network`. Change consumers to the public import names rather than
replacing one deep path with another.

Browser projects need an import map. Start from the generated project's
`index.html` and its CLI server/build contract. Package-aware tooling uses
the package export map. A bare module name by itself is not a URL that a
browser can resolve.

## Existing game startup

The CLI starters and most integrated examples use `BootstrapGame`, levels,
and the shared static engine services. The separate `createGame` API supports
independent game instances with explicit modules. Keep one lifecycle/loop
pattern per game; do not combine both loops in one game.

Keep a working legacy game as a behavioral baseline. Move one responsibility
at a time and verify rendering, input, assets, and cleanup after each change.
Folder moves alone are not a migration of shared static state.

## Example structure

Example roots now expose `index.html`, `main.js`, and
`game.config.json`. Code moves below `src/` according to its role:

```text
main.js
src/
  levels/
  screens/
  entities/
  components/
  systems/
assets/
```

Rename and update imports together. `Assets/` at the game root is now
`assets/`; match casing exactly for Linux/static hosting.

Each example launches in its own document.
`Main.html?demo=<id>` remains a redirect into the showcase catalog, and
query parameters used by the selected game are preserved. New links should
target the game's `index.html` directly.

## Tools and scripts

User-facing project operations live in `cli/`.
`scripts/` contains repository checks and documentation generation.
The old `tools/` location is removed.

New starters are `minimal-2d` and `minimal-3d` under
`cli/templates/`. The former incomplete genre folders are not the
recommended basis for new projects.

## Configuration and metadata

Runtime defaults belong to runtime source. Games declare their own settings
in `game.config.json`; new games do not need to copy a root engine defaults
file.

The CLI reads `gameforge.project.json`.
An external editor may read `game.workspace.json`.
The runtime asset loader reads `resources.json`.
Keep these roles explicit when updating an older game.

The CLI's `update --to 1` command migrates supported project metadata
offline. It does not automatically move arbitrary source files, rewrite all
imports, convert every legacy API, or upgrade the engine from the internet.

## Verify the result

1. Resolve all imports through the intended public surface.
2. Run the project's `doctor` command.
3. Start the game from its own HTML entry.
4. Confirm the first frame, expected input, and asset loads.
5. Build and serve the static result separately from the checkout.
6. For game-instance code, verify disposal and starting a fresh instance.

See the [CLI reference](../reference/cli.md) and
[architecture guide](../architecture.md) for the current ownership rules.
