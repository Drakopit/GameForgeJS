# Toon adventure checkpoint 3: imported skinned characters

The encounter now uses a KayKit Knight and Skeleton Warrior from the supplied
GameDev Resources library. The original files were copied, not modified. Embedded
textures, multi-part meshes, bone hierarchies and animation libraries are loaded
through the normal resource manifest. This is a working character checkpoint,
not the finished adventure or final Zero to Hero course.

## 1. Run and observe

Run `node cli/index.cjs serve` from the repository and open
`/examples/DemoToonABS/index.html`. Use H for the framework help panel.

- The knight idles and runs when moving with WASD/arrows.
- Space selects an unarmed punch, sampled against the gameplay attack timeline.
- Damage selects a hit reaction; defeat plays a death clip and holds its final pose.
- R restores both actors, their poses, health and combat state.
- B still changes Toon lighting bands on the imported textured models.

The original sphere bodies remain the physics representation and are not drawn.
Changing the character art does not change damage ranges or collision dimensions.
Death disables gameplay collision while the visible model finishes its clip.

## 2. Inspect the copied resources

`assets/kaykit/` contains five unchanged GLBs, three license texts, a README and
`provenance.json`. The latter records source-relative paths and SHA-256 hashes.
All three copied license texts identify Kay Lousberg and CC0. These third-party
assets are credited in the in-game help as well.

| Manifest key | File | Use |
| --- | --- | --- |
| `knight` | `knight.glb` | Player meshes, skin and embedded texture |
| `skeleton` | `skeleton.glb` | Enemy meshes, skin and embedded texture |
| `rig-general` | `general.glb` | Idle, hit and death clips |
| `rig-movement` | `movement.glb` | Running clip |
| `rig-melee` | `melee.glb` | Unarmed punch clip |

The libraries contain other clips and mannequin geometry because the copies are
unchanged. Selective runtime publication does not prune animation clips or assets.
No absolute path into the external resource folder is needed at runtime.

## 3. Trace the character pipeline

1. `config/resources.json` declares the five models, with paths relative to the
   manifest. BootstrapGame and module3D load them before building the scene.
2. `src/data/CharacterAssets.js` names the models, clips and visual scale.
3. `CharacterVisual.js` builds a Model3D using ModelMeshFactory. Each imported
   part receives a ToonMaterial with its original texture and material settings.
4. The framework's new `SkeletalAnimator` owns an independent SkeletonPose for
   that model instance. Separate clip libraries bind channels by node name.
5. ClipSampler interpolates TRS keyframes (quaternion slerp for rotation).
   CpuSkinDeformer applies joint transforms and inverse bind matrices to vertex
   positions, normals and tangents, without modifying the loaded asset arrays.
6. Geometry3D.MarkUpdated tells the renderer to update existing vertex buffers.
   The same deformed geometry is used by color and shadow passes. No buffer is
   created per animation frame.

The classes are separate files under `src/3d/Animation/`. The game-owned visual
class chooses clips; the animator knows nothing about enemies, input or damage.

## 4. Use the public API

```js
import { AssetManager } from 'gameforgejs/core';
import { ModelMeshFactory, SkeletalAnimator } from 'gameforgejs/3d';

const model = ModelMeshFactory.FromAsset('knight');
const animator = new SkeletalAnimator(model);
animator.AddClip('idle', AssetManager.instance.GetModel('rig-general'), 'Idle_A');
animator.Play('idle');
// From the owner's existing lifecycle:
animator.Update(dt);
```

Register clips before selecting them. Repeating Play with the current name does
not restart the clip; use `{ restart: true }` when needed. `{ loop: false }` holds
the last keyframe and sets `finished`. Seek samples an explicit time, which the
demo uses to fit the punch to windup/active/recovery duration. Gameplay hitboxes,
not the animated hand mesh, determine damage.

Exercise: change the idle mapping from `Idle_A` to `Idle_B`, reload, and verify
both the source page and published build. A missing clip produces a named error.
Returning to Idle_A should require changing only CharacterAssets.js.

## 5. Supported subset and measured limits

- LINEAR and STEP TRS channels; four weighted joint influences per vertex.
- Compatible rigs only: unique node names, matching ancestors and matching rest
  transforms. This is not general retargeting between unrelated skeletons.
- CUBICSPLINE, morph targets and matrix-node animation binding are rejected.
- Clip changes are immediate. Crossfading, animation events, root-motion-driven
  physics, equipment attachments and final attack-pose alignment remain future work.
- CPU skinning is intended for a small cast. In one local headless Edge run on an
  AMD Ryzen 7 7735HS, 30 updates of these two characters averaged about 6.6 ms per
  update; a concurrent regression run measured about 10.5 ms. This excludes scene
  rendering and is not a frame-rate guarantee or evidence of crowd performance.

The current demo also includes [checkpoint 4](toon-forest-checkpoint.md): imported
forest scenery and several connected encounters. Floor and boundary geometry remain
primitive. Water, pursuit, progression and the full adventure are not complete.

## 6. Publish and verify

```sh
node cli/index.cjs build --root examples/DemoToonABS
node cli/index.cjs serve --root examples/DemoToonABS/dist
```

Verify textures, idle/run, combat, death, R and H again. Browser regressions also
check vertex deformation, immutable source data, GPU buffer reuse, texture decode,
combat synchronization and shader errors. Synthetic tests cover inverse bind
matrices, instance isolation, loop/end behavior and unsupported animation inputs.
