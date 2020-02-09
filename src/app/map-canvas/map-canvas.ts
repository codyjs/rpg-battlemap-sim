import { MutableRefObject } from 'react';
import { CanvasFramework } from '../canvas-framework/canvas-framework';
import { Rect, Grid, DrawType, Point } from '../canvas-framework/types';
import { CanvasPiece } from './canvas-piece';
import { MapPiece, BackdropData } from './types';
import { CanvasBackdrop } from './canvas-backdrop';
import { BattlemapWebsocketClient } from './battlemap-websocket-client';

export class MapCanvas {
    private canvasFramework: CanvasFramework = null;
    private grid: Grid = null;
    private backdrop: Rect = null;
    private pieces: CanvasPiece[] = [];

    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>, private wsClient: BattlemapWebsocketClient) {
        this.canvasFramework = new CanvasFramework(canvasRef);
    }

    public init() {
        this.canvasRef.current.height = this.canvasRef.current.scrollHeight;
        this.canvasRef.current.width = this.canvasRef.current.scrollWidth;
        this.canvasFramework.init();
    }

    public addPieces(pieces: MapPiece[]) {
        pieces.forEach((piece, idx) => {
            const canvasPiece = new CanvasPiece(this.canvasFramework, this.canvasRef, this.grid, piece, idx);
            canvasPiece.onMove((pieceId: number, to: Point) => this.wsClient.movePiece(pieceId, to));
            this.pieces.push(canvasPiece);
            this.canvasFramework.addRect(canvasPiece);
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

    public movePiece(pieceId: number, dest: Point) {
        this.pieces[pieceId].moveTo(dest);
    }

    public dispose(): void {
        this.canvasFramework.dispose();
    }
}
