import { DIRECTION_VECTORS, Direction } from "./input.js";
import { type IVector2, Vector2, is_vector2 } from "../vector2.js";

export interface ITransform {
    position: IVector2;
    rotation: IVector2;
}

export class Transform implements ITransform {
    constructor(public position: Vector2, public rotation: Vector2 = Vector2.from_vec2(DIRECTION_VECTORS[Direction.RIGHT])) { }

    get angle() {
        const v = Vector2.from_vec2(this.rotation);
        v.subtract(this.position);
        v.normalize();
        return Math.atan2(v.y, v.x);
    }

    translate(by: IVector2) {
        this.position.add(by);
    }

    lookat(point: IVector2) {
        this.rotation.set(point.x, point.y);
    }
}

export function is_transform(arg: any): arg is ITransform {
    return arg && is_vector2(arg.position) && is_vector2(arg.rotation);
}
