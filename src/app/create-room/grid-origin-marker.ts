import { Rect, DrawType, RectEventData, Grid, Point } from '../canvas-framework/types';
import { MutableRefObject } from 'react';

export class GridOriginMarker implements Rect {
    x: number;    y: number;
    h: number;
    w: number;
    drawType = DrawType.Fill;
    renderPriority = 2;
    color = '#f00';
    alpha = 0.25;

    constructor(
        private canvasRef: MutableRefObject<HTMLCanvasElement>,
        private onOriginUpdate: (origin: Point) => void
    ) {}

    public handleDrag({ mouseX, mouseY, xOffset, yOffset }: RectEventData): void {
        const newOrigin = { x: mouseX - xOffset, y: mouseY - yOffset };
        this.onOriginUpdate(newOrigin);
    }

    public handleHover(): void {
        this.canvasRef.current.style.cursor = 'pointer';
    }

    public handleHoverEnd(): void {
        this.canvasRef.current.style.cursor = 'auto';
    }
}
