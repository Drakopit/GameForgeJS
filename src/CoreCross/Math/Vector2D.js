/**
 * @doc Class Vector2D
 * @namespace Math
 * @class Vector2D
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var vector2D = new Vector2D(0, 0);
 * @returns {Object}
 */

export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static Zero() {
        return new Vector2D(0, 0);
    }

    static One() {
        return new Vector2D(1, 1);
    }

    static FromArray(values = [0, 0], offset = 0) {
        return new Vector2D(values[offset] ?? 0, values[offset + 1] ?? 0);
    }

    static FromObject(value = {}) {
        return new Vector2D(value.x ?? value[0] ?? 0, value.y ?? value[1] ?? 0);
    }

    Clone() {
        return new Vector2D(this.x, this.y);
    }

    Copy(vector) {
        const value = Vector2D.FromObject(vector);
        this.x = value.x;
        this.y = value.y;
        return this;
    }

    /**
     * @doc Method
     * @description Get value x and y of Vector
     * @example
     *  var position = vector2D.Value();
     * @returns Vector2D(x, y)
     */
    GetValue() {
        return this.Clone();
    }

    /**
     * @doc Method
     * @description Set value in Vector
     * @example
     *  vector2D.Value(100, 150);
     * @returns void
     */
    SetValue(x, y) {
        return this.Set(x, y);
    }

    Set(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }

    ToArray(out = [], offset = 0) {
        out[offset] = this.x;
        out[offset + 1] = this.y;
        return out;
    }

    Equals(vector, epsilon = 0) {
        const value = Vector2D.FromObject(vector);
        return Math.abs(this.x - value.x) <= epsilon
            && Math.abs(this.y - value.y) <= epsilon;
    }

    Add(vector) {
        const value = Vector2D.FromObject(vector);
        return new Vector2D(this.x + value.x, this.y + value.y);
    }

    AddValue(vector2D) {
        return this.Add(vector2D);
    }

    AddSelf(vector) {
        const value = Vector2D.FromObject(vector);
        this.x += value.x;
        this.y += value.y;
        return this;
    }

    Subtract(vector) {
        const value = Vector2D.FromObject(vector);
        return new Vector2D(this.x - value.x, this.y - value.y);
    }

    SubtractValue(vector2D) {
        return this.Subtract(vector2D);
    }

    SubtractSelf(vector) {
        const value = Vector2D.FromObject(vector);
        this.x -= value.x;
        this.y -= value.y;
        return this;
    }

    MultiplyScalar(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    MultiplyScalarSelf(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    DivideScalar(scalar) {
        return scalar === 0 ? new Vector2D() : new Vector2D(this.x / scalar, this.y / scalar);
    }

    DivideScalarSelf(scalar) {
        if (scalar === 0) return this.Set(0, 0);
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    Dot(vector) {
        const value = Vector2D.FromObject(vector);
        return this.x * value.x + this.y * value.y;
    }

    LengthSquared() {
        return this.Dot(this);
    }

    Length() {
        return Math.hypot(this.x, this.y);
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
