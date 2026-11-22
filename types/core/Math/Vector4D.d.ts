/**
 * Four-component vector for colors, quaternions, homogeneous coordinates and generic math data.
 */
export class Vector4D {
    static Zero(): Vector4D;
    static One(): Vector4D;
    static FromArray(values?: number[], offset?: number): Vector4D;
    static FromObject(value?: {}): Vector4D;
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number;
    y: number;
    z: number;
    w: number;
    Clone(): Vector4D;
    Copy(vector: any): this;
    GetValue(): Vector4D;
    SetValue(x: any, y: any, z: any, w: any): this;
    Set(x?: number, y?: number, z?: number, w?: number): this;
    ToArray(out?: any[], offset?: number): any[];
    Equals(vector: any, epsilon?: number): boolean;
    Add(vector: any): Vector4D;
    AddValue(vector4D: any): Vector4D;
    AddSelf(vector: any): this;
    Subtract(vector: any): Vector4D;
    SubtractValue(vector4D: any): Vector4D;
    SubtractSelf(vector: any): this;
    MultiplyScalar(scalar: any): Vector4D;
    MultiplyScalarSelf(scalar: any): this;
    DivideScalar(scalar: any): Vector4D;
    DivideScalarSelf(scalar: any): this;
    Dot(vector: any): number;
    LengthSquared(): number;
    Length(): number;
    Normalize(): Vector4D;
    NormalizeSelf(): this;
    DistanceTo(vector: any): number;
}
