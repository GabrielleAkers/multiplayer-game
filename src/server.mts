import { WebSocketServer, WebSocket } from "ws";
import * as common from "./common.mjs";

const MAX_CONNECTIONS = 10;
const SERVER_FPS = 60;

interface WsPlayer extends common.Player {
    ws: WebSocket;
}

const players = new Map<number, WsPlayer>();
let current_id = 0;
const joined_players = new Set<number>();
const left_players = new Set<number>();

const event_queue: Array<common.PlayerEvent> = [];

const wss = new WebSocketServer({
    host: "0.0.0.0",
    port: common.SERVER_PORT
});

wss.on("connection", (ws, req) => {
    if (players.size >= MAX_CONNECTIONS) {
        ws.close();
        return;
    }

    const id = current_id++;
    const location = { x: common.get_random(common.PLAYER_RADIUS, common.CANVAS_WIDTH - common.PLAYER_RADIUS), y: common.get_random(common.PLAYER_RADIUS, common.CANVAS_HEIGHT - common.PLAYER_RADIUS) };
    const movement = { is_moving: false, target: { x: 0, y: 0 } };
    const hex_color = common.random_hexcolor();

    const player: WsPlayer = {
        ws,
        id,
        location,
        movement,
        hex_color
    };
    players.set(id, player);
    event_queue.push({
        label: "PlayerJoined",
        id,
        hex_color,
        location
    });

    ws.addEventListener("message", evt => {
        const msg = JSON.parse(evt.data.toString());
        console.log("the messagerrrrr:", msg);
    });

    ws.on("error", console.error);

    ws.on("close", () => {
        players.delete(id);
        event_queue.push({
            label: "PlayerLeft",
            id
        });
    });
});

let previous_timestamp = performance.now();
const tick = () => {
    const timestamp = performance.now();
    const delta_time = (timestamp - previous_timestamp) / 1000;
    previous_timestamp = timestamp;

    joined_players.clear();
    left_players.clear();

    for (const evt of event_queue) {
        switch (evt.label) {
            case "PlayerJoined": {
                joined_players.add(evt.id);
            } break;
            case "PlayerLeft": {
                if (!joined_players.delete(evt.id))
                    left_players.add(evt.id);
            } break;
        }
    }

    // tell new players about themselves and each other
    joined_players.forEach(id => {
        const player = players.get(id);
        if (player !== undefined) {
            common.send_ws_message<common.ClientInit>(player.ws, {
                label: "ClientInit",
                id: player.id,
                hex_color: player.hex_color,
                location: player.location
            });

            players.forEach(other_player => {
                if (id !== other_player.id) {
                    common.send_ws_message<common.PlayerJoined>(player.ws, {
                        label: "PlayerJoined",
                        hex_color: other_player.hex_color,
                        id: other_player.id,
                        location: other_player.location
                    });
                }
            });
        }
    });

    // handle joiners
    joined_players.forEach(id => {
        const player = players.get(id);
        if (player !== undefined) {
            players.forEach(other_player => {
                if (id !== other_player.id) {
                    common.send_ws_message<common.PlayerJoined>(player.ws, {
                        label: "PlayerJoined",
                        hex_color: other_player.hex_color,
                        id: other_player.id,
                        location: other_player.location
                    });
                }
            });
        }
    });

    // handle leavers
    left_players.forEach(id => {
        players.forEach(player => {
            common.send_ws_message<common.PlayerLeft>(player.ws, {
                label: "PlayerLeft",
                id: id
            });
        });
    });

    const tick_time = performance.now() - timestamp;
    event_queue.length = 0;

    setTimeout(tick, Math.max(0, 1000 / SERVER_FPS - tick_time));
};

setTimeout(tick, 1000 / SERVER_FPS);

console.log(`im listening on ws://0.0.0.0:${common.SERVER_PORT} :3`);
