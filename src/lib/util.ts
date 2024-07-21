import * as ws from "ws";

export function is_number(arg: any): arg is number {
    return typeof (arg) === "number";
}

export function is_string(arg: any): arg is string {
    return typeof (arg) === "string";
}

export function is_boolean(arg: any): arg is boolean {
    return typeof (arg) === "boolean";
}

export interface WsMessage {
    label: string;
}

export const send_ws_message = <T extends WsMessage>(ws: ws.WebSocket | WebSocket, message: T): number => {
    const msg = JSON.stringify(message);
    ws.send(msg);
    return msg.length;
};

export const get_random = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

export const random_hexcolor = () => "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });

export function format_time(sec: number) {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor(sec % 3600 / 60);
    const seconds = Math.floor(sec % 60);
    const pad = (s: number) => (s < 10 ? "0" : "") + s;
    return `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
}

export type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
