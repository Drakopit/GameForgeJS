/**
 * Lightweight 3D physics world for gravity and sphere-versus-platform collision.
 *
 * It is intended for approachable demos rather than a full general-purpose
 * physics solver.
 *
 * @param {Object} [options] - Simulation settings.
 * @param {number[]} [options.gravity] - World gravity vector.
 * @param {Object|null} [options.bounds=null] - Optional horizontal movement bounds.
 */
export class PhysicsWorld3D {
    constructor({ gravity, bounds }?: {
        gravity?: number[];
        bounds?: any;
    });
    gravity: number[];
    bounds: any;
    bodies: any[];
    /**
     * Registers a game object and its optional motion and collision components.
     * @param {Object} definition - Body definition.
     * @returns {Object} Stored body record.
     */
    AddBody({ object, rigidbody, collider, tag, enabled }: any): any;
    RemoveBody(body: any): void;
    /**
     * Advances enabled bodies and resolves supported solid collisions.
     * @param {number} dt - Delta time in seconds.
     * @returns {void}
     */
    Step(dt: number): void;
    #private;
}
