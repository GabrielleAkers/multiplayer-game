import { TARGET_FPS } from "../common.mjs";

// based on http://gameprogrammingpatterns.com/game-loop.html
export class GameLoop {
    private update: (time_step: number) => any;
    private render: Function;
    private req_anim_frame_id: number | null = null;
    private is_running: boolean = false;
    private last_frame_time: number = 0;
    private accum_time: number = 0;
    private time_step: number = 1000 / TARGET_FPS;
    constructor(update: (time_step: number) => any, render: Function) {
        this.update = update;
        this.render = render;
    }

    main = (timestamp: number) => {
        if (!this.is_running) return;

        const delta_time = timestamp - this.last_frame_time;
        this.last_frame_time = timestamp;

        this.accum_time += delta_time;

        while (this.accum_time >= this.time_step) {
            this.update(this.time_step);
            this.accum_time -= this.time_step;
        }

        this.render();
        this.req_anim_frame_id = requestAnimationFrame(this.main);
    };

    start() {
        if (!this.is_running) {
            this.is_running = true;

            this.req_anim_frame_id = requestAnimationFrame(this.main);
        }
    }

    stop() {
        if (this.req_anim_frame_id) {
            cancelAnimationFrame(this.req_anim_frame_id);
        }
        this.is_running = false;
    }
}
