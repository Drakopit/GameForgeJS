# External 3D editor integration

Scene Editor 3D is an external authoring application. Its installation and UI
documentation belong to that project's repository. GameForgeJS consumes the
resulting JSON; the game does not require the editor to run.

## Runtime contract

Register the scene in the game's `resources.json`:

```json
{
  "jsons": [
    { "name": "scene", "path": "./assets/Manifests/scenes/start.scene.json" }
  ]
}
```

After loading resources, instantiate the registered document:

```js
import { AssetManager } from "gameforgejs/core";
import { Level3D, SceneManifest3D } from "gameforgejs/3d";

export class MySceneLevel extends Level3D {
    BuildScene() {
        const document = AssetManager.instance.GetJson("scene");
        this.scene.backgroundColor = [...document.backgroundColor];
        this.camera = SceneManifest3D.CreateCamera(
            document.camera,
            this.width / this.height,
        );
        this.scene.Add(this.camera);
        SceneManifest3D.Populate(this.scene, document);
    }
}
```

This example uses the existing static asset-manager integration. It is not a
serialized scripting system: the game still owns its movement, collisions,
goals, actors, and UI.

## Authoring metadata

`game.workspace.json` declares editable scene documents for an editor;
`resources.json` declares the resources loaded by the game. Keep both
references consistent when moving or renaming a scene.

Every 3D example keeps its scene in a `gameforgejs.scene` file (`*.gfscene.json`):
`renderer-3d/assets/Scenes/gallery.gfscene.json` (camera, fog, lights),
`sky-trail-3d/assets/Scenes/sky-trail/*.gfscene.json` (platforms, coins, spawn, goal, lights)
and the scenes of highland-tactics, aether-observatory, solar-system and toon-adventure.
Games read them with `SceneDocument`; `SceneManifest3D.Create` also accepts a 3D scene. Verify edits
by reloading the corresponding game after saving.

See [2D editor integration](./world-editor-v4.md) for workspace ownership and
actor document conventions.
