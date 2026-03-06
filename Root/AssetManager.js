import { Logger } from "./Logger.js";

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
        this.shaders = {};
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
     * @function QueueShader
     * @description Coloca um shader na fila de carregamento
     * @param {string} name 
     * @param {string} url 
     */
    QueueShader(name, url) {
        const promise = fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Erro no shader: ${url}`);
                return response.text(); // Pega o código fonte do shader como texto
            })
            .then(sourceCode => {
                this.shaders[name] = sourceCode; // Salva na memória
            });
            
        this.promises.push(promise);
    }

    /**
     * @description Retorna o código fonte do shader solicitado
     * @param {string} name 
     * @returns {string} Código fonte do shader
     */
    GetShader(name) {
        if (!this.shaders[name]) console.warn(`AssetManager: Shader '${name}' não encontrado.`);
        return this.shaders[name];
    }

    /**
     * @description Aguarda todos os assets serem carregados
     */
    async LoadAll() {
        await Promise.all(this.promises);
        this.promises = []; // Limpa a fila após o carregamento
        Logger.log("info", "AssetManager: Todos os assets foram carregados com sucesso!");
    }

    GetImage(name) {
        if (!this.images[name]) console.warn(`AssetManager: Imagem '${name}' não encontrada.`);
        return this.images[name];
    }
}