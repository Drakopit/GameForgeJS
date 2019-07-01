export class Shader {
    constructor() {
        this.source = null;
    }

    get FullSource() { return this.source; }
    get Source() { return this.source.innerText; }

    /**
     * @description Inicializa o shader
     * @param typeShader // Tipo de shader Ex: fragment ou vertex
     */
    Init(typeShader) {
        this.source = document.createElement("script");
        this.source.type = `x-shader/x-${typeShader}`;
        document.head.appendChild(this.source);
    }

    Load(fileName) {
        if (this.source)
            this.source.src = fileName;
        else
            throw 'O shader precisa ser inicializado!';
    }

    Attach(shader) {
        if (this.source)
            this.source.innerText = shader;
        else
            throw 'O shader precisa ser inicializado!';
    }
}