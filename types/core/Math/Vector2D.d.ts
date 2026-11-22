/**
 * @doc Class Vector2D
 * @namespace Math
 * @class Vector2D
 * @author Patrick Faustino Camello
 * @summary Mutable two-dimensional vector with arithmetic and conversion helpers.
 * @Date 15/05/2019
 * @example
 *  var vector2D = new Vector2D(0, 0);
 * @returns {Object}
 */
export class Vector2D {
    static Zero(): Vector2D;
    static One(): Vector2D;
    static FromArray(values?: number[], offset?: number): Vector2D;
    static FromObject(value?: {}): Vector2D;
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    Clone(): Vector2D;
    Copy(vector: any): this;
    /**
     * @doc Method
     * @description Get value x and y of Vector
     * @example
     *  var position = vector2D.Value();
     * @returns Vector2D(x, y)
     */
    GetValue(): Vector2D;
    /**
     * @doc Method
     * @description Set value in Vector
     * @example
     *  vector2D.Value(100, 150);
     * @returns void
     */
    SetValue(x: any, y: any): this;
    Set(x?: number, y?: number): this;
    ToArray(out?: any[], offset?: number): any[];
    Equals(vector: any, epsilon?: number): boolean;
    Add(vector: any): Vector2D;
    AddValue(vector2D: any): Vector2D;
    AddSelf(vector: any): this;
    Subtract(vector: any): Vector2D;
    SubtractValue(vector2D: any): Vector2D;
    SubtractSelf(vector: any): this;
    MultiplyScalar(scalar: any): Vector2D;
    MultiplyScalarSelf(scalar: any): this;
    DivideScalar(scalar: any): Vector2D;
    DivideScalarSelf(scalar: any): this;
    Dot(vector: any): number;
    LengthSquared(): number;
    Length(): number;
    Normalize(): Vector2D;
    NormalizeSelf(): this;
    DistanceTo(vector: any): number;
}
