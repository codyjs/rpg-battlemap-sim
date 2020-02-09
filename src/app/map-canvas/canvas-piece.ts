import { Rect, Grid, DrawType, RectEventData } from '../canvas-framework/types';
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

    private ghost: Rect = null;

    constructor(private canvasFramework: CanvasFramework, private canvasRef: MutableRefObject<HTMLCanvasElement>,
            private grid: Grid, piece: MapPiece) {
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
        const [gridX, gridY] = this.grid.getGridCoordsFromCanvasCoords(mouseX - this.grid.x, mouseY - this.grid.x);
        const [gridOffsetX, gridOffsetY] = this.grid.getGridCoordsFromCanvasCoords(xOffset, yOffset);
        if (!this.ghost) {
            this.ghost = {
                x: 0, y: 0,
                w: this.w * this.grid.tileSize,
                h: this.h * this.grid.tileSize,
                image: this.image,
                drawType: DrawType.Ghost,
                renderPriority: 3
            };
            this.canvasFramework.addRect(this.ghost);
        }
        this.ghost.x = gridX * this.grid.tileSize + this.grid.x - gridOffsetX * this.grid.tileSize;
        this.ghost.y = gridY * this.grid.tileSize + this.grid.y - gridOffsetY * this.grid.tileSize;
    }

    public handleHover(): void {
        this.canvasRef.current.style.cursor = 'grab';
    }

    public handleHoverEnd(): void {
        this.canvasRef.current.style.cursor = 'auto';
    }

    public handleDragEnd(): void {
        if (this.ghost) {
            this.x = this.ghost.x;
            this.y = this.ghost.y;
            this.canvasFramework.removeRect(this.ghost);
            this.ghost = null;
        }
    }
}