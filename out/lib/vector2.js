import { is_number } from "./util.js";
export class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    setx(x) {
        this.x = x;
        return this;
    }
    sety(y) {
        this.y = y;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    equals(v) {
        return (this.x === v.x) && (this.y === v.y);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    multiply(k) {
        this.x *= k;
        this.y *= k;
        return this;
    }
    divide(k) {
        if (k === 0)
            throw new Error("Cant divide by zero");
        return this.multiply(1 / k);
    }
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    length_squared() {
        return this.dot(this);
    }
    length() {
        return Math.sqrt(this.length_squared());
    }
    normalize() {
        return this.divide(this.length() || 1);
    }
    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    random() {
        this.x = Math.random();
        this.y = Math.random();
        return this;
    }
    lerp(t, delta) {
        this.x += (t.x - this.x) * delta;
        this.y += (t.y - this.y) * delta;
        return this;
    }
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
    static from_vec2(v) {
        return new Vector2(v.x, v.y);
    }
    static zero = new Vector2(0, 0);
}
export function is_vector2(arg) {
    return arg && is_number(arg.x) && is_number(arg.y);
}
//# sourceMappingURL=vector2.js.map