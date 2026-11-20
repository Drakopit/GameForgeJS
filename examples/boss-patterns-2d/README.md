# Boss Patterns 2D

An approachable Shining Soul-inspired encounter: read a telegraph, evade, then punish recovery. Three health phases combine aimed projectile fans, rings, a marked charge and delayed floor hazards.

## Run and build

From the repository root:

```sh
npm ci
npm start
# Open /examples/boss-patterns-2d/ on the printed server address.
node cli/index.cjs build --root examples/boss-patterns-2d
npm run test:lessons
```

The built dist/ is portable under a hosting subpath. Only selected framework groups
are distributed. The browser uses native ES modules, zero third-party runtime
packages and no remote assets. Each class has its own file; configuration lives in config/.

## Controls

| Action | Keyboard / mouse | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | WASD / arrows | Left stick / D-pad | Virtual stick |
| Fire at boss | Hold Space / Enter | Hold A | Tap FIRE |
| Dash | C | Y | DASH |
| Retry / help | R / H | Select / R3 | RETRY / HELP |

## Read the composition in this order

1. [ArenaLevel](src/levels/ArenaLevel.js) composes the room, player, boss, field and a capped pool. It only coordinates reset/result/events.
2. [ArenaPlayer](src/entities/ArenaPlayer.js) uses native HealthComponent, BoundsComponent and fixed VelocityComponent with [CombatMotion](src/components/CombatMotion.js). Hurt invulnerability and dash cooldown are independent.
3. [BossDirector](src/components/BossDirector.js) owns only waiting → windup → attacking → recovering. The health fraction selects a phase/cycle from config/scenario.json.
4. [FanAttack](src/components/FanAttack.js), [RingAttack](src/components/RingAttack.js) and [ChargeAttack](src/components/ChargeAttack.js) each own Prepare, Begin, Update and Draw. Prepare locks the target before the telegraph, so the player can read and evade it. Add a new pattern by implementing this small interface and registering it in the director.
5. [ArenaProjectile](src/entities/ArenaProjectile.js) composes native VelocityComponent and LifetimeComponent with [ProjectileContact](src/components/ProjectileContact.js). The ObjectPool has a hard 96-object cap; exhaustion drops emissions.
6. [HazardField](src/components/HazardField.js) marks positions before they become damaging and expires them after a bounded lifetime.
7. [CombatVisual](src/components/CombatVisual.js) draws hit feedback from health state; native Canvas HUD components show health, phase, attack name and dash readiness. Defeat/victory clear transient danger; retry resets the full encounter.

## Boundaries and lifecycle

The boss health thresholds are 66% and 33%. Fixed updates drive movement, attack clocks, collision and hazards; engine updates drive health invulnerability/lifetime. Configuration controls phase cycles, windup/recovery, speeds and budgets. Input uses the framework's configurable action system and identified touch contacts.

This is a readable pattern lesson rather than a general AI framework, continuous-collision solver or a complete RPG. Circle contacts use semantic Vector2D positions; bounds components remain available for inspection. Fast projectiles use the engine's fixed step; no swept-collision guarantees are claimed. On exit, entities, pool storage, subscriptions, buttons and viewport observers are released.

The existing class-owned entity/component architecture is preserved. Every
component runs on the framework's lifecycle; no archetype ECS rewrite, alternate
renderer, hidden DOM gameplay UI or additional game loop is introduced.
