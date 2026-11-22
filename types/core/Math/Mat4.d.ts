/**
 * Dependency-free four-by-four matrix math utilities for Render3D.
 */
export class Mat4 {
    static create(): Float32Array<ArrayBuffer>;
    static clone(matrix: any): Float32Array<any>;
    static copy(out: any, matrix: any): any;
    static identity(out: any): any;
    /** Builds glTF's T * R * S matrix from an XYZW quaternion. */
    static fromRotationTranslationScale(out: any, q: any, translation: any, scale: any): any;
    static perspective(out: any, fovy: any, aspect: any, near: any, far: any): any;
    static orthographic(out: any, left: any, right: any, bottom: any, top: any, near: any, far: any): any;
    static multiply(out: any, a: any, b: any): any;
    static translate(out: any, a: any, v: any): any;
    static scale(out: any, a: any, v: any): any;
    static rotate(out: any, a: any, radians: any, axis: any): any;
    static rotateX(out: any, a: any, radians: any): any;
    static rotateY(out: any, a: any, radians: any): any;
    static rotateZ(out: any, a: any, radians: any): any;
    static transpose(out: any, a: any): any;
    static invert(out: any, a: any): any;
    static lookAt(out: any, eye: any, center: any, up: any): any;
}
