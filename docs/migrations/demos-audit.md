# Demo architecture audit and naming migration

All runnable demos are listed in examples/catalog.json. The directory prefix Demo
was replaced with purpose-based lowercase names ending in -2d or -3d. Catalog IDs
match folders. Old launcher IDs remain explicit aliases, while direct folder URLs
and repository commands use the canonical names.

## Audit scope

The review covers every catalog entry's startup, module composition, scene/screen
ownership, input device creation, project/config layout, resource paths, editor
references, public imports, distribution declarations, class file boundaries and
teardown. Source and built browser startup checks cover every entry. Specialized
suites exercise Sky Trail, Toon ABS, platformer progression and multi-touch behavior.

| Demo | Startup/composition | Scene family | Distribution |
| --- | --- | --- | --- |
| `toon-adventure-3d` | BootstrapGame / class Module | Level3D | config/ + selective package |
| `platformer-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `movement-collision-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `component-adventure-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `platform-adventure-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `tactical-rpg-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `fighting-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `puzzle-battle-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `renderer-3d` | BootstrapGame / class Module | Level3D | config/ + selective package |
| `solar-system-3d` | BootstrapGame / class Module | Level3D | config/ + selective package |
| `sky-trail-3d` | BootstrapGame / class Module | Level3D | config/ + selective package |
| `online-sandbox-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `addons-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |
| `touch-garden-2d` | BootstrapGame / class Module | Level + Screen | config/ + selective package |

## Corrections applied

- Every demo now has a root Module class, using the established level lifecycle.
- Runtime configuration, resources, project metadata and distribution declarations
  are consolidated under config/. Resource and editor paths were updated together.
- Every distribution manifest lists only the runtime groups/addons actually imported
  by that project. Addon identifiers use the package schema's supported names.
- Screens receive their owning context's configuration. The component adventure
  registers entities through AddEntity instead of replacing the level entity list.
- The online sandbox borrows its Input-owned mouse instead of creating a fallback
  listener owner. Its existing chat/network teardown remains with the level.
- The movement example's off-screen help and FPS labels were moved inside its screen.
- The platformer now maps its exposed actions to keyboard and gamepad. The puzzle
  uses configurable keyboard/gamepad actions and resets match state without a page reload.
- Each demo and the examples root have README files. The catalog no longer describes
  Toon Adventure as a single-sentry room or Sky Trail as a single basic route.
- The new mobile demo consumes Input's Touch instance, converts client coordinates
  through Screen, and composes movement, velocity, bounds and collectible classes.

## Enforced patterns

The project gate discovers projects from the catalog, including all canonical names.
It rejects unregistered folders, duplicate IDs/aliases, wrong dimensions, missing
README/config files, invalid distribution packages, nonessential root configuration,
private framework imports, cross-demo URLs, duplicate input-device construction,
manual RAF/interval/canvas creation and multiple top-level classes in a source file.

Framework entities/components participate in lifecycle methods. Plain domain models
(board algorithms, battle planners, renderer composition helpers) are permitted when
they have a clear level owner and no independent browser loop or service lifetime.
The audit does not force every data/model class to inherit GameObject or rewrite
working game rules merely because a file is long.

Global engine services are owned by BootstrapGame, levels own scenes and level-specific
listeners, and entities own their components. Screens are created through Screen or
Level3D. Procedural drawing is allowed through the framework's Draw/Canvas context;
creating a competing gameplay canvas or HTML HUD is not.

## Verification boundaries

Browser smoke tests validate startup, assets, canvases and disposal in source and
prefixed builds. Dedicated tests add actual keyboard/gamepad and simultaneous browser
touch input. Touch is also checked with portrait and landscape mobile emulation.
These checks do not establish exhaustive human playthrough coverage, physical-phone
compatibility, server-scale networking or complete Zero to Hero games.

See [the examples guide](../../examples/README.md) for the full index, controls,
learning sequence and old-to-new directory map.
