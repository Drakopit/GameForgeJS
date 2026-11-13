# Version comparison

Reference points inspected on 2026-11-13. These are Git snapshots, not separate
semantic releases: package metadata still reports version 1.0.0.

- Public runtime baseline: `e65b7fc` (the older directory layout). The presentation
  page alone is updated by `1db11a3`; that website commit does not merge the framework refactor.
- Immediate pre-modular baseline: `e10475a`, also the local `feature/refactor-and-fix` head.
- Current development baseline: `f02c66d` on `feature/modularize-framework`.
- Working changes after `f02c66d`: addon validation/completion, Toon/course acceptance
  details and the new presentation page. These are separate from that baseline.

The current checkout **is** the modularization branch; it is not a fourth version.

| Concern | Public master | Before modularization | Modular branch |
| --- | --- | --- | --- |
| Runtime layout | CoreCross, Core2D, Core3D, CoreNetwork at root | Implementations under src/CoreCross, src/Core2D, etc. | src/core, src/2d, src/3d, src/network with public entry points |
| Game entry | Shared Main.html launcher | Shared launcher and demo entry scripts | Each game has index.html/main.js; showcase is separate; old Main links redirect |
| Game model | Classes and static shared services | BootstrapGame, Level, GameObject and components | Same primary model; createGame is a separate opt-in instance API |
| Tooling | Local server | Server and publisher | Create, serve, generate, doctor and build CLI with offline local-package support |
| Publication | Shared repository layout | Publisher file/module selection | Validated build plans, selective runtime groups and bundled addon selection |
| Configuration | Root/default and per-demo files | Per-game files and resource/editor manifests | Defaults in runtime; config folder in new projects/Advanced; older layouts accepted |
| Reuse | Mainly examples and core features | More model/rendering and reliability work | First parallax/state-machine addons shared by Advanced and independent example |
| Validation | Limited tooling in public snapshot | Repository checks | Automated lifecycle, resources, CLI, package and browser integration checks |
| Documentation | Older Jekyll/README presentation | Guides and generated reference | Searchable docs, generated public API and staged learning roadmap |

## The substantial change

This is primarily a change in **project independence, distribution and reuse**,
not proof of a new renderer or a universal performance improvement. A game can
keep its levels, entities, screens and components while shipping selected groups
and reusing optional behaviors. Most genre features existed in demos before this
branch; modularization makes them easier to consume and validate.

## Remaining costs and limits

- Distribution groups are coarse; barrel imports still load dependencies inside
  their groups. This is not symbol-level tree shaking.
- The instance API and shared-service bootstrap coexist. Existing static services
  do not automatically become isolated by moving directories.
- Project extension registration and distribution selection still have overlapping
  terminology, although they have different consumers.
- Only the migrated projects use config/; external-editor workspace discovery
  still expects its file in the game root.
- The addon pilots do not yet provide full platformer, ABS, tactical or sandbox kits.
- Toon rendering, complete skeletal playback validation, water gameplay and the
  full Zero to Hero games remain roadmap work, not finished release claims.

The development baseline is more usable for independent projects, but its package
version alone does not communicate compatibility. Consumers should record the
Git revision until a deliberate release/version policy is established.
