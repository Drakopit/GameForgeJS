# Advanced stage manifests

The Advanced example composes each level from small JSON documents. Its
`assets/Manifests/advanced.level.json` file is an index; it references resource
names registered in the game's `resources.json`.

## Document ownership

| Document | Owns |
| --- | --- |
| `advanced/stage-default.json` | Shared screen, collision, background, and audio defaults. |
| `advanced/core.json` | World settings and win conditions for the first level. |
| `advanced/stage.json` | Parallax, materials, platforms, and objects. |
| `advanced/player.json` | Spawn, movement, stats, combat, and combos. |
| `advanced/enemies.json` | Enemy defaults and spawn definitions. |
| `advanced/effects.json` | Floating text and visual effects. |
| `advanced/ui.json` | HUD and status window. |

The second and boss levels use `advanced.second.level.json` and
`advanced.boss.level.json`, with their own `second-*` and `boss-*` documents.

An index composes registered resource names in order:

```json
{
  "id": "advanced_snow_demo",
  "compose": [
    "advanced_stage_default",
    "advanced_core",
    "advanced_stage",
    "advanced_player",
    "advanced_enemies",
    "advanced_effects",
    "advanced_ui"
  ]
}
```

This convention is implemented by the Advanced game. A JSON document does not
automatically become an engine feature: a game's loader must interpret it.

## Campaign and progression

The campaign runs from `AdvancedDemoMenu` to `AdvancedDemoPhaseSelector`
and then the selected level. Progress is stored in `localStorage`; completing
the first level unlocks the second, and completing the second unlocks the boss.

`AdvancedDemoGameOver` handles defeat and falling outside the level.
`AdvancedDemoCongratulations` handles completing the boss. Both return to
the menu on confirmation.

Optional player systems are configured through:

- `player.inventory`: starting slots, items, effects, and enemy rewards.
- `player.skillTree`: starting points, nodes, costs, requirements, and effects.
- `ui.progressHud`: inventory/skill panels and summary placement.

Bindings belong to the game's config: `INVENTORY` opens the inventory and
`SKILL_TREE` opens the skill tree. Gameplay entities pause while a panel is open.

## Camera shake

`advanced/effects.json` declares `cameraShake.light`,
`cameraShake.strong`, and `cameraShake.playerDamage`.
The reusable 2D camera exposes `camera.Shake(duration, intensity, frequency)`.

## Asset catalogs

The Snow Pack image resources include `snow_sky`, `snow_mountain_01`,
`snow_mountain_02`, `snow_tileset`, `snow_vegetation`, `snow_objects`,
and `snow_standards`.

The `assets/Manifests/snow.pack.json` catalog composes the following files:

- `snow/backgrounds.json`
- `snow/terrain.json`
- `snow/vegetation.json`
- `snow/objects.json`
- `snow/standards.json`

These catalogs name atlas regions. A platform can use
`terrain: "snow_ground"`; a static object can use `spriteRef: "pine_large"`;
an animated object can use `animationRef: "blue_flag"`.

## Parallax

Declare background layers in `parallax.layers`:

```json
{
  "id": "mountain_near",
  "sprite": "snow_mountain_01",
  "x": 0,
  "y": 165,
  "width": 638,
  "height": 176,
  "scrollRatioX": 0.18,
  "scrollRatioY": 0.04,
  "repeatX": true
}
```

A smaller `scrollRatioX` makes a layer appear farther away.

## Platforms

Platforms can refer to a named terrain set:

```json
{
  "id": "ground_left",
  "x": 0,
  "y": 500,
  "width": 600,
  "height": 100,
  "solid": true,
  "visible": true,
  "material": "ground",
  "terrain": "snow_ground"
}
```

The terrain set selects corners, top edges, side edges, and fill regions.
For a single repeated tile, use `tile` with `renderMode: "tile"`.
Direct `sprite`, `pos_x`, `pos_y`, `tileWidth`, and `tileHeight`
values are available when a region has not been entered in the catalog.

## Objects

Decorative and interactive instances belong to `objects`:

```json
{
  "id": "blue_flag_01",
  "animationRef": "blue_flag",
  "x": 1835,
  "y": 436,
  "width": 44,
  "height": 64,
  "visible": true,
  "solid": false,
  "zIndex": 35
}
```

A solid object also joins the level's collision list.
