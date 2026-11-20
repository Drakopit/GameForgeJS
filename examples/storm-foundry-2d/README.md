# Storm Foundry — FX & Physics 2D

A self-contained industrial weather laboratory: layered rain, wind, impact spray,
expanding surface waves, displaced planar reflections, dynamic metal props and a
live particle/lens playground. All art is procedural Canvas 2D. There are no remote
assets, runtime libraries, fonts, physics packages or shader dependencies.

This is a cinematic technical showcase, not an assertion of AAA renderer parity.
Glow is a low-resolution Canvas bloom approximation; reflections copy the scene
in displaced strips. There is no HDR, SSR, fluid simulation or general rigid-body
solver. Circles use mass-weighted impulses; their spin is decorative.

## Run, check and publish

From the repository root:

```sh
npm install
node cli/index.cjs serve --root . --port 3100
# Open http://127.0.0.1:3100/examples/storm-foundry-2d/
npm run typecheck:foundry
npm run test:foundry
node cli/index.cjs build --root examples/storm-foundry-2d
node cli/index.cjs serve --root examples/storm-foundry-2d/dist --port 3101
```

The launcher also supports `Main.html?demo=storm-foundry-2d` (aliases: `foundry`, `fx`).
The portable artifact contains only the selected `core` + `2d` runtime groups.
TypeScript is a development-only checker; the browser runs native JavaScript.
All new showcase files and new particle/slider/render-target classes use checked
JSDoc with TypeScript strict mode. This does not claim that all legacy engine code
has already been migrated to strict typing.

## Interact

| Action | Keyboard / mouse | Gamepad | Mobile |
| --- | --- | --- | --- |
| Throw a dynamic prop | Drag and release in the world | Right stick aims; A drops | Drag and release |
| Drop a prop | Space / DROP button | A | DROP |
| Particle burst / trauma | B / BURST | X | BURST |
| Wind impulse | G / GUST | Y | GUST |
| Open / collapse lab | L / OPEN FX LAB | Start | OPEN FX LAB |
| Previous / next preset | `[` / `]` | LB / RB | Preset buttons in lab |
| Select / tune a control | Arrows; drag slider | D-pad; A toggles selected switch | Drag slider / tap toggle |
| Previous / next lab tab | Q / E | LT / RT | Tab buttons |
| More controls on short screens | MORE CONTROLS | D-pad past the last/first row; tabs via LT/RT | MORE CONTROLS |
| Debug colliders / composition | I | Select | Weather tab |
| Telemetry | T | Weather tab | Weather tab |
| Reset default scene | R | B | RESET SCENE |
| Help | H / HELP | R3 | ? button |

The lab has Weather, Emitter, Curves and Lens tabs. It exposes rain and wind,
body gravity/restitution, birth rate, speed, spread, lifetime, gravity, drag,
linear size/RGB birth-to-death curves, additive/normal blending, planar reflection,
glow, vignette, chromatic ghosting, scanlines, cool grading and trauma strength.
Emitter tuning affects new births; existing particles finish their authored curves.

Presets: **Storm & Puddles**, **Neon Particle Burst**, **Calm Reflection** and
**Stress / Heavy FX**. Reset restores Storm, clears simulation state/counters and
re-seeds the scene; it preserves the reduced-motion preference. Reduced motion
starts from the browser preference and disables shake and continuous fixture/water
animation. Rain and particle simulation remain active.

## Composition and source map

```text
BootstrapGame → FoundryModule → FoundryLevel
  Prop entities: PropForces → VelocityComponent → Bounds → Lifetime → WaterContact → PropVisual
  World entity: RippleField + three ParticleSystems + Weather/ParticleEmitter + PropPhysics
  Fixed: prop forces → framework velocity integration → circle/plane contacts
  Frame: emitters, bounded particles, ripple ages; telemetry consumes the supplied dt
  Draw: cached city → reactor/props → water reflection → rain/particles → post → HUD
```

- [Scene composition](src/levels/FoundryLevel.js), [class module](src/modules/FoundryModule.js).
- [World components](src/entities/FoundryWorld.js), [prop composition](src/entities/FoundryProp.js).
- [Circle contact solver](src/systems/PropPhysics.js), [water contact response](src/components/WaterContact.js).
- [Pass ordering](src/rendering/FoundryRenderer.js), [surface reflection](src/rendering/WaterPass.js),
  [Canvas composites](src/rendering/PostProcessPass.js).
- [Live controls](src/ui/FoundryPanel.js), [declarative control specs](src/ui/ControlSpecs.js),
  [presets and budgets](config/showcase.json).

The existing framework uses class-owned entities and components, not an archetype
ECS. This example follows that architecture; systems remain ordinary components on
the framework lifecycle. There is no second RAF, timer or hidden DOM gameplay UI.

## Budgets, telemetry and cleanup

Default hard limits: 1,800 rain particles, 1,400 emitter particles, 500 splash
particles, 128 ring waves and 20 reusable dynamic prop entities. Pools never expand
beyond these capacities. Telemetry/inspector shows active counts, contacts and
dropped emissions. Stress deliberately reaches these budgets; it is not a promise
of a fixed FPS on every GPU/phone. All pairs are bounded by the small prop budget.

Scenery is cached per resize. Post targets are reused at one-third resolution;
they are disposed with the level, along with buttons, viewport observers and
contact subscriptions. GameViewport.Bind respects browser chrome and device safe
insets. Short screens paginate controls rather than hiding rows below the viewport.

Tests cover source and portable builds, mouse/touch/gamepad controls, presets,
capacity stress, actual water impacts, collision impulses, post toggles, responsive
layout and cleanup. Physical device performance remains a separate check.

## Next architecture step

See the [repository split proposal](../../docs/plans/repository-split.md) for the
runtime/tooling/showcase boundaries. No repositories are extracted by this demo.
