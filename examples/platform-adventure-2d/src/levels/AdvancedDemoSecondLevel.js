import { AdvancedDemoFirstLevel } from "./AdvancedDemoFirstLevel.js";

export class AdvancedDemoSecondLevel extends AdvancedDemoFirstLevel {
    constructor() {
        super({
            caption: "GameForgeJS - Platform Adventure 2D: Fase 2",
            screenId: "AdvancedDemoSecondLevel",
            manifestName: "advanced_second_level",
            phaseId: "second",
            unlocksPhaseId: "boss",
        });
    }
}
