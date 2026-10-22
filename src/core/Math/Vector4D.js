/**
 * Four-component vector for colors, quaternions, homogeneous coordinates and generic math data.
 */
export class Vector4D {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static Zero() {
        return new Vector4D(0, 0, 0, 0);
    }

    static One() {
        return new Vector4D(1, 1, 1, 1);
    }

    static FromArray(values = [0, 0, 0, 0], offset = 0) {
        return new Vector4D(
            values[offset] ?? 0,
            values[offset + 1] ?? 0,
            values[offset + 2] ?? 0,
            values[offset + 3] ?? 0
        );
    }

    static FromObject(value = {}) {
        return new Vector4D(
            value.x ?? value[0] ?? 0,
            value.y ?? value[1] ?? 0,
            value.z ?? value[2] ?? 0,
            value.w ?? value[3] ?? 0
        );
    }

    Clone() {
        return new Vector4D(this.x, this.y, this.z, this.w);
    }

    Copy(vector) {
        const value = Vector4D.FromObject(vector);
        this.x = value.x;
        this.y = value.y;
        this.z = value.z;
        this.w = value.w;
        return this;
    }

    GetValue() {
        return this.Clone();
    }

    SetValue(x, y, z, w) {
        return this.Set(x, y, z, w);
    }

    Set(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    ToArray(out = [], offset = 0) {
        out[offset] = this.x;
        out[offset + 1] = this.y;
        out[offset + 2] = this.z;
        out[offset + 3] = this.w;
        return out;
    }

    Equals(vector, epsilon = 0) {
        const value = Vector4D.FromObject(vector);
        return Math.abs(this.x - value.x) <= epsilon
            && Math.abs(this.y - value.y) <= epsilon
            && Math.abs(this.z - value.z) <= epsilon
            && Math.abs(this.w - value.w) <= epsilon;
    }

    Add(vector) {
        const value = Vector4D.FromObject(vector);
        return new Vector4D(this.x + value.x, this.y + value.y, this.z + value.z, this.w + value.w);
    }

    AddValue(vector4D) {
        return this.Add(vector4D);
    }

    AddSelf(vector) {
        const value = Vector4D.FromObject(vector);
        this.x += value.x;
        this.y += value.y;
        this.z += value.z;
        this.w += value.w;
        return this;
    }

    Subtract(vector) {
        const value = Vector4D.FromObject(vector);
        return new Vector4D(this.x - value.x, this.y - value.y, this.z - value.z, this.w - value.w);
    }

    SubtractValue(vector4D) {
        return this.Subtract(vector4D);
    }

    SubtractSelf(vector) {
        const value = Vector4D.FromObject(vector);
        this.x -= value.x;
        this.y -= value.y;
        this.z -= value.z;
        this.w -= value.w;
        return this;
    }

    MultiplyScalar(scalar) {
        return new Vector4D(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }

    MultiplyScalarSelf(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
        return this;
    }

    DivideScalar(scalar) {
        return scalar === 0 ? new Vector4D() : new Vector4D(
            this.x / scalar,
            this.y / scalar,
            this.z / scalar,
            this.w / scalar
        );
    }

    DivideScalarSelf(scalar) {
        if (scalar === 0) return this.Set(0, 0, 0, 0);
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        this.w /= scalar;
        return this;
    }

    Dot(vector) {
        const value = Vector4D.FromObject(vector);
        return this.x * value.x + this.y * value.y + this.z * value.z + this.w * value.w;
    }

    LengthSquared() {
        return this.Dot(this);
    }

    Length() {
        return Math.hypot(this.x, this.y, this.z, this.w);
    }

    Normalize() {
        return this.DivideScalar(this.Length() || 1);
    }

    NormalizeSelf() {
        return this.DivideScalarSelf(this.Length() || 1);
    }

    DistanceTo(vector) {
        return this.Subtract(vector).Length();
    }
}
