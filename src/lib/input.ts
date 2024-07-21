import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../common.mjs";
import { IVector2, Vector2 } from "./vector2.js";

export enum Direction {
    LEFT = 0,
    RIGHT,
    UP,
    DOWN,
    UP_LEFT,
    UP_RIGHT,
    DOWN_LEFT,
    DOWN_RIGHT,
    COUNT
}

export const DIRECTION_VECTORS: IVector2[] = (() => {
    const vectors = Array(Direction.COUNT);
    vectors[Direction.LEFT] = { x: -1, y: 0 }; // screen space
    vectors[Direction.RIGHT] = { x: 1, y: 0 };
    vectors[Direction.UP] = { x: 0, y: -1 };
    vectors[Direction.DOWN] = { x: 0, y: 1 };
    vectors[Direction.UP_LEFT] = { x: -1, y: -1 };
    vectors[Direction.UP_RIGHT] = { x: 1, y: -1 };
    vectors[Direction.DOWN_LEFT] = { x: -1, y: 1 };
    vectors[Direction.DOWN_RIGHT] = { x: 1, y: 1 };
    return vectors;
})();

export const DIRECTION_KEYS: { [key: string]: Direction; } = {
    "KeyA": Direction.LEFT,
    "KeyD": Direction.RIGHT,
    "KeyW": Direction.UP,
    "KeyS": Direction.DOWN
};

export class Input {
    private held_keys: (keyof typeof DIRECTION_KEYS)[] = [];
    private mouse_pos: Vector2 = new Vector2(0, 0);
    constructor(canvas: HTMLCanvasElement) {
        document.addEventListener("keydown", evt => {
            if (Object.hasOwn(DIRECTION_KEYS, evt.code))
                this.on_key_pressed(evt.code);
        });

        document.addEventListener("keyup", evt => {
            if (Object.hasOwn(DIRECTION_KEYS, evt.code))
                this.on_key_released(evt.code);
        });

        canvas.addEventListener("mousemove", evt => {
            this.mouse_pos.set(evt.clientX - canvas.offsetLeft, evt.pageY - canvas.offsetTop);
        });
    }

    get cursor_position() {
        return this.mouse_pos;
    }

    get direction() {
        if (this.held_keys.length > 1)
            return [DIRECTION_KEYS[this.held_keys[0]], DIRECTION_KEYS[this.held_keys[1]]];
        return DIRECTION_KEYS[this.held_keys[0]];
    }

    private on_key_pressed(key: keyof typeof DIRECTION_KEYS) {
        if (this.held_keys.indexOf(key) === -1)
            this.held_keys.unshift(key);
    }

    private on_key_released(key: keyof typeof DIRECTION_KEYS) {
        const idx = this.held_keys.indexOf(key);
        if (idx === -1) return;
        this.held_keys.splice(idx, 1);
    }
}
