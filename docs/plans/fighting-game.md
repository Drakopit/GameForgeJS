# Toward a responsive fighting game

This is a design note, not a claim that a Street Fighter/Mortal Kombat-scale game
has been built. Keep it a game/addon project using native GameForgeJS components;
do not put character-specific combat rules in Engine, Input or GamePad.

## Current evidence

Fighting Arena already has two-player input, buffered attack edges, startup/active/
recovery timings, guard/hurt states, body push, confirmed melee chains, projectiles,
meter supers, reactive CPU and a short arcade opponent sequence. Its current
timings are in seconds and its command vocabulary is mostly single-button actions.
It is not yet a deterministic, frame-data-driven competitive fighter.

The input polish accompanying this note adds sparse/stable controller seats,
physical button tokens, mouse/touch menu navigation, native P1 touch controls,
responsive arena presentation and a modal sprite-based guide. The configuration
is the single binding source; selecting PlayStation artwork does not remap inputs.

## Ownership and required contracts

| Piece | Contract |
| --- | --- |
| FightClock component | One integer combat tick per native fixed update, normally 60 Hz. Render interpolation uses the engine's draw phase; no second RAF/timer. Record input before simulation. |
| CommandHistory component | Bounded ring of directions, facing, press/release edges and held durations per player/input tick. Resolve opposing directions by an authored SOCD policy. Never turn a held button into repeated press edges. |
| MotionRecognizer | Data describes 236+P, 623+P, charge-back→forward+P, double taps and longer directional sequences. Match longest/highest-priority commands first; configure diagonal tolerance, total duration, per-step gap, button window and optional negative edge. Consume each accepted command once. |
| FighterState component | Explicit idle/walk/jump/guard/attack/hitstun/blockstun/knockdown/KO/finisher states. Definitions contain integer startup/active/recovery frames and allowed transitions. Animation presents state, never decides collision timing. |
| CombatBoxes component | Authored per-frame local hitboxes, hurtboxes, pushboxes and throw regions, mirrored by facing. Native vector/rectangle math performs overlap. Keep attack invulnerability and ordinary hurt cooldown distinct. |
| CombatResolver system | Gather contacts before applying results so simultaneous hits can trade. Define clash, priority, counter-hit, blocking, throws and one-hit-per-target policy explicitly. Constrain pushboxes against the arena. |
| Hitstop component | Freeze combat simulation/animation/movement for an integer duration while input history continues sampling. Keep input ticks and frozen simulation ticks separate; document which clock each buffer expires against. Camera/UI/audio may continue. |
| CancelRules data | Frame range, required hit/block/whiff result, allowed next moves, grounded/air state and meter cost. Validate and debit resources atomically only when the transition succeeds. |
| Combo/Juggle state | Combo scaling with a configurable floor, starter proration, gravity/knockback decay, juggle budget, air resets, knockdowns and tech windows. Reset on authored neutral/recovery boundaries, not an arbitrary render timeout. |
| Move/projectile entities | Specials/supers use native pooling, velocity, lifetime and collision components. Definitions own spawn frames, meter costs and per-character limits; the renderer remains replaceable. |
| Finisher director | An explicit post-KO finish window accepts an authored command, reserves actors/input, plays original staged animation/camera/audio, then resolves exactly once into match results. Native Timeline may present it; authoritative combat state owns eligibility, cancellation and the result. |
| Tower progression | Expand today's short arcade sequence into data-authored opponent/arena/modifier entries, difficulty, rewards, retry/continue rules, unlocks and final encounter. A game-owned progression service persists results across ordinary levels. |

Example command data for a future recognizer, not a currently supported API:

```json
{
  "id": "ember_wave",
  "motion": [2, 3, 6],
  "button": "LIGHT",
  "maxInputTicks": 18,
  "maxStepGap": 8,
  "buttonWindow": 4,
  "priority": 20,
  "move": "ember_wave_light"
}
```

A direction convention and facing policy must be documented with this data.
Charge moves additionally track minimum held ticks and a release window. Keep
motion leniency configurable so an experienced developer can author strict or
accessible controls without replacing the input system.

## Safe implementation slices

1. **Reproducible combat clock and recorder.** Move gameplay from render-delta
   timing to fixed ticks; replay the same input log at 30/60/144 rendering FPS and
   require identical state hashes. Keep the current playable demo as the baseline.
2. **Motion commands and frame-data inspector.** Introduce bounded history,
   directional recognition and visible input/box/frame history. Test facing
   changes, overlapping commands, charge release, hitstop buffering and pad loss.
3. **Combat rules.** Add per-frame boxes, hitstop, cancel conditions, scaling and
   juggle budgets incrementally with deterministic contact fixtures and trade tests.
4. **Tower and presentation.** Author progression, save/reload, training controls,
   round feedback and finishers after the core contracts stabilize. Test new game
   through ending, loss/retry, skipping presentation and interrupted transitions.

Rollback/network play is a later requirement, not implied by today's online
sandbox. It needs serializable snapshots of all combat state, deterministic
randomness, resimulation and confirmed/predicted event IDs so sounds/FX do not
replay twice. Canvas, GPU resources, audio nodes and input devices do not belong
in snapshots. Do not add a general networking dependency to the native core.
