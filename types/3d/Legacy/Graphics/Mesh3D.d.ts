/** @deprecated Use `Mesh` with `ModelMeshFactory` from `gameforgejs/3d`. */
export class Mesh3D {
    /**
     * @param {WebGLRenderingContext} gl - Contexto WebGL da Screen3D
     * @param {object} parsedModel       - Resultado de ModelLoader.Load()[n]
     */
    constructor(gl: WebGLRenderingContext, parsedModel: object);
    gl: WebGLRenderingContext;
    model: any;
    _buffers: {};
    texture: WebGLTexture;
    _initShaders(): void;
    program: WebGLProgram;
    locs: {
        aPosition: number;
        aTexCoord: number;
        aNormal: number;
        uProjection: WebGLUniformLocation;
        uModelView: WebGLUniformLocation;
        uNormalMatrix: WebGLUniformLocation;
        uSampler: WebGLUniformLocation;
        uLightDir: WebGLUniformLocation;
        uLightColor: WebGLUniformLocation;
        uBaseColor: WebGLUniformLocation;
        uHasTexture: WebGLUniformLocation;
        uLightIntensity: WebGLUniformLocation;
        uAmbientStrength: WebGLUniformLocation;
    };
    _compile(type: any, source: any): WebGLShader;
    _uploadToGPU(): void;
    _indexCount: any;
    _indexType: 5125 | 5123;
    _vertexCount: number;
    _createBuffer(target: any, data: any): WebGLBuffer;
    _loadTexture(): Promise<void>;
    /**
     * @param {Transform3D} transform - transform.position, rotation, scale
     * @param {Camera3D}    camera    - camera.viewMatrix, camera.projectionMatrix
     * @param {object}      options   - { lightDir, baseColor }
     */
    Draw(transform: Transform3D, camera: Camera3D, options?: object): void;
    /**
     * Releases the mesh's GPU buffers and textures.
     * Call when the owning level releases the mesh.
     */
    Dispose(): void;
}
