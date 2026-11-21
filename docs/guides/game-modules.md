# Class-based game modules

A game module groups a feature's classes and dependencies. This design takes the
imports/declarations/exports organization of [NgModules](https://angular.dev/guide/ngmodules/overview)
as a reference, using ordinary JavaScript classes and GameForgeJS lifecycle hooks.

Keep three responsibilities distinct:

| Mechanism | Responsibility |
| --- | --- |
| JavaScript import/export | Load code and expose JavaScript symbols |
| Module classes | Compose game features and validate their declared public surface |
| config/gameforgejs.package.json | Select framework groups/addons for distribution |

A game module does not replace Level, Level3D, Screen, GameObject or Component.
It does not create another canvas, renderer or update loop.

## Declare a feature

```js
import { Module } from 'gameforgejs/core';
import { Combatant } from '../entities/Combatant.js';
import { ArenaLevel } from '../levels/ArenaLevel.js';

export class CombatModule extends Module {
    constructor() {
        super('combat', {
            imports: [],
            declarations: [Combatant, ArenaLevel],
            exports: [ArenaLevel],
        });
    }
}
```

Declarations are class references, not entity instances. The graph validates their
ownership but never constructs them. Levels still instantiate scene objects with
the arguments they need and register them through AddEntity.

Exports describe the feature's public contract. A module may export its declarations
or a class explicitly exported by one of its direct imports. It cannot re-export
another module's private class. This validation is not a JavaScript sandbox: direct
ES module imports still follow JavaScript semantics.

## Compose a game

```js
import { BootstrapGame, Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { CombatModule } from './CombatModule.js';
import { ArenaLevel } from '../levels/ArenaLevel.js';

export class AppModule extends Module {
    constructor() {
        super('app', {
            imports: [module2D(), module3D(), CombatModule],
            declarations: [],
            exports: [ArenaLevel],
        });
    }
}

BootstrapGame({
    modules: [AppModule],
    levels: [new ArenaLevel()],
});
```

Imported module classes are instantiated once per resolved graph. Shared class
imports in a diamond use the same module instance. A new game gets a fresh graph;
do not share a live module instance between running games. Explicit duplicate IDs,
missing dependencies, cycles, duplicate declaration ownership and invalid exports
fail before setup runs. Old factory modules remain valid imports; legacy requires
lists continue to work. Put official rendering/input service imports at the root,
then import feature classes below it, so service factories are not repeated.

There is no decorator compiler, automatic scene construction, hierarchical injector,
lazy module loader or automatic tree-shaking of game declarations. Services remain
explicit constructor arguments or entries in context.services. Use OnSetup to
register a service when one is needed; declaring a feature needs no service hooks.

## Lifecycle

| Hook | Timing |
| --- | --- |
| OnSetup(context) | Before resource loading; register services or asset loaders |
| OnStart(context) | After resource loading and before the first level starts |
| OnUpdate(dt) | Existing engine update, in seconds |
| OnFixedUpdate(dt) | Existing engine fixed step |
| OnDrawn() / OnGUI() | Existing rendering and UI phases |
| OnDestroy() | Teardown in reverse module dependency order |

Frame hooks honor enabled. Setup/start failures clean partially attached modules
and remove their subscriptions. The same contract works with BootstrapGame and
isolated Game sessions. Dispose owns subscription removal; user hooks release only
resources they create. No module should schedule its own RAF to receive updates.

## Generate and migrate

```sh
node cli/index.cjs generate module CombatModule --root path/to/game
```

The generated src/modules/CombatModule.js is a class with metadata and lifecycle
hooks. Add it to the imports of your authored AppModule. Newly created templates
include src/modules/AppModule.js; the separate generated src/modules.js registry
contains only official service factories and remains managed by gameforge add.
Existing projects keep working and are not silently rewritten by update.

An old generated `function Feature() { return { id, setup() {} }; }` can be migrated
incrementally: turn it into `class Feature extends Module`, move service preparation
to OnSetup, runtime work to OnUpdate/OnFixedUpdate and cleanup to OnDestroy. Existing
factories still run, including their update listeners on the corrected BootstrapGame
loop. The manifest still needs every framework group/addon used by the imported code;
a Module declaration is not a package declaration.

ToonAdventureModule and SkyTrailModule are executable examples. Tests cover graph
composition, startup order, both engine loops, cleanup and generated project builds.
