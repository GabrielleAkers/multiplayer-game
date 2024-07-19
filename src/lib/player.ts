import { PLAYER_RADIUS, PLAYER_SPEED } from "../common.mjs";
import { is_boolean, is_string } from "./util.js";
import { IVector2, Vector2, is_vector2 } from "./vector2.js";

export interface IMovement {
    is_moving: boolean;
    target: Vector2;
}

export class Movement {
    constructor(public is_moving: boolean, public target: Vector2) { }

    copy(m: IMovement) {
        this.is_moving = m.is_moving;
        this.target.copy(m.target);
        return this;
    }
}

export interface IPlayerStyle {
    hex_color: string;
}

export interface IPlayer {
    id: number;
    location: Vector2;
    movement: Movement;
    style: IPlayerStyle;
}

export class Player implements IPlayer {
    constructor(public id: number, public location: Vector2, public movement: Movement, public style: IPlayerStyle) { }

    update_position(delta_time: number) {
        if (this.location.distance(this.movement.target) <= 0.1 * PLAYER_RADIUS) return;

        this.location.lerp(this.movement.target, PLAYER_SPEED * delta_time / this.movement.target.distance(this.location));
    }
}

export function is_movement(arg: any): arg is IMovement {
    return arg && is_boolean(arg.is_moving) && is_vector2(arg.target);
}

export function is_player_style(arg: any): arg is IPlayerStyle {
    return arg && is_string(arg.hex_color);
}
