/**
 * @doc Class GameObjects
 * @namespace Root
 * @class GameObjects
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  Is used to inheritance. Normaly to dynamic game objects 
 * @returns void
 */

import { Sprite } from "../Graphic/Sprite.js";
import { Vector2D } from "../Math/Vector2D.js";
import { Base } from "./Base.js";
import { Util } from "./Utils.js";

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
        this.deth;
        this.danping = 0.5;
        this.mass;
        
        this.sprite = new Sprite();

        this.Tag = "Entity";
        this.name = "Drako";

        // Current Level
        this.CurrentLevel = undefined;
    }

    OnCollision(other, callback) {
        if (other instanceof GameObject && Collide2D.isCollidingAABB(this, other)) {
            return () => callback;
        }
    };
}