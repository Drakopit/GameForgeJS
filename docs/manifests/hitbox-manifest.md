# 2D hitbox manifests

Declare hitboxes, hurtboxes, and collision boxes in JSON, then register the
document in `resources.json`.

```json
{
  "version": 1,
  "origin": "entity-top-left",
  "collisionboxes": {
    "*": [{ "name": "body", "x": 0, "y": 0, "w": 44, "h": 63 }]
  },
  "hurtboxes": {
    "*": [{ "name": "torso", "x": 5, "y": 6, "w": 34, "h": 52 }]
  },
  "hitboxes": {
    "Attack_1": [
      {
        "name": "slash",
        "frames": [2, 3],
        "x": 32,
        "y": 18,
        "w": 52,
        "h": 28,
        "damage": 10,
        "hitStop": 0.06,
        "hitStun": 0.14,
        "stagger": false,
        "knockback": { "x": 430, "y": -350 },
        "oncePerTarget": true
      }
    ]
  }
}
```

Coordinates are local to the entity's `position`. When
`owner.facingRight` is false, boxes are mirrored using `owner.size.x`.
Set `"mirror": false` on an individual box to disable that behavior.

## Register and use a document

For a game served from its own folder:

```json
{
  "jsons": [
    { "name": "player_boxes", "path": "./assets/Manifests/player.boxes.json" }
  ]
}
```

After loading the registered resources:

```js
import { AssetManager } from "gameforgejs/core";
import { BoxController2D } from "gameforgejs/2d";

// Inside an entity's initialization:
this.boxes = new BoxController2D(
    this,
    AssetManager.instance.GetJson("player_boxes"),
);
this.boxes.DrawDebug(this.draw);
```

`CombatResolver2D` copies `damage`, `knockback`, `hitStop`,
`hitStun`, and `stagger` into its impact event. The Advanced example uses
that event to apply damage, create floating text, and call `Engine.HitStop()`.
Use `stagger: false` for early combo hits that should briefly stop an enemy
without pushing it away; a finisher can use `stagger: true`.

## Combos

Combo sequencing is separate from the box document. `ComboController`
defines animation order and the first frame that can chain into the next hit:

```js
import { ComboController } from "gameforgejs/2d";

this.combo = new ComboController(this, [
    { animation: "Attack_1", chainFromFrame: 3 },
    { animation: "Attack_2", chainFromFrame: 2 },
    { animation: "Attack_3", chainFromFrame: 3 },
]);
```
