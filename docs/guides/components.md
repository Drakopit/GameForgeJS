# Components and entity behavior

A `GameObject` supports inheritance and reusable behavior components.
This is an object/component model; it is not a data-oriented ECS with an
independent entity database and query scheduler.

## Available components

| Component | Responsibility |
| --- | --- |
| `TransformComponent` | Position, rotation, and scale, synchronized with `owner.position`. |
| `VelocityComponent` | Velocity, gravity, friction, and speed limits. |
| `BoundsComponent` | AABB bounds for collisions, selection, and hit testing. |
| `HealthComponent` | HP, damage, healing, invulnerability, and damage/death callbacks. |
| `LifetimeComponent` | Expiration for effects, text, or projectiles. |
| `ActionInputComponent` | Reading actions from `ActionManager` for an entity. |

## Compose an entity

```js
import { GameObject } from "gameforgejs/2d";
import {
    ActionInputComponent,
    BoundsComponent,
    HealthComponent,
    TransformComponent,
} from "gameforgejs/core";

export class Player extends GameObject {
    constructor() {
        super();
        this.AddComponent(new TransformComponent({ x: 120, y: 220 }));
        this.AddComponent(new BoundsComponent({ width: 32, height: 48 }));
        this.AddComponent(new HealthComponent({
            hp: 100,
            invulnerability: 0.45,
        }));
        this.AddComponent(new ActionInputComponent({
            actions: {
                jump: "JUMP",
                attack: "ATTACK",
                left: "LEFT",
                right: "RIGHT",
            },
        }));
    }
}
```

This composes state and input access. It does not draw or move the player:
add a game-specific movement behavior and renderer, as the Adventure example
does. Configure the named actions in `game.config.json`.

## Preserve the lifecycle

`GameObject` forwards its lifecycle to enabled components.
When overriding a lifecycle method in a subclass, preserve that dispatch
unless you intentionally implement another component update policy:

```js
OnUpdate(dt) {
    super.OnUpdate(dt);
    // Additional entity-specific work.
}
```

Replacing `OnUpdate` without calling the base implementation prevents the
normal component update dispatch. Component order also matters: read input
before a behavior consumes it.

Use `GetComponent` to find a component and `RemoveComponent` to detach
one. A reusable component should release its listeners and other owned
resources when detached.

## Study the playable example

`examples/DemoAdventure2D/src/entities/AdventurePlayer.js` combines
transform, bounds, health, input, top-down movement, melee attack, and a
renderer. Its game-specific components live under the same example's
`src/components/`.

The Slime entity combines shared state components with wandering behavior and
a renderer. The camera uses a room-camera component for transitions.

Run the example from the showcase, or open
`/examples/DemoAdventure2D/index.html` on the repository development server.
Use this as an integration example; avoid moving the Adventure game's rules
into the engine merely because more than one entity uses them.

## Serialization boundary

The existing component model does not automatically deserialize arbitrary
component names from JSON. A game or editor that needs prefabs must provide an
explicit registry, supported schema, and loading behavior. A list of component
names in a document is not an implemented prefab system.
