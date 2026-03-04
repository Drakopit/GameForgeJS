/**
 * @doc Class AssetManager
 * @namespace Root
 * @class AssetManager
 * @summary Preloader para imagens, áudios e dados JSON. Evita travamentos durante o gameplay.
 */
export class AssetManager {
    constructor() {
        this.images = {};
        this.audios = {};
        this.jsons = {};
        this.promises = [];
        
        // Singleton
        if (!AssetManager.instance) {
            AssetManager.instance = this;
        }
        return AssetManager.instance;
    }

    /**
     * @description Coloca uma imagem na fila de carregamento
     */
    QueueImage(name, src) {
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
            img.src = src;
        });
        this.promises.push(promise);
    }

    /**
     * @description Aguarda todos os assets serem carregados
     */
    async LoadAll() {
        await Promise.all(this.promises);
        this.promises = []; // Limpa a fila após o carregamento
        console.log("Todos os assets foram carregados com sucesso!");
    }

    GetImage(name) {
        if (!this.images[name]) console.warn(`AssetManager: Imagem '${name}' não encontrada.`);
        return this.images[name];
    }
}