import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { HighlandLevel } from '../levels/HighlandLevel.js';
import { TacticalPawn } from '../entities/TacticalPawn.js';
import { HighlandEnvironment } from '../entities/HighlandEnvironment.js';
import { UnitStats } from '../components/UnitStats.js';
import { UnitTravel } from '../components/UnitTravel.js';
import { UnitVisual } from '../components/UnitVisual.js';
import { TurnSystem } from '../components/TurnSystem.js';
import { TerrainView } from '../rendering/TerrainView.js';
import { TacticalHUD } from '../ui/TacticalHUD.js';
import { TacticalControls } from '../input/TacticalControls.js';
export class HighlandModule extends Module {
    constructor() { super('highland-tactics-3d', { imports: [module2D({ telemetry: true }), module3D()], declarations: [HighlandLevel, TacticalPawn, HighlandEnvironment, UnitStats, UnitTravel, UnitVisual, TurnSystem, TerrainView, TacticalHUD, TacticalControls], exports: [HighlandLevel] }); }
}
