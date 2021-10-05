/**
 * @doc Class Collide2D
 * @namespace Math
 * @class Collide2D
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var collide = new Collide2D();
 *  if (collide.isCollidingAABB(obj1, obj2)) {
 *      console.log("Collision");
 *  }
 * @returns {Object}
 */

export class Collide2D {
    constructor() {}

    /**
     * @doc Method
     * @param {obj1} rect 
     * @param {obj2} otherRect
     * @description Collision of type AABB, rectangular.
     * @example
     *  var collide = collide2D.isCollidingAABB(obj1, obj2);
     * @returns {boolean}
     */
    static isCollidingAABB(Obj0, Obj1) {
        if (Obj0.position.GetValue().x < Obj1.position.GetValue().x + Obj1.size.GetValue().x &&
            Obj0.position.GetValue().x + Obj0.size.GetValue().x > Obj1.position.GetValue().x &&
            Obj0.position.GetValue().y < Obj1.position.GetValue().y + Obj1.size.GetValue().y &&
            Obj0.position.GetValue().y + Obj0.size.GetValue().y > Obj1.position.GetValue().y) {
            return true;
        }
        return false;
    }

    /**
     * @doc Method
     * @param {obj1} circle 
     * @param {obj2} obj
     * @description Collision of type circular.
     * @example
     *  var collide = collide2D.isCollidingCircle(obj1, obj2);
     * @returns {boolean} 
     */
    static isCollidingCircle(circle, obj) {
        // Teorema de Pitagoras
        if (Math.sqrt((obj.x - circle.x) ** 2 + (obj.y - circle.y) ** 2) < circle.r) {
            return true
        }
        return false;
    }

    static isCollidingPoint(position, rect) {
        if (position.GetValue().x > rect.x && position.GetValue().x < rect.x + rect.width &&
            position.GetValue().y > rect.y && position.GetValue().y < rect.y + rect.height) {
            return true;
        }
        return false;
    }
}