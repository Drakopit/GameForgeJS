# Toon adventure checkpoint 4: a continuous forest trail

The playable demo now connects a courtyard, a forest trail and an old grove in
one Level3D. Five sentries guard the route. Defeating any or all of them leaves
movement and physics running. Only player defeat stops combat until R restarts.
This is a small exploration slice, not the finished adventure or final course.

## 1. Walk the route

Run `node cli/index.cjs serve` from the repository root and open
`/examples/toon-adventure-3d/index.html` at the printed server address.

1. Press H for the ScreenUI controls; close it with H.
2. Walk north with W/up through the courtyard. Space attacks in your facing direction.
3. Dodge the yellow preparation and strike during recovery. Three hits defeat a sentry.
4. Continue along the tan path. The camera follows and the HUD names the current area.
5. Find two guards along the forest trail and two in the old grove.
6. After all five defeats, the HUD announces the cleared trail. You can still explore.
7. R resets all five guards, the player, health, pending attacks and animation poses.

There is no automatic respawn or transition after a kill. Sentries remain stationary
and attack only within reach. Defeated bodies no longer collide; their death visuals remain.

## 2. Add another encounter

Open `examples/toon-adventure-3d/config/scenes/courtyard.gfscene.json` (or the
Courtyard scene in the editor's 3D view). Each entry of `settings.areas` has a name and
a minimum Z boundary; areas are ordered from south to north (decreasing Z). Sentries are
nodes in the `enemies` layer whose `Enemy.area` names their area. Duplicate a sentry,
move it to `[0, 0.55, -18]` in the old grove, reload and verify that the HUD total
becomes six. Keep spawns outside solid scenery.

`ToonRoomLevel` registers each Sentry through AddEntity, assigns its player target
and creates its CharacterVisual and AttackIndicator. The player receives the whole
enemy collection. MeleeAttack tests every living target, remembering each attempted
target for the current swing. Existing attack states remain in their separate files.

For a longer map, extend the floor and boundary walls along with `bounds`, the
area thresholds and path segments. Walking areas are data within one level; they
are not separately streamed maps. ExplorationCamera clamps its following view to
the map's ends. No extra game loop or canvas is created.

## 3. Place scenery with collision

`data/ForestScenery.js` describes imported tree, rock and bush placements.
`entities/SceneryProp.js` creates each model through ModelMeshFactory and wraps
its materials in ToonMaterial. The optional `collider` is an explicit world-size
box: visual scale does not automatically resize this simplified physics volume.
Trees collide around their trunks, rocks have solid boxes and bushes are decorative.
OnDestroy removes both model meshes and physics bodies.

Example placement:

```js
{ model: 'forest-tree', position: [-5, 0.2, -17], scale: 1.1, collider: [0.7, 3, 0.7] }
```

The manifest in `config/resources.json` loads three glTF models. Their adjacent
`.bin` files and shared `forest_texture.png` must travel with them. Only those
selected resources and the original CC0 license were copied from the supplied
KayKit Forest Nature pack. `assets/kaykit/provenance.json` records source paths
and SHA-256 hashes. Original resource files are unchanged.

## 4. Check the published game

```sh
node cli/index.cjs build --root examples/toon-adventure-3d
node cli/index.cjs serve --root examples/toon-adventure-3d/dist
```

Repeat the route, check the forest textures, clear enemies and restart. The browser
suite runs these checks against source and a build hosted under a URL prefix,
including multi-target strikes, camera following, all-clear movement and cleanup.

CharacterVisual passes the engine-provided OnUpdate(dt) directly to the animator.
It has no distance scheduler or accumulated replacement delta. Finished death poses
still skip further skinning. Six CPU-skinned characters cost more than the previous
throttle; this is not crowd rendering. Measure on target devices before adding rigs.

## 5. HUD, controls and sky

HealthBar reads HealthComponent directly. AreaAnnouncement shows each area's name
on entry, including re-entry: hold for 2.5 seconds, then a smooth 1.5-second fade.
Its transition age advances through the existing level update, without wall-clock
reads or a second loop. Both widgets use ScreenUI and separate files under src/ui/.

Skybox.FromImage uses sky_cross from config/resources.json. The cubemap cross was
copied unchanged from sky-trail-3d; assets/sky/README.md records its repository
origin. It is separate from the KayKit assets and their license.

| Action | Keyboard | Standard-layout gamepad |
| --- | --- | --- |
| Move | WASD / arrows | Left stick (analog speed) / D-pad |
| Attack | Space | Left face: Xbox X / PS Square / Nintendo Y |
| Restart | R | Top face: Xbox Y / PS Triangle / Nintendo X |
| Help | H | Start / Options / + |
| Toon bands | B | Select / View / Share / Minus |

Mappings remain in game.config.json. Movement uses ActionManager.GetActionValue,
clamps diagonal speed and normalizes facing independently of stick strength.
Button actions use IsActionDown, so holding help does not repeatedly toggle it.
Keyboard and gamepad are supported gameplay paths here. Mouse/touch gameplay is
not implemented: raw framework devices exist, but ActionManager currently maps
keyboard/gamepad only.

Browser regressions simulate navigator.getGamepads through real Input polling,
including partial stick values, D-pad, buttons and disconnect. Physical-controller
compatibility testing remains distinct from simulation. Source and prefixed builds
also check fading, area re-entry, health-bar damage and skybox GPU upload.

[Checkpoint 5](toon-water-checkpoint.md) adds the first decorative animated pond.
Remaining work includes patrol/pursuit, attack occlusion around obstacles, swimming,
progression, equipment, saving and a complete adventure. The earlier animation
limitations still apply. This checkpoint extends the Zero to Hero material without
presenting the full course as complete.
