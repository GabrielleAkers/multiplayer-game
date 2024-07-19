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

export type Constructor = new (...args: any[]) => {};
