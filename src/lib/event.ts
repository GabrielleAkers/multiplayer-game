import { type IPlayerStyle, is_player_style } from "./components/playerstyle.js";
import { type IMovement, is_movement } from "./components/movement.js";
import { is_number } from "./util.js";
import { type IVector2, is_vector2 } from "./vector2.js";

export interface PlayerInit {
    label: "PlayerInit";
    id: number;
    location: IVector2;
    style: IPlayerStyle;
}

export function is_player_init(arg: any): arg is PlayerInit {
    return arg && arg.label === "PlayerInit" && is_number(arg.id) && is_vector2(arg.location) && is_player_style(arg.style);
}

export interface PlayerJoined {
    label: "PlayerJoined";
    id: number;
    location: IVector2;
    lookat: IVector2;
    style: IPlayerStyle;
}

export function is_player_joined(arg: any): arg is PlayerJoined {
    return arg && arg.label === "PlayerJoined" && is_number(arg.id) && is_vector2(arg.location) && is_vector2(arg.lookat) && is_player_style(arg.style);
}

export interface PlayerLeft {
    label: "PlayerLeft";
    id: number;
}

export function is_player_left(arg: any): arg is PlayerLeft {
    return arg && arg.label === "PlayerLeft" && is_number(arg.id);
}

// client -> server
export interface ClientMove {
    label: "ClientMove";
    movement: IMovement;
}

export function is_client_move(arg: any): arg is ClientMove {
    return arg && arg.label === "ClientMove" && is_movement(arg.movement);
}

// server -> clients
export interface PlayerMove {
    label: "PlayerMove";
    id: number;
    location: IVector2;
    movement: IMovement;
}

export function is_player_move(arg: any): arg is PlayerMove {
    return arg && arg.label === "PlayerMove" && is_number(arg.id) && is_vector2(arg.location) && is_movement(arg.movement);
}

export interface ClientLook {
    label: "ClientLook";
    at: IVector2;
}

export function is_client_look(arg: any): arg is ClientLook {
    return arg && arg.label === "ClientLook" && is_vector2(arg.at);
}

export interface PlayerLook {
    label: "PlayerLook";
    id: number;
    at: IVector2;
}

export function is_player_look(arg: any): arg is PlayerLook {
    return arg && arg.label === "PlayerLook" && is_vector2(arg.at);
}

export interface PlayerSeesYou {
    label: "PlayerSeesYou";
    id: number;
}

export function is_player_sees_you(arg: any): arg is PlayerSeesYou {
    return arg && arg.label === "PlayerSeesYou" && is_number(arg.id);
}

export type PlayerEvent = PlayerJoined | PlayerLeft | PlayerMove | PlayerLook | PlayerSeesYou;
