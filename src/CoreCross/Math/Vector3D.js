/**
 * @doc Class Vector3D
 * @namespace Math
 * @class Vector3D
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var vector3D = new Vector3D(0, 0, 0);
 * @returns {Object}
 */

export class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static Zero() {
        return new Vector3D(0, 0, 0);
    }

    static One() {
        return new Vector3D(1, 1, 1);
    }

    static FromArray(values = [0, 0, 0], offset = 0) {
        return new Vector3D(values[offset] ?? 0, values[offset + 1] ?? 0, values[offset + 2] ?? 0);
    }

    static FromObject(value = {}) {
        return new Vector3D(value.x ?? value[0] ?? 0, value.y ?? value[1] ?? 0, value.z ?? value[2] ?? 0);
    }

    Clone() {
        return new Vector3D(this.x, this.y, this.z);
    }

    Copy(vector) {
        const value = Vector3D.FromObject(vector);
        this.x = value.x;
        this.y = value.y;
        this.z = value.z;
        return this;
    }

    /**
     * @doc Method
     * @description Get value x, y and z of Vector
     * @example
     *  var position = vector3D.Value();
     * @returns new Vector3D(x, y, z)
     */
    GetValue() {
        return this.Clone();
    }

    ToArray(out = [], offset = 0) {
        out[offset] = this.x;
        out[offset + 1] = this.y;
        out[offset + 2] = this.z;
        return out;
    }

    /**
     * @doc Method
     * @description Set value x, y and z of Vector
     * @example
     *  vector3D.Value(100, 150);
     * @returns void
     */
    SetValue(x, y, z) {
        return this.Set(x, y, z);
    }

    Set(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    Equals(vector, epsilon = 0) {
        const value = Vector3D.FromObject(vector);
        return Math.abs(this.x - value.x) <= epsilon
            && Math.abs(this.y - value.y) <= epsilon
            && Math.abs(this.z - value.z) <= epsilon;
    }

    Add(vector) {
        const value = Vector3D.FromObject(vector);
        return new Vector3D(this.x + value.x, this.y + value.y, this.z + value.z);
    }

    AddValue(vector3D) {
        return this.Add(vector3D);
    }

    AddSelf(vector) {
        const value = Vector3D.FromObject(vector);
        this.x += value.x;
        this.y += value.y;
        this.z += value.z;
        return this;
    }

    Subtract(vector) {
        const value = Vector3D.FromObject(vector);
        return new Vector3D(this.x - value.x, this.y - value.y, this.z - value.z);
    }

    SubtractValue(vector3D) {
        return this.Subtract(vector3D);
    }

    SubtractSelf(vector) {
        const value = Vector3D.FromObject(vector);
        this.x -= value.x;
        this.y -= value.y;
        this.z -= value.z;
        return this;
    }

    MultiplyScalar(scalar) {
        return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    MultiplyScalarSelf(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    DivideScalar(scalar) {
        return scalar === 0 ? new Vector3D() : new Vector3D(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    DivideScalarSelf(scalar) {
        if (scalar === 0) return this.Set(0, 0, 0);
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
    }

    Dot(vector) {
        const value = Vector3D.FromObject(vector);
        return this.x * value.x + this.y * value.y + this.z * value.z;
    }

    Cross(vector) {
        const value = Vector3D.FromObject(vector);
        return new Vector3D(
            this.y * value.z - this.z * value.y,
            this.z * value.x - this.x * value.z,
            this.x * value.y - this.y * value.x
        );
    }

    LengthSquared() {
        return this.Dot(this);
    }

    Length() {
        return Math.hypot(this.x, this.y, this.z);
    }

    Normalize() {
        return this.DivideScalar(this.Length() || 1);
    }

    NormalizeSelf() {
        return this.DivideScalarSelf(this.Length() || 1);
    }

    DistanceTo(vector3D) {
        return this.Subtract(vector3D).Length();
    }
}
