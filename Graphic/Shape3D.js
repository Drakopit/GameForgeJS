import { mat4 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';
import { AssetManager } from '../Root/AssetManager.js';

export class Shapes3D {
    constructor(screen) {
        this.gl = screen.Context;
        this.screen = screen;
        this.programInfo = {};

        this.initShaders();
        this.initBuffers();
    }

    initShaders() {
        // Vertex Shader: Recebe a Posição 3D e a Coordenada UV (2D)
        const vsSource = AssetManager.instance.GetShader("vertexShader");

        // Fragment Shader: Lê o pixel exato da textura (uSampler)
        const fsSource = AssetManager.instance.GetShader("fragmentShader");

        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Erro no shader: ' + this.gl.getProgramInfoLog(this.shaderProgram));
            return;
        }

        this.programInfo = {
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
                uSampler: this.gl.getUniformLocation(this.shaderProgram, 'uSampler'),
            },
        };
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    initBuffers() {
        // 1. BUFFER DE POSIÇÕES (24 vértices)
        const positions = [
            -1.0, -1.0,  1.0,    1.0, -1.0,  1.0,    1.0,  1.0,  1.0,   -1.0,  1.0,  1.0, // Frente
            -1.0, -1.0, -1.0,   -1.0,  1.0, -1.0,    1.0,  1.0, -1.0,    1.0, -1.0, -1.0, // Trás
            -1.0,  1.0, -1.0,   -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,    1.0,  1.0, -1.0, // Topo
            -1.0, -1.0, -1.0,    1.0, -1.0, -1.0,    1.0, -1.0,  1.0,   -1.0, -1.0,  1.0, // Base
             1.0, -1.0, -1.0,    1.0,  1.0, -1.0,    1.0,  1.0,  1.0,    1.0, -1.0,  1.0, // Direita
            -1.0, -1.0, -1.0,   -1.0, -1.0,  1.0,   -1.0,  1.0,  1.0,   -1.0,  1.0, -1.0, // Esquerda
        ];
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        // 2. BUFFER DE COORDENADAS UV (Substitui o antigo ColorBuffer)
        // Mapeia os cantos da imagem (0,0 até 1,1) para cada face do cubo
        const textureCoordinates = [
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0, // Frente
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0, // Trás
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0, // Topo
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0, // Base
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0, // Direita
            0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0, // Esquerda
        ];
        this.textureCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);

        // 3. BUFFER DE ÍNDICES (Permanece igual)
        const indices = [
            0,  1,  2,      0,  2,  3,    // Frente
            4,  5,  6,      4,  6,  7,    // Trás
            8,  9,  10,     8,  10, 11,   // Topo
            12, 13, 14,     12, 14, 15,   // Base
            16, 17, 18,     16, 18, 19,   // Direita
            20, 21, 22,     20, 22, 23,   // Esquerda
        ];
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
    }

    /**
     * @description Converte um elemento de imagem (HTMLImageElement) numa textura WebGL
     */
    CreateTexture(imageElement) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Envia os píxeis da imagem para a GPU
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageElement);

        // Configurações para imagens que não são de tamanho "Potência de 2" (ex: 256x256)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

        return texture;
    }

    /**
     * @description Desenha o cubo texturizado
     */
    DrawCube(position, rotation, scale, camera, webglTexture) {
        this.gl.useProgram(this.shaderProgram);

        // Injeta Vértices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        // Injeta UVs
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Activa a textura na GPU
        if (webglTexture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, webglTexture);
            this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
        }

        // --- MATRIZES ---
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, position);
        mat4.rotate(modelMatrix, modelMatrix, rotation.x, [1, 0, 0]);
        mat4.rotate(modelMatrix, modelMatrix, rotation.y, [0, 1, 0]);
        mat4.rotate(modelMatrix, modelMatrix, rotation.z, [0, 0, 1]);
        mat4.scale(modelMatrix, modelMatrix, scale);

        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, camera.viewMatrix, modelMatrix);

        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
    }
}