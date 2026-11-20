# GameForgeJS examples

This directory contains independent runnable projects, not a second runtime.
Each example consumes public gameforgejs imports and follows BootstrapGame → Module
→ Level/Level3D → Screen/entities/components. `showcase/` preserves old launcher
links; the categorized catalog lives on the root presentation page.
`catalog.json` is the authoritative list of runnable entries.

See the [responsive viewport and input audit](../docs/guides/responsive-viewports.md)
for all 19 examples, including remaining mobile gameplay work.

## Run

From the repository root, run `npm ci` once, then `npm start`. Open
`/#jogos` on the printed server address, or use the direct
entry described by each README. Use an HTTP server: ES modules and resource manifests
are not designed for opening index.html through a file URL.

## Examples and purpose

| Example | Canonical folder / launcher ID | Purpose |
| --- | --- | --- |
| [Aether Observatory 3D](aether-observatory-3d/README.md) | `aether-observatory-3d` | Native WebGL floating islands, shaded architecture, fog, physics traversal, orbit/chase cameras and a skippable cinematic. |
| [Cinematic Crossing 2D](cinematic-crossing-2d/README.md) | `cinematic-crossing-2d` | Parallel camera, zoom and fade tracks, waypoint movement, dialogue cues and clean skip/replay control states. |
| [Route Atlas 2D](route-atlas-2d/README.md) | `route-atlas-2d` | A branching overworld graph, smooth node travel, playable shard trials and event-driven stage unlocks. |
| [Boss Patterns 2D](boss-patterns-2d/README.md) | `boss-patterns-2d` | A three-phase boss with aimed fans, rings, marked charges, delayed hazards, pooled projectiles and dash invulnerability. |
| [Storm Foundry FX Lab 2D](storm-foundry-2d/README.md) | `storm-foundry-2d` | Rain, water/reflection passes, bounded particles, dynamic props and a live tuning lab. |
| [Toon Adventure 3D](toon-adventure-3d/README.md) | `toon-adventure-3d` | A Toon ABS sandbox: animated characters, five sentries, two large lakes, paired warp pads, minimap and shallow-water interaction. |
| [Platformer Building Blocks 2D](platformer-2d/README.md) | `platformer-2d` | Reusable addon mechanics: solid tiles, coyote time, buffered/variable jumps, animation and two collection stages. |
| [Movement & Collision 2D](movement-collision-2d/README.md) | `movement-collision-2d` | Start here: Level, Screen, GameObject, Draw and AABB collection. |
| [Component Adventure 2D](component-adventure-2d/README.md) | `component-adventure-2d` | GameObject composition: bounds, health, walls, enemies and room camera behavior. |
| [Platform Adventure 2D](platform-adventure-2d/README.md) | `platform-adventure-2d` | Advanced platform/RPG integration: perception/patrol/pursuit AI, combat states, inventory, skills, manifests and progression. |
| [Tactical RPG 2D](tactical-rpg-2d/README.md) | `tactical-rpg-2d` | Turn-based domain models coordinated by framework levels: grid movement, pathfinding, ranges and battle flow. |
| [Fighting Arena 2D](fighting-2d/README.md) | `fighting-2d` | An arcade/versus fighter with energy projectiles, supers, buffered melee chains, reactive CPU and four character profiles. |
| [Puzzle Battle 2D](puzzle-battle-2d/README.md) | `puzzle-battle-2d` | Grid-based puzzle domain models: falling pairs, rotation, combos, garbage exchanges and a CPU opponent. |
| [Renderer Showcase 3D](renderer-3d/README.md) | `renderer-3d` | Manifest-loaded rendering: cameras, models, textures, normal maps, lighting and shadows. |
| [Solar System 3D](solar-system-3d/README.md) | `solar-system-3d` | Procedural celestial materials, lighting and coordinated orbit animation. |
| [Sky Trail 3D](sky-trail-3d/README.md) | `sky-trail-3d` | A small 3D platforming game: four courses, moving/blinking terrain, checkpoints, pickups and following camera. |
| [Online Sandbox 2D](online-sandbox-2d/README.md) | `online-sandbox-2d` | Cooperative mining/building, dedicated .NET server, rooms, prediction, canvas chat and mobile controls; backend deployment required. |
| [Addon Building Blocks 2D](addons-2d/README.md) | `addons-2d` | Consume shared parallax and state-machine addons while retaining the existing level/entity lifecycle. |
| [Touch Garden 2D](touch-garden-2d/README.md) | `touch-garden-2d` | Mobile building blocks: identified simultaneous touches, scaled screen coordinates, virtual steering, dash cooldown, collision and collection. |

## Suggested learning paths

For an advanced effects/composition lab, start with
[Storm Foundry](storm-foundry-2d/README.md): rain, reactive surfaces, dynamic props,
bounded particle pools and an in-engine live tuning panel.

