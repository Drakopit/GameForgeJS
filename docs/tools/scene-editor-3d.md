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

The 3D renderer example contains a scene document under
`examples/Demo3D/assets/Manifests/scenes/`. Sky Trail has a different,
game-specific contract under
`examples/DemoMiniGame3D/assets/Manifests/sky-trail/course.json`, describing
platforms, coins, player spawn, and a goal.

Do not treat a Sky Trail course as a generic `SceneManifest3D` scene.
The game implements that schema and the editor must preserve it. Verify edits
by reloading the corresponding game after saving.

See [2D editor integration](./world-editor-v4.md) for workspace ownership and
actor document conventions.
