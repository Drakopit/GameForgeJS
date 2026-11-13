# Toon adventure checkpoint 4: a continuous forest trail

The playable demo now connects a courtyard, a forest trail and an old grove in
one Level3D. Five sentries guard the route. Defeating any or all of them leaves
movement and physics running. Only player defeat stops combat until R restarts.
This is a small exploration slice, not the finished adventure or final course.

## 1. Walk the route

Run `node cli/index.cjs serve` from the repository root and open
`/examples/DemoToonABS/index.html` at the printed server address.

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

Open `examples/DemoToonABS/src/data/Courtyard.js`. Each `areas` entry has a name,
a minimum Z boundary and a list of enemy spawn positions. Areas are ordered from
south to north (decreasing Z). Add `[0, 0.55, -18]` to the old grove's enemy list,
reload and verify that the HUD total becomes six. Keep spawns outside solid scenery.

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
node cli/index.cjs build --root examples/DemoToonABS
node cli/index.cjs serve --root examples/DemoToonABS/dist
```

Repeat the route, check the forest textures, clear enemies and restart. The browser
suite runs these checks against source and a build hosted under a URL prefix,
including multi-target strikes, camera following, all-clear movement and cleanup.

Nearby rigs animate each update; rigs farther than 12 world units from the player
sample at 5 Hz. Finished death poses skip further skinning. Combat still uses the
normal fixed step. This reduces CPU deformation work, but is not crowd rendering
or world streaming. Test on target devices before increasing enemy counts.

Remaining work includes patrol/pursuit, attack occlusion around obstacles, water,
progression, equipment, saving and a complete adventure. The earlier animation
limitations still apply. This checkpoint extends the Zero to Hero material without
presenting the full course as complete.
