# Zero to Hero readiness — 20 November 2026

This evaluates readiness to teach and ship the promised **complete Toon 3D ABS
adventure** and **original 2D platformer with at least 20 authored levels**.
It is an engineering estimate, not a test-pass percentage, measured learner study
or claim that 63% of the course chapters are finished. Each pillar has equal
weight; percentage = score / 10. Completion still requires the hard gates below.

| Pillar | Score / 10 | Estimated completion | Current status/evidence | Still missing |
| --- | --- | --- | --- | --- |
| Core / ECS | 8.0 | 80% | Class modules, Level/Component lifecycle, scoped services, native 2D/3D rendering, math/swizzles, physics building blocks, pooling, Timeline, input/prompt presentation and owned audio. | Broader legacy typing, documented supported subsets, animation blending, stronger save/state contracts and targeted performance budgets. Current entity/component composition is not an archetype ECS. |
| Demos / learning path | 6.5 | 65% | Nineteen independent examples; Toon exploration/ABS/models/water/warps; focused cinematics, overworld, boss and FX labs. Keyboard/gamepad/touch support is explicit where implemented. | Full 20-level campaign and varied enemy roster; complete 3D adventure with progression, final boss/ending; reproducible chapter checkpoints rather than copying a large demo. |
| Editor / tooling | 4.5 | 45% | Offline CLI creation/generation/build, selective runtime groups, portable artifacts and editor integration contracts. | No maintained desktop editor application was found in this repository. Need authored-content workflow validation, stronger diagnostics, stable package releases and the planned runtime/tooling repository extraction. A graphical editor is not required for the CLI-first course MVP. |
| Docs / onboarding | 6.0 | 60% | Starter instructions, API reference, config ownership, five incremental Toon checkpoints and focused mechanic guides with source maps. | End-to-end baby-step chapters for both finished games; version-pinned checkpoints, exercises, troubleshooting for actual failures, and cold-start walkthroughs by developers unfamiliar with the codebase. Reconcile historical checkpoint prose with current feature status. |
| Polish / UX | 6.5 | 65% | Categorized direct-launch gallery, sprite prompts tied to bindings, touch visibility/settings, native HUDs, synthesized feedback and browser regression coverage. | Full supported-device playthroughs of every interactive example, accessibility/contrast/localization depth, mobile landscape tuning, sound/art consistency and performance measurements on named physical devices. Headless browser tests are not physical controller/device certification. |
| **Overall** | **6.3** | **63%** | **Useful, tested building blocks; the complete-game course remains in progress.** | **The remaining estimate is 37%; the unfinished games and reproducible teaching path are the largest deliverables.** |

## Hard gates for calling it complete

1. Both games play from New Game to ending, with restart, pause/settings, audio,
   progression and tested save/reload. The 2D campaign has at least 20 **distinct
   authored stages**; eight map nodes or two reused collection rooms do not count.
2. The 3D path demonstrates imported models/materials, supported animation,
   readable ABS enemies/boss, connected environments and documented water behavior.
   Shallow-water slowdown/rings are already implemented; swimming, buoyancy and
   reflected/refracted scenery are separate features with separate acceptance tests.
3. Every chapter starts from an explicit checkpoint and has a small change, exact
   files/commands, expected behavior, common failures and one exercise. A new
   reader can reproduce the finished result without hidden demo dependencies.
4. The declared input matrix passes actual gameplay and menus. Desktop pads stay
   hidden unless enabled; mobile buttons stay inside safe viewports. Controllers
   are exercised beyond slot 0, and disappearing devices do not steal another seat.
5. Source and packed builds pass local/prefix hosting and public deployment checks;
   assets/licenses, entity/GPU/audio/listener cleanup and named-device performance
   budgets are reviewed together. No external browser runtime dependencies appear.

## Next bounded deliveries

1. Close the current catalog/input/audio regression checks and the fighting input
   audit, then preserve the result as a reproducible baseline.
2. Deliver one complete Toon vertical slice: one short quest with an interaction,
   inventory item, saved progression, boss, ending and a baby-step chapter set.
3. Build a four-stage platformer campaign slice with a playable overworld, two
   distinct enemy behaviors, checkpoints and save/reload; prove the authoring flow
   before scaling to twenty stages.
4. Expand content and chapters in small reviewed batches. Extract addons only when
   two games need the same behavior; keep the standalone repository split staged
   behind package-resolution and compatibility gates.

See the [course contract](../getting-started/zero-to-hero.md),
[focused mechanic guide](../guides/cinematics-and-patterns.md),
[fighting design note](fighting-game.md) and
[repository extraction proposal](repository-split.md).
