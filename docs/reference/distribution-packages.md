# Distribution packages

`gameforgejs.package.json` selects runtime groups for static publication.
It does not register plugins, create a canvas or change the framework lifecycle.

```json
{
  "schemaVersion": 1,
  "modules": ["core", "2d"]
}
```

Place it beside `gameforge.project.json` in `config/`. Older root-level manifests
remain supported; having the same manifest in both places is an error.
Supported groups: `core`, `2d`, `3d`,
`network`, `compat`. Cross-group dependencies are included by examining actual
imports and re-exports. Selecting `2d` also includes `core`. Audio and input
currently belong to `core`.

Run `gameforge build --dry-run` to inspect `runtimeModules` and the file list,
then `gameforge build` to publish. From a checkout use
`node cli/index.cjs build --root <game> --dry-run`.
The repository's `npm run publish` uses the same build implementation.

New CLI projects include this manifest. Existing projects without it keep a full
runtime copy. The older publisher configuration path keeps its existing behavior;
selective publication currently requires `gameforge.project.json`.

## Responsibilities

| File | Responsibility |
| --- | --- |
| `game.config.json` | Screen, input, audio and game settings |
| `resources.json` | Loaded game assets |
| `gameforge.project.json` | CLI paths, template and existing extension registration |
| `gameforgejs.package.json` | Runtime groups included in publication |

The existing `gameforge add` command still registers a runtime extension. When
a distribution manifest exists, it also adds the corresponding distribution
group. Editing this manifest alone never initializes an extension. Using a
framework class does not require registering a runtime extension.

## Version 1 boundaries

- Selection retains entire groups, not individual exports. Barrel imports retain
  their normal dependencies. This is not tree shaking or bundling.
- Game code and assets are retained; unused assets are not inferred.
- The source import map is unchanged. Publication removes unselected official
  mappings from the root HTML and copies selected groups under `@engine`.
- Literal public imports, re-exports and dynamic imports in copied JavaScript,
  plus inline HTML module imports, are checked for excluded runtime groups.
- Computed imports and scoped import maps fail in selective mode because this
  version cannot verify them. Omit the manifest for a full build when needed.
- Custom loaders, remote code and arbitrary import-map configurations are outside
  this validation contract. Prefer official public runtime imports.
- The parser runs in the Node CLI only. Browser runtime dependencies are unchanged.

## Proposed addon model — next stage

An addon exports ordinary native JavaScript classes, components and data. It
uses public framework APIs and receives dependencies such as `Screen`, camera,
configuration and assets. It must not silently create another engine loop,
input service or audio manager.

Use `Component` for behavior attached to an entity with lifecycle hooks. Use
ordinary classes for controllers, state machines and algorithms. Neither form
requires a global registry or a `setup(context)` function.

The pilot will establish an entry point, declared framework groups, optional
assets and cleanup ownership. Addon discovery and version resolution are not
implemented by schema version 1. Unknown fields are rejected: do not add an
`addons` field yet.

An extraction is accepted when the original demo and an independent sample use
the same addon without importing source from each other.
