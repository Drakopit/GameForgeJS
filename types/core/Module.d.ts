export function startModules(modules: any): Promise<void>;
/**
 * Class-based feature composition with imports, declarations, exports and lifecycle. Levels, entities and
 * components remain the owners of scene/gameplay behavior; the package manifest
 * separately selects which framework source groups are distributed.
 * @param {string} id - Unique module identifier.
 * @param {Object} [options] - Dependency and enablement settings.
 * @param {Array} [options.imports=[]] - Imported module classes or instances.
 * @param {Function[]} [options.declarations=[]] - Classes owned by this module.
 * @param {Function[]} [options.exports=[]] - Public classes, declared here or exported by imports.
 * @param {string[]} [options.requires=[]] - Required module identifiers.
 * @param {boolean} [options.enabled=true] - Whether frame hooks run.
 */
export class Module extends Base {
    /**
     * @param {string} id
     * @param {{imports?: (Function | Module | {id: string, setup: Function})[], declarations?: Function[], exports?: Function[], requires?: string[], enabled?: boolean}} [options]
     */
    constructor(id: string, { imports, declarations, exports, requires, enabled }?: {
        imports?: (Function | Module | {
            id: string;
            setup: Function;
        })[];
        declarations?: Function[];
        exports?: Function[];
        requires?: string[];
        enabled?: boolean;
    });
    id: string;
    imports: (Function | Module | {
        id: string;
        setup: Function;
    })[];
    declarations: Function[];
    exports: Function[];
    requires: string[];
    enabled: boolean;
    context: any;
    started: boolean;
    /** Register services/loaders before the resource manifest is loaded. */
    OnSetup(): void;
    /** Internal adapter retained for the existing module dependency graph. */
    setup(context: any): Promise<void>;
    /** Starts once, after assets and before the first level starts. */
    Start(): Promise<void>;
}
import { Base } from './Base.js';
