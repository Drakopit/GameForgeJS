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
}