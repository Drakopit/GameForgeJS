/**
 * @doc Class ObjectPool
 * @namespace Root
 * @class ObjectPool
 * @summary Reuses inactive objects, such as projectiles and particles, to reduce allocations.
 * @template {{active?: boolean, position?: {SetValue(x: number, y: number): unknown}}} T
 */
export class ObjectPool<T extends {
    active?: boolean;
    position?: {
        SetValue(x: number, y: number): unknown;
    };
}> {
    /** @param {() => T} createFunc @param {number} [initialSize] @param {{maxSize?: number}} [options] */
    constructor(createFunc: () => T, initialSize?: number, { maxSize }?: {
        maxSize?: number;
    });
    /** @type {T[]} */
    pool: T[];
    createFunc: () => T;
    maxSize: number;
    /**
     * @description Returns an available object, creating one if necessary; returns null at a configured capacity.
     * @returns {T | null}
     */
    Get(): T | null;
    /**
     * @description Marks an object as available for reuse.
     */
    /** @param {T} obj */
    Release(obj: T): void;
}
