/** Resolves logical actions through real bindings, then maps physical inputs to art. */
export class InputPromptRegistry {
    constructor(data?: {}, actions?: typeof ActionManager);
    actions: typeof ActionManager;
    profiles: {
        [k: string]: any;
    };
    fallback: any;
    ForAction(action: any, profile: any, explicitRules?: any): any;
    Resolve(rule: any, profile: any): any;
    /** Legacy adapters may reference their real configuration paths without duplicating bindings. */
    FromPaths(sources: any, profile: any, config?: any): any;
}
import { ActionManager } from '../../core/Input/ActionManager.js';
