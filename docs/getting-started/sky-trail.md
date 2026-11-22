# Sky Trail: a modular 3D platforming demo

Run `node cli/index.cjs serve` and open `/examples/sky-trail-3d/index.html`.
Choose **Sky Trail** for the normal course or **Sky Trail — Ventos Altos** for a
harder timing variant of the same layout. The second variant moves platforms 20%
faster, shortens the blinking platform's solid window and shifts intermediate coins.
It uses its own manifest, without duplicating gameplay classes or textures.

## Play the course

1. Collect the two coins on the starting island.
2. Jump toward the moving garden platform. Movement follows the camera direction.
3. Land on the central platform's golden ring to activate the checkpoint; it turns green.
4. Continue through the moving and blinking platforms. A red platform is about to vanish.
5. Collect all seven coins and reach the flag to finish. The HUD shows progress,
   altitude, falls, elapsed time and the best completion time for this course in this session.
6. Falling costs five score points and returns you to the checkpoint (or start).
   Collected coins remain collected. R restarts the whole run and clears the checkpoint.

Jump input has a 120 ms buffer and 100 ms grace window after leaving a ledge.
It is still a single jump: holding the button does not repeatedly jump. These
small timers consume the fixed timestep supplied by the engine. No extra loop or
wall-clock delta is introduced. The timer and physics stop on victory, so score and
best time cannot keep changing while the results are displayed.

## Controls

| Action | Keyboard | Standard gamepad (Xbox labels) |
| --- | --- | --- |
| Move | WASD / arrows | Left stick / D-pad |
| Jump | Space / Z | A (PS Cross / Nintendo B) |
| Run | Left Shift | RT |
| Orbit camera | Q / E | Right stick left/right |
| Help | H | Top face button: Y |
| Restart run | R | Left stick click |
| Menu | Escape / Backspace | B / Back |
| Select / retry after victory | Enter / Space / Z | A / Start |

All actions use ActionManager and config/game.config.json. Movement preserves
analog strength. Help is drawn with ScreenUI and does not pause the world.
Mouse and touch gameplay are not implemented in this demo.

## Code ownership

| File under src/ | Responsibility |
| --- | --- |
| levels/CubeGameLevel.js | Compose the scene, sequence fixed-step work, manage run progression |
| entities/TrailPlayer.js | Imported character, physics body, input, facing, buffered jump and reset |
| entities/TrailPlatforms.js | Moving/blinking solids, attached positions and passenger transport |
| entities/TrailCoins.js | Coin meshes, animation, pickup and reset |
| entities/TrailGoal.js | Flag, beacon and locked/unlocked presentation |
| entities/TrailCheckpoint.js | Stationary landing checkpoint, marker and respawn position |
| rendering/TrailCamera.js | Smooth follow and orbit |
| rendering/SkyTrailSurfaceFactory.js | Shared platform geometry and texture/material composition |
| ui/SkyTrailHUD.js and ui/SkyTrailHelp.js | Progress, result and keyboard/gamepad help |
| data/SkyTrailCourse.js | Load the selected course and convert JSON coordinates to Vector3D |

The level owns the entities through AddEntity. Each owner removes its meshes and
physics bodies in OnDestroy. The renderer remains owned/disposed by Level3D.
Entities do not receive the entire level as a service bag: they receive their scene,
physics, definitions and explicit collaborators.

Input is captured in OnUpdate. Moving platforms, passenger carry and player intent
are applied before Level3D's existing physics step. Pickup, checkpoint landing and
finish detection run after that step. Camera following stays in the render update.
This prevents platform movement depending on how many render frames happen between
physics ticks. Reset clears grounded references, pending jumps and checkpoint state.

## Author a variant

Copy assets/Scenes/sky-trail/sky-trail.gfscene.json (or create it in the GameForgeJS
Editor's 3D view) and register it in config/resources.json with a JSON asset name
beginning with `sky_trail_course_`. The menu discovers it. Platforms, coins (children
of their platform), the player spawn, the goal and the lights are scene nodes;
gameplay tuning is the scene's `settings`. Keep unique platform node IDs.
A platform with `checkpoint: true` must be stationary and permanent: a moving or
blinking checkpoint is rejected. Its respawn point is computed from the top surface
and the player's collider, not a second hard-coded spawn coordinate.

Ventos Altos demonstrates this workflow. It is a timing variant, not an entirely
new map. Session records are keyed by course asset name and are not saved to disk.

## Validation and publication

```sh
node cli/index.cjs build --root examples/sky-trail-3d
node cli/index.cjs serve --root examples/sky-trail-3d/dist
npm run test:browser
```

The targeted browser regression covers both course variants in source and a build
hosted under a URL prefix: grounding, jumping, jump grace/buffering, moving-platform
carry, blinking collision, checkpoint/fall recovery, coin retention, finish gating,
score/time freeze, reset, keyboard/gamepad input and disposal. It uses deterministic
placement for progression checks; this does not replace human difficulty testing.

Visual QA also caught reversed triangle winding on BeveledCube bevel faces and
Ring surfaces; both now face their declared normals. Screen honors pixelArt:false
so the 3D demo's HUD does not use pixelated CSS scaling. These fixes have dedicated
geometry and browser coverage. Vector Swizzling remains the next separate task.


## Shared math and tuning

Facing uses MathExt.LerpAngle and camera following uses Vector3D.Lerp. Spatial
updates use semantic vector components, converting at physics/render boundaries.
Movement defaults, menu repeat/orbit, score rules and scenery proportions are named
in data/TrailSettings.js. Existing course movement settings override the defaults.
See [code conventions](../guides/code-conventions.md).

Run `npm run test:sky-trail` for the four-course source/build regression, including
menu gamepad navigation, preview resource reuse and platform-to-platform jumps.
