# Fighting Arena 2D

A local arcade/versus fighter with animated characters, melee chains, ranged energy
spheres, a meter-powered super, guard, jumping, dash and a distance-aware CPU.

## Play

Run `npm start` at the repository root and open `/examples/fighting-2d/index.html`,
or select Fighting Arena in the launcher. Choose ARCADE, then your character.
VERSUS lets two people select fighters and play on one keyboard or two gamepads.
The menu's third option opens the in-engine combat guide. Mouse/touch can select
menu options and character cards. On mobile, native action buttons and a virtual
stick support simultaneous movement and attacks; desktop pads stay hidden unless
explicitly enabled in the guide. The guide pauses combat and clears queued menu input.

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
and config/game.config.json own bindings. Player 1 and Player 2 occupy stable seats rather than hardcoded browser slots. Sparse
slots and disconnect/reconnect do not transfer the remaining controller to the wrong player.
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

Bindings live only in config/game.config.json; native button tokens keep physical
controls independent of Xbox/PlayStation art. config/prompts.json references those
bindings and never changes them. Touch buttons use the existing Touch contacts,
ActionBar and VirtualStick. FightingViewport fits the authored arena to a native
responsive Screen and releases its viewport observers at exit.

The [future fighting architecture note](../../docs/plans/fighting-game.md) describes
fixed-frame motion commands, cancels, juggle rules, finishers and a full tower.
Those future systems are not claimed as delivered by this input polish.

## Complete sheet catalog and contextual attacks

The four sheets are now audited cell-by-cell: 79 occupied cells each in Char_3,
Char_3_No_Armor and Char_4, and 73 in Char_5. Every occupied cell is mapped and
every declared cell contains pixels. The silver sheet has no alternate-outfit
run; GetSheetAnimations omits that sequence instead of showing blank frames.

FighterAnimations is the data registry. Clips declare exact row/column cells,
including non-contiguous and multi-row sequences, FPS, looping and foot anchors.
FighterVisual selects locomotion/reaction variants and delegates timing, clipping
and mirroring to native Sprite. The aura uses its own native Sprite track.

- Walk/backward walk, forward dash/back step, jump/fall/landing, high/low guard.
- Light/medium/heavy, contextual crouching/aerial normals, dash strike and weapon power.
- Hurt/knockback, knockdown/get-up, intro, victory, KO and aura.
- P1 medium: I; P2 medium: 5/numpad 5; pad medium: left trigger; native touch MEDIUM button.
- S/down plus a normal selects the crouching version; normals in the air select
  aerial versions. Crouch + power selects the weapon projectile.
- Down crouches/guards low; Shift or the pad guard button guards high. Low attacks
  require low guard; aerial high attacks require high guard; mids permit either.
- A low heavy can knock down; get-up is temporarily invulnerable. Hitboxes,
  recovery, damage and windows live in FighterAttacks, separately from the art.

The menu's Animation Lab cycles every sequence on every fighter using keyboard,
gamepad or native touch buttons. The alternate costume and meditation pose are
inspection/auxiliary sequences, not invented combat transformations. The four
sheets remain visual variants with tuning; this is not a claim of four unrelated
commercial movesets. See the [catalog/sheet audit](../../docs/plans/demo-polish-audit.md).
