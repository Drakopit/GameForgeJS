/**
 * @doc Class GameObjects
 * @namespace Root
 * @class GameObjects
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the GameForgeJS framework.
 * @Date 15/05/2019
 * @example
 *  Is used to inheritance. Normaly to dynamic game objects 
 * @returns void
 */

import { Sprite } from "../Graphics/Sprite.js";
import { Vector2D } from "../../core/Math/Vector2D.js";
import { Collide2D } from "../Collision/Collide2D.js";
import { Base } from "../../core/Base.js";
import { Util } from "../../core/Utils.js";
import { DEBUG } from "../../core/Engine.js";

/**
 * Base movable 2D entity with sprite, collision and component support.
 *
 * Extend it for game-specific players, enemies and interactive objects.
 */
export class GameObject extends Base {
    constructor() {
        super();
        this.id = Util.NewUUIDv4();
        this.hspeed = 64;
        this.vspeed = 64;
        this.solid = true;
        this.position = new Vector2D(0, 0);
        this.previousPosition = this.position;
        this.startPosition = this.position;
        this.size = new Vector2D(0, 0);
        this.direction = 90;
        this.friction = 0.5;
        this.gravity = 9.80665; // Força da gravidade
        this.gravityDirection = 180;
        this.deth = null;
        this.danping = 0.5;
        this.mass = null;

        this.sprite = new Sprite();
        this.components = [];
        this._started = false;
        this._destroyed = false;

        this.Tag = "Entity";
        this.name = "Drako";
    }

    AddComponent(component) {
        if (!component) return null;
        if (this.components.includes(component)) return component;
        if (component.owner && component.owner !== this) throw new Error("A component already belongs to another entity.");

        component.Attach?.(this);
        component.owner ??= this;
        this.components.push(component);
        if (this._started && component.enabled !== false) component.OnStart?.(this.context);
        return component;
    }

    GetComponent(typeOrName) {
        return this.components.find(component => {
            if (typeof typeOrName === "string") return component.constructor.name === typeOrName;
            return component instanceof typeOrName;
        }) ?? null;
    }

    RemoveComponent(typeOrInstance) {
        const index = this.components.findIndex(component => (
            component === typeOrInstance
            || (typeof typeOrInstance === "string" && component.constructor.name === typeOrInstance)
            || (typeof typeOrInstance === "function" && component instanceof typeOrInstance)
        ));

        if (index < 0) return null;

        const [component] = this.components.splice(index, 1);
        try { component.OnDestroy?.(); }
        finally { component.Detach?.(); }
        return component;
    }

    OnStart() {
        if (this._started) return;
        this._started = true;
        this._destroyed = false;
        super.OnStart(); // Call standardized Base lifecycle
        this.components.forEach(c => { if (c.enabled !== false) c.OnStart?.(this.context); });
    }

    OnUpdate(deltaTime) {
        this.isMoving ? this.sprite.Update(deltaTime) : this.sprite.Reset();
        this.components.forEach(c => { if (c.enabled !== false) c.OnUpdate?.(deltaTime); });
    }

    OnFixedUpdate(deltaTime) {
        this.components.forEach(c => { if (c.enabled !== false) c.OnFixedUpdate?.(deltaTime); });
    }

    OnDrawn() {
        this.components.forEach(c => { if (c.enabled !== false) c.OnDrawn?.(); });
    }

    OnDestroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        const errors = [];
        for (const component of [...this.components]) {
            try { this.RemoveComponent(component); } catch (error) { errors.push(error); }
        }
        this._started = false;
        if (errors.length) throw new AggregateError(errors, "Entity component cleanup failed.");
    }

    OnCollision(other, callback) {
        if (other instanceof GameObject && Collide2D.isCollidingAABB(this, other)) {
            return () => callback;
        }
    };

    _debugRect(x, y, width, height, color = "#00FF00") {
        if (DEBUG()) {
            this.draw.Style = this.draw.TYPES.STROKED;
            this.draw.Color = color;
            this.draw.DrawRect(x, y, width, height);
            this.draw.Color = "#FFFFFF";
            this.draw.Style = this.draw.TYPES.FILLED;
        }
    }
}
