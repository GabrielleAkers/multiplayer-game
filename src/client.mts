import * as common from "./common.mjs";
import { draw_circle, draw_line } from "./lib/draw.js";
import { is_player_init, is_player_joined, is_player_left, is_player_move, ClientMove, ClientLook, is_player_look } from "./lib/event.js";
import { GameLoop } from "./lib/gameloop.js";
import { DIRECTION_VECTORS, Direction, Input } from "./lib/input.js";
import { Movement, Player } from "./lib/player.js";
import { is_array, is_number, send_ws_message } from "./lib/util.js";
import { Vector2 } from "./lib/vector2.js";

const game_canvas = document.getElementById("game_canvas") as HTMLCanvasElement | null;
if (game_canvas === null) throw new Error("No game canvas found");
game_canvas.width = common.CANVAS_WIDTH;
game_canvas.height = common.CANVAS_HEIGHT;
const ctx = game_canvas.getContext("2d");
if (ctx === null) throw new Error("2d canvas not found");

let ws: WebSocket | undefined = new WebSocket(`ws://${window.location.hostname}:${common.SERVER_PORT}`);

const players = new Map<number, Player>();
let player: Player | undefined = undefined;
const input: Input = new Input(game_canvas);

ws.addEventListener("message", evt => {
    const msg = JSON.parse(evt.data);
    if (player === undefined) {
        if (is_player_init(msg)) {
            player = new Player(msg.id, Vector2.from_vec2(msg.location), new Movement(false, 0), new Vector2(0, 0), msg.style);
            players.set(msg.id, player);
        } else {
            console.log("i gets weird message o.O", msg);
            ws?.close();
        }
    } else {
        if (is_player_joined(msg)) {
            players.set(msg.id, new Player(msg.id, Vector2.from_vec2(msg.location), new Movement(false, 0), new Vector2(0, 0), msg.style));
        } else if (is_player_left(msg)) {
            players.delete(msg.id);
        } else if (is_player_move(msg)) {
            // console.log("moving time :3", msg);
            const p = players.get(msg.id);
            if (p !== undefined) {
                p.location.copy(msg.location);
                p.movement.copy(msg.movement);
            }
        } else if (is_player_look(msg)) {
            const p = players.get(msg.id);
            if (p !== undefined) {
                p.lookat.copy(msg.at);
            }
        } else {
            console.log("i gets weird message O.o", msg);
            ws?.close();
        }
    }
});

ws.addEventListener("close", evt => {
    console.log("ws close", evt);
    ws = undefined;
});

ws.addEventListener("error", evt => {
    console.error("ws error", evt);
});

const update_state = (time_step: number) => {
    players.forEach(p => {
        if (player !== undefined && player.id !== p.id) {
            if (p.movement.is_moving) {
                p.update_position(time_step / 1000);
            }
        }
    });
    if (player !== undefined && ws !== undefined) {
        if (is_number(input.direction)) {
            player.movement.is_moving = true;
            player.movement.direction = input.direction;
            player.update_position(time_step / 1000);
            send_ws_message<ClientMove>(ws, {
                label: "ClientMove",
                movement: player.movement
            });
        }
        else if (is_array(input.direction)) {
            if (input.direction.indexOf(Direction.UP) !== -1) {
                if (input.direction.indexOf(Direction.LEFT) !== -1) {
                    player.movement.is_moving = true;
                    player.movement.direction = Direction.UP_LEFT;
                }
                if (input.direction.indexOf(Direction.RIGHT) !== -1) {
                    player.movement.is_moving = true;
                    player.movement.direction = Direction.UP_RIGHT;
                }
            }
            if (input.direction.indexOf(Direction.DOWN) !== -1) {
                if (input.direction.indexOf(Direction.LEFT) !== -1) {
                    player.movement.is_moving = true;
                    player.movement.direction = Direction.DOWN_LEFT;
                }
                if (input.direction.indexOf(Direction.RIGHT) !== -1) {
                    player.movement.is_moving = true;
                    player.movement.direction = Direction.DOWN_RIGHT;
                }
            }
            player.update_position(time_step / 1000);
            send_ws_message<ClientMove>(ws, {
                label: "ClientMove",
                movement: player.movement
            });
        }
        else {
            if (player.movement.is_moving) {
                player.movement.is_moving = false;
                send_ws_message<ClientMove>(ws, {
                    label: "ClientMove",
                    movement: player.movement
                });
            }
        }
        if (!player.lookat.equals(input.cursor_position)) {
            player.lookat.copy(input.cursor_position);
            send_ws_message<ClientLook>(ws, {
                label: "ClientLook",
                at: player.lookat
            });
        }
    }
};

const draw_frame = () => {
    ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);

    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (ws === undefined) {
        const label = "Not connected (ᗒᗣᗕ)";
        const size = ctx.measureText(label);
        ctx.font = "52px bold";
        ctx.fillStyle = "white";
        ctx.fillText(label, ctx.canvas.width / 2 - size.width / 2, ctx.canvas.height / 2);
    } else {
        // draw other players
        players.forEach(p => {
            if (player !== undefined && player.id !== p.id) {
                draw_line(ctx, p.location, p.lookat, p.style.hex_color, [], 1);
                draw_circle(ctx, p.location, common.PLAYER_RADIUS, p.style.hex_color, "grey", 1);
            }
        });

        // draw self
        if (player !== undefined) {
            draw_line(ctx, player.location, player.lookat, player.style.hex_color, [], 1);
            draw_circle(ctx, player.location, common.PLAYER_RADIUS, player.style.hex_color, "white", 3);
        }
    }
};

const game_loop = new GameLoop(update_state, draw_frame);
game_loop.start();
