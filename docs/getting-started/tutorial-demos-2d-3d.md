# Learn from 2D and 3D examples

Start with an executable minimal project, then use the larger examples to
answer a specific question. This keeps setup separate from game-specific
features.

## A minimal 2D game

```sh
node cli/index.cjs create ../hello-2d --template minimal-2d
node cli/index.cjs serve --root ../hello-2d
```

Open the printed address. Inspect the generated `main.js`, then follow its
imports into `src/`. The generated code is the example's source of truth;
this guide does not maintain another copied version of it.

Make one change at a time: change the rendered object's color or position,
reload, then add an input action. Verify the behavior before moving it into a
new entity or component.

Useful references:

- [Project layout and configuration](./new-project.md)
- [Per-game input](./input-config.md)
- [Reusable components](../guides/components.md)
- Movement and collision: `examples/Demo/`
- Components and room transitions: `examples/DemoAdventure2D/`
- Manifests and campaign flow: `examples/DemoAdvanced/`

## A minimal 3D game

```sh
node cli/index.cjs create ../hello-3d --template minimal-3d
node cli/index.cjs serve --root ../hello-3d
```

A WebGL2-capable browser is required. Inspect how the starter composes its
camera, scene, mesh, and game loop. Change a transform or material first;
introduce model files and physics only when the minimal scene is working.

Useful references:

- [3D rendering concepts](../guides/render3d.md)
- [External scene document contract](../tools/scene-editor-3d.md)
- Renderer scene: `examples/Demo3D/`
- Animated celestial materials: `examples/DemoSolarSystem/`
- Moving platforms, textures, physics, and course data:
  `examples/DemoMiniGame3D/`

Use the current `Level3D`, `Mesh`, `PerspectiveCamera`, and material
APIs for new code. Deprecated compatibility exports are described in the
[3D guide](../guides/render3d.md#legacy-apis).

## Browse an existing example

From the engine checkout, run `npm start` and open
`/examples/showcase/index.html`. The catalog links directly to each game's
own `index.html`.

Within an example:

1. Read `main.js` to see game composition.
2. Read `game.config.json` for game settings.
3. Follow imports into `src/levels`, `src/screens`, and `src/entities`.
4. Read `resources.json`, if present, to locate loaded data and media.
5. Use `game.workspace.json` only when working with an external editor.

Larger demos keep their own game rules. A skill tree, inventory, puzzle rule,
or campaign flow is not automatically part of the reusable engine API.

## Contribute an example

Give the example its own `index.html`, a small root `main.js`, game
settings, and code under `src/`. Keep its required resources self-contained
or declare an explicit shared owner. Do not import another example's game
code or private assets.

Add its metadata once to `examples/catalog.json` and run `npm run docs`
to update the generated README table. The showcase reads the same catalog.

Run the checks, then open the example itself and verify its first frame,
input, resource loading, and return/reload behavior. A project that passes
only a JavaScript syntax check is not yet a working example.
