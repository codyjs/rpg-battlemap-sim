import { Rect, Grid, DrawType, RectEventData, Point } from '../canvas-framework/types';
import { MapPiece } from './types';
import { CanvasFramework } from '../canvas-framework/index';
import { MutableRefObject } from 'react';

export class CanvasPiece implements Rect {
    public x: number;
    public y: number;
    public h: number;
    public w: number;
    public renderPriority = 3;
    public drawType = DrawType.Image;
    public image: HTMLImageElement = null;
    
    private onMoveCallback: (pieceId: number, to: Point) => void;
    private ghost: Rect = null;

    constructor(private canvasFramework: CanvasFramework, private canvasRef: MutableRefObject<HTMLCanvasElement>,
            private grid: Grid, piece: MapPiece, private id: number) {
        this.x = piece.x * this.grid.tileSize + this.grid.x;
        this.y = piece.y * this.grid.tileSize + this.grid.y;
        this.h = piece.h * this.grid.tileSize;
        this.w = piece.w * this.grid.tileSize;

        const pieceImg = new Image();
        pieceImg.src = '/images/pieces/' + piece.image;
        pieceImg.onload = () => {
            pieceImg.height = this.h;
            pieceImg.width = this.w;
            this.image = pieceImg;
        };
    }

    public handleDrag({ mouseX, mouseY, xOffset, yOffset }: RectEventData): void {
        const gridSquare = this.grid.getGridCoordsFromCanvasCoords(mouseX - this.grid.x, mouseY - this.grid.x);
        const gridOffset = this.grid.getGridCoordsFromCanvasCoords(xOffset, yOffset);
        if (!this.ghost) {
            this.ghost = {
                x: 0, y: 0,
                w: this.w * this.grid.tileSize,
                h: this.h * this.grid.tileSize,
                image: this.image,
                drawType: DrawType.Ghost,
                renderPriority: 3,
                originalRect: this
            };
            this.canvasFramework.addRect(this.ghost);
        }
        this.ghost.x = gridSquare.x * this.grid.tileSize + this.grid.x - gridOffset.x * this.grid.tileSize;
        this.ghost.y = gridSquare.y * this.grid.tileSize + this.grid.y - gridOffset.y * this.grid.tileSize;
    }

    public handleHover(): void {
        this.canvasRef.current.style.cursor = 'grab';
    }

    public handleHoverEnd(): void {
        this.canvasRef.current.style.cursor = 'auto';
    }

    public handleDragEnd(): void {
        if (this.ghost) {
            // this.x = this.ghost.x;
            // this.y = this.ghost.y;
            if (this.onMoveCallback) this.onMoveCallback(this.id, this.grid.getGridCoordsFromCanvasCoords(this.ghost.x, this.ghost.y));
            this.canvasFramework.removeRect(this.ghost);
            this.ghost = null;
        }
    }

    public onMove(callback: (pieceId: number, to: Point) => void) {
        this.onMoveCallback = callback;
    }

    public moveTo(dest: Point) {
        const canvasCoords = this.grid.getCanvasCoordsFromGridCoords(dest.x, dest.y);
        this.x = canvasCoords.x;
        this.y = canvasCoords.y;
    }
}