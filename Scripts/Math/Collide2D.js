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
class Collide2D extends Math {
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
    static isCollidingAABB(rect, otherRect) {
        var isCollision = false;
        if (otherRect.x <= rect.x + rect.width && otherRect.x + otherRect.width >= rect.x &&
            otherRect.y <= rect.y + rect.height && otherRect.y + otherRect.height >= rect.y) {
            isCollision = true;
        }
        return isCollision;
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
        var isCollision = false;
        // Teorema de Pitagoras
        if (Math.sqrt((obj.x - circle.x) ** 2 + (obj.y - circle.y) ** 2) < circle.r) {
            isCollision = true
        }
        return isCollision;
    }
}