import { is_boolean, is_number } from "../util.js";
import { Direction } from "./input.js";

export interface IMovement {
    is_moving: boolean;
    direction: Direction;
}

export class Movement implements IMovement {
    constructor(public is_moving: boolean, public direction: Direction) { }

    copy(m: IMovement) {
        this.is_moving = m.is_moving;
        this.direction = m.direction;
        return this;
    }

    equals(m: IMovement) {
        return this.is_moving === m.is_moving && this.direction === m.direction;
    }
}

export function is_movement(arg: any): arg is IMovement {
    return arg && is_boolean(arg.is_moving) && is_number(arg.direction);
}
