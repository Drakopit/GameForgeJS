# Toon adventure checkpoint 2: the first ABS encounter

The room now contains one stationary sentry. This checkpoint adds real-time melee
rules to the [Toon room foundation](toon-room-checkpoint.md). Meshes are still
placeholders: there is no skeletal attack animation, pursuit, inventory or water.

The current demo also includes [checkpoint 3](toon-character-checkpoint.md), which
replaces the character placeholders with animated KayKit models. Combat rules
and physics remain those described here; pursuit, inventory and water are pending.

## 1. Play the encounter

From the repository root, run `node cli/index.cjs serve` and open
`/examples/DemoToonABS/index.html` on the printed server address.

1. Press H to read controls in the framework HUD. H closes help; it does not pause.
2. Use WASD/arrows to approach the first sentry down the center aisle.
3. Face it and press Space. Holding Space does not repeat attacks.
4. Yellow ground rectangles mark preparation; red marks the active hit area.
5. Step aside during the sentry's longer preparation, then strike while it recovers.
6. Defeat it with three successful hits. Five received hits cause defeat.
7. R resets all actors, health, invulnerability, pending attacks and the result.

The player stops moving during a swing. The sentry fixes its facing when starting
an attack and cannot follow your dodge mid-swing. Damage interrupts an attack and
knocks its owner back. After damage there is temporary invulnerability, reflected
in the health rules rather than another timer in the HUD.

## 2. Follow one attack through its files

`Explorer.OnUpdate` captures a new Space press through ActionManager. Its fixed
update consumes the press once and calls `MeleeAttack.Start()` if the player is
alive, not hurt and ready. The existing state-machine addon drives these classes:

| State file under `src/combat/states/` | Behavior |
| --- | --- |
| `ReadyState.js` | Accept a new attack |
| `WindupState.js` | Preparation timer; no damage |
| `ActiveState.js` | Test the facing-oriented hit area and attempt damage |
| `RecoveryState.js` | Wait before allowing another attack |

All states are separate classes/files. MeleeAttack owns their instances and
transitions. It stores a Set of targets already attempted during the swing, so
overlapping for several fixed updates cannot deal repeated damage. A target that
was invulnerable on the first attempt is also not retried during that swing.

`Combatant.js` shares health, physics registration, knockback and teardown between
Explorer and Sentry. It attaches the framework's HealthComponent and advances its
timer in the level's fixed lifecycle. It does not create another game loop.
`Sentry.js` starts an attack when the living player enters reach; navigation and
patrol will be separate future work.

`AttackIndicator.js` draws the attack footprint using Mesh and UnlitMaterial.
`ToonRoomHUD.js` draws life, result and help using ScreenUI/Draw. Neither owns
damage calculations. The level resolves player updates before sentry updates;
when both attacks would hit on the same step, an interrupting player hit wins.

## 3. Tune without editing the states

Edit `src/data/Encounter.js`:

```js
playerAttack: {
    windup: 0.15,
    active: 0.12,
    recovery: 0.28,
    reach: 1.7,
    halfWidth: 0.65,
}
```

Timings are seconds; reach and width are world units. Try increasing player
windup to 0.3, reload, and notice the longer yellow preparation. The existing
fixed loop quantizes boundaries to simulation steps. Damage is currently one
health point per successful attack. Actors use a 0.55-radius sphere; overlap
tests expand the footprint by that radius and reject large vertical separation.

This is one small-room melee implementation, not a general combat addon yet.
There is no line-of-sight raycast or arbitrary-mesh hitbox system. Keep this
encounter in the open center aisle; later world design must address attacks
through thin obstacles and generalize collider sizes before reuse.

## 4. Publish and check the same behavior

```sh
node cli/index.cjs build --root examples/DemoToonABS
node cli/index.cjs serve --root examples/DemoToonABS/dist
```

The distribution selects core, 2d, 3d and the state-machine addon. No parallax,
platformer, networking or compatibility package is needed. Test H, Space, dodge,
continued exploration after a kill, defeat and R in the published game as well as the source checkout.

Browser regressions exercise input, no windup damage, a single hit per swing,
directional misses, locked telegraphs, immunity, knockback, outcome and reset.
This checkpoint does not complete the adventure or its Zero to Hero course.

[Checkpoint 4](toon-forest-checkpoint.md) extends the current demo to five guards
and three connected areas. Killing a guard no longer ends the encounter or freezes
physics. The original one-sentry exercise above still works at the courtyard entrance.
