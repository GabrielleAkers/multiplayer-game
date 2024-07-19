export class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero = new Vector2(0, 0);
    static equals(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    }
    static is_zero(v) {
        return Vector2.equals(v, Vector2.zero);
    }
    static reverse(v) {
        return new Vector2(-v.x, -v.y);
    }
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }
    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }
    static multiply(v, k) {
        return new Vector2(k * v.x, k * v.y);
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static length(v) {
        return Math.sqrt(Vector2.dot(v, v));
    }
    static distance(v1, v2) {
        return Vector2.length(Vector2.subtract(v2, v1));
    }
}
//# sourceMappingURL=vector2.mjs.map