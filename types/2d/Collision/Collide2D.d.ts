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
    /**
     * @doc Method
     * @param {Object} obj1 - The first rectangle object with position and size properties.
     * @param {Object} obj2 - The second rectangle object with position and size properties.
     * @description Checks for collision between two axis-aligned bounding boxes (AABB).
     * @example
     *  const collision = collide2D.isCollidingAABB(rect1, rect2);
     * @returns {boolean} - True if there is a collision, false otherwise.
     */
    static isCollidingAABB(obj1: any, obj2: any): boolean;
    /**
     * @doc Method
     * @param {Object} circle - The circle object with x, y, and radius (r) properties.
     * @param {Object} obj - The object to check collision with, should have x, y properties.
     * @description Checks for collision between a circle and an object.
     * @example
     *  const collision = collide2D.isCollidingCircle(circle, obj);
     * @returns {boolean} - True if there is a collision, false otherwise.
     */
    static isCollidingCircle(circle: any, obj: any): boolean;
    /**
     * @doc Method
     * @param {Object} position - The point position with x and y properties.
     * @param {Object} rect - The rectangle object with x, y, width, and height properties.
     * @description Checks if a point is inside a rectangle.
     * @example
     *  const isInside = collide2D.isCollidingPoint(point, rect);
     * @returns {boolean} - True if the point is inside the rectangle, false otherwise.
     */
    static isCollidingPoint(position: any, rect: any): boolean;
    static IntersectsRect(rectA: any, rectB: any): boolean;
    static ContainsPoint(point: any, rect: any): boolean;
    /**
     * @doc Method
     * @description Resolves overlap by moving obj1 outside obj2.
     * @param {GameObject} obj1 - Dynamic object, such as a player.
     * @param {GameObject} obj2 - Static object, such as a wall or floor.
     */
    static ResolveCollisionAABB(obj1: GameObject, obj2: GameObject): boolean;
}
