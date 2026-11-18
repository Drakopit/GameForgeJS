# Touch Garden: mobile building blocks

Touch Garden is a small top-down collection game, implemented with the same
BootstrapGame, Module, Level, Screen, GameObject and Component abstractions as the
other demos. Its graphics are procedural Canvas shapes; no asset download is required.

## 1. Run it

```sh
node cli/index.cjs serve
```

Open `/examples/touch-garden-2d/index.html` on the printed address, or choose Touch
Garden in the launcher. On a phone, use a reachable development server address;
the CLI defaults to loopback. The published game can be opened normally over HTTPS.

1. Drag in the lower-left area to move. Its first contact owns the virtual stick.
2. Keep that finger down and tap DASH with another finger. A green ring indicates recovery.
3. Collect five crystals. Stone planters block walking and dashes.
4. Tap ? to open/close help. Tap R to reset collectibles, movement and cooldown.
5. Releasing/cancelling the steering contact stops movement. The game stays interactive
   after collection is complete.

Keyboard: WASD/arrows, Space to dash, H for help and R to reset. Standard gamepad:
left stick/D-pad, bottom face A/Cross/B to dash, Start for help, top face Y/Triangle/X
to reset. The HUD exposes these paths. Touch is not advertised for other demos unless
they implement their own complete control model.

## 2. Read contacts through the framework

BootstrapGame initializes Input, which owns a Touch instance. The level borrows it:

```js
const controls = new TouchControls(Input.instance.touch, this.screen);
```

Do not construct a second shared Touch or register duplicate listeners in the level.
Input.Update latches touch starts/ends before gameplay; LateUpdate clears those edges.
GetActiveTouches and GetTouch(identifier) return snapshots with independent Vector2D
values. Each contact carries its identifier, startPosition, position and cancelled
flag. GetStartedTouches/GetEndedTouches expose per-frame edges, including short taps
that begin and end before the next frame.

The legacy getTouchStartPosition/getTouchEndPosition methods remain available for
older single-position consumers. Cancellation is handled through touchcancel and
blur; a window-owned device also cancels on resize. Dispose removes its listeners.
Input disposal is responsible for the device's lifetime.

## 3. Convert to logical screen coordinates

Browser touch positions are client coordinates. Screen coordinates are logical game
pixels. CSS scaling and centered letterboxing make those coordinate systems differ.

```js
const point = Touch.ToScreen(contact.position, screen);
```

ToScreen uses the canvas bounding rectangle and logical dimensions. The example's
CSS fits a 480-by-800 screen into portrait or landscape viewports without stretching
its aspect ratio. touch-action:none belongs to this game's surface, so gestures
control the game rather than scrolling/zooming the document. The core input class
keeps passive listeners and does not suppress browser gestures for every application.

## 4. Compose behavior

| File under src/ | Responsibility |
| --- | --- |
| modules/TouchGardenModule.js | Feature and service composition |
| levels/TouchGardenLevel.js | Scene creation, collection, help and reset |
| input/TouchControls.js | Contact ownership, coordinate conversion and virtual actions |
| components/GardenMotion.js | Keyboard/gamepad/touch intent, dash and cooldown |
| entities/GardenPlayer.js | GameObject with BoundsComponent, GardenMotion and VelocityComponent |
| entities/GardenObstacle.js | Visible collidable planter |
| entities/GardenCrystal.js | Collectible GameObject and bounds |
| entities/GardenBackground.js | Procedural arena drawing |
| ui/TouchGardenHUD.js | Shared HUDFrame panels and virtual controls |
| data/GardenSettings.js | Arena, positions, speeds and timing |

GardenMotion reads commands in OnUpdate and consumes dash requests during the fixed
step. VelocityComponent integrates movement; GardenPlayer constrains the arena and
rejects planter intersections using BoundsComponent. The first steering contact is
tracked by identifier, so releasing another finger does not steal the stick.
Cancel, reset and exit clear local gesture ownership. No extra clock/RAF is created.

## 5. Change one building block

- Change speed or dash timing in GardenSettings.js, then compare walking and action recovery.
- Add a crystal position. The level/HUD derive totals from the created collectible list.
- Add a planter rectangle; both rendering and collision read its one definition.
- Move the game into a differently sized viewport and check ToScreen alignment.

The example uses simple AABB rejection, not a full sliding/continuous collision solver.
Its two-ring input layout is a reusable interaction recipe, not an assumption that all
games should use the same controls.

## 6. Build and test

```sh
node cli/index.cjs build --root examples/touch-garden-2d
npm run test:touch
```

The dedicated runner tests source and prefixed builds in portrait and landscape,
using real browser TouchEvents with two contacts. It verifies movement plus dash,
holding/release/cancel behavior, help/reset buttons, keyboard fallback, collection,
collision and cleanup. Unit tests cover identifier independence, immutable snapshots,
quick taps, blur/resize cancellation, legacy accessors and scaled coordinates.
Physical iOS/Android device testing remains a separate compatibility step.
