import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_SPEED } from "../common.mjs";
import { DIRECTION_VECTORS, Direction } from "./input.js";
import { is_boolean, is_number, is_string } from "./util.js";
import { Vector2 } from "./vector2.js";

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

export interface IPlayerStyle {
    hex_color: string;
}

export interface IPlayer {
    id: number;
    location: Vector2;
    movement: Movement;
    lookat: Vector2;
    style: IPlayerStyle;
}

export class Player implements IPlayer {
    constructor(public id: number, public location: Vector2, public movement: Movement, public lookat: Vector2, public style: IPlayerStyle) { }

    update_position(delta_time: number) {
        if (this.movement.is_moving)
            this.location.add({ x: DIRECTION_VECTORS[this.movement.direction].x * PLAYER_SPEED * delta_time, y: DIRECTION_VECTORS[this.movement.direction].y * PLAYER_SPEED * delta_time });
    }
}

export function is_movement(arg: any): arg is IMovement {
    return arg && is_boolean(arg.is_moving) && is_number(arg.direction);
}

export function is_player_style(arg: any): arg is IPlayerStyle {
    return arg && is_string(arg.hex_color);
}
