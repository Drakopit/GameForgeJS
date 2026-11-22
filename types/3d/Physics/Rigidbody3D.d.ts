/**
 * Small dynamic-body state component integrated by `PhysicsWorld3D`.
 *
 * @param {Object} [options] - Body settings.
 * @param {number} [options.mass=1] - Body mass used for forces.
 * @param {number[]} [options.velocity] - Initial velocity.
 * @param {boolean} [options.useGravity=true] - Whether gravity affects this body.
 * @param {boolean} [options.isKinematic=false] - Whether game code controls motion.
 * @param {number} [options.damping=0.96] - Horizontal velocity retention.
 */
export class Rigidbody3D {
    constructor({ mass, velocity, acceleration, useGravity, isKinematic, damping, bounciness, }?: {
        mass?: number;
        velocity?: number[];
        acceleration?: number[];
        useGravity?: boolean;
        isKinematic?: boolean;
        damping?: number;
        bounciness?: number;
    });
    mass: number;
    velocity: number[];
    acceleration: number[];
    useGravity: boolean;
    isKinematic: boolean;
    damping: number;
    bounciness: number;
    grounded: boolean;
    groundBody: any;
    /**
     * Accumulates a force until the next integration step.
     * @param {number[]} force - XYZ force.
     * @returns {void}
     */
    AddForce(force: number[]): void;
    /**
     * Advances velocity and position for one simulation step.
     * @param {Transform3D} transform - Mutated object transform.
     * @param {number} dt - Delta time in seconds.
     * @param {number[]} gravity - World gravity vector.
     * @returns {void}
     */
    Integrate(transform: Transform3D, dt: number, gravity: number[]): void;
}
