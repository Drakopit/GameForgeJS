import { AdvancedDemoFirstLevel } from "./AdvancedDemoFirstLevel.js";

export class AdvancedDemoBossLevel extends AdvancedDemoFirstLevel {
    constructor() {
        super({
            caption: "GameForgeJS - Platform Adventure 2D: Boss",
            screenId: "AdvancedDemoBossLevel",
            manifestName: "advanced_boss_level",
            phaseId: "boss",
            unlocksPhaseId: null,
            returnToPhaseSelector: false,
            completionTarget: "congratulations",
        });
    }
}
