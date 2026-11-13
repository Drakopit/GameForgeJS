import { Mat4 } from '../../core/Math/Mat4.js';

/** Linear blend skinning for a small number of characters; updates existing buffers. */
export class CpuSkinDeformer {
    constructor(mesh) {
        this.mesh = mesh;
        this.part = mesh.modelPart;
        if (this.part.targets?.length) throw new Error('CPU skinning does not support morph targets yet.');
        this.positions = new Float32Array(mesh.geometry.positions);
        this.normals = new Float32Array(mesh.geometry.EnsureNormals().normals);
        this.tangents = new Float32Array(mesh.geometry.EnsureTangents().tangents);
        // Never mutate a loaded asset or another model instance's bind geometry.
        mesh.geometry.positions = new Float32Array(this.positions);
        mesh.geometry.normals = new Float32Array(this.normals);
        mesh.geometry.tangents = new Float32Array(this.tangents);
        const count = mesh.geometry.vertexCount * 4;
        if (this.part.joints?.length !== count || this.part.weights?.length !== count) {
            throw new Error('Skinned geometry requires four joint indices and weights per vertex.');
        }
        for (let i = 0; i < count; i++) {
            if (!Number.isInteger(this.part.joints[i]) || this.part.joints[i] < 0
                || this.part.joints[i] >= this.part.skin.joints.length
                || !Number.isFinite(this.part.weights[i]) || this.part.weights[i] < 0) {
                throw new Error('Invalid skin joint index or weight.');
            }
        }
    }

    Apply(pose) {
        const { mesh, part } = this;
        const inverseMesh = Mat4.create();
        if (!Mat4.invert(inverseMesh, pose.world[part.node.index])) throw new Error('Singular skinned mesh transform.');
        const palette = part.skin.joints.map((joint, index) => {
            const bind = part.skin.inverseBindMatrices
                ? part.skin.inverseBindMatrices.subarray(index * 16, index * 16 + 16) : Mat4.create();
            return Mat4.multiply(Mat4.create(), inverseMesh,
                Mat4.multiply(Mat4.create(), pose.world[joint], bind));
        });
        const blended = new Float32Array(16);
        const normalMatrix = Mat4.create();
        for (let vertex = 0; vertex < mesh.geometry.vertexCount; vertex++) {
            blended.fill(0);
            let totalWeight = 0;
            for (let influence = 0; influence < 4; influence++) {
                const index = vertex * 4 + influence;
                const weight = part.weights[index];
                const matrix = palette[part.joints[index]];
                totalWeight += weight;
                for (let cell = 0; cell < 16; cell++) blended[cell] += matrix[cell] * weight;
            }
            if (totalWeight === 0) Mat4.identity(blended);
            else for (let cell = 0; cell < 16; cell++) blended[cell] /= totalWeight;
            TransformVector(blended, this.positions, mesh.geometry.positions, vertex * 3, 1);
            if (!Mat4.invert(normalMatrix, blended)) throw new Error('Singular skin deformation.');
            Mat4.transpose(normalMatrix, normalMatrix);
            TransformVector(normalMatrix, this.normals, mesh.geometry.normals, vertex * 3, 0);
            Normalize(mesh.geometry.normals, vertex * 3);
            TransformVector(blended, this.tangents, mesh.geometry.tangents, vertex * 4, 0);
            Normalize(mesh.geometry.tangents, vertex * 4);
        }
        mesh.geometry.MarkUpdated();
    }
}

function TransformVector(matrix, source, target, offset, w) {
    const x = source[offset], y = source[offset + 1], z = source[offset + 2];
    target[offset] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;
    target[offset + 1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;
    target[offset + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;
}

function Normalize(vector, offset) {
    const length = Math.hypot(vector[offset], vector[offset + 1], vector[offset + 2]) || 1;
    for (let component = 0; component < 3; component++) vector[offset + component] /= length;
}
