# Rendering in 3D

The 3D module uses native WebGL2. It provides scenes, cameras, meshes,
materials, lights, asset loaders, and basic rigidbody physics without a
third-party rendering dependency.

## Current APIs

| Area | APIs and behavior |
| --- | --- |
| Rendering | `WebGL3DRenderer`, `Scene3D`, `PerspectiveCamera`. |
| Geometry | `Mesh`, `Geometry3D`, `PrimitiveMesh`; cubes, beveled cubes, planes, spheres, and rings. |
| Materials | `StandardMaterial`, `UnlitMaterial`, and `CelestialBodyMaterial`. |
| Textures | Albedo, normal, ARM/ORM, height/parallax, UV tiling, and cross-image skyboxes. |
| Lighting | Ambient, hemisphere, directional, point, and spot lights. |
| Shadows | Directional shadow mapping with PCF filtering. |
| Physics | Rigidbody gravity, sphere and AABB colliders, floor contact, and moving platforms. |
| Scene data | `SceneManifest3D` instantiates registered scene JSON. |
| Models | `ModelLoader`, `Model3D`, and `ModelMeshFactory`. |

The [minimal 3D starter](../getting-started/new-project.md) is the runnable
starting point. The examples below focus on rendering concepts and assume the
game's import map or bundler already resolves `gameforgejs/3d`.

## Build a scene

```js
import {
    DirectionalLight,
    HemisphereLight,
    Mesh,
    PerspectiveCamera,
    PrimitiveMesh,
    Scene3D,
    StandardMaterial,
    WebGL3DRenderer,
} from "gameforgejs/3d";

const renderer = new WebGL3DRenderer(canvas);
const scene = new Scene3D();
const camera = new PerspectiveCamera({
    fov: 60,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 1000,
    position: [0, 4, 10],
    target: [0, 0, 0],
});

scene.Add(camera);
scene.Add(new HemisphereLight({
    skyColor: [0.5, 0.7, 1.0],
    groundColor: [0.35, 0.25, 0.18],
    intensity: 0.6,
}));
scene.Add(new DirectionalLight({
    direction: [-0.5, -1, -0.4],
    intensity: 2.2,
    castShadow: true,
    shadowMapSize: 1024,
}));

const cube = Mesh.FromGeometry(
    PrimitiveMesh.BeveledCube(0.075),
    new StandardMaterial({ roughness: 0.9, metallic: 0 }),
);
scene.Add(cube);

// Call from the game's render callback:
renderer.Render(scene, camera);
```

Here `canvas` is an existing canvas element. A new game should use the
render callback of its game instance instead of starting another independent
animation loop.

## Textures and skyboxes

```js
import { Skybox, StandardMaterial, Texture } from "gameforgejs/3d";

const material = new StandardMaterial({
    albedoMap: Texture.Load("./assets/rock_albedo.png"),
    normalMap: Texture.Load("./assets/rock_normal.png"),
    ormMap: Texture.Load("./assets/rock_arm.png"),
    heightMap: Texture.Load("./assets/rock_height.png"),
    uvScale: [2, 2],
    normalScale: 1.05,
    heightScale: 0.035,
    roughness: 0.9,
    metallic: 0,
});

// skyImage must be a loaded cross-layout image:
scene.Add(Skybox.FromImage(skyImage));
```

Those filenames are illustrative. Register and provide the actual textures
used by your game. Sky Trail contains a complete example with material files.

## Scene manifests

A `Level3D` subclass can instantiate a loaded scene document:

```js
import { AssetManager } from "gameforgejs/core";
import { Level3D, SceneManifest3D } from "gameforgejs/3d";

export class MyLevel3D extends Level3D {
    BuildScene() {
        const document = AssetManager.instance.GetJson("my_scene");
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

This uses the existing `Level3D` and static asset-manager integration. See
the [architecture guide](../architecture.md) for the boundary between existing
static APIs and the game-instance lifecycle.

An external authoring tool can produce compatible JSON; it does not need to
be embedded in the runtime. See [3D editor integration](../tools/scene-editor-3d.md).

## Legacy APIs

Deprecated 3D exports remain for source compatibility with existing game
code. New code should use the current rendering types:

| Deprecated type | Current alternative |
| --- | --- |
| `LegacyLevel3D` | `Level3D` |
| `LegacyTransform3D` | `Transform3D` |
| `GameObject3D` | `Mesh`, `Model3D`, or a game-specific entity |
| `Camera3D` | `PerspectiveCamera` |
| `DirectionalLight3D` | `DirectionalLight` |
| `Shapes3D` | `Mesh` with `PrimitiveMesh` and a material |
| `Mesh3D` | `Mesh` with `ModelMeshFactory` |
| `Skybox3D` | `Skybox` |

These types are marked through JSDoc and runtime warnings. The project does
not require experimental JavaScript decorators.
