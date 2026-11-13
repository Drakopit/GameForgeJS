# Toon adventure checkpoint 1: a room you can explore

This is the first executable foundation of the Toon 3D ABS path, not the finished
Zero to Hero adventure. It verifies banded lighting, overhead movement and solid
obstacles with original primitive placeholders. Combat, skinned animation,
imported environment art, water and progression remain later checkpoints.

The current demo also includes [checkpoint 2: the first ABS encounter](toon-abs-checkpoint.md).
Follow that lesson for Space attacks, the sentry, health and the full encounter reset.

## 1. Run the room

From a checkout with dependencies installed:

```sh
node cli/index.cjs serve
```

Open `/examples/DemoToonABS/index.html` on the printed local server address.
You should see a green courtyard, two trees, two blocks and a golden sphere.
WASD or arrows move the sphere; diagonal movement has the same speed as cardinal
movement. The blocks stop it. R returns it to the entrance. B cycles 2, 3 and 4
lighting bands; look at the tree crowns to see the difference. Press H to toggle
the help panel drawn with ScreenUI; help does not pause gameplay.

If the canvas is blank, check the browser console: WebGL2 is required, and shader
compilation errors are reported by the renderer. Serve over HTTP; opening the HTML
directly from disk does not establish the module and asset loading environment.

## 2. Follow the files

| File under `examples/DemoToonABS` | Responsibility |
| --- | --- |
| `main.js` | BootstrapGame, module2D/module3D and the initial level |
| `config/game.config.json` | Screen and action bindings |
| `config/gameforgejs.package.json` | Distribution: core, 2d and 3d |
| `src/levels/ToonRoomLevel.js` | Scene composition, lights and band controls |
| `src/data/Courtyard.js` | Camera, spawn, bounds, obstacles and palette |
| `src/entities/CourtyardRoom.js` | Room meshes and static physics bodies |
| `src/entities/Explorer.js` | Placeholder player mesh, input and dynamic body |
| `src/ui/ToonRoomHUD.js` | Framework HUD and H-key help panel |

`Level3D` creates and disposes the rendering surface, renderer and physics world.
The level registers its entities through `AddEntity`; the entities remove their
physics bodies during teardown. There is no manually created canvas or second
animation loop. The fixed overhead camera is an existing `PerspectiveCamera`.

The player extends the current renderer's `Mesh` and participates in the level's
entity lifecycle. The old `GameObject3D` is deprecated; it is not introduced into
this new project. Physics is the existing sphere/box solver, not a general mesh
collision system. The scene is intentionally small and static.

## 3. Change the style

The public material is available to any 3D project:

```js
import { ToonMaterial } from 'gameforgejs/3d';

const material = new ToonMaterial({
    albedoColor: '#419b82',
    bands: 3,
    receiveShadow: true,
});
material.bands = 4;
```

`bands` accepts integers from 2 through 8, including runtime changes. Other values
throw `ToonMaterial bands must be an integer from 2 to 8.`

The material reuses StandardMaterial's texture and normal-map bindings, lights,
normal transforms and directional shadow pipeline. Direct diffuse lighting is
quantized per light; smooth specular is omitted for this matte style. Ambient and
hemisphere lighting, distance attenuation and filtered shadows remain continuous.
It is not a promise that the final image contains exactly three RGB colors.
StandardMaterial keeps its existing smooth lighting behavior.

Exercise: change a block's color in `Courtyard.js`, reload, and compare the tree
crowns with two versus four bands. Replace a ToonMaterial with StandardMaterial
to use ordinary lighting without changing the level or physics.

## 4. Publish the same room

```sh
node cli/index.cjs build --root examples/DemoToonABS --dry-run
node cli/index.cjs build --root examples/DemoToonABS
node cli/index.cjs serve --root examples/DemoToonABS/dist
```

The plan selects `core`, `2d` and `3d` and excludes network, compatibility and
unselected addons. The current combat checkpoint additionally selects the
state-machine addon. The 2D group supplies ScreenUI through module2D. Level3D owns the overlay
and its cleanup; all instructions are drawn in the HUD, not HTML elements.
Check movement, B and R again in the published build. This checkpoint is also
tested when hosted under a URL prefix.

## Next checkpoint

Add one readable ABS encounter: attack startup/active/recovery windows, one hit
per target per attack, enemy telegraph, damage, invulnerability and reset. Keep
each behavior state in its own file. These gameplay rules should work with the
placeholder meshes before importing and animating the final characters.
