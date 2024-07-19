import { PLAYER_RADIUS, PLAYER_SPEED } from "../common.mjs";
import { is_boolean, is_string } from "./util.js";
import { is_vector2 } from "./vector2.js";
export class Movement {
    is_moving;
    target;
    constructor(is_moving, target) {
        this.is_moving = is_moving;
        this.target = target;
    }
    copy(m) {
        this.is_moving = m.is_moving;
        this.target.copy(m.target);
        return this;
    }
}
export class Player {
    id;
    location;
    movement;
    style;
    constructor(id, location, movement, style) {
        this.id = id;
        this.location = location;
        this.movement = movement;
        this.style = style;
    }
    update_position(delta_time) {
        if (this.location.distance(this.movement.target) <= 0.1 * PLAYER_RADIUS)
            return;
        this.location.lerp(this.movement.target, PLAYER_SPEED * delta_time / this.movement.target.distance(this.location));
    }
}
export function is_movement(arg) {
    return arg && is_boolean(arg.is_moving) && is_vector2(arg.target);
}
export function is_player_style(arg) {
    return arg && is_string(arg.hex_color);
}
//# sourceMappingURL=player.js.map