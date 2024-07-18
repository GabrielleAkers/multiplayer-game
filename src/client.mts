import * as common from "./common.mjs";

(async () => {
    const game_canvas = document.getElementById("game_canvas") as HTMLCanvasElement | null;
    if (game_canvas === null) throw new Error("No game canvas found");
    game_canvas.width = common.CANVAS_WIDTH;
    game_canvas.height = common.CANVAS_HEIGHT;
    const ctx = game_canvas.getContext("2d");
    if (ctx === null) throw new Error("2d canvas not found");

    let ws: WebSocket | undefined = new WebSocket(`ws://${window.location.hostname}:${common.SERVER_PORT}`);
    const players = new Map<number, common.Player>();
    let player: common.Player | undefined = undefined;

    ws.addEventListener("message", evt => {
        const msg = JSON.parse(evt.data);
        if (player === undefined) {
            if (common.is_client_init(msg)) {
                player = {
                    id: msg.id,
                    location: msg.location,
                    hex_color: msg.hex_color,
                    movement: { is_moving: false, target: { x: 0, y: 0 } }
                };
                players.set(msg.id, player);
            } else {
                console.log("i gets weird message o.O", msg);
                ws?.close();
            }
        } else {
            if (common.is_player_joined(msg)) {
                players.set(msg.id, {
                    id: msg.id,
                    location: msg.location,
                    hex_color: msg.hex_color,
                    movement: { is_moving: false, target: { x: 0, y: 0 } }
                });
            } else if (common.is_player_left(msg)) {
                players.delete(msg.id);
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

    let previous_timestamp = 0;
    const anim_fram = (timestamp: number) => {
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
            // draw players
            players.forEach(p => {
                if (player !== undefined && player.id !== p.id) {
                    ctx.beginPath();
                    ctx.arc(p.location.x, p.location.y, common.PLAYER_RADIUS, 0, 2 * Math.PI);
                    ctx.fillStyle = p.hex_color;
                    ctx.fill();
                    ctx.stroke();
                }
            });

            if (player !== undefined) {
                ctx.beginPath();
                ctx.arc(player.location.x, player.location.y, common.PLAYER_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = player.hex_color;
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        }
        window.requestAnimationFrame(anim_fram);
    };
    window.requestAnimationFrame(timestamp => {
        previous_timestamp = timestamp;
        window.requestAnimationFrame(anim_fram);
    });
})();
