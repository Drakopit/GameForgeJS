# Addons that use the framework

The first pilots are `ParallaxLayer2D`, `State` and `StateMachine`. DemoAdvanced
and the independent [Addon playground](../../examples/DemoAddons/index.html)
use the same implementations under `src/addons`. No runtime registration is
required. They do not create a loop, canvas or input/audio service.

The playground separates `PatrolActor` in `src/entities/` from `PatrolState` and
`RestState` in `src/states/`, with one class per file. The actor creates its states
and owns the state machine; each state implements its behavior and transitions.

The next optional addon is [platformer movement](platformer.md), with a separate
playable lab using the same entity/component lifecycle.

## Parallax

```js
import { ParallaxLayer2D } from 'gameforgejs/addons/parallax';

// Inside a Level that already owns Screen and Camera instances:
this.background = new ParallaxLayer2D(this.screen, {
  sprite: 'mountains',
  scrollRatioX: 0.25,
  repeatX: true,
}, { assets: this.context.assets });
```

Call `OnUpdate(dt)` from the level update and `OnDrawn(camera)` before drawing
foreground entities. Without a camera, `speedX`/`speedY` provide automatic scrolling.
Supply `{ image }` to use an already loaded image instead of an asset service.
The default service is the existing bootstrap `AssetManager.instance`.

`Dispose()` releases the layer's references. It does not destroy the borrowed
image, screen or asset service. Width, height and scale must be positive;
invalid dimensions fail instead of entering an endless tiling loop. Canvas
context state is restored even if drawing throws.

## State machine

```js
import { State, StateMachine } from 'gameforgejs/addons/state-machine';

class IdleState extends State {
  Enter() { this.owner.speed = 0; }
  Update(dt) { /* Decide when to change state. */ }
  Exit() { /* Release state-owned resources. */ }
}

this.machine = new StateMachine(this);
this.machine.ChangeState(new IdleState(this));
```

The entity drives `machine.Update(dt)` from its existing lifecycle and calls
`machine.Dispose()` when destroyed. State instances receive their owner in the
constructor. A locked current state rejects an ordinary transition; use
`ChangeState(next, { force: true })` for an explicit interruption.

`Clear()` exits the active state even when locked. Repeating cleanup is harmless.
Transitions call the previous `Exit` before the next `Enter`. Transition decisions
belong in `Update`, not in `Enter`/`Exit`: reentrant transitions are rejected.
If `Enter` throws, the partially entered state remains available for `Clear()`.
Disposal detaches the machine's owner; create a new machine for a new owner.

The demo's original import paths remain thin re-exports so existing game code
does not need a mass rewrite. The independent sample imports public addon names
directly and implements its own patrol/rest rules with `GameObject` and `Level`.

## Distribution and extension

Declare bundled addons in [the distribution manifest](../reference/distribution-packages.md).
Tests cover locked/forced transitions, owner isolation, cleanup and drawing errors.
The browser suite exercises source and published copies of both consuming demos.

An application-specific addon can simply export classes or `Component` subclasses
from the game's source folder. Depend on public framework APIs; document required
owner methods, configuration, and who releases resources. Do not extract gameplay
rules into the core just to make them shared.
