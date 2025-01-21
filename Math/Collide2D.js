/**
 * @doc Class Collide2D
 * @namespace Math
 * @class Collide2D
 * @author Patrick Faustino Camello
 * @summary Provides methods for detecting collisions between 2D shapes.
 * @description Includes methods for axis-aligned bounding box (AABB) collisions, circular collisions, and point-in-rectangle checks.
 * @Date 15/05/2019
 * @example
 *  const collide = new Collide2D();
 *  if (collide.isCollidingAABB(obj1, obj2)) {
 *      console.log("Collision detected");
 *  }
 * @returns {Object}
 */

export class Collide2D {
    constructor() {}

    /**
     * @doc Method
     * @param {Object} obj1 - The first rectangle object with position and size properties.
     * @param {Object} obj2 - The second rectangle object with position and size properties.
     * @description Checks for collision between two axis-aligned bounding boxes (AABB).
     * @example
     *  const collision = collide2D.isCollidingAABB(rect1, rect2);
     * @returns {boolean} - True if there is a collision, false otherwise.
     */
    static isCollidingAABB(obj1, obj2) {
        const rect1 = {
            left: obj1.position.GetValue().x,
            right: obj1.position.GetValue().x + obj1.size.GetValue().x,
            top: obj1.position.GetValue().y,
            bottom: obj1.position.GetValue().y + obj1.size.GetValue().y
        };

        const rect2 = {
            left: obj2.position.GetValue().x,
            right: obj2.position.GetValue().x + obj2.size.GetValue().x,
            top: obj2.position.GetValue().y,
            bottom: obj2.position.GetValue().y + obj2.size.GetValue().y
        };

        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }

    /**
     * @doc Method
     * @param {Object} circle - The circle object with x, y, and radius (r) properties.
     * @param {Object} obj - The object to check collision with, should have x, y properties.
     * @description Checks for collision between a circle and an object.
     * @example
     *  const collision = collide2D.isCollidingCircle(circle, obj);
     * @returns {boolean} - True if there is a collision, false otherwise.
     */
    static isCollidingCircle(circle, obj) {
        const dx = obj.x - circle.x;
        const dy = obj.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < circle.r;
    }

    /**
     * @doc Method
     * @param {Object} position - The point position with x and y properties.
     * @param {Object} rect - The rectangle object with x, y, width, and height properties.
     * @description Checks if a point is inside a rectangle.
     * @example
     *  const isInside = collide2D.isCollidingPoint(point, rect);
     * @returns {boolean} - True if the point is inside the rectangle, false otherwise.
     */
    static isCollidingPoint(position, rect) {
        return position.GetValue().x > rect.x &&
               position.GetValue().x < rect.x + rect.width &&
               position.GetValue().y > rect.y &&
               position.GetValue().y < rect.y + rect.height;
    }
}