1. Foundations: movement-collision-2d → addons-2d → platformer-2d → component-adventure-2d.
2. Genre systems: platform-adventure-2d, fighting-2d, puzzle-battle-2d and tactical-rpg-2d.
3. 3D: renderer-3d → solar-system-3d → sky-trail-3d → toon-adventure-3d.
4. Device/network integration: touch-garden-2d and online-sandbox-2d.

The platformer building blocks contain two short stages; the Toon adventure is an
incremental checkpoint. Neither is presented as the final Zero to Hero game/course.
Ventos Altos is a timing variant inside Sky Trail, alongside two distinct extra routes.
The online sandbox synchronizes browser tabs unless explicitly configured otherwise.

## Focused mechanics learning path

1. [Camera + Timeline in 2D](cinematic-crossing-2d/README.md): parallel tracks, dialogue cues, waypoint movement and skip/replay.
2. [Route Atlas](route-atlas-2d/README.md): graph state → stage entry → clear event → outgoing unlocks.
3. [Boss Patterns](boss-patterns-2d/README.md): telegraph → attack strategy → recovery, health phases and capped projectiles.
4. [Aether Observatory](aether-observatory-3d/README.md): the same timeline/control ownership in native WebGL, with mesh components, physics and camera traversal.

## Shared project contract

Each demo has main.js, index.html, README.md, config/ and src/. Keep runtime settings,
resources, project metadata and distribution declarations in config/. A project can
have an optional style.css, assets/ and game.workspace.json. Do not copy engine code
into games or create cross-demo imports. Select framework groups/addons in the package
manifest; declare game feature composition in src/modules/<Feature>Module.js.

Levels construct framework Screens; Level3D constructs its renderer and optional UI.
Entities register through AddEntity when participating in the level lifecycle.
Components attach to owners. Domain models such as puzzle boards and battle planners
may remain plain classes, explicitly updated by their owning level; they do not own
RAF loops, canvases or input devices. One class belongs in each source file. Register
and release scene-specific listeners together. Input owns Touch/Mouse/GamePad devices.

Use ActionManager for configurable game actions. The fighting demo has player-specific
adapters over public Input for local-versus bindings. Touch Garden uses Input.instance.touch
and Touch.ToScreen. Declare supported inputs honestly: raw touch support does not
make every game mobile-ready. Passive rendering/addon examples need no controls.

## Naming and migration

Folders and canonical IDs use `<purpose>-2d` or `<purpose>-3d`, lowercase kebab-case.
Display names use a readable title plus dimension. New demos must be registered in
catalog.json and include a README explaining purpose, controls, ownership and limits.
Old launcher IDs remain aliases (`Main.html?demo=mini3d` still opens Sky Trail).
Direct old folder URLs changed; repository links and commands use the new names.

| Previous folder | Current folder |
| --- | --- |
| `Demo` | `movement-collision-2d` |
| `Demo3D` | `renderer-3d` |
| `DemoAddons` | `addons-2d` |
| `DemoAdvanced` | `platform-adventure-2d` |
| `DemoAdventure2D` | `component-adventure-2d` |
| `DemoFightingGame2D` | `fighting-2d` |
| `DemoMiniGame3D` | `sky-trail-3d` |
| `DemoOnlineMMO` | `online-sandbox-2d` |
| `DemoPlatformer` | `platformer-2d` |
| `DemoSolarSystem` | `solar-system-3d` |
| `DemoStreetFightPuzzle` | `puzzle-battle-2d` |
| `DemoTacticalRPG` | `tactical-rpg-2d` |
| `DemoToonABS` | `toon-adventure-3d` |

## Validation

```sh
npm run check
npm test
npm run test:browser
npm run test:sky-trail
npm run test:touch
```

The project check visits every catalog entry, enforces naming/config/module ownership,
validates assets/editor references and checks package declarations. Browser checks
exercise source and built copies, including prefix hosting. The mobile runner uses
real browser TouchEvents with simultaneous contacts in portrait and landscape; this
is emulation, not a physical-device compatibility certification.

See the [architecture audit](../docs/migrations/demos-audit.md) and
[touch walkthrough](../docs/getting-started/touch-garden.md).

## Captures and engine UI

Every entry declares a real gameplay screenshot, shared by the landing page and
launcher. Regenerate them with `npm run capture:examples`, or pass canonical IDs
(e.g. `npm run capture:examples -- toon-adventure-3d`). Capture requires Playwright
and a Chromium/Edge executable. Generated pictures belong under site/examples/.

Game information belongs in Screen/ScreenUI. Platformer, renderer and solar system
have H + gamepad help; addon instructions are always visible in its HUD. See
[the UI guide](../docs/guides/in-engine-info.md),
[enemy AI](../docs/guides/enemy-ai.md) and
[Toon lakes/warps](../docs/getting-started/toon-sandbox-checkpoint.md).

## Input presentation and sound

Each project loads config/prompts.json. Help reads real bindings and cached native
keyboard/controller sprites; it does not remap controls when artwork changes.
Touch pads default to mobile/coarse input and can be enabled or disabled explicitly
in the guide. See the [presentation and feedback guide](../docs/guides/input-prompts-and-feedback.md).
