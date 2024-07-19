import * as common from "./common.mjs";
import { is_player_init, is_player_joined, is_player_left, is_player_move, ClientMove } from "./lib/event.js";
import { Movement, Player } from "./lib/player.js";
import { send_ws_message } from "./lib/util.js";
import { Vector2 } from "./lib/vector2.js";

(async () => {
    const game_canvas = document.getElementById("game_canvas") as HTMLCanvasElement | null;
    if (game_canvas === null) throw new Error("No game canvas found");
    game_canvas.width = common.CANVAS_WIDTH;
    game_canvas.height = common.CANVAS_HEIGHT;
    const ctx = game_canvas.getContext("2d");
    if (ctx === null) throw new Error("2d canvas not found");

    let ws: WebSocket | undefined = new WebSocket(`ws://${window.location.hostname}:${common.SERVER_PORT}`);

    const players = new Map<number, Player>();
    let player: Player | undefined = undefined;

    ws.addEventListener("message", evt => {
        const msg = JSON.parse(evt.data);
        if (player === undefined) {
            if (is_player_init(msg)) {
                player = new Player(msg.id, Vector2.from_vec2(msg.location), new Movement(false, Vector2.from_vec2(msg.location)), msg.style);
                players.set(msg.id, player);
            } else {
                console.log("i gets weird message o.O", msg);
                ws?.close();
            }
        } else {
            if (is_player_joined(msg)) {
                players.set(msg.id, new Player(msg.id, Vector2.from_vec2(msg.location), new Movement(false, Vector2.from_vec2(msg.location)), msg.style));
            } else if (is_player_left(msg)) {
                players.delete(msg.id);
            } else if (is_player_move(msg)) {
                console.log("moving time :3", msg);
                const p = players.get(msg.id);
                if (p !== undefined) {
                    p.location.copy(msg.location);
                    p.movement.copy(msg.movement);
                }
            } else {
                console.log("i gets weird message O.o", msg);
                ws?.close();
            }
        }
    });

    ws.addEventListener("open", evt => {
        console.log("ws open", evt);
    });

    ws.addEventListener("close", evt => {
        console.log("ws close", evt);
        ws = undefined;
    });

    ws.addEventListener("error", evt => {
        console.error("ws error", evt);
    });

    game_canvas.addEventListener("click", evt => {
        if (ws !== undefined && player !== undefined) {
            player.movement.is_moving = true;
            player.movement.target.copy({ x: evt.clientX - game_canvas.offsetLeft, y: evt.clientY - game_canvas.offsetTop });
            // console.log("clicky ^.^", player.movement.target);

            send_ws_message<ClientMove>(ws, {
                label: "ClientMove",
                movement: player.movement
            });
        }
    });

    let previous_timestamp = 0;
    const draw_frame = (timestamp: number) => {
        const delta_time = (timestamp - previous_timestamp) / 1000;
        previous_timestamp = timestamp;

        // construct canvas
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
                    if (p.movement.is_moving) p.update_position(delta_time);
                    ctx.beginPath();
                    ctx.arc(p.location.x, p.location.y, common.PLAYER_RADIUS, 0, 2 * Math.PI);
                    ctx.fillStyle = p.style.hex_color;
                    ctx.fill();
                    ctx.strokeStyle = "grey";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // draw self
            if (player !== undefined) {
                if (player.movement.is_moving) player.update_position(delta_time);
                ctx.beginPath();
                ctx.arc(player.location.x, player.location.y, common.PLAYER_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = player.style.hex_color;
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
        window.requestAnimationFrame(draw_frame);
    };
    window.requestAnimationFrame(timestamp => {
        previous_timestamp = timestamp;
        window.requestAnimationFrame(draw_frame);
    });
})();
