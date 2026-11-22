/**
 * Base movable 2D entity with sprite, collision and component support.
 *
 * Extend it for game-specific players, enemies and interactive objects.
 */
export class GameObject extends Base {
    id: any;
    hspeed: number;
    vspeed: number;
    solid: boolean;
    position: Vector2D;
    previousPosition: Vector2D;
    startPosition: Vector2D;
    size: Vector2D;
    direction: number;
    friction: number;
    gravity: number;
    gravityDirection: number;
    deth: any;
    danping: number;
    mass: any;
    sprite: Sprite;
    components: any[];
    _started: boolean;
    _destroyed: boolean;
    Tag: string;
    name: string;
    AddComponent(component: any): any;
    GetComponent(typeOrName: any): any;
    RemoveComponent(typeOrInstance: any): any;
    OnUpdate(deltaTime: any): void;
    OnFixedUpdate(deltaTime: any): void;
    OnCollision(other: any, callback: any): () => any;
    _debugRect(x: any, y: any, width: any, height: any, color?: string): void;
}
import { Base } from "../../core/Base.js";
import { Vector2D } from "../../core/Math/Vector2D.js";
import { Sprite } from "../Graphics/Sprite.js";
