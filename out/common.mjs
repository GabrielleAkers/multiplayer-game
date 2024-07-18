export const SERVER_PORT = 7070;
export const CANVAS_SCALE = 100;
export const CANVAS_WIDTH = 8 * CANVAS_SCALE;
export const CANVAS_HEIGHT = 6 * CANVAS_SCALE;
export const PLAYER_RADIUS = 10;
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
export function is_client_init(arg) {
    return arg && arg.label === "ClientInit" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
}
export function is_player_joined(arg) {
    return arg && arg.label === "PlayerJoined" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
}
export function is_player_left(arg) {
    return arg && arg.label === "PlayerLeft" && is_number(arg.id);
}
export const send_ws_message = (ws, message) => {
    const msg = JSON.stringify(message);
    ws.send(msg);
};
export const get_random = (min, max) => {
    return Math.random() * (max - min) + min;
};
export const random_hexcolor = () => "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
//# sourceMappingURL=common.mjs.map