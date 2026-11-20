# Native surfaces, weather and height-aware tactics

All features here use the existing Level/GameObject/Component lifecycle and
Canvas/WebGL renderers. No runtime packages, extra canvas factories, worker
simulation loops or wall-clock animation timers are introduced.

## Standard surface pipeline

`SurfaceMaterial` extends `StandardMaterial` and opts into the same native shader:

```js
import { SurfaceMaterial, SurfaceAnimator, RainEmitter, RainRenderer,
    WetSurfaceResponse } from 'gameforgejs/3d';
import { GameObject } from 'gameforgejs/2d';

const water = new SurfaceMaterial({ preset: 'water', scale: 1 });
const stone = new SurfaceMaterial({ preset: 'stone', wetness: 0 });
const weather = new GameObject();
const rain = weather.AddComponent(new RainEmitter({
    count: 96,
    seed: 12,
    bounds: { width: 16, depth: 16, height: 10 },
    heightAt: (x, z) => terrainHeightAt(x, z),
    onImpact: position => water.AddRipple(position, 0.25),
}));
weather.AddComponent(new SurfaceAnimator([water]));
weather.AddComponent(new RainRenderer(scene, rain));
weather.AddComponent(new WetSurfaceResponse(rain, [stone]));
this.AddEntity(weather);
```

Set native mesh materials to `water`/`stone` as usual. Other presets are `wood`
and `metal`. Standard map, shadow, emissive and fog settings remain available.
JSON scene manifests accept `{ "type": "surface", "preset": "wood" }`.
Use one SurfaceAnimator per shared material, not one per mesh instance. It
advances from engine `dt`; the renderer never invents its own animation clock.

The standard shader resets surface/reflection/ripple controls on every draw,
including draws of ordinary Standard/Toon materials. Metals reduce diffuse light
instead of stacking full diffuse lighting on top of specular reflection.

| Effect | Native implementation | Deliberate limit |
| --- | --- | --- |
| Reflection | Fresnel-weighted analytic sky/ground/horizon approximation | Does not reflect scene objects, cubemaps or offscreen geometry. Not SSR or a planar WebGL camera pass. |
| Water | Animated surface normals, tint variation, eight bounded world-space impact rings | No refraction, buoyancy or GPU vertex displacement. Geometry/collision still belong to the game. |
| Stone | World-space mottling, roughness and small procedural normal perturbations | Not a substitute for a normal/roughness texture when authored detail matters. |
| Wood | Warm grain, roughness and a small normal perturbation | Procedural world-space pattern, not model-specific UV craftsmanship. |
| Metal | Native metallic/specular shading plus environment approximation | Not a calibrated physical renderer or environment capture. |
| Rain | Seeded, fixed-update pooled drops; one dynamic mesh with streaks and short impact bursts | Height callback defines collisions; does not automatically query arbitrary mesh triangles. Count is capped at 2048. |
| Wetness | Component-controlled wetting and evaporation | Visual response; friction/gameplay changes are explicit game rules. |

`RainEmitter` runs in `OnFixedUpdate`; `RainRenderer` uploads into an existing
Geometry3D, uses both face directions and submits one native mesh. Scene exit
removes the mesh; the level renderer releases its GPU buffers. No rain renderer
owns the scene, viewport, engine clock or audio context.

Renderer Showcase consumes the suite alongside its texture/normal-map examples.
Highland Tactics combines it with terrain collision heights and water-only impact
ripples. These are two consumers of the public API rather than private shader copies.

## Canvas reflection

`PlanarReflection2D.Draw(context, source, options)` reflects strips of an existing
above-water Canvas image into a water region. Supply `waterY`, `width`, `height`,
engine `time` and optional ripple displacement. The pass allocates no canvas or
clock and restores context state. Foundry consumes this API while retaining its
own bounded ripple field and artistic composition. Pass `time: 0` for reduced
motion. This is Canvas compositing, not a fake WebGL capability claim.

## Height-aware navigation and projection

`HeightGrid` accepts a rectangular array of elevations; null means a gap.
`Reachable` returns costed paths respecting movement budget, climb, descent,
occupancy and a one-gap leap. `CanSee` tests the terrain against an eye-height
ray and excludes endpoint tiles. It does not include units or decorative meshes
unless the game adds those occluders to its rules.

`OrthographicCamera` renders actual 3D with parallel projection. It shares the
native camera contract, lighting, depth test, shadows and frustum queue.
Both camera types expose `Project(worldVector, width, height)` for native Canvas
labels and tile picking. Matrix buffer indexing remains internal; game world
vectors use named x/y/z properties.

See [Highland's gameplay/source walkthrough](../../examples/highland-tactics-3d/README.md)
for CT, facing, preview/resolution parity, AI, touch input and phase ownership.
It is an original skirmish inspired by PS1 tactical presentation, not a claim to
reimplement FFT's full battle engine, jobs or campaign systems.

## Verification

```sh
npm test
npm run test:polish
npm run test:foundry
npm run test:browser
npm run test:viewport
```

The polish suite exercises real GPU uniform resets, Canvas reflection pixels,
classic Tactics scene re-entry, all fighter sheets, and Highland source/portable
keyboard/touch play plus gamepad abilities and full simulated encounter outcomes.
Viewport tests establish bounds and aspect behavior, not physical-device performance.
