import { CanvasFramework } from "../../canvas-framework/index";
import { MutableRefObject } from 'react';
import { Grid, DrawType, Rect, Point } from '../../canvas-framework/types';
import { GridOriginMarker } from "./grid-origin-marker";
import { BackdropScalingRect } from "./backdrop-scaling-rect";

export class MapBuilderCanvas {
    private grid: Grid = new Grid({
        x: 0, y: 0,
        h: 0, w: 0,
        drawType: DrawType.Grid,
        renderPriority: 1
    }, 0);
    private gridOriginMarker: GridOriginMarker = null;
    private imageRect: Rect = null;
    private scalingRect: BackdropScalingRect = null;
    private canvasFramework: CanvasFramework;

    public onGridOriginChange?: (gridOrigin: Point) => void;
    public onImageSizeChange?: (imageSize: { h: number, w: number}) => void;

    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>) {
        this.canvasFramework = new CanvasFramework(this.canvasRef);
        this.gridOriginMarker = new GridOriginMarker(canvasRef, (newGridOrigin: Point) => this.setGridOrigin(newGridOrigin));
    }

    public init(): void {
        this.canvasFramework.init();
        this.canvasRef.current.height = this.canvasRef.current.scrollHeight;
        this.canvasRef.current.width = this.canvasRef.current.scrollWidth;
        this.canvasFramework.addRect(this.grid);
        this.canvasFramework.addRect(this.gridOriginMarker);
    }

    public setGridSize(gridSize: { w: number, h: number }): void {
        this.grid.w = gridSize.w;
        this.grid.h = gridSize.h;
    }

    public setTileSize(tileSize: number): void {
        this.grid.tileSize = tileSize;
        this.gridOriginMarker.w = tileSize;
        this.gridOriginMarker.h = tileSize;
    }

    public setGridOrigin(gridOrigin: Point): void {
        this.grid.x = gridOrigin.x;
        this.grid.y = gridOrigin.y;
        this.gridOriginMarker.x = gridOrigin.x;
        this.gridOriginMarker.y = gridOrigin.y;
        if (this.onGridOriginChange) this.onGridOriginChange(gridOrigin);
    }

    setBackdropImage(image: HTMLImageElement) {
        if (this.imageRect) {
            this.canvasFramework.removeRect(this.imageRect);
        }
        if (this.scalingRect) {
            this.canvasFramework.removeRect(this.scalingRect);
        }
        this.imageRect = {
            x: 0, y: 0,
            h: 0, w: 0,
            drawType: DrawType.Image,
            image,
            renderPriority: 0
        };
        this.scalingRect = new BackdropScalingRect(this.canvasRef, this.imageRect, (imageSize) => this.onImageSizeChange(imageSize));
        this.canvasFramework.addRect(this.imageRect);
        this.canvasFramework.addRect(this.scalingRect);
    }

    dispose() {
        this.canvasFramework.dispose();
    }
}
