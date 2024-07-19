import { is_number } from "./util.js";

export interface IVector2 {
    x: number;
    y: number;
}

export class Vector2 implements IVector2 {
    constructor(public x: number, public y: number) { }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    setx(x: number) {
        this.x = x;
        return this;
    }

    sety(y: number) {
        this.y = y;
        return this;
    }

    copy(v: IVector2) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    equals(v: IVector2) {
        return (this.x === v.x) && (this.y === v.y);
    }

    add(v: IVector2) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v: IVector2) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(k: number) {
        this.x *= k;
        this.y *= k;
        return this;
    }

    divide(k: number) {
        if (k === 0) throw new Error("Cant divide by zero");
        return this.multiply(1 / k);
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    dot(v: IVector2) {
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

    distance(v: IVector2) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    random() {
        this.x = Math.random();
        this.y = Math.random();
        return this;
    }

    lerp(t: IVector2, delta: number) {
        this.x += (t.x - this.x) * delta;
        this.y += (t.y - this.y) * delta;
        return this;
    }

    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }

    static from_vec2(v: IVector2) {
        return new Vector2(v.x, v.y);
    }

    static zero = new Vector2(0, 0);
}

export function is_vector2(arg: any): arg is IVector2 {
    return arg && is_number(arg.x) && is_number(arg.y);
}
