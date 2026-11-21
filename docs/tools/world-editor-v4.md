# External 2D editor integration

WorldEditor/WorldMaker is an external authoring application. It is not part of
the GameForgeJS runtime or development server. Installation, supported UI
features, and release instructions belong to the editor's own project.

This page describes the files shared with the runtime. The editor may change
its UI without changing those contracts.

## Workspace and runtime resources

`game.workspace.json` tells an editor which documents compose each level.
The runtime loads `resources.json` and the game's entry point; it does not
interpret the workspace as a game implementation.

```json
{
  "schemaVersion": 1,
  "kind": "GameForgeJS.Workspace",
  "resources": "resources.json",
  "resourcePrefix": "",
  "levels2D": [
    {
      "id": "level_1",
      "levelType": "platformer",
      "documents": {
        "stage": "assets/Manifests/level_1/stage.json",
        "player": "assets/Manifests/level_1/player.json",
        "enemies": "assets/Manifests/level_1/enemies.json"
      }
    }
  ],
  "scenes3D": []
}
```

Keep workspace document paths relative to the game folder. Register documents
needed at runtime in `resources.json` as well. A `documents` entry alone does
not load JSON or implement a behavior. When an editor writes a new file, verify
that both its authoring reference and its runtime resource registration exist.

## Actor documents

An editable `player.json` stores appearance on `player` and initial position
inside `spawn`:

```json
{
  "player": {
    "asset": "hero_idle",
    "frame": { "x": 0, "y": 0, "width": 96, "height": 84, "frames": 7 },
    "runAsset": "hero_run",
    "runFrame": { "x": 0, "y": 0, "width": 96, "height": 84, "frames": 8 },
    "scale": 1,
    "bodySize": { "width": 32, "height": 48 },
    "spawn": { "x": 100, "y": 300 }
  }
}
```

Enemy documents place shared appearance in `enemyDefaults`; individual
instances declare position and overrides:

```json
{
  "enemyDefaults": {
    "asset": "enemy_idle",
    "frame": { "x": 0, "y": 0, "width": 148, "height": 96, "frames": 6 },
    "scale": 1,
    "bodySize": { "width": 64, "height": 64 }
  },
  "enemies": [
    { "id": "enemy_01", "x": 420, "y": 300 }
  ]
}
```

`asset` references a name in `resources.json.images`. `frame` describes the
first sprite rectangle; `frames` is the number of horizontally arranged
animation frames. The Advanced and Tactical RPG examples implement this
convention. Other games must explicitly implement the documents they use.

## Validate changes

Run the repository's asset checks after changing the bundled examples:

```sh
npm run check:editor-assets
```

The checker verifies registered files and supported sprite/animation
rectangles. It does not replace running the game: verify that editing a spawn,
tile, or object also changes the runtime scene.

See [3D editor integration](./scene-editor-3d.md) for the 3D scene contract.
