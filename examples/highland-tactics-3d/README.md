# Highland Tactics 3D

An original PS1-style tactical diorama, rendered as true 3D meshes through native
GameForgeJS WebGL. No FFT assets, external renderer, UI framework or runtime library.

Run npm start from the repository root and open /examples/highland-tactics-3d/.
The project also builds independently with the normal CLI.

## Play

CT rises according to speed. On an allied turn, select Move, Act / Strike,
Act / Spark, or Wait / Face. Movement and an action may each be spent once, in
either order. Wait opens four cardinal directions; confirm to end the turn.
Doing less spends less CT, so a waiting unit can act sooner.

Use arrows/WASD or the gamepad D-pad/left stick to select commands/tiles.
Enter/Space or gamepad south confirms; Escape or gamepad east cancels.
Q/E or shoulders rotate the parallel-projection camera. H/Start opens a side
drawer. R retries without creating another canvas. T toggles native rain.
Touch/mouse select tiles directly and use native Canvas buttons for commands,
facing, confirmation, camera, weather and retry. Help pauses the turn simulation.

Blue tiles are reachable paths; orange tiles are attack range; bright amber tiles
contain valid targets. The selected tile shows H in the footer. Range is measured
in grid steps; movement permits climb 1, descent 2 and a one-gap leap up to height 2.
Occupied tiles block routes. Strike reaches one adjacent tile with height delta
at most 1. Spark reaches 3 with height delta at most 3 and consumes one SP.
Terrain blocks eye-height line of sight. Spark exposes armor for two unit turns.

Front/side/back previews use the defender's facing: 85/95/100 percent base hit
chance, with side/back damage multipliers 1.15/1.35. Height changes chance and
damage; previews and resolution share BattleRules. Seeded rolls are reproducible.
The opposing patrol moves, attacks and faces the nearest surviving opponent.
Defeat every enemy for Victory; losing the allied party produces Defeat.

## Read the composition

- scenes/battlefield.gfscene.json: tiles (height from scale Y), units, camera and lights; read by src/data/BattleScene.js.
- HeightGrid in the native 3D API: reusable paths, climbs, gaps and terrain rays.
- UnitStats, UnitTravel, UnitVisual: separate ECS values, motion and meshes.
- TurnSystem: CT, action budgets, AI and finite phases; no drawing or input.
- TacticalControls: keyboard/gamepad/touch command routing.
- TerrainView: native terrain meshes, range planes and projected tile picking.
- TacticalHUD: stats, CT order, preview, commands and optional controls drawer.
- HighlandEnvironment: native SurfaceMaterial, rain batch and wetness components.
- HighlandLevel and HighlandModule: lifecycle composition and service ownership.

This is a complete short skirmish, not a recreation of FFT's full job/campaign
systems. No job tree, inventory, cover objects, multiplayer or save campaign is
implied. Reflections use the documented analytic sky/ground approximation.
