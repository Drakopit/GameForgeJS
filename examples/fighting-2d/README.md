# Fighting Arena 2D

A local arcade/versus fighter with animated characters, melee chains, ranged energy
spheres, a meter-powered super, guard, jumping, dash and a distance-aware CPU.

## Play

Run `npm start` at the repository root and open `/examples/fighting-2d/index.html`,
or select Fighting Arena in the launcher. Choose ARCADE, then your character.
VERSUS lets two people select fighters and play on one keyboard or two gamepads.
The menu's third option opens the in-engine combat guide.

| Action | Player 1 | Player 2 | Standard gamepad |
| --- | --- | --- | --- |
| Move | A / D | Left / Right | Left stick / D-pad |
| Jump | W | Up | A / D-pad up |
| Guard | S | Down | LB / D-pad down |
| Light | J or Z | 1 / Numpad1 | X |
| Heavy | K or X | 2 / Numpad2 | Y |
| Energy sphere | L or C | 3 / Numpad3 | RB |
| Super | U or Q | 0 / Numpad0 | RT |
| Help | H | H | Start |
| Back to menu | Escape | Escape | Select / Back |

Gamepad labels above use Xbox's standard layout; the existing alias/profile system
and config/game.config.json own bindings. Player 1 uses slot 0 and Player 2 slot 1.
Double tap a horizontal direction for a dash. The HUD displays power and super readiness.

## Try the combat

1. Press L/RB at distance. The sphere costs no meter and is available from the start.
   A cooldown and one live projectile per fighter prevent unlimited shot spam.
2. Watch the opponent's charge: guard facing the shot or jump early to clear it.
   Guard consumes the projectile and reduces damage, with a short block stun.
3. Approach, hit light, then queue heavy and sphere. ComboController buffers the
   chain; the next attack cancels during recovery after a confirmed contact.
4. Press U/RT for a larger super projectile. It costs 50 EN; rounds start at 50.
   Hits, guarding/damage and gradual recovery rebuild meter. The super overpowers
   an ordinary energy sphere; equal projectiles cancel each other.
5. Win two rounds. Arcade advances through three opponents after confirmation;
   versus offers a rematch. Round changes clear projectiles, input queues and combos.

The CPU reacts at intervals rather than reading player commands. It casts at range,
closes distance, guards or jumps against incoming shots, punishes recovery and
confirms light/heavy chains. Characters retain speed/health/damage differences;
energy color, travel speed and size also follow their profiles.

## Structure

- main.js and modules/FightingModule.js: BootstrapGame and class-based composition.
- levels/FightingGame2DLevel.js: round flow, entity ownership and scene orchestration.
- entities/Fighter2D.js: GameObject combat state and framework ComboController.
- entities/FighterMotor.js: Component for movement, gravity, dash and arena limits.
- presentation/FighterVisual.js: Component using the engine Sprite clock, clipping
  and flipping, with authored foot anchors and nonblank sheet cells in data/FighterAnimations.js.
- combat/FighterBoxes.js: foot-anchored bounds adapted to CombatResolver2D.
- combat/FightingCombat.js: melee contacts, body push, projectile clashes and damage.
- entities/EnergyProjectile.js: GameObject projectile instances reused with ObjectPool.
- ai/FightingCPU.js: interval-based tactical commands, separately testable.
- input/: existing framework keyboard/gamepad adapters and queued action edges.
  The reader subscribes to PreUpdate to preserve short taps during hit-stop/intro;
  it unregisters on level exit. It creates no browser listener or gamepad device.
- ui/: HUDFrame/InfoPanel controls, bars, readiness and round announcements.
- data/: movement/round/CPU tuning, attack timings and sheet-cell definitions.

All entities update through Level, and components through GameObject. Rendering uses
Screen, Sprite and engine UI; no HTML gameplay overlay or second animation loop exists.
Configuration, resources, editor metadata and selective distribution stay under config/.

## Verify and build

```sh
npm run test:fighting
node --test tests/fighting-cpu.test.cjs
node cli/index.cjs build --root examples/fighting-2d
node cli/index.cjs serve --root examples/fighting-2d/dist --base /game/
```

The fighting suite checks source and prefixed portable builds: keyboard powers,
blocking, jumps, supers, clashes, a three-hit chain, CPU activity, two gamepad slots,
held-button behavior, buffered taps, stable entity ownership and teardown.
The complete browser suite also includes the combat scenario.
