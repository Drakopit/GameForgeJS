class Collide2D extends Math {
    constructor() {}

    static isCollidingAABB(rect, otherRect) {
        var isCollision = false;
        if (otherRect.x <= rect.x + rect.width && otherRect.x + otherRect.width >= rect.x &&
            otherRect.y <= rect.y + rect.height && otherRect.y + otherRect.height >= rect.y) {
            isCollision = true;
        }
        return isCollision;
    }
    static isCollidingCircle(circle, obj) {
        var isCollision = false;
        // Teorema de Pitagoras
        if (Math.sqrt((obj.x - circle.x) ** 2 + (obj.y - circle.y) ** 2) < circle.r) {
            isCollision = true
        }
        return isCollision;
    }
}