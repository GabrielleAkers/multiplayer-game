import { PLAYER_RADIUS, PLAYER_SPEED } from "../../common.mjs";
import { DIRECTION_VECTORS } from "../components/input.js";
import { type IMovement, Movement, is_movement } from "../components/movement.js";
import { type IPlayerStyle, is_player_style } from "../components/playerstyle.js";
import { type ITransform, Transform, is_transform } from "../components/transform.js";
import { draw_line, draw_circle } from "../draw.js";
import { GameObject } from "../gameobject.js";
import { is_number } from "../util.js";

export interface IPlayer {
    id: number;
    transform: ITransform;
    movement: IMovement;
    style: IPlayerStyle;
}

export class Player extends GameObject implements IPlayer {
    constructor(public id: number, public transform: Transform, public movement: Movement, public style: IPlayerStyle) {
        super(id, transform);
    }

    update_position(delta_time: number) {
        if (this.movement.is_moving)
            this.transform.translate({ x: DIRECTION_VECTORS[this.movement.direction].x * PLAYER_SPEED * delta_time, y: DIRECTION_VECTORS[this.movement.direction].y * PLAYER_SPEED * delta_time });
    }

    update(delta_time: number, root_object: GameObject) {
        this.update_position(delta_time);
    }

    draw(ctx: CanvasRenderingContext2D) {
        draw_line(ctx, this.transform.position, this.transform.rotation, this.style.hex_color, [], 1);
        draw_circle(ctx, this.transform.position, PLAYER_RADIUS, this.style.hex_color, "white", 2);
    }
}

export function is_player(arg: any): arg is IPlayer {
    return arg && is_number(arg.id) && is_transform(arg.transform) && is_movement(arg.movement) && is_player_style(arg.style);
}
