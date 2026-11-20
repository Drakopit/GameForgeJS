# Route Atlas 2D

A focused overworld example with eight stages, branching paths, animated node travel and a real miniature stage. Complete a three-shard trial to unlock outgoing routes; simply selecting a node does not clear it.

## Run and build

From the repository root:

```sh
npm ci
npm start
# Open /examples/route-atlas-2d/ on the printed server address.
node cli/index.cjs build --root examples/route-atlas-2d
npm run test:lessons
```

The built dist/ is portable under a hosting subpath. Only selected framework groups
are distributed. The browser uses native ES modules, zero third-party runtime
packages and no remote assets. Each class has its own file; configuration lives in config/.

## Controls

| Action | Keyboard / mouse | Gamepad | Touch |
| --- | --- | --- | --- |
| Navigate | WASD / arrows | Left stick / D-pad | Virtual stick / tap adjacent node |
| Enter stage | Space / Enter | A | ENTER / tap current node |
| Return to map | Escape | B | BACK |
| Reset / help | R / H | Select / R3 | RESET / HELP |

## Read the composition in this order

1. [RouteProgress](src/data/RouteProgress.js) owns node identity, edges, the current node and a Set of cleared stages. Availability derives from completed outgoing edges; it is not duplicated in UI flags.
2. [RouteNavigator](src/components/RouteNavigator.js) chooses adjacent available nodes using directional intent and interpolates travel. Selection/entry is blocked while travelling. Pointer input converts through the responsive map transform.
3. [AtlasLevel](src/levels/AtlasLevel.js) emits stage:entered. [StageTrial](src/components/StageTrial.js) subscribes on start and removes the subscription on destruction.
4. In the trial, move to three shards while avoiding moving sentries. The last collection emits stage:cleared; only that event updates progression.
5. [AtlasView](src/entities/AtlasView.js) draws available/locked/cleared routes and current position from that same model. [AtlasHUD](src/ui/AtlasHUD.js) exposes native controls.
6. Replace the trial with a normal LevelHandler transition in a larger game. Carry only a stage ID and a game-owned progression service across the transition; report completion through an event or result.

## Boundaries and lifecycle

Outgoing routes open after clearing their source stage; routes can then be traversed backwards. Either branch reaches Twin Gate. Progress is session-local and RESET is explicit; persistence/storage schema is intentionally outside this focused mechanic. Hazard contact returns the trial player to its start without discarding already collected shards.

StageTrial is a tiny playable room, not eight authored full levels. The map has eight distinct selectable nodes demonstrating the progression contract. All configuration is in config/scenario.json, all subscriptions/buttons/viewport bindings are released on exit.

The existing class-owned entity/component architecture is preserved. Every
component runs on the framework's lifecycle; no archetype ECS rewrite, alternate
renderer, hidden DOM gameplay UI or additional game loop is introduced.
