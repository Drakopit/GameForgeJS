# Toon adventure checkpoint 5: a small animated pond

This checkpoint adds a shallow interactive pond beside the courtyard entrance. It is the
first water slice, not a water simulation or the complete Zero to Hero course.
The existing engine renders it using Mesh, Geometry3D and ToonMaterial; there is
no custom renderer, separate animation loop, new dependency or manual canvas.

## 1. Find the water

1. Run `node cli/index.cjs serve` from the repository root.
2. Open `/examples/toon-adventure-3d/index.html` on the printed server address.
3. Look to the right of the knight at the entrance. Approach using WASD/arrows or
   the controller's left stick/D-pad. Enter through the open left (west) bank.
4. Watch the moving pale lines and small waves. Press B or Select/View to compare
   the existing Toon lighting bands on the water and surrounding scenery.
5. Press H or Start for the controls. Combat and the rest of the route still work.

No new action bindings are needed: use the existing movement, help and lighting
actions. Walk in from the left, notice the reduced speed and footstep rings, then
walk back out. The three remaining stone edges retain their own collision boxes.

## 2. Change the pond data

Open `examples/toon-adventure-3d/src/data/Pond.js`:

```js
position: [4.5, 0.18, 2.5],
movementMultiplier: 0.55,
floorY: 0,
width: 3,
depth: 3,
segments: 20,
amplitude: 0.035,
speed: 1.1,
```

Positions and amplitude use world units. Speed advances the wave phase in radians
per second. Try speed 0 to freeze the surface, then restore 1.1. Try amplitude
0.02 for calmer water. Keep the surface above the ground and below the stone bank.
The grid has (segments + 1) squared vertices; increase it only when needed.
Dimensions must be positive and segments a positive integer. These are authored
demo values, not an editor schema or a general-purpose water API.

Colors and bank dimensions live in the same file. If moving the pond, check that
its rectangular collision footprint does not overlap the route, props or spawns.

## 3. Follow the existing framework lifecycle

- `ToonPond` owns the water, ripple highlights, three bank meshes with their own static
  BoxCollider3D volumes. The level registers the pond once through AddEntity.
- `WaterSurface` is a Mesh with a ToonMaterial and a small WaterGeometry grid.
  OnUpdate(dt) advances a wave phase using the time supplied by the engine.
- `WaterGeometry` changes heights and normals in place, then calls MarkUpdated.
  The renderer's existing dynamic geometry path uploads the changes into its
  existing GPU buffers. The shoreline dampens the waves to zero at the edges.
- `WaterRipples` uses narrow curved strips sampled against the same wave function.
  These are stylized highlights, not physical foam or collision-based shore foam.
- OnDestroy unregisters the bank bodies and removes its meshes. Level3D owns renderer
  disposal. The water does not start its own timer or retain a second delta clock.

The two wave terms are periodic, so phase wrapping avoids unbounded growth without
a discontinuity. Wave normals are normalized finite-difference slopes. Ripple strips
sit slightly above the water; extreme parameter changes can need a smaller grid
spacing to avoid intersections. Keep the tutorial defaults for the verified look.

## 4. Publish and verify

```sh
node cli/index.cjs build --root examples/toon-adventure-3d
node cli/index.cjs serve --root examples/toon-adventure-3d/dist
```

Check animation, bank collision, H, B, combat and restart again. Browser regressions
cover source and a build hosted under a URL prefix: changed vertices and rendered
pixels, unit normals, stable shoreline, GPU buffer reuse, collision and scene cleanup.

The pond is opaque and lies above the existing floor. It has no depth texture,
refraction, reflected skybox, underwater view, buoyancy, swimming or water damage.
There is no collider covering the water itself: the existing floor supports the
character. The water volume checks the actor center in X/Z and the feet height,
using its sphere collider radius. It does not simulate water displacement.


## 5. Shallow-water movement and footstep feedback

`ShallowWaterContact` extends the framework Component and attaches to Explorer,
following the same lifecycle convention as its HealthComponent. Explorer updates
contact during the normal fixed step, after the level physics step, before setting
movement velocity. Its configured zones provide ContainsFeet and a movement multiplier.
Leaving a zone restores 1; the default pond uses 0.55 (2.2 world units/second instead
of 4). Analog stick intensity still multiplies that speed, and facing stays normalized.

Change movementMultiplier in data/Pond.js to 0.8, enter the water, compare speed,
then restore 0.55. Keep it between zero and one for a slowdown. floorY identifies the
existing ground supporting the feet, not a generated underwater terrain. Contact
requires feet between that ground and the water surface; an actor above the pond
is not slowed. This interaction currently applies to Explorer, not every combatant.

`FootstepRipples` owns one mesh containing two expanding rings. It reuses the pond
phase and highlight material, samples the existing wave height and clips coordinates
to the pond bounds. Rings appear only while a living character moves in the water;
they disappear on idle, exit or reset. They are visual feedback that follows the
feet, not persistent particles or a fluid simulation. GPU buffers are reused.

Attacks retain their existing windup/active/recovery rules. Water modifies voluntary
walking speed, not attack timings or knockback. R resets contact and hides footsteps;
OnDestroy detaches the component, removes ring meshes and unregisters bank bodies.
The source/build regressions cover entry, exit, speed restoration, vertical rejection,
attacking in water, idle/reset feedback and stable buffers while walking.
