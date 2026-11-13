export function ValidateBody(body) {
    if (!['x', 'y', 'width', 'height', 'vx', 'vy'].every(key => Number.isFinite(body[key])) || body.width <= 0 || body.height <= 0) {
        throw new TypeError('Platformer body requires finite position/velocity and positive width/height (GameObject.size).');
    }
}
