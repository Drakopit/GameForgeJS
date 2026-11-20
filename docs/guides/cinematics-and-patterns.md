# Focused gameplay patterns

These examples teach one mechanic per project through the existing
BootstrapGame → Module → Level → GameObject/Component lifecycle. They do not
replace the framework with a custom game loop, archetype ECS or rendering layer.

| Learn | Runnable project | Start reading |
| --- | --- | --- |
| 2D cinematic | [Lantern Crossing](../../examples/cinematic-crossing-2d/README.md) | CrossingSequence → WaypointMotion → CourierControl |
| 3D cinematic and exploration | [Aether Observatory](../../examples/aether-observatory-3d/README.md) | ObservatoryLevel → MeshBinding → ExplorerMotion → ObservatoryTour |
| Branching world map | [Route Atlas](../../examples/route-atlas-2d/README.md) | RouteProgress → RouteNavigator → StageTrial |
| Boss phases and patterns | [Ember Warden](../../examples/boss-patterns-2d/README.md) | BossDirector → individual attack strategies → ProjectileContact |

## Camera + Timeline

Timeline is an ordinary core Component. Attach it to a game-owned GameObject so
the engine supplies dt and destruction. Tracks describe continuous changes;
cues describe one-time events. Neither creates a timer or owns the renderer.

```js
import { Timeline, MathExt } from 'gameforgejs/core';

const sequence = director.AddComponent(new Timeline({
    duration: 4,
    tracks: [{ start: 0, duration: 4, sample: t => {
        camera.SetZoom(MathExt.Lerp(1, 1.4, t));
    }}],
    cues: [{ at: 1, run: () => dialogue.Show('The gate is open.') }],
    onFinish: reason => {
        controls.enabled = true;
        dialogue.Hide();
    },
}));
controls.enabled = false;
sequence.Play();
```

The game owns the control lock, camera and dialogue; Timeline only orchestrates
them. Use multiple tracks for camera translation, target/FOV and actors. Use
MathExt/vector interpolation rather than defining a second math layer. Author
tracks in increasing start order when they target the same property; later
tracks win at shared boundaries.

Play resets time and cue history; pausing uses `sequence.paused = true`. Skip
samples every track's endpoint in authored order without firing unvisited cues,
then finishes with `skipped`. Cancel does not sample endpoints and finishes with
`cancelled`. Natural completion samples endpoints and finishes with `completed`.
Finish is emitted once per active run. Destruction cancels, allowing the game to
release reservations even when a scene is interrupted.

Timeline is deliberately small: no animation editor, async tasks, seeking or
automatic ownership of game input. Treat sample/cue callbacks as synchronous
scene operations. To play a new sequence from a completion callback, use a
separate game-owned sequence rather than recursively restarting a cue callback.

Camera.SetZoom leaves viewport dimensions unchanged; Begin/End apply its
magnification. Visible world size is viewport size divided by zoom. Existing
zoom=1 scenes retain their transforms. ZoomIn/ZoomOut now delegate to that same
contract rather than repeatedly scaling the viewport dimensions.

## Progression and AI ownership

RouteProgress is a plain domain model; it needs no engine lifecycle. Its
availability query derives unlocked nodes from cleared outgoing routes. Movement
is a component, stage entry/clear is an event, and rendering reads the same model.
The tiny stage demonstrates the complete loop without introducing persistence or
pretending its eight nodes are eight fully authored levels.

The boss director chooses the next phase/cycle and sequences windup, attack and
recovery. Individual strategies own their locked aim and execution. Health,
velocity, lifetime and pooling reuse native framework classes. Hazards are a
bounded field component. Add a strategy by implementing Prepare/Begin/Update/Draw;
avoid putting every attack's logic into the director.

## Native 3D boundaries

Aether uses native WebGL3DRenderer, Scene3D, Mesh, materials, lights,
PerspectiveCamera and PhysicsWorld3D. Its camera and orbit animation are ordinary
components. Vector3D.xz reads a copied Vector2D for planar calculations; assigning
xz writes back deliberately. Swizzle('zyx') and Swizzle('xx') return independent
three/two-axis copies. GPU matrices and native buffer APIs keep their array
representation at those boundaries.

The renderer now builds conservative transformed AABBs, rejects outside meshes,
draws opaque near-to-far and transparent far-to-near with depth writes disabled.
It retains off-camera shadow casters. Geometry.MarkUpdated invalidates cached
bounds. Unknown shader-displaced bounds can opt out with frustumCulled=false.
Transparent intersecting geometry still has ordinary object-order limitations.

Scene fog is optional, has no effect by default, and blends Standard/Toon/Unlit
surfaces by camera distance. Custom celestial shaders do not receive an invented
atmosphere implementation. Main-pass telemetry counts visible/culled meshes and
triangles separately from shadows/skybox. The example's physics support remains
sphere versus axis-aligned boxes; it does not claim a general rigid-body solver.

## Verification

`npm run test:lessons` exercises all four projects, source and portable build,
desktop and mobile, under `/GameForgeJS/`. It checks actual keyboard/gamepad/touch
input, cinematic skip/replay/control return, stage entry/clear/unlock, boss phases
and attack timing, and scene/GPU/physics disposal. Native tests cover timeline
boundary crossing, transparent sorting, frustum intersections, bounds updates,
zoom and swizzle value semantics. No external browser runtime requests are allowed.
