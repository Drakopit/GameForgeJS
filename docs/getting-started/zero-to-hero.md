# Zero to Hero: complete-game learning paths

This page defines the final learning deliverables and provides the first runnable
lesson. The remaining chapters and full games are planned work, not completed
features. Each chapter will be written against a working, tested checkpoint.
The complete material is only finished after all planned modifications: final
framework/addon APIs, full game source, assets, lessons and published builds must
be validated together. Intermediate examples are checkpoints, not the final course.

See the [implementation audit](../migrations/advanced-demo-audit.md) for current
evidence and the active Toon room → ABS encounter → model animation → water and
progression sequence. The 2D lab is a supporting checkpoint, not the final campaign.

The [first Toon room checkpoint](toon-room-checkpoint.md) is now executable:
banded lighting, overhead movement, solid obstacles and selective publication.
Its primitive art remains temporary; the initial room lesson covers navigation and rendering.

[Checkpoint 2](toon-abs-checkpoint.md) extends that room with one sentry, melee
windows, damage, invulnerability, knockback and restart. The complete adventure,
animated characters, progression and water remain outstanding.

[Checkpoint 3](toon-character-checkpoint.md) now replaces the character placeholders
with copied KayKit models, embedded textures and verified CPU skeletal playback.
Clip blending, full environment art, progression and water are still pending.

## Format for every chapter

1. State the small playable result and prerequisites.
2. Show the exact command, file and code change; explain each new concept.
3. Run the game and describe the expected visual/input result.
4. Diagnose common errors using their actual messages and paths.
5. Offer one small exercise and a working checkpoint to compare against.
6. Explain how an experienced developer can replace the default behavior.

## Lesson 1: run a 3D scene

Prerequisites: a GameForgeJS checkout and a Node version satisfying its
`package.json`. Run these commands from the checkout folder:

```sh
npm ci
node cli/index.cjs create ../my-abs-game --template minimal-3d
node cli/index.cjs serve --root ../my-abs-game
```

Open the address printed by the server. The result should be a rotating cube
and a Ready status. If creation reports a nonempty destination, choose another
new folder; do not overwrite an existing project.

Open the generated `src/levels/FirstLevel.js`. It extends `Level3D`:
`BuildScene()` constructs the scene and `OnUpdate(dt)` advances it. Change the
rotation speed, save, and reload. Confirm that the speed changes. No manual
canvas or second game loop is needed.

Follow the startup path through `main.js`: `BootstrapGame` loads
`config/game.config.json` and `config/resources.json`, then starts the level.
The `config/gameforgejs.package.json` file selects published runtime groups;
it does not supply scene behavior.

Stop the server with Ctrl+C. From the engine checkout:

```sh
node cli/index.cjs build --root ../my-abs-game --dry-run
node cli/index.cjs build --root ../my-abs-game
node cli/index.cjs serve --root ../my-abs-game/dist
```

Open the new server address and verify the same cube. The build's module list
should include `core` and `3d`. This completes the first source-to-publication
checkpoint; it is not yet an action game.

For the 2D path, repeat with a different new folder and `--template minimal-2d`.
The expected result is a square that moves with WASD or arrow keys.

## Path A: original Toon 3D action adventure with ABS combat

The visual direction is Toon: readable silhouettes, controlled palettes,
stylized lighting/shadow bands and water consistent with the art direction.
Outline rendering is an optional technique to evaluate, not a mandatory effect.
Keep this style configurable so the framework still supports other art styles.
Before declaring this chapter ready, test imported character materials, animation,
lighting, water and visual combat cues together in the real game.

Use the room exploration and real-time combat structure of a classic top-down
adventure as a design reference, implemented in 3D with original content.
Start with a readable overhead camera; alternative camera controllers remain
replaceable. A completed game needs a beginning, progression, final encounter
and ending, not just a combat arena.

