import * as ws from "ws";

export const SERVER_PORT = 7070;
export const CANVAS_SCALE = 100;
export const CANVAS_WIDTH = 8 * CANVAS_SCALE;
export const CANVAS_HEIGHT = 6 * CANVAS_SCALE;
export const PLAYER_RADIUS = 10;

export interface Vector2 {
    x: number;
    y: number;
}

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


// same as PlayerJoined but used to notify player which player is theirs
export interface ClientInit {
    label: "ClientInit";
    id: number;
    location: Vector2;
    hex_color: string;
}

export function is_client_init(arg: any): arg is ClientInit {
    return arg && arg.label === "ClientInit" && is_number(arg.id) && is_vector2(arg.location) && is_string(arg.hex_color);
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

export type PlayerEvent = PlayerJoined | PlayerLeft;

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
