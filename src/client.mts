import * as common from "./common.mjs";
import { draw_circle, draw_circle_section, draw_line } from "./lib/draw.js";
import { is_player_init, is_player_joined, is_player_left, is_player_move, ClientMove, ClientLook, is_player_look, is_player_sees_you } from "./lib/event.js";
import { GameLoop } from "./lib/gameloop.js";
import { Input } from "./lib/components/input.js";
import { Player } from "./lib/gameobjects/player.js";
import { Movement } from "./lib/components/movement.js";
import { Transform } from "./lib/components/transform.js";
import { is_number, send_ws_message } from "./lib/util.js";
import { Vector2 } from "./lib/vector2.js";
import { GameObject } from "./lib/gameobject.js";

const game_canvas = document.getElementById("game_canvas") as HTMLCanvasElement | null;
if (game_canvas === null) throw new Error("No game canvas found");
game_canvas.width = common.CANVAS_WIDTH;
game_canvas.height = common.CANVAS_HEIGHT;
const ctx = game_canvas.getContext("2d");
if (ctx === null) throw new Error("2d canvas not found");

const overlay_canvas = document.getElementById("overlay_canvas") as HTMLCanvasElement | null;
if (overlay_canvas === null) throw new Error("No overlay canvas found");
overlay_canvas.width = common.CANVAS_WIDTH;
overlay_canvas.height = common.CANVAS_HEIGHT;
const overlay_ctx = overlay_canvas.getContext("2d");
if (overlay_ctx === null) throw new Error("2d overlay canvas not found");

let ws: WebSocket | undefined = new WebSocket(`ws://${window.location.hostname}:${common.SERVER_PORT}`);

const main_scene = new GameObject(0, new Transform(Vector2.zero, Vector2.zero));
let player: Player | undefined = undefined;
const input: Input = new Input(overlay_canvas);

ws.addEventListener("message", evt => {
    const msg = JSON.parse(evt.data);
    if (player === undefined) {
        if (is_player_init(msg)) {
            player = new Player(msg.id, new Transform(Vector2.from_vec2(msg.location)), new Movement(false, 0), msg.style);
            main_scene.add_child(player);
        } else {
            console.log("i gets weird message o.O", msg);
            ws?.close();
        }
    } else {
        if (is_player_joined(msg)) {
            const new_player = new Player(msg.id, new Transform(Vector2.from_vec2(msg.location)), new Movement(false, 0), msg.style);
            main_scene.add_child(new_player);
        } else if (is_player_left(msg)) {
            main_scene.remove_child_by_id(msg.id);
        } else if (is_player_move(msg)) {
            // console.log("moving time :3", msg);
            const p = main_scene.get_child<Player>(msg.id);
            if (p !== undefined) {
                p.transform.position.copy(msg.location);
                p.movement.copy(msg.movement);
            }
        } else if (is_player_look(msg)) {
            const p = main_scene.get_child(msg.id);
            if (p !== undefined) {
                p.transform.lookat(msg.at);
            }
        } else if (is_player_sees_you(msg)) {
            console.log("scary!!! you are seen by", msg.id);
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
    main_scene.get_children<Player>().forEach(p => {
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
        else {
            if (player.movement.is_moving) {
                player.movement.is_moving = false;
                send_ws_message<ClientMove>(ws, {
                    label: "ClientMove",
                    movement: player.movement
                });
            }
        }
        if (!input.cursor_position.equals(player.transform.rotation)) {
            player.transform.lookat(input.cursor_position);
            send_ws_message<ClientLook>(ws, {
                label: "ClientLook",
                at: player.transform.rotation
            });
        }

        main_scene.get_children<Player>().forEach(p => {
            if (player !== undefined && player.id !== p.id) {
                if (common.in_cone(player, p)) {
                    console.log("player visible!!!!!!!!!!", p);
                }
            }
        });
    }
};

const draw_frame = () => {
    ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);
    overlay_ctx.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);

    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    overlay_ctx.fillStyle = "#000000";
    overlay_ctx.fillRect(0, 0, overlay_ctx.canvas.width, overlay_ctx.canvas.height);

    if (ws === undefined) {
        const label = "Not connected (ᗒᗣᗕ)";
        const size = ctx.measureText(label);
        ctx.font = "52px bold";
        ctx.fillStyle = "white";
        ctx.fillText(label, ctx.canvas.width / 2 - size.width / 2, ctx.canvas.height / 2);
    } else {
        // draw other players
        main_scene.get_children<Player>().forEach(p => {
            if (player !== undefined && player.id !== p.id) {
                draw_circle(ctx, p.transform.position, common.PLAYER_RADIUS, p.style.hex_color, "grey", 1);
            }
        });

        // draw self
        if (player !== undefined) {
            // player facing direction
            // draw_line(ctx, player.transform.position, player.transform.rotation, player.style.hex_color, [], 1);
            // player circle
            draw_circle(ctx, player.transform.position, common.PLAYER_RADIUS, player.style.hex_color, "white", 1);

            // draw vision cone
            overlay_ctx.globalCompositeOperation = "destination-out";
            draw_circle_section(overlay_ctx,
                player.transform.position,
                0,
                common.PLAYER_VISION_DISTANCE,
                player.transform.angle - common.PLAYER_VISION_ANGLE,
                player.transform.angle + common.PLAYER_VISION_ANGLE,
                ""
            );
            // players can always see a small area right around their character
            overlay_ctx.beginPath();
            overlay_ctx.arc(player.transform.position.x, player.transform.position.y, common.PLAYER_RADIUS + 5, 0, 2 * Math.PI);
            overlay_ctx.fill();
            overlay_ctx.globalCompositeOperation = "source-over";
        }
    }
};

const game_loop = new GameLoop(update_state, draw_frame);
game_loop.start();
