import { MutableRefObject } from 'react';
import { CanvasFramework } from '../canvas-framework/canvas-framework';
import { Rect, Grid, DrawType } from '../canvas-framework/types';
import { CanvasPiece } from './canvas-piece';
import { MapPiece, BackdropData } from './types';
import { CanvasBackdrop } from './canvas-backdrop';

export class MapCanvas {
    private canvasFramework: CanvasFramework = null;
    private grid: Grid = null;
    private backdrop: Rect = null;

    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>) {
        this.canvasFramework = new CanvasFramework(canvasRef);
    }

    public init() {
        this.canvasRef.current.height = this.canvasRef.current.scrollHeight;
        this.canvasRef.current.width = this.canvasRef.current.scrollWidth;
        this.canvasFramework.init();
    }

    public addPieces(pieces: MapPiece[]) {
        pieces.forEach(piece => {
            this.canvasFramework.addRect(new CanvasPiece(this.canvasFramework, this.canvasRef, this.grid, piece));
        });
    }

    public setBackdrop(backdropData: BackdropData): void {
        if (this.backdrop) {
            this.canvasFramework.removeRect(this.backdrop);
        }
        this.backdrop = new CanvasBackdrop(backdropData.image, backdropData.h, backdropData.w);
        this.canvasFramework.addRect(this.backdrop);
    }

    public setGrid(grid: Grid): void {
        if (this.grid) {
            this.canvasFramework.removeRect(this.grid);
        }
        this.grid = grid;
        this.grid.drawType = DrawType.Grid;
        this.grid.renderPriority = 1;
        this.canvasFramework.addRect(this.grid);
    }

    public dispose(): void {
        this.canvasFramework.dispose();
    }
}
