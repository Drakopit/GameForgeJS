# Modularization and complete-game checkpoints

## Scope and current evidence

The deliverables remain the modular framework, an original Toon 3D ABS adventure,
an original 2D platformer with at least 20 designed stages, and complete Zero to
Hero guides. Small labs validate APIs; they do not replace those games.

| Area | Evidence in this checkout | Remaining work |
| --- | --- | --- |
| Distribution | `cli/lib/package.cjs` follows runtime imports and selects entire groups/addons; `tests/package.test.cjs` checks omitted dependencies and invalid declarations | Finer pruning is not implemented; group selection is not symbol-level tree shaking |
| Advanced 2D | DemoAdvanced uses config-folder discovery, composed content manifests and shared parallax/state-machine addons | Audit combat, inventory and progression ownership before extracting further addons; complete course assets and 20-stage campaign remain outstanding |
| 2D movement lab | DemoPlatformer validates movement, existing camera, Sprite/Animator, collection and level transitions | Two validation stages are not the final campaign; pause new lab features while establishing the 3D path |
| 3D gameplay reference | DemoMiniGame3D uses Level3D, physics, imported model, course data, camera and HUD | Sky Trail is a platform game, not the Toon ABS adventure; player behavior is still concentrated in CubeGameLevel |
| 3D rendering reference | Demo3D exercises scene manifests, lights, materials and models; DemoToonABS adds ToonMaterial, animated characters and a primitive room with one ABS encounter | Stylized water, finished environment art and complete adventure progression remain outstanding |
| Character pipeline | SkeletalAnimator deforms two copied KayKit characters, with independent poses, embedded textures and compatible-rig clip libraries; source/build browser tests validate GPU updates | CPU implementation for a small cast; crossfades, general retargeting, attachments and crowd performance remain pending |
| Tutorials | Zero to Hero defines both paths and a runnable starter/publication lesson | Remaining lessons must accompany tested gameplay checkpoints, with complete source and assets |

## Implemented in this checkpoint: 3D distribution baseline

Demo3D and DemoMiniGame3D now keep runtime config, resources, CLI metadata and
distribution selection in `config/`. Resource URLs were rebased to `../assets/`.
Their root `game.workspace.json` remains the editor discovery file and points to
the relocated resource manifest, including each scene entry and its `config/`
resource prefix for the external editor.

Both select `core`, `2d`, and `3d`. The 2D selection is intentional: these examples
use framework screen/menu facilities. Publication omits network, compatibility
and unused addons; it retains entire selected groups, including their legacy
files. BootstrapGame, Screen, Level3D, renderer and gameplay APIs are unchanged.

For each of these demos, the local build plan changed from 142 runtime files
(500,176 bytes) to 124 (445,221 bytes): 54,955 bytes, about 11%, removed from the
copied runtime. These are uncompressed source bytes at this checkpoint, excluding
game assets; they are not network-transfer or frame-performance measurements.

The CLI project file describes startup extensions and paths. The distribution
manifest describes copied runtime groups. These roles overlap in names but are
not interchangeable: publishing a module does not initialize its services.

Reproduce from the repository root:

```sh
node cli/index.cjs build --root examples/DemoMiniGame3D --dry-run
node cli/index.cjs build --root examples/DemoMiniGame3D
node cli/index.cjs serve --root examples/DemoMiniGame3D/dist
```

Expected: `core`, `2d`, `3d` in the plan; the Sky Trail menu opens, Enter starts
the existing game, and textures/course/model resolve from the published folder.
Repeat with `examples/Demo3D` for the rendering showcase. The build output is
not proof of ABS combat, skeletal animation or a completed Toon art direction.

## Next implementation order

1. **Toon room checkpoint (implemented):** a dedicated DemoToonABS project uses Level3D,
   existing scene/physics services and config-folder distribution. Configurable
   banded lighting is verified on primitive geometry. Level, player, material and
   room data have separate files; the fixed camera uses PerspectiveCamera.
2. **ABS encounter checkpoint (implemented for one stationary sentry):** overhead movement and collisions, one enemy,
   telegraphed attack, hit window, damage, invulnerability and knockback. Validate
   one hit per target per attack, death/reset and ownership cleanup. Each behavior
   state belongs in its own file. Primitives remain explicit placeholders.
3. **Model/animation checkpoint (characters implemented; environment pending):** multi-node environment and skinned character,
   texture handling and actual skeletal playback, including attack transitions.
   Do not write a finished model-animation lesson before this works visually.
4. **Water and progression checkpoint:** stylized water, independent interaction
   rules, connected rooms, items, persistence and a complete beginning-to-ending path.
5. **Complete both courses:** resume the 2D campaign and validate both full games,
   original assets, lessons and portable builds together. Every lesson states its
   current checkpoint and limitations; no claim of completion for placeholder art.

The [Toon room checkpoint](../getting-started/toon-room-checkpoint.md) is implemented.
The [first ABS encounter](../getting-started/toon-abs-checkpoint.md) now uses
[animated KayKit characters](../getting-started/toon-character-checkpoint.md).
Environment imports and animation blending are the remaining content-pipeline
work before water/progression; pursuit and obstacle occlusion remain limitations.

The Toon forest checkpoint now connects three areas with five guards, selected
KayKit forest props and camera following. Enemy defeat updates progress without
freezing the world. Pursuit, water and full progression remain pending; see
[the walkthrough](../getting-started/toon-forest-checkpoint.md).
