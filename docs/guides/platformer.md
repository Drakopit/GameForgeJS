# Platformer movement: first playable slice

This optional addon uses the existing `Component`, `GameObject`, `ActionManager`
and `TileCollision2D` lifecycle. It creates no canvas, engine, or input loop.
The movement lab is a small foundation, not the final 20-stage course.

## Run and explore

1. From the repository, run `npm install` and `npm run dev`.
2. Open `examples/DemoPlatformer/index.html` on the local server.
3. Move with A/D or arrows. Press Space to jump; release early for a lower jump.
4. Collect all four coins and reach the gold flag. The camera follows through a
   scrolling world. Enter advances to the second stage, then returns to the first
   after completing both. R restarts the current stage; falling keeps your coins.
5. Try pressing jump just before landing (120 ms buffer) or just after leaving
   an edge (100 ms coyote time).

## Add movement to your own GameObject

The demo keeps each class in its own file: `src/entities/Player.js` owns player
component composition and respawn, and `src/levels/PlatformerLevel.js` owns terrain and level
rules. `main.js` only bootstraps the game. The addon follows the same organization:
`PlatformerController.js` handles movement, `TilePlatformerWorld.js` adapts tile
collision, and `index.js` only exports the public classes.

Import from `gameforgejs/addons/platformer`, map the `LEFT`, `RIGHT`, and `JUMP`
actions in your normal game config, then attach the component after setting size:

```js
import { PlatformerController, TilePlatformerWorld } from 'gameforgejs/addons/platformer';

const world = new TilePlatformerWorld({
    tileSize: 32,
    worldWidth: 30,
    worldHeight: 17,
    getTile: (x, y) => y >= 15,
});
player.size.x = 24;
player.size.y = 30;
player.AddComponent(new PlatformerController({ world, speed: 260 }));
level.AddEntity(player);
```

Positions are pixels; velocities are pixels/second and timings are seconds.
The component updates the owner's existing `position`. Call `super.OnUpdate(dt)`
and `super.OnFixedUpdate(dt)` when overriding those hooks in an entity or level.
Draw normally through `Screen` and `Draw`; the addon does not choose your sprites.

Tune `speed`, `acceleration`, `deceleration`, `gravity`, `jumpSpeed`, `maxFallSpeed`,
`coyoteTime`, `jumpBufferTime`, and `jumpCutRatio` in the constructor. Setting either
timing to zero disables that tolerance. After teleporting, call `controller.Reset()`.

Experienced developers can supply a world with `Move(body, dt)` that mutates
`x`, `y`, `vx`, `vy` and returns `{ grounded, left, right, top, bottom }`, or use
`input: null` and send snapshots with `SetInput({ axis, jumpPressed, jumpHeld })`.
`jumpPressed` is a new press, not a held button. This supports AI or replay input
without replacing the framework's lifecycle.

## Configuration and distribution

### Collect items and move between levels

`src/entities/Coin.js` is a normal `GameObject` with a `BoundsComponent`. The
player also has bounds, so collecting uses the framework's rectangle intersection
instead of another collision implementation. `TryCollect(player)` returns true
only for the first overlap; collected coins remain registered but stop drawing.

The level checks collection after physics, counts successful pickups, and unlocks
the flag only when all coins have been collected. `src/ui/PlatformerHUD.js` owns
the count and instruction drawing. Movement and animation stay independent of
these game rules.

To add another stage:

1. Create a data file like `src/data/CollectionStage.js`. Give it a title, terrain,
   spawn, goal, and coin positions. Coin coordinates are in pixels.
2. In `main.js`, pass it to a new `PlatformerLevel(stage)` in the bootstrap's
   ordered `levels` array. Set `last: true` only on the final stage for the HUD.
3. Reaching the unlocked flag sets `won`. Enter then sets the framework's `Next`
   flag; the engine exits the old level and starts the next one. The last level
   wraps to the first using the existing engine behavior.

`Level.OnExit` destroys the registered entities and removes their canvas.
`PlatformerLevel.OnStart` recreates the player and coins and resets the stage's
count, including on reentry. R resets the current player, coins, camera and win
state; falling resets only the player. No score or progression is persisted across
reloads. These are two small validation stages, not the final 20-stage game.

### Animate the player with Sprite and Animator

1. `config/resources.json` loads the original SVG sheets in `assets/player/`.
   Each sheet has one row of 32 × 32 frames. Asset paths are relative to the manifest.
2. `src/data/PlayerAnimations.js` maps Idle, Run, Jump and Fall to their asset keys,
   frame counts and timing. `speed` is the existing Sprite updates-per-frame value
   at a 60 FPS reference: 6 means 10 frames per second.
3. `src/components/PlayerAnimation.js` registers these sheets with the framework's
   `Animator`, using the `Sprite` already owned by `GameObject`.
4. The component selects a pose from grounded state and velocity, and retains the
   last horizontal facing direction. Repeated `Animator.Play` calls for the same
   animation do not restart it.
5. `GameObject.OnUpdate` advances sprite frames once. Its legacy `isMoving` flag
   enables that update, including the idle animation. The component only selects
   animations and calls `Animator.Update`; it does not also call `Sprite.Update`.
6. Drawing aligns the sprite's feet with the 24 × 30 collision body. Changing art
   does not change the collision size. Respawn resets both movement and animation.

The artwork is an original geometric placeholder for this lab, with editable
frames in each SVG. It is not the final course's character art. Animation selection
does not alter movement or introduce another state machine.

### Build a scrolling stage

1. Edit `src/data/MovementStage.js`. `columns`, `rows`, and terrain rectangles
   use tile units. `spawn` and `goal` use pixels.
2. The level supplies the same terrain to drawing and `TilePlatformerWorld`.
   Extending the map does not require changing the movement addon.
3. Construct the framework's `Camera` with the screen size and call `Init(screen,
   { width, height })` using the stage size in pixels.
4. Call `camera.Update(player, dt)` after movement and respawn in `OnFixedUpdate`.
   The existing camera follows the player and clamps to the world's edges.
5. Draw terrain, entities and the flag between `camera.Begin()` and `camera.End()`.
   Use `try/finally` so the drawing context is restored even if drawing fails.
   Draw `OnGUI` outside this block to keep the HUD fixed on screen.

`Level.OnDrawn()` clears the screen before drawing entities. This demo owns the
complete drawing order: clear once, paint the background, begin the camera, draw
terrain and registered entities, end the camera, then draw the HUD. Its override
therefore calls each entity's `OnDrawn()` directly instead of calling the base
level's drawing method after painting terrain.

This example uses the existing camera at zoom 1. It does not add a second camera
implementation or change the framework's camera API.

### Runtime and tooling files

All four tooling/runtime files live in the demo's `config/` directory:

- `game.config.json`: screen and action mappings.
- `resources.json`: player animation sheets.
- `gameforge.project.json`: entry point and paths for tooling.
- `gameforgejs.package.json`: distribution selection, with `modules: ["core", "2d"]`
  and `addons: ["platformer"]`.

The project metadata points to the runtime files; it does not duplicate their
settings. Stage data lives in `src/data/MovementStage.js`; the level owns rules
and the player owns respawn behavior.

## Next increments

The tile adapter currently supports solid rectangular tiles and horizontal world
bounds. Slopes, one-way platforms, moving platforms,
enemies, checkpoints and persistent progression remain separate increments. Do not
attach this controller alongside another component that also moves the same body.
The final Zero to Hero game will need its complete stages, art, source, and guide
validated together before it is considered finished.
