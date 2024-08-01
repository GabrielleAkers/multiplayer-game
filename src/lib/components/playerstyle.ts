import { is_string } from "../util.js";


export interface IPlayerStyle {
    hex_color: string;
}

export function is_player_style(arg: any): arg is IPlayerStyle {
    return arg && is_string(arg.hex_color);
}
