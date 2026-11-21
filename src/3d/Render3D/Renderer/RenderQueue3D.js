import { Mat4 } from '../../../core/Math/Mat4.js';

/** Conservative world AABB frustum rejection; transparent surfaces sort back-to-front. */
export class RenderQueue3D {
    constructor() { this.bounds = new WeakMap(); this.culled = 0; }
    Build(objects, camera) {
        const clip = Mat4.multiply(Mat4.create(), camera.projectionMatrix, camera.viewMatrix);
        const planes = [];
        for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
            planes.push([clip[3] + sign * clip[axis], clip[7] + sign * clip[4 + axis],
                clip[11] + sign * clip[8 + axis], clip[15] + sign * clip[12 + axis]]);
        }
        const opaque = [], transparent = [];
        this.culled = 0;
        for (const mesh of objects) {
            const bounds = this.GetBounds(mesh.geometry);
            const matrix = mesh.transform.GetMatrix();
            const center = {
                x: matrix[0] * bounds.x + matrix[4] * bounds.y + matrix[8] * bounds.z + matrix[12],
                y: matrix[1] * bounds.x + matrix[5] * bounds.y + matrix[9] * bounds.z + matrix[13],
                z: matrix[2] * bounds.x + matrix[6] * bounds.y + matrix[10] * bounds.z + matrix[14],
            };
            const extent = {
                x: Math.abs(matrix[0]) * bounds.ex + Math.abs(matrix[4]) * bounds.ey + Math.abs(matrix[8]) * bounds.ez,
                y: Math.abs(matrix[1]) * bounds.ex + Math.abs(matrix[5]) * bounds.ey + Math.abs(matrix[9]) * bounds.ez,
                z: Math.abs(matrix[2]) * bounds.ex + Math.abs(matrix[6]) * bounds.ey + Math.abs(matrix[10]) * bounds.ez,
            };
            if (mesh.frustumCulled !== false && planes.some(([a, b, c, d]) =>
                a * center.x + b * center.y + c * center.z + d + Math.abs(a) * extent.x + Math.abs(b) * extent.y + Math.abs(c) * extent.z < 0)) {
                this.culled++; continue;
            }
            const view = camera.viewMatrix;
            const depth = -(view[2] * center.x + view[6] * center.y + view[10] * center.z + view[14]);
            (mesh.material?.transparent ? transparent : opaque).push({ mesh, depth });
        }
        opaque.sort((a, b) => a.depth - b.depth);
        transparent.sort((a, b) => b.depth - a.depth);
        return [...opaque, ...transparent].map(item => item.mesh);
    }
    GetBounds(geometry) {
        const cached = this.bounds.get(geometry);
        if (cached?.version === geometry.version) return cached;
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        const values = geometry.positions;
        for (let offset = 0; offset < values.length; offset += 3) {
            minX = Math.min(minX, values[offset]); maxX = Math.max(maxX, values[offset]);
            minY = Math.min(minY, values[offset + 1]); maxY = Math.max(maxY, values[offset + 1]);
            minZ = Math.min(minZ, values[offset + 2]); maxZ = Math.max(maxZ, values[offset + 2]);
        }
        const bounds = { version: geometry.version, x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2,
            ex: (maxX - minX) / 2, ey: (maxY - minY) / 2, ez: (maxZ - minZ) / 2 };
        this.bounds.set(geometry, bounds); return bounds;
    }
}
