import { GameObject } from 'gameforgejs/2d';
import { UnitStats } from '../components/UnitStats.js';
import { UnitTravel } from '../components/UnitTravel.js';
import { UnitVisual } from '../components/UnitVisual.js';
export class TacticalPawn extends GameObject {
    constructor(grid, scene, definition) {
        super();
        this.stats = this.AddComponent(new UnitStats(definition));
        this.travel = this.AddComponent(new UnitTravel(grid));
        this.visual = this.AddComponent(new UnitVisual(scene, definition.color));
    }
}
