import { type IVector2, Vector2 } from "../vector2.js";

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
    private held_direction: (keyof typeof DIRECTION_KEYS)[] = [];
    private mouse_pos: Vector2 = new Vector2(0, 0);
    constructor(canvas: HTMLCanvasElement) {
        document.addEventListener("keydown", evt => {
            if (Object.hasOwn(DIRECTION_KEYS, evt.code))
                this.on_direction_key_pressed(evt.code);
        });

        document.addEventListener("keyup", evt => {
            if (Object.hasOwn(DIRECTION_KEYS, evt.code))
                this.on_direction_key_released(evt.code);
        });

        canvas.addEventListener("mousemove", evt => {
            this.mouse_pos.set(evt.clientX - canvas.offsetLeft, evt.pageY - canvas.offsetTop);
        });
    }

    get cursor_position() {
        return this.mouse_pos;
    }

    get direction() {
        if (this.held_direction.length > 1) {
            const checked = [DIRECTION_KEYS[this.held_direction[0]], DIRECTION_KEYS[this.held_direction[1]]];
            if (checked.indexOf(Direction.UP) !== -1) {
                if (checked.indexOf(Direction.LEFT) !== -1) {
                    return Direction.UP_LEFT;
                }
                if (checked.indexOf(Direction.RIGHT) !== -1) {
                    return Direction.UP_RIGHT;
                }
            }
            if (checked.indexOf(Direction.DOWN) !== -1) {
                if (checked.indexOf(Direction.LEFT) !== -1) {
                    return Direction.DOWN_LEFT;
                }
                if (checked.indexOf(Direction.RIGHT) !== -1) {
                    return Direction.DOWN_RIGHT;
                }
            }
        }
        return DIRECTION_KEYS[this.held_direction[0]];
    }

    private on_direction_key_pressed(key: keyof typeof DIRECTION_KEYS) {
        if (this.held_direction.indexOf(key) === -1)
            this.held_direction.unshift(key);
    }

    private on_direction_key_released(key: keyof typeof DIRECTION_KEYS) {
        const idx = this.held_direction.indexOf(key);
        if (idx === -1) return;
        this.held_direction.splice(idx, 1);
    }
}
