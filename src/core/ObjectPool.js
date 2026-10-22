/**
 * @doc Class ObjectPool
 * @namespace Root
 * @class ObjectPool
 * @summary Reuses inactive objects, such as projectiles and particles, to reduce allocations.
 */
export class ObjectPool {
    constructor(createFunc, initialSize = 20) {
        this.pool = [];
        this.createFunc = createFunc;

        // Pré-aloca os objetos na memória
        for (let i = 0; i < initialSize; i++) {
            let obj = this.createFunc();
            obj.active = false; // Flag para saber se está em uso
            this.pool.push(obj);
        }
    }

    /**
     * @description Returns an available object, creating one if necessary.
     */
    Get() {
        // Procura um objeto que não está sendo usado
        let obj = this.pool.find(item => !item.active);
        
        // Se a pool encher, expande ela dinamicamente
        if (!obj) {
            obj = this.createFunc();
            this.pool.push(obj);
        }

        obj.active = true;
        return obj;
    }

    /**
     * @description Marks an object as available for reuse.
     */
    Release(obj) {
        obj.active = false;
        // Joga para fora da tela ou reseta propriedades
        if(obj.position) {
            obj.position.SetValue(-9999, -9999);
        }
    }
}