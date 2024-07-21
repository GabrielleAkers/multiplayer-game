import type { IVector2 } from "./vector2.js";

export type DrawLineProps = [
    from: IVector2,
    to: IVector2,
    stroke_style: string | CanvasGradient | CanvasPattern,
    line_dash: Iterable<number>,
    line_width: number
];

export function draw_line(ctx: CanvasRenderingContext2D, ...[from, to, stroke_style, line_dash, line_width]: DrawLineProps) {
    ctx.beginPath();
    ctx.strokeStyle = stroke_style;
    ctx.setLineDash(line_dash);
    ctx.lineWidth = line_width;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.closePath();
}

export type DrawCircleProps = [
    location: IVector2,
    radius: number,
    fill_style: string | CanvasGradient | CanvasPattern,
    stroke_style: string | CanvasGradient | CanvasPattern,
    line_width: number
];

export function draw_circle(ctx: CanvasRenderingContext2D, ...[location, radius, fill_style, stroke_style, line_width]: DrawCircleProps) {
    ctx.beginPath();
    ctx.arc(location.x, location.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill_style;
    ctx.fill();
    ctx.strokeStyle = stroke_style;
    ctx.lineWidth = line_width;
    ctx.stroke();
    ctx.closePath();
}
