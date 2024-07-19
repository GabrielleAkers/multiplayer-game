import { WebSocketServer, WebSocket } from "ws";
import * as common from "./common.mjs";
import { Vector2 } from "./lib/vector2.js";
import { IPlayer, Movement, Player } from "./lib/player.js";
import { Constructor, get_random, random_hexcolor, send_ws_message } from "./lib/util.js";
import { PlayerEvent, PlayerInit, PlayerJoined, PlayerLeft, PlayerMove, is_client_move } from "./lib/event.js";

const MAX_CONNECTIONS = 10;
const SERVER_FPS = 60;

class WsPlayer extends Player {
    constructor(public ws: WebSocket, ...args: ConstructorParameters<typeof Player>) {
        super(...args);
    }
}

const players = new Map<number, WsPlayer>();
let current_id = 0;
const joined_players = new Set<number>();
const left_players = new Set<number>();

const event_queue: Array<PlayerEvent> = [];

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
    const location = new Vector2(
        get_random(0.1 * common.CANVAS_WIDTH + 2 * common.PLAYER_RADIUS, 0.9 * common.CANVAS_WIDTH - 2 * common.PLAYER_RADIUS),
        get_random(0.1 * common.CANVAS_HEIGHT + 2 * common.PLAYER_RADIUS, 0.9 * common.CANVAS_HEIGHT - 2 * common.PLAYER_RADIUS)
    );
    const movement = new Movement(false, Vector2.from_vec2(location));
    const style = { hex_color: random_hexcolor() };

    const player = new WsPlayer(ws, id, location, movement, style);
    players.set(id, player);
    event_queue.push({
        label: "PlayerJoined",
        id,
        style,
        location
    });

    ws.addEventListener("message", evt => {
        const msg = JSON.parse(evt.data.toString());
        // console.log("the messagerrrrr:", msg);
        if (is_client_move(msg)) {
            console.log("the moverrrr", msg);
            player.movement.copy(msg.movement);
        }
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
            send_ws_message<PlayerInit>(player.ws, {
                label: "PlayerInit",
                id: player.id,
                style: player.style,
                location: player.location
            });

            players.forEach(other_player => {
                if (id !== other_player.id) {
                    send_ws_message<PlayerJoined>(player.ws, {
                        label: "PlayerJoined",
                        style: other_player.style,
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
                    send_ws_message<PlayerJoined>(other_player.ws, {
                        label: "PlayerJoined",
                        style: player.style,
                        id: player.id,
                        location: player.location
                    });
                }
            });
        }
    });

    // handle leavers
    left_players.forEach(id => {
        players.forEach(player => {
            send_ws_message<PlayerLeft>(player.ws, {
                label: "PlayerLeft",
                id
            });
        });
    });

    // handle movement
    players.forEach(player => {
        players.forEach(other_player => {
            if (player.id !== other_player.id && player.location.distance(player.movement.target) > 0.1 * common.PLAYER_RADIUS) {
                send_ws_message<PlayerMove>(other_player.ws, {
                    label: "PlayerMove",
                    id: player.id,
                    location: player.location,
                    movement: player.movement
                });
            }
        });
    });

    players.forEach(player => player.update_position(delta_time));


    const tick_time = performance.now() - timestamp;
    event_queue.length = 0;

    setTimeout(tick, Math.max(0, 1000 / SERVER_FPS - tick_time));
};

setTimeout(tick, 1000 / SERVER_FPS);

console.log(`im listening on ws://0.0.0.0:${common.SERVER_PORT} :3`);
