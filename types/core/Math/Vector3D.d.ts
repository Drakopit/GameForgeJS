/**
 * @doc Class Vector3D
 * @namespace Math
 * @class Vector3D
 * @author Patrick Faustino Camello
 * @summary Mutable three-dimensional vector with arithmetic and conversion helpers.
 * @Date 15/05/2019
 * @example
 *  var vector3D = new Vector3D(0, 0, 0);
 * @returns {Object}
 */
export class Vector3D {
    static Zero(): Vector3D;
    static One(): Vector3D;
    static FromArray(values?: number[], offset?: number): Vector3D;
    static FromObject(value?: {}): Vector3D;
    /**
     * Returns a new interpolated vector without changing either endpoint.
     * @param {Vector3D} a - Starting vector.
     * @param {Vector3D} b - Target vector.
     * @param {number} t - Interpolation factor, clamped to 0..1.
     * @returns {Vector3D} Interpolated vector.
     */
    static Lerp(a: Vector3D, b: Vector3D, t: number): Vector3D;
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set xy(value: Vector2D);
    /** Two-axis swizzles are independent copies; assign to write back explicitly. */
    get xy(): Vector2D;
    set xz(value: Vector2D);
    get xz(): Vector2D;
    set yz(value: Vector2D);
    get yz(): Vector2D;
    /**
     * Read any two/three XYZ axes, including repetitions, into a new vector.
     * @param {string} pattern - Two or three axes, for example xz, zyx or xx.
     * @returns {Vector2D|Vector3D} Independent vector; mutations do not write back.
     */
    Swizzle(pattern: string): Vector2D | Vector3D;
    Clone(): Vector3D;
    Copy(vector: any): this;
    /**
     * @doc Method
     * @description Get value x, y and z of Vector
     * @example
     *  var position = vector3D.Value();
     * @returns new Vector3D(x, y, z)
     */
    GetValue(): Vector3D;
    ToArray(out?: any[], offset?: number): any[];
    /**
     * @doc Method
     * @description Set value x, y and z of Vector
     * @example
     *  vector3D.Value(100, 150);
     * @returns void
     */
    SetValue(x: any, y: any, z: any): this;
    Set(x?: number, y?: number, z?: number): this;
    Equals(vector: any, epsilon?: number): boolean;
    Add(vector: any): Vector3D;
    AddValue(vector3D: any): Vector3D;
    AddSelf(vector: any): this;
    Subtract(vector: any): Vector3D;
    SubtractValue(vector3D: any): Vector3D;
    SubtractSelf(vector: any): this;
    MultiplyScalar(scalar: any): Vector3D;
    MultiplyScalarSelf(scalar: any): this;
    DivideScalar(scalar: any): Vector3D;
    DivideScalarSelf(scalar: any): this;
    Dot(vector: any): number;
    Cross(vector: any): Vector3D;
    LengthSquared(): number;
    Length(): number;
    Normalize(): Vector3D;
    NormalizeSelf(): this;
    DistanceTo(vector3D: any): number;
}
import { Vector2D } from './Vector2D.js';
