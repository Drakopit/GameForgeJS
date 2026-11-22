/** Linear blend skinning for a small number of characters; updates existing buffers. */
export class CpuSkinDeformer {
    constructor(mesh: any);
    mesh: any;
    part: any;
    positions: Float32Array<any>;
    normals: Float32Array<any>;
    tangents: Float32Array<any>;
    Apply(pose: any): void;
}
