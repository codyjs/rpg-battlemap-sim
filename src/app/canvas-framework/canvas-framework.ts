import { CanvasInputController } from './canvas-input-controller';
import { CanvasRenderEngine } from './canvas-render-engine';
import { MutableRefObject } from 'react';
import { Rect, Point } from './types';

export class CanvasFramework {
    private inputController: CanvasInputController = null;
    private renderEngine: CanvasRenderEngine = null;
    private selectedRect: Rect = null;
    private selectedRectOffset: Point = null;
    private hoverRect: Rect = null;
    private panStart: Point = null;

    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>) {
        this.renderEngine = new CanvasRenderEngine(canvasRef);
        this.inputController = new CanvasInputController(canvasRef);

        this.inputController.onSelectStart = (p) => this.handleSelectStart(p);
        this.inputController.onSelectMove = (p) => this.handleSelectMove(p);
        this.inputController.onSelectEnd = (p) => this.handleSelectEnd(p);
        this.inputController.onPanStart = (p) => this.handlePanStart(p);
        this.inputController.onPanMove = (p) => this.handlePanMove(p);
        this.inputController.onPanEnd = () => this.handlePanEnd();
        this.inputController.onHover = (p) => this.handleHover(p);
        this.inputController.onZoom = (p, y) => this.handleZoom(p, y);
    }

    public init() {
        this.renderEngine.init();
    }

    public addRect(rect: Rect) {
        this.renderEngine.addRect(rect);
    }

    public removeRect(rect: Rect) {
        this.renderEngine.removeRect(rect);
    }

    public dispose() {
        this.renderEngine.dispose();
    }

    private handleSelectStart(pageCoords: Point): boolean {
        const mouseCoords = this.getUnscaledMouseCoords(pageCoords);
        this.selectedRect = this.findRectAt(mouseCoords);
        if (this.selectedRect) {
            this.canvasRef.current.style.cursor = 'grabbing';
            this.selectedRectOffset = {
                x: mouseCoords.x - this.selectedRect.x,
                y: mouseCoords.y - this.selectedRect.y
            };
            if (this.selectedRect.handleMouseDown) {
                this.selectedRect.handleMouseDown({
                    mouseX: mouseCoords.x,
                    mouseY: mouseCoords.y,
                    xOffset: this.selectedRectOffset.x,
                    yOffset: this.selectedRectOffset.y
                });
            }
            return true;
        }
        return false;
    }

    private handleSelectMove(pageCoords: Point): boolean {
        const mouseCoords = this.getUnscaledMouseCoords(pageCoords);
        if (this.selectedRect && this.selectedRect.handleDrag) {
            this.selectedRect.handleDrag({
                mouseX: mouseCoords.x,
                mouseY: mouseCoords.y,
                xOffset: this.selectedRectOffset.x,
                yOffset: this.selectedRectOffset.y
            });
            return true;
        }
        return false;
    }

    private handlePanStart(pageCoords: Point): void {
        this.panStart = this.getRawMouseCoords(pageCoords);
    }

    private handlePanMove(pageCoords: Point): boolean {
        if (this.panStart) {
            const rawMouseCoords = this.getRawMouseCoords(pageCoords);
            this.renderEngine.viewportOffset.x -= this.panStart.x - rawMouseCoords.x;
            this.renderEngine.viewportOffset.y -= this.panStart.y - rawMouseCoords.y;
            this.panStart.x = rawMouseCoords.x;
            this.panStart.y = rawMouseCoords.y;
            return true;
        }
        return false;
    }

    private handleHover(pageCoords: Point): void {
        const mouseCoords = this.getUnscaledMouseCoords(pageCoords);
        const rect = this.findRectAt(mouseCoords);
        if (rect) {
            if (this.hoverRect && this.hoverRect !== rect) {
                if (this.hoverRect.handleHoverEnd) this.hoverRect.handleHoverEnd();
            }
            this.hoverRect = rect;

            if (rect.handleHover) {
                rect.handleHover();
            }
        } else if (this.hoverRect) {
            if (this.hoverRect.handleHoverEnd) this.hoverRect.handleHoverEnd();
            this.hoverRect = null;
        }

        if (!this.hoverRect) {
            this.canvasRef.current.style.cursor = 'move';
        }
    }

    private handleSelectEnd(pageCoords: Point): void {
        const mouseCoords = this.getUnscaledMouseCoords(pageCoords);
        if (this.selectedRect && this.selectedRect.handleDragEnd) {
            this.canvasRef.current.style.cursor = 'grab';
            this.selectedRect.handleDragEnd({
                mouseX: mouseCoords.x,
                mouseY: mouseCoords.y,
                xOffset: this.selectedRectOffset.x,
                yOffset: this.selectedRectOffset.y
            });
        }
        this.selectedRect = null;
        this.selectedRectOffset = null;
    }

    private handlePanEnd(): void {
        this.panStart = null;
    }

    private handleZoom(pageCoords: Point, deltaY: number): void {
        const newScale = this.renderEngine.scale + deltaY * -0.05;
        if (newScale <= 0.25 || newScale >= 4) return;
        const preScaleMouseCoords = this.getUnscaledMouseCoords(pageCoords);
        this.renderEngine.scale = newScale;
        const postScaleMouseCoords = this.getUnscaledMouseCoords(pageCoords);
        const scaleOffsetX = (preScaleMouseCoords.x - postScaleMouseCoords.x) * newScale;
        const scaleOffsetY = (preScaleMouseCoords.y - postScaleMouseCoords.y) * newScale;
        this.renderEngine.viewportOffset.x -= scaleOffsetX;
        this.renderEngine.viewportOffset.y -= scaleOffsetY;
    }

    private getUnscaledMouseCoords(pageCoords: Point): Point {
        const canvasX = pageCoords.x - this.canvasRef.current.offsetLeft;
        const canvasY = pageCoords.y - this.canvasRef.current.offsetTop;
        const x = this.unscale(canvasX - this.renderEngine.viewportOffset.x);
        const y = this.unscale(canvasY - this.renderEngine.viewportOffset.y);
        return {x, y};
    }

    
    private unscale(value: number): number {
        return value / this.renderEngine.scale;
    }

    private getRawMouseCoords(pageCoords: Point): Point {
        const x = pageCoords.x - this.canvasRef.current.offsetLeft;
        const y = pageCoords.y - this.canvasRef.current.offsetTop;
        return {x, y};
    }

    private findRectAt(point: Point): Rect | null {
        let rect = null;
        for (let i = 0; i < this.renderEngine.rects.length; i++) {
            rect = this.renderEngine.rects[i];
            if (rect.drawType !== 'grid' &&
                point.x >= rect.x &&
                point.x <= rect.x + rect.w &&
                point.y >= rect.y &&
                point.y <= rect.y + rect.h) {
                return rect;
            }
        }
        return null;
    }
}