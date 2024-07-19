export function is_number(arg) {
    return typeof (arg) === "number";
}
export function is_string(arg) {
    return typeof (arg) === "string";
}
export function is_boolean(arg) {
    return typeof (arg) === "boolean";
}
export const send_ws_message = (ws, message) => {
    const msg = JSON.stringify(message);
    ws.send(msg);
};
export const get_random = (min, max) => {
    return Math.random() * (max - min) + min;
};
export const random_hexcolor = () => "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
//# sourceMappingURL=util.js.map