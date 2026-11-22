/**
 * Factory for educational and manifest-friendly primitive geometries.
 *
 * Methods return `Geometry3D`; wrap the result in `Mesh` to render it.
 */
export class PrimitiveMesh {
    /**
     * Creates a textured cube centered at the origin.
     * @param {number} [size=1] - Edge length.
     * @returns {Geometry3D} Cube geometry.
     */
    static Cube(size?: number): Geometry3D;
    static BeveledCube(bevel?: number): Geometry3D;
    /**
     * Creates a subdivided horizontal plane suitable for floors.
     * @param {number} [width=1] - X span.
     * @param {number} [depth=1] - Z span.
     * @param {Object} [options] - Segmentation settings.
     * @returns {Geometry3D} Plane geometry.
     */
    static Plane(width?: number, depth?: number, { subdivisions }?: any): Geometry3D;
    /**
     * Creates a UV sphere centered at the origin.
     * @param {number} [radius=1] - Sphere radius.
     * @param {Object} [options] - Segment settings.
     * @returns {Geometry3D} Sphere geometry.
     */
    static Sphere(radius?: number, { widthSegments, heightSegments }?: any): Geometry3D;
    static Ring(innerRadius?: number, outerRadius?: number, { segments }?: {
        segments?: number;
    }): Geometry3D;
}
import { Geometry3D } from "./Geometry3D.js";
