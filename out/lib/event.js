import { is_player_style, is_movement } from "./player.js";
import { is_number } from "./util.js";
import { is_vector2 } from "./vector2.js";
export function is_player_init(arg) {
    return arg && arg.label === "PlayerInit" && is_number(arg.id) && is_vector2(arg.location) && is_player_style(arg.style);
}
export function is_player_joined(arg) {
    return arg && arg.label === "PlayerJoined" && is_number(arg.id) && is_vector2(arg.location) && is_player_style(arg.style);
}
export function is_player_left(arg) {
    return arg && arg.label === "PlayerLeft" && is_number(arg.id);
}
export function is_client_move(arg) {
    return arg && arg.label === "ClientMove" && is_movement(arg.movement);
}
export function is_player_move(arg) {
    return arg && arg.label === "PlayerMove" && is_number(arg.id) && is_vector2(arg.location) && is_movement(arg.movement);
}
//# sourceMappingURL=event.js.map