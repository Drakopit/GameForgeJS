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
        if (Obj0.x + Obj0.width < Obj1.x &&
            Obj1.x + Obj1.width < Obj0.x &&
            Obj0.y + Obj0.height < Obj1.y &&
            Obj1.y + Obj1.height < Obj0.y) {
            return false;
        }
        return true;
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
}