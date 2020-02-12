import { Rect, Point, Grid, DrawType } from './types';
import { MutableRefObject } from 'react';

export class CanvasRenderEngine {
    private drawInterval: NodeJS.Timeout = null;
    
    public rects: Rect[] = [];
    public scale = 1;
    public viewportOffset: Point = { x: 0, y: 0 };

    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>) {}
    
    public setRects(rects: Rect[]) {
        this.rects = rects;
    }

    public init(): void {
        this.drawInterval = setInterval(() => this.draw(), 10);
    }
        
    public dispose(): void {
        clearInterval(this.drawInterval);
    }

    private getContext(): CanvasRenderingContext2D {
        return this.canvasRef.current.getContext('2d');
    }

    private applyScale(value: number): number {
        return value * this.scale;
    }

    private draw(): void {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.canvasRef.current.scrollWidth, this.canvasRef.current.scrollHeight);
        this.rects.forEach(rect => this.drawRect(rect));
    }

    private drawGrid(grid: Grid): void {
        const ctx = this.getContext();
        ctx.strokeStyle = '#000000';
        for (let x = this.applyScale(grid.x) + this.viewportOffset.x; x <= this.applyScale(grid.x + grid.w * grid.tileSize) + this.viewportOffset.x; x += this.applyScale(grid.tileSize)) {
            ctx.beginPath();
            ctx.moveTo(x, this.applyScale(grid.y) + this.viewportOffset.y);
            ctx.lineTo(x, this.applyScale(grid.y) + this.applyScale(grid.h * grid.tileSize) + this.viewportOffset.y);
            ctx.stroke();
        }
        for (let y = this.applyScale(grid.y) + this.viewportOffset.y; y <= this.applyScale(grid.y + grid.h * grid.tileSize) + this.viewportOffset.y; y += this.applyScale(grid.tileSize)) {
            ctx.beginPath();
            ctx.moveTo(this.applyScale(grid.x) + this.viewportOffset.x, y);
            ctx.lineTo(this.applyScale(grid.x) + this.applyScale(grid.w * grid.tileSize) + this.viewportOffset.x, y);
            ctx.stroke();
        }
    }

    private drawGhost(ghost: Rect, originalRect: Rect): void {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.globalAlpha = 0.5;
        if (ghost.image) ctx.drawImage(ghost.image, this.applyScale(ghost.x) + this.viewportOffset.x, this.applyScale(ghost.y) + this.viewportOffset.y, this.applyScale(ghost.image.width), this.applyScale(ghost.image.height));
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        const beginCoords = this.getCenter(originalRect);
        const endCoords = this.getCenter({ x: ghost.x, y: ghost.y, w: ghost.image.width, h: ghost.image.height, drawType: DrawType.Image });
        ctx.moveTo(this.applyScale(beginCoords.x) + this.viewportOffset.x, this.applyScale(beginCoords.y) + this.viewportOffset.y);
        ctx.lineTo(this.applyScale(endCoords.x) + this.viewportOffset.x, this.applyScale(endCoords.y) + this.viewportOffset.y);
        ctx.stroke();
    }

    private drawRect(rect: Rect): void {
        const ctx = this.getContext();
        switch (rect.drawType) {
        case DrawType.Fill:
            ctx.fillStyle = rect.color;
            if (rect.alpha) ctx.globalAlpha = rect.alpha;
            ctx.fillRect(this.applyScale(rect.x) + this.viewportOffset.x, this.applyScale(rect.y) + this.viewportOffset.y, this.applyScale(rect.w), this.applyScale(rect.h));
            if (rect.alpha) ctx.globalAlpha = 1;
            break;
        case DrawType.Stroke:
            ctx.strokeStyle = rect.color;
            ctx.strokeRect(this.applyScale(rect.x) + this.viewportOffset.x, this.applyScale(rect.y) + this.viewportOffset.y, this.applyScale(rect.w), this.applyScale(rect.h));
            break;
        case DrawType.Image:
            if (rect.image) ctx.drawImage(rect.image, this.applyScale(rect.x) + this.viewportOffset.x, this.applyScale(rect.y) + this.viewportOffset.y, this.applyScale(rect.image.width), this.applyScale(rect.image.height));
            break;
        case DrawType.Grid:
            this.drawGrid(rect as Grid);
            break;
        }

        if (rect.ghost) {
            this.drawGhost(rect.ghost, rect);
        }
    }

    private getCenter(rect: Rect): Point {
        return {
            x: rect.x + rect.w / 2,
            y: rect.y + rect.h / 2
        };
    }
}