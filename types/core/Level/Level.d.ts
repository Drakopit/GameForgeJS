/**
 * Base scene lifecycle container updated and drawn by the engine.
 *
 * Extend this class to own a game's entities and canvas screens.
 */
export class Level extends Base {
    screen: any;
    caption: string;
    TelaId: any;
    FPS: number;
    LEVEL_HANDLER: this;
    entities: any[];
    _started: boolean;
    _destroyed: boolean;
    _exited: boolean;
    _startedEntities: WeakSet<object>;
    _destroyedEntities: WeakSet<object>;
    context: any;
    /**
     * @doc Method
     * @description Called when the level starts.
     * @example
     *  level.OnStart();
     * @returns {void}
     */
    OnStart(context?: any): void;
    /**
     * @doc Method
     * @description Called every frame to update the game state.
     * @example
     *  level.OnUpdate();
     * @returns {void}
     */
    OnUpdate(deltaTime: any): void;
    /**
     * @doc Method
     * @description Get an entity by its name.
     * @param {string} name
     * @example
     * level.GetEntityByName("Player");
     * @returns {Object} The entity with the specified name.
     */
    GetEntityByName(name: string): any;
    /**
     * @doc Method
     * @description Adds an entity to the level.
     * @param {Object} entity - The entity to add.
     * @example
     *  level.AddEntity(entity);
     * @returns {void}
     */
    AddEntity(entity: any): void;
    StartEntity(entity: any): void;
    DestroyEntity(entity: any): void;
    /**
     * @doc Method
     * @description Removes an entity from the level.
     * @param {Object} entity - The entity to remove.
     * @example
     *  level.RemoveEntity(entity);
     * @returns {void}
     */
    RemoveEntity(entity: any): void;
    OnExit(): void;
    ShowFPS(draw: any, x: any, y: any): void;
}
import { Base } from "../Base.js";
