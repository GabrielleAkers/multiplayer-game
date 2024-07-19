import * as ws from "ws";

export const SERVER_PORT = 7070;
export const CANVAS_SCALE = 100;
export const CANVAS_WIDTH = 8 * CANVAS_SCALE;
export const CANVAS_HEIGHT = 6 * CANVAS_SCALE;
export const PLAYER_RADIUS = 10;
export const PLAYER_SPEED = 100;

export interface Vector2 {
    x: number;
    y: number;
}

export const v2equal = (v1: Vector2, v2: Vector2): boolean => v1.x === v2.x && v1.y === v2.y;

export const v2add = (v1: Vector2, v2: Vector2): Vector2 => ({ x: v1.x + v2.x, y: v1.y + v2.y });

export const v2sub = (v1: Vector2, v2: Vector2): Vector2 => v2add(v1, { x: -v2.x, y: -v2.y });

export const v2mul = (v: Vector2, k: number): Vector2 => ({ x: v.x * k, y: v.y * k });

export const v2dot = (v1: Vector2, v2: Vector2): number => (v1.x * v2.x) + (v1.y * v2.y);

export const v2len = (v1: Vector2): number => Math.sqrt(v2dot(v1, v1));

export const v2dist = (v1: Vector2, v2: Vector2): number => v2len(v2sub(v2, v1));

export interface Movement {
    is_moving: boolean;
    target: Vector2;
}

export interface Player {
    id: number;
    location: Vector2;
    movement: Movement;
    hex_color: string;
}

export function is_number(arg: any): arg is number {
    return typeof (arg) === "number";
}

export function is_string(arg: any): arg is string {
    return typeof (arg) === "string";
}

export function is_boolean(arg: any): arg is boolean {
    return typeof (arg) === "boolean";
}

export function is_vector2(arg: any): arg is Vector2 {
    return arg && is_number(arg.x) && is_number(arg.y);
}

export function is_movement(arg: any): arg is Movement {
    return arg && is_boolean(arg.is_moving) && is_vector2(arg.target);
}


// same as PlayerJoined but used to notify player which player is theirs
export interface PlayerInit {
    label: "PlayerInit";
    id: number;
    location: Vector2;
    hex_color: string;
}

export function is_player_init(arg: any): arg is PlayerInit {
    return arg && arg.label === "PlayerInit" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
}

export interface PlayerJoined {
    label: "PlayerJoined";
    id: number;
    location: Vector2;
    hex_color: string;
}

export function is_player_joined(arg: any): arg is PlayerJoined {
    return arg && arg.label === "PlayerJoined" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
}

export interface PlayerLeft {
    label: "PlayerLeft";
    id: number;
}

export function is_player_left(arg: any): arg is PlayerLeft {
    return arg && arg.label === "PlayerLeft" && is_number(arg.id);
}

export interface PlayerMove {
    label: "PlayerMove";
    id: number;
    location: Vector2;
    movement: Movement;
}

export function is_player_move(arg: any): arg is PlayerMove {
    return arg && arg.label === "PlayerMove" && is_number(arg.id) && is_vector2(arg.location) && is_movement(arg.movement);
}

export type PlayerEvent = PlayerJoined | PlayerLeft | PlayerMove;

interface WsMessage {
    label: string;
}

export const send_ws_message = <T extends WsMessage>(ws: ws.WebSocket | WebSocket, message: T) => {
    const msg = JSON.stringify(message);
    ws.send(msg);
};

export const get_random = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

export const random_hexcolor = () => "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });

export const update_player_position = (player: Player, delta_time: number) => {
    if (v2dist(player.location, player.movement.target) <= 0.1 * PLAYER_RADIUS) return;

    const dir = v2sub(player.movement.target, player.location);
    const dir_normed = v2mul(dir, 1 / Math.sqrt(v2dot(dir, dir)));
    const loc = v2add(player.location, v2mul(dir_normed, PLAYER_SPEED * delta_time));
    player.location = loc;
};
