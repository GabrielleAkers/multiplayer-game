import { WebSocketServer, WebSocket } from "ws";
import * as common from "./common.mjs";
import { Vector2 } from "./lib/vector2.js";
import { Player } from "./lib/gameobjects/player.js";
import { Movement } from "./lib/components/movement.js";
import { get_random, random_hexcolor, send_ws_message as _send_ws_message, format_time, type KeysMatching, IWsMessage } from "./lib/util.js";
import { PlayerEvent, PlayerInit, PlayerJoined, PlayerLeft, PlayerLook, PlayerMove, PlayerSeesYou, is_client_look, is_client_move } from "./lib/event.js";
import { Transform } from "./lib/components/transform.js";

const MAX_CONNECTIONS = 10;

interface IAverage {
    value: number;
    push_sample: (v: number) => void;
}

class Average implements IAverage {
    private samples: number[] = new Array(5);
    value: number = 0;
    push_sample(v: number) {
        this.samples.unshift(v) > 5 ? this.samples.pop() : null;
        this.value = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    }
}

interface ITracker {
    value: number;
    increment: (v: number) => void;
}

class Tracker implements ITracker {
    constructor(public value: number) { }
    increment(v: number) {
        this.value += v;
    }
}

interface IPerformanceStats {
    frame_time: IAverage;
    num_connections: ITracker;
    bytes_sent: ITracker;
    bytes_received: ITracker;
    messages_sent: ITracker;
    messages_received: ITracker;
    ticks: ITracker;
    started_at: number;
    uptime: number;
}

class PerformanceStats implements IPerformanceStats {
    frame_time: IAverage = new Average();
    num_connections: Tracker = new Tracker(0);
    bytes_sent: Tracker = new Tracker(0);
    bytes_received: Tracker = new Tracker(0);
    messages_sent: ITracker = new Tracker(0);
    messages_received: ITracker = new Tracker(0);
    ticks: Tracker = new Tracker(0);
    started_at: number = 0;
    uptime: number = 0;
    constructor() { }
}

class ServerPlayer extends Player {
    constructor(
        public ws: WebSocket,
        public new_movement: Movement,
        public new_lookat: Vector2,
        public can_see: Set<number>,
        ...args: ConstructorParameters<typeof Player>
    ) {
        super(...args);
    }
}

const players = new Map<number, ServerPlayer>();
let current_id = 0;
const joined_players = new Set<number>();
const left_players = new Set<number>();

const event_queue: Array<PlayerEvent> = [];

const wss = new WebSocketServer({
    host: "0.0.0.0",
    port: common.SERVER_PORT
});

const perf_stats = new PerformanceStats();
const send_ws_message = <T extends IWsMessage>(ws: WebSocket, message: T) => {
    const r = _send_ws_message(ws, message);
    perf_stats.messages_sent.increment(1);
    perf_stats.bytes_sent.increment(r);
    return r;
};

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
    const transform = new Transform(location);
    const movement = new Movement(false, 0);
    const lookat = new Vector2(0, 0);
    const style = { hex_color: random_hexcolor() };

    const player = new ServerPlayer(ws, new Movement(false, 0), new Vector2(1, 0), new Set<number>(), id, transform, movement, style);
    players.set(id, player);
    event_queue.push({
        label: "PlayerJoined",
        id,
        style,
        location,
        lookat
    });
    perf_stats.num_connections.increment(1);

    ws.addEventListener("message", evt => {
        const data_str = evt.data.toString();
        const msg = JSON.parse(data_str);
        const l = Buffer.from(data_str).length;
        perf_stats.bytes_received.increment(l);
        perf_stats.messages_received.increment(1);
        // console.log("the messagerrrrr:", msg);
        if (is_client_move(msg)) {
            // console.log("the moverrrr", msg);
            player.new_movement.copy(msg.movement);
        }
        if (is_client_look(msg)) {
            player.new_lookat.copy(msg.at);
        }
    });

    ws.on("error", console.error);

    ws.on("close", () => {
        players.delete(id);
        event_queue.push({
            label: "PlayerLeft",
            id
        });
        perf_stats.num_connections.increment(-1);
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
                location: player.transform.position
            });

            players.forEach(other_player => {
                if (id !== other_player.id) {
                    send_ws_message<PlayerJoined>(player.ws, {
                        label: "PlayerJoined",
                        style: other_player.style,
                        id: other_player.id,
                        location: other_player.transform.position,
                        lookat: other_player.transform.rotation
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
                        location: player.transform.position,
                        lookat: player.transform.rotation,
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
        if (!player.movement.equals(player.new_movement)) {
            player.movement.copy(player.new_movement);
            players.forEach(other_player => {
                if (player.id !== other_player.id) {
                    send_ws_message<PlayerMove>(other_player.ws, {
                        label: "PlayerMove",
                        id: player.id,
                        location: player.transform.position,
                        movement: player.movement
                    });
                }
            });
        }
    });

    // handle lookat
    players.forEach(player => {
        if (!player.new_lookat.equals(player.transform.rotation)) {
            player.transform.lookat(player.new_lookat);
            players.forEach(other_player => {
                if (player.id !== other_player.id) {
                    send_ws_message<PlayerLook>(other_player.ws, {
                        label: "PlayerLook",
                        id: player.id,
                        at: player.transform.rotation
                    });
                    if (common.in_cone(player, other_player)) {
                        player.can_see.add(other_player.id);
                    } else {
                        player.can_see.delete(other_player.id);
                    }
                }
            });
        }
    });

    players.forEach(player => {
        player.can_see.forEach(id => {
            const p = players.get(id);
            if (p)
                send_ws_message<PlayerSeesYou>(p.ws, {
                    label: "PlayerSeesYou",
                    id: player.id
                });
        });
    });

    players.forEach(player => player.update_position(delta_time));


    const tick_time = performance.now() - timestamp;
    event_queue.length = 0;

    perf_stats.ticks.increment(1);
    perf_stats.frame_time.push_sample(tick_time);
    perf_stats.uptime = process.uptime();

    if (perf_stats.ticks.value % common.TARGET_FPS === 0)
        console.log(`
            frame time: ${perf_stats.frame_time.value}
            connections: ${perf_stats.num_connections.value}
            bytes sent: ${perf_stats.bytes_sent.value}
            bytes received: ${perf_stats.bytes_received.value}
            messages sent: ${perf_stats.messages_sent.value}
            messages received: ${perf_stats.messages_received.value}
            ticks: ${perf_stats.ticks.value}
            uptime: ${format_time(perf_stats.uptime)}
        `);

    setTimeout(tick, Math.max(0, 1000 / common.TARGET_FPS - tick_time));
};

perf_stats.started_at = Date.now();
setTimeout(tick, 1000 / common.TARGET_FPS);

console.log(`im listening on ws://0.0.0.0:${common.SERVER_PORT} :3`);
