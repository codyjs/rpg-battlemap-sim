export interface Rect {
    x: number;
    y: number;
    h: number;
    w: number;
    drawType: DrawType;
    renderPriority?: number;
    image?: HTMLImageElement;
    color?: string;
    alpha?: number;
    handleMouseDown?: (eventData: RectEventData) => void;
    handleDrag?: (eventData: RectEventData) => void;
    handleDragEnd?: (eventData: RectEventData) => void;
    handleHover?: () => void;
    handleHoverEnd?: () => void;
};

export interface RectEventData {
    mouseX: number;
    mouseY: number;
    xOffset: number;
    yOffset: number;
}

export enum DrawType {
    Fill = 'fill',
    Stroke = 'stroke',
    Image = 'image',
    Grid = 'grid',
    Ghost = 'ghost'
}

export interface Point {
    x: number;
    y: number;
}

export class Grid implements Rect {
    x: number;
    y: number;
    h: number;
    w: number;
    drawType = DrawType.Grid;
    tileSize: number;
    renderPriority?: number;

    constructor(rect: Rect, tileSize: number) {
        this.x = rect.x;
        this.y = rect.y;
        this.h = rect.h;
        this.w = rect.w;
        this.renderPriority = rect.renderPriority;
        this.tileSize = tileSize;
    }

    public getGridCoordsFromCanvasCoords(canvasX: number, canvasY: number): Point {
        return {
            x: Math.floor((canvasX - this.x) / this.tileSize),
            y: Math.floor((canvasY - this.y) / this.tileSize)
        };
    }

    public getCanvasCoordsFromGridCoords(gridX: number, gridY: number): Point {
        return {
            x: (gridX * this.tileSize) + this.x,
            y: (gridY * this.tileSize) + this.y
        };
    }
}