| Chapter group | Playable checkpoint | Required validation |
| --- | --- | --- |
| Foundation | First room, player, camera and collision | Movement is independent of frame rate; camera remains inside room bounds |
| Project/content organization | Config, assets, levels, entities and manifests | Moving or publishing the project preserves asset resolution |
| Complex models | Import a multi-node GLB/glTF environment and character | Verify hierarchy, scale, orientation, materials and external/embedded textures |
| Character animation | Idle, movement, attack and hit reactions | Verify actual skeletal playback and transitions; parsed animation data alone is insufficient |
| ABS combat | Attack windows, hitboxes, damage, invulnerability and knockback | One attack does not hit the same target repeatedly unless configured |
| Enemy behavior | Patrol, perception, pursuit, attack, retreat and return | Clear telegraphs, bounded pursuit and reachable movement |
| Interaction/progression | Doors, switches, items, inventory, save/load | Reload restores progression and does not duplicate rewards |
| Water | Readable water surface, shoreline and water interaction | Separate visual shader behavior from collision/swimming rules; measure cost |
| World structure | Connected rooms, outdoor area and dungeon | Transitions release owned resources and preserve intended state |
| Complete game | Boss, ending, menus, audio and published build | Playable from new game to ending, including save/reload and restart |

Model-animation lessons must state the supported renderer subset. Checkpoint 3
verifies CPU skinning and compatible-rig LINEAR/STEP playback; it does not provide
general retargeting or clip blending. Water lessons still require implementation
and visual verification before they can be presented as working instructions.

## Path B: original 2D platformer with at least 20 levels

Use polished platforming as the reference: responsive jumping, readable enemy
behavior, secrets and mechanics that build on previous lessons. The delivered
game must contain at least 20 individually designed, completable levels, not
20 copies of the same layout.

| Level | Main lesson / challenge | Enemy behavior focus |
| --- | --- | --- |
| 1 | Safe movement and jumping | Slow patrol |
| 2 | Ledges and jump tolerance | Turn before a ledge |
| 3 | Collectibles and alternate routes | Timed hopping |
| 4 | First checkpoint and exit challenge | Telegraph before charging |
| 5 | Slopes or stepped terrain | Patrol with height constraints |
| 6 | Moving platforms | Vertical flying route |
| 7 | Breakable/interactable blocks | Wake when approached |
| 8 | First boss-style encounter | Distinct attack/recovery states |
| 9 | Water introduction | Swimming patrol |
| 10 | Currents and safe resting places | Bounded pursuit |
| 11 | Underwater secret route | Projectile timing |
| 12 | Mixed land/water challenge | Retreat and return to territory |
| 13 | Vertical climbing | Orbiting or circling hazard |
| 14 | Wind and platform timing | Dive with warning |
| 15 | Branching paths and optional challenge | Guard a route without trapping the player |
| 16 | Multi-mechanic encounter | Alternate patterns based on state |
| 17 | Advanced precision with checkpoints | Combine familiar behaviors |
| 18 | Exploration and secrets | Configurable detection zones |
| 19 | Final approach | Escalation with recovery spaces |
| 20 | Final encounter and ending | Readable phases, fair reset and victory |

These are proposed level goals, subject to playtesting. Enemy AI here means
state machines, perception, timers and navigation; no machine learning is required.
Add replay, pause, sound controls, save slots/progress, difficulty tuning and
publication lessons around this campaign. Each mechanic must also work outside
the campaign so the course does not become a mandatory game architecture.

## Completion criteria

Both paths provide small sequential lessons, checkpoint source, expected results,
troubleshooting and complete playable builds. A reader starting from an empty
game folder must be able to reproduce the result without copying hidden systems
from a large demo. Development follows the [roadmap](../development-roadmap.md).

[Checkpoint 4](toon-forest-checkpoint.md) adds a continuous route through three areas,
five sentries, imported forest props and a following camera. Defeating enemies no
longer stops exploration. This is another incremental slice; the full course remains pending.
