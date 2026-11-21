/**
 * @doc Class ObjectPool
 * @namespace Root
 * @class ObjectPool
 * @summary Reuses inactive objects, such as projectiles and particles, to reduce allocations.
 * @template {{active?: boolean, position?: {SetValue(x: number, y: number): unknown}}} T
 */
export class ObjectPool {
    /** @param {() => T} createFunc @param {number} [initialSize] @param {{maxSize?: number}} [options] */
    constructor(createFunc, initialSize = 20, { maxSize = Infinity } = {}) {
        if (!Number.isInteger(initialSize) || initialSize < 0 || !(maxSize >= initialSize)
            || (maxSize !== Infinity && (!Number.isInteger(maxSize) || maxSize < 1))) {
            throw new RangeError('Invalid object pool capacity.');
        }
        /** @type {T[]} */
        this.pool = [];
        this.createFunc = createFunc;
        this.maxSize = maxSize;

        // Pré-aloca os objetos na memória
        for (let i = 0; i < initialSize; i++) {
            let obj = this.createFunc();
            obj.active = false; // Flag para saber se está em uso
            this.pool.push(obj);
        }
    }

    /**
     * @description Returns an available object, creating one if necessary; returns null at a configured capacity.
     * @returns {T | null}
     */
    Get() {
        // Procura um objeto que não está sendo usado
        let obj = this.pool.find(item => !item.active);
        
        // Se a pool encher, expande ela dinamicamente
        if (!obj) {
            if (this.pool.length >= this.maxSize) return null;
            obj = this.createFunc();
            this.pool.push(obj);
        }

        obj.active = true;
        return obj;
    }

    /**
     * @description Marks an object as available for reuse.
     */
    /** @param {T} obj */
    Release(obj) {
        obj.active = false;
        // Joga para fora da tela ou reseta propriedades
        if(obj.position) {
            obj.position.SetValue(-9999, -9999);
        }
    }
}
