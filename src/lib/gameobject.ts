import { type ITransform, Transform } from "./components/transform.js";
import { IVector2 } from "./vector2.js";

export interface IGameObject {
    id: number;
    transform: ITransform;
}

export class GameObject implements IGameObject {
    private children: Map<number, GameObject> = new Map();
    constructor(public id: number, public transform: Transform) { }

    start(delta_time: number, root_object: GameObject) {
        this.children.forEach(child => child.start(delta_time, root_object));

        this.update(delta_time, root_object);
    }

    update(delta_time: number, root_object: GameObject) { }

    render(ctx: CanvasRenderingContext2D) {
        this.draw(ctx);
        this.children.forEach(child => child.render(ctx));
    }

    draw(ctx: CanvasRenderingContext2D) { }

    add_child(game_object: GameObject) {
        this.children.set(game_object.id, game_object);
    }

    remove_child(game_object: GameObject) {
        this.children.delete(game_object.id);
    }

    remove_child_by_id(id: number) {
        this.children.delete(id);
    }

    get_child<T extends GameObject>(id: number): T | undefined {
        return this.children.get(id) as T | undefined;
    }

    get_children<T extends GameObject>(): Map<number, T> {
        return this.children as Map<number, T>;
    }
}
