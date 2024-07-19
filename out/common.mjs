export const SERVER_PORT = 7070;
export const CANVAS_SCALE = 100;
export const CANVAS_WIDTH = 8 * CANVAS_SCALE;
export const CANVAS_HEIGHT = 6 * CANVAS_SCALE;
export const PLAYER_RADIUS = 10;
export const PLAYER_SPEED = 100;
export const v2equal = (v1, v2) => v1.x === v2.x && v1.y === v2.y;
export const v2add = (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const v2sub = (v1, v2) => v2add(v1, { x: -v2.x, y: -v2.y });
export const v2mul = (v, k) => ({ x: v.x * k, y: v.y * k });
export const v2dot = (v1, v2) => (v1.x * v2.x) + (v1.y * v2.y);
export const v2len = (v1) => Math.sqrt(v2dot(v1, v1));
export const v2dist = (v1, v2) => v2len(v2sub(v2, v1));
export function is_number(arg) {
    return typeof (arg) === "number";
}
export function is_string(arg) {
    return typeof (arg) === "string";
}
export function is_boolean(arg) {
    return typeof (arg) === "boolean";
}
export function is_vector2(arg) {
    return arg && is_number(arg.x) && is_number(arg.y);
}
export function is_movement(arg) {
    return arg && is_boolean(arg.is_moving) && is_vector2(arg.target);
}
export function is_player_init(arg) {
    return arg && arg.label === "PlayerInit" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
}
export function is_player_joined(arg) {
    return arg && arg.label === "PlayerJoined" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
}
export function is_player_left(arg) {
    return arg && arg.label === "PlayerLeft" && is_number(arg.id);
}
export function is_player_move(arg) {
    return arg && arg.label === "PlayerMove" && is_number(arg.id) && is_vector2(arg.location) && is_movement(arg.movement);
}
export const send_ws_message = (ws, message) => {
    const msg = JSON.stringify(message);
    ws.send(msg);
};
export const get_random = (min, max) => {
    return Math.random() * (max - min) + min;
};
export const random_hexcolor = () => "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
export const update_player_position = (player, delta_time) => {
    if (v2dist(player.location, player.movement.target) <= 0.1 * PLAYER_RADIUS)
        return;
    const dir = v2sub(player.movement.target, player.location);
    const dir_normed = v2mul(dir, 1 / Math.sqrt(v2dot(dir, dir)));
    const loc = v2add(player.location, v2mul(dir_normed, PLAYER_SPEED * delta_time));
    player.location = loc;
};
//# sourceMappingURL=common.mjs.map