# Catalog polish audit — 20 November 2026

Scope: all 20 catalog entries, including the new Highland Tactics. Review combines
source/lifecycle inspection, actual engine screenshots, keyboard/gamepad/touch
scenarios where implemented, desktop/portrait/landscape viewport checks, and
source/portable build regressions. This is not a commercial QA certification or a
claim that every legacy example has full mobile gameplay controls.

## Shared fixes

- Help uses a paginated right-side drawer, with a compact footer for short views.
- Native buttons respect Screen-owned modal input and consume each pointer event
  once. Closing a drawer cannot activate a button underneath it in the same event.
- Gameplay owners pause combat/movement while reading help; no global pause loop
  or HTML information layer is introduced. FX labs may keep visual simulation running.
- Clear native control prompts, safe-area presentation and disposal remain shared.

| Example | Reviewed behavior / changes |
| --- | --- |
| Highland Tactics 3D | New actual 3D terraces, CT, costed climbs/gap jumps, line of sight, facing previews, movement/action budgets, armor exposure, AI, victory/defeat and native HUD. Source/portable keyboard/touch and gamepad abilities tested. |
| Aether Observatory 3D | Traversal, camera modes, tour, fog, physics, input and cleanup; help pauses player/tour/physics. |
| Cinematic Crossing 2D | Sequence play/skip/replay, camera/viewport and control restoration; help pauses the sequence. |
| Route Atlas 2D | Routes, unlocks, trials and input; help pauses stage simulation. |
| Boss Patterns 2D | Three phases, telegraphs, hazard/projectile budgets and restart; help pauses combat and fixed movement. |
| Storm Foundry 2D | Controls, bounded simulation, presets and disposal; reflection now consumes the reusable native Canvas pass. |
| Toon Adventure 3D | Models, combat, water, lakes/warps, HUD and restart; help pauses encounter simulation. |
| Platformer Building Blocks 2D | Collision, jump buffering/coyote time, coins and stage progression. Added native touch adapter, proper help/win freeze, scenery and exposed tile-top shading. Controller/collision logic remains in the existing addon. |
| Movement Collision 2D | Collection, bounds and disposal; clearer sprite help hint and pause while reading controls. |
| Component Adventure 2D | Room transitions, entity rendering and controls; replaced dense header bindings with a short objective and help sprite. |
| Platform Adventure 2D | Enemy AI, progression, inventory/skills and room lifecycle; shared drawer and help blocking. |
| Tactical RPG 2D | Map, range/action selection and arena return. Recreates destroyed ECS runtime units from persisted domain values; reset no longer calls missing components. HUD messages no longer collide with FPS. |
| Fighting Arena 2D | Removed in-stage button-like footer; help utility stays at the top. Stable pad seats and simultaneous touch retained. Full repertoire and sheet audit described below. |
| Puzzle Battle 2D | Native responsive boards/HUD, introductory clear opportunity, ghost landing, readable previews, pause/retry/result, touch actions, feedback tones. Fixed leaked text alignment, rotation-vs-repeat coupling, lost fall-time remainder, inherited spawn rotation, blocked spawns and truncated garbage delivery. |
| Renderer Showcase 3D | Native presets/water/reflection/rain gallery with labels; corrected help/info overlap. GPU reset tests prevent surface effects leaking into normal materials. |
| Solar System 3D | Orbit/zoom, celestial rendering and resource cleanup; replaced dense help-binding string with a native prompt. |
| Sky Trail 3D | Menu/gamepad, four courses, traversal, pickups/checkpoints and overlay alignment; help pauses gameplay. |
| Online Sandbox 2D | Lobby/rooms, text editing/chat, synchronization, touch/safe areas and disposal covered by dedicated multiplayer tests. |
| Addons 2D | Fixed double canvas clearing that erased the parallax before drawing the actor; patrol/rest and scrolling layers now appear together. No player input is required for this automatic example. |
| Touch Garden 2D | Multi-touch ownership, interruption, dash, collision, collection, rotation and native help cleanup. |

## Fighter sheets and behavior

All occupied cells are declared, with no blank frames substituted:

| Asset | Occupied cells | Mapped cells |
| --- | ---: | ---: |
| Char_3 | 79 | 79 |
| Char_3_No_Armor | 79 | 79 |
| Char_4 | 79 | 79 |
| Char_5 | 73 | 73 |

The silver sheet has no alternate-outfit run; the per-sheet registry omits it.
Data-authored cell sequences support multiple rows and skip gaps. Native Sprite
remains the playback clock. Gameplay selects walk/backward walk, dash/back step,
jump/fall/landing, high/low guard, light/medium/heavy and contextual crouching,
aerial, dash and weapon attacks, hurt/knockback, knockdown/get-up, intro, victory,
KO and aura. Low and high attacks have corresponding guard rules; hitboxes and
attack windows remain combat data, not guesses based on visible frame numbers.

The Animation Lab menu entry exposes every declared sequence on every fighter,
including the alternate costume and meditation pose that are not ordinary combat
actions. This distinction is intentional: mapping art does not justify inventing
a transformation mechanic. Four shared sheets are visual variants; this pass does
not claim four independent commercial character movesets, motion commands or rollback.

## Remaining scope

Legacy fixed-coordinate examples can preserve aspect ratio without becoming full
touch games. Toon and Sky Trail still need dedicated touch traversal/combat/menu
work before full mobile gameplay is advertised. The complete Zero to Hero games,
campaigns and chapter checkpoints remain separate roadmap work. Native weather
limits and reflection approximations are documented in the surface guide.
