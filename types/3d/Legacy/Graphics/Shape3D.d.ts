/** @deprecated Use `Mesh`, `PrimitiveMesh` and `StandardMaterial` from `gameforgejs/3d`. */
export class Shapes3D {
    constructor(screen: any);
    gl: any;
    screen: any;
    programInfo: {};
    textures: any[];
    defaultTexture: any;
    initShaders(): void;
    shaderProgram: any;
    loadShader(type: any, source: any): any;
    initBuffers(): void;
    positionBuffer: any;
    textureCoordBuffer: any;
    normalBuffer: any;
    indexBuffer: any;
    CreateTexture(imageElement: any): any;
    CreateSolidTexture(color: any): any;
    DrawCube(position: any, rotation: any, scale: any, camera: any, webglTexture: any, lighting?: any): void;
    Dispose(): void;
}
