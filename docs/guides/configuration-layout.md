# Configuration layout and ownership

New projects keep framework configuration in `config/`. DemoAdvanced is the
first migrated example. Other examples remain supported with their existing
layout while migration proceeds incrementally.

```text
game/
  index.html
  main.js
  config/
    game.config.json
    resources.json
    gameforge.project.json
    gameforgejs.package.json
  src/
  assets/
  game.workspace.json        optional external-editor discovery file
  package.json               optional npm tooling
```

## Why keep separate files?

| File | Consumer | Owns |
| --- | --- | --- |
| `game.config.json` | Bootstrap/Config | Game overrides for window, screen, audio, input and settings |
| `resources.json` | ResourceManifestLoader | Asset identifiers and file locations |
| `gameforge.project.json` | CLI | Project paths, template and existing extension registration |
| `gameforgejs.package.json` | Publisher | Runtime groups to distribute |
| `game.workspace.json` | External editor | Editable scenes and level documents |

These contracts are not interchangeable. The editor's document references and
runtime resource registration describe different uses of the same data. Do not
remove either just because they mention the same JSON file.

The two `modules` lists also have different meanings: the project file describes
the existing generated extension registry; the package file selects distribution
groups. This naming overlap remains a migration concern. Package selection does
not require introducing new runtime initialization code.

## Reduce duplication before adding abstractions

DemoAdvanced now stores only runtime overrides instead of copying engine defaults.
Its action bindings remain explicit; compact formatting does not change their
shape or introduce another input DSL. Dimensions and other omitted properties
are inherited from `Config.Defaults()`: declare them explicitly when a game needs
to pin them independently of future default changes.

The workspace declares common resources and their prefix once; levels inherit
those values. Level-specific gameplay manifests remain in `assets/Manifests`.
Do not split every setting into a separate file. If a project genuinely needs
several runtime configuration layers, `Config.Load` already accepts an ordered
array of paths, with later values overriding earlier values.

## Paths and compatibility

- Bootstrap paths are URLs relative to `main.js`, such as `./config/game.config.json`.
- Project metadata paths, including `enginePath`, remain relative to the game root.
- Resource paths are relative to the resource manifest URL. From
  `config/resources.json`, a game image normally uses `../assets/image.png`.
- Workspace document paths remain relative to the game root. DemoAdvanced uses
  `resources: "config/resources.json"` and `resourcePrefix: "config/"` for the
  existing editor's asset resolver.
- The external editor currently discovers `game.workspace.json` in the game root.
  Moving that file requires coordinating an editor update. It stays in the root
  for now; this repository does not pretend that discovery has already changed.
- CLI project/package manifests work in `config/` or the older root location.
  Duplicates are rejected instead of silently choosing one.
- Publication retains runtime config/resources and omits CLI/package metadata.
  The output cannot overlap the source `config/` directory.

Migration checks include effective configuration equality, asset paths, editor
workspace references and browser execution of both source and published games.
