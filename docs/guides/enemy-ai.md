# Platform Adventure enemy AI

`examples/platform-adventure-2d` keeps its existing Enemy, state machine, animation,
combat boxes and damage rules. `src/ai/EnemyBrain.js` adds level-owned perception
and movement decisions, called by Enemy.OnUpdate using the framework delta time.
It does not own a timer, browser listener or simulation loop.

## Behavior

1. Patrol near the authored spawn at a reduced speed.
2. Acquire a living player within horizontal range and sight height, with a clear
   eye line through the level's solid blocks. Platforms below the eyes do not occlude.
3. Pursue the visible player and preserve the configured combat spacing. The existing
   Attack state owns attack timing and facing; hits still use CombatResolver2D.
4. When sight is lost, approach the last known X for a short memory window; the enemy
   never tracks the hidden player's new position.
5. Return to the post after exceeding the leash, then resume patrol/acquisition.
6. Before taking a step, check support ahead and reject excessive drops or solid walls.
   Patrol reverses at an unsafe edge; pursuit stops rather than running off a cliff.

The brain does not grant enemies jumping/pathfinding across disconnected platforms.
It does not change gamepad input or the player controller. Airborne knockback remains
with the existing physics/combat flow, and reset clears perception and patrol state.

## Tune an enemy

Use the existing `enemyDefaults.ai` or per-enemy `config.ai` in the stage manifest.
Defaults live alongside the other enemy configuration in Enemy.js:

| Setting | Default | Purpose |
| --- | --- | --- |
| aggroRange | 200 (stages may override) | Maximum horizontal acquisition distance |
| sightHeight | 120 | Vertical perception limit |
| patrolRadius | 85 | Distance from post before reversing |
| patrolSpeed | 0.4 | Multiplier of the configured movement speed |
| memorySeconds | 1.8 | Search duration after losing sight |
| leashRange | 340 | Maximum pursuit distance from post |
| homeTolerance | 8 | Arrival/search stopping tolerance |
| edgeLookahead | 12 | Clearance beyond the leading body edge |
| maxDrop | 26 | Maximum supported drop for an ordinary step |
| floorTolerance | 4 | Tolerance for support/block comparisons |

`stopDistance`, `attackRange`, `attackVerticalRange` and `attackCooldown` retain their
existing meanings. Keep stopDistance within attackRange for ordinary melee enemies.

`node --test tests/enemy-ai.test.cjs` checks occlusion, memory, leash return, patrol,
wall avoidance and safe edges. The browser suite also exercises a registered enemy
and its state transitions in source and built Platform Adventure projects.
