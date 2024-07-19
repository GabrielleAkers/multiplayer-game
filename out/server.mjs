import { WebSocketServer } from "ws";
import * as common from "./common.mjs";
const MAX_CONNECTIONS = 10;
const SERVER_FPS = 60;
const players = new Map();
let current_id = 0;
const joined_players = new Set();
const left_players = new Set();
const event_queue = [];
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
    const movement = { is_moving: false, target: location };
    const hex_color = common.random_hexcolor();
    const player = {
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
        // console.log("the messagerrrrr:", msg);
        if (common.is_player_move(msg)) {
            console.log("the moverrrr", msg);
            player.movement = msg.movement;
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
            case "PlayerJoined":
                {
                    joined_players.add(evt.id);
                }
                break;
            case "PlayerLeft":
                {
                    if (!joined_players.delete(evt.id))
                        left_players.add(evt.id);
                }
                break;
        }
    }
    // tell new players about themselves and each other
    joined_players.forEach(id => {
        const player = players.get(id);
        if (player !== undefined) {
            common.send_ws_message(player.ws, {
                label: "PlayerInit",
                id: player.id,
                hex_color: player.hex_color,
                location: player.location
            });
            players.forEach(other_player => {
                if (id !== other_player.id) {
                    common.send_ws_message(player.ws, {
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
                    common.send_ws_message(other_player.ws, {
                        label: "PlayerJoined",
                        hex_color: player.hex_color,
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
            common.send_ws_message(player.ws, {
                label: "PlayerLeft",
                id
            });
        });
    });
    // handle movement
    players.forEach(player => {
        players.forEach(other_player => {
            if (player.id !== other_player.id && common.v2dist(player.location, player.movement.target) > 0.1 * common.PLAYER_RADIUS) {
                common.send_ws_message(other_player.ws, {
                    label: "PlayerMove",
                    id: player.id,
                    location: player.location,
                    movement: player.movement
                });
            }
        });
    });
    players.forEach(player => common.update_player_position(player, delta_time));
    const tick_time = performance.now() - timestamp;
    event_queue.length = 0;
    setTimeout(tick, Math.max(0, 1000 / SERVER_FPS - tick_time));
};
setTimeout(tick, 1000 / SERVER_FPS);
console.log(`im listening on ws://0.0.0.0:${common.SERVER_PORT} :3`);
//# sourceMappingURL=server.mjs.map