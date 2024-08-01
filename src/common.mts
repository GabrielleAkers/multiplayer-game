import { Player } from "./lib/gameobjects/player.js";
import { Vector2 } from "./lib/vector2.js";

export const SERVER_PORT = 7070;
export const TARGET_FPS = 60;
export const CANVAS_SCALE = 100;
export const CANVAS_WIDTH = 16 * CANVAS_SCALE;
export const CANVAS_HEIGHT = 9 * CANVAS_SCALE;
export const PLAYER_RADIUS = 10;
export const PLAYER_SPEED = 200;
export const PLAYER_VISION_DISTANCE = 100;
export const PLAYER_VISION_ANGLE = Math.PI / 3; // angle on either side of facing direction player can see

export const in_cone = (p1: Player, p2: Player) => {
    if (p2.transform.position.distance(p1.transform.position) < PLAYER_VISION_DISTANCE) {
        const between = Vector2.from_vec2(p2.transform.position).subtract(p1.transform.position);
        const looking = Vector2.from_vec2(p1.transform.rotation).subtract(p1.transform.position);
        if (looking.angle_between(between) < PLAYER_VISION_ANGLE) return true;
    }
    return false;
};
