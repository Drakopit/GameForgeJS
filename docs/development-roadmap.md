# Developer experience roadmap

Current assessment: **6/10** for completing a small game with JavaScript and
object-oriented programming experience. Target: **9/10** for documented
workflows. These are qualitative ratings, not user-study results.

Preserve native browser JavaScript, explicit classes, per-game configuration,
manifests and optional tooling. Expert developers can replace controllers or
implement their own levels without adopting genre templates.

| Stage | Deliverable | Acceptance criterion |
| --- | --- | --- |
| 1 | Selective publication | 2D omits 3D/network/compat; cross-group dependencies survive; generated 2D/3D builds run at root and subpaths; invalid declarations fail before replacing output. |
| 2 | Addon contract, parallax and state-machine pilots | Original demo and independent sample share code; lifecycle, configuration and cleanup are documented and tested. |
| 3 | Platformer workflow | Combine movement, jump buffering, coyote time, collision, camera, animation, collectibles and level transition using documented components and manifests; tuning does not require changing addon internals. |
| 4 | 3D action workflow | Third-person movement, camera, targeting, attacks, damage and HUD work with Level3D and existing services; controllers remain replaceable. |
| 5 | Tactical workflow | Grid, reachability, targeting, turn order and action resolution are independent of demo global state and presentation; test maps larger than the original demo. |
| 6 | Sandbox foundations | A bounded reference world demonstrates chunk loading/unloading, interaction, persistence and configurable generation; measure memory/frame time on named hardware before claiming scale. |

These are sequential milestones, not a single implementation task. Stage 1
retains whole runtime groups; symbol pruning and asset pruning are separate work.

## Cross-cutting goals

The final deliverables include [Zero to Hero learning paths](getting-started/zero-to-hero.md):
a complete original 3D ABS adventure with complex models, verified character
animation and water, and an original 2D platformer with at least 20 designed
levels and varied enemy AI. Chapters follow small tested checkpoints. They are
acceptance goals for the roadmap, not claims that these games already exist.

Configuration consolidation precedes the addon pilot. See
[configuration ownership](guides/configuration-layout.md).

- Teach one primary path: bootstrap, level, screen, entity, component.
- Provide executable recipes, expected results and public API links in searchable docs.
- Identify owner and path in missing asset, manifest, animation and input errors.
- Document required owner methods and cleanup; avoid hidden duplicate services.
- Specify save/load, inventory overflow and skill effects before addon extraction.
- Observe first-playable and second-level creation to measure time and obstacles.

## Current implementation scope

The distribution manifest, group dependency analysis, publication validation and
starter integration are the first delivery. Advanced is the first migrated demo;
other demos retain their existing distribution behavior. Runtime APIs and game
classes are unchanged. The next delivery is the small addon pilot, not all genres.
