import { Rect, Point, Grid, DrawType } from './types';
import { MutableRefObject } from 'react';

interface TouchData {
    identifier: number;
    pageX: number;
    pageY: number;
}

function copyTouch({ identifier, pageX, pageY }: Touch): TouchData {
    return { identifier, pageX, pageY };
}

export class CanvasFramework {
    private rects: Rect[] = [];
    private drawInterval: NodeJS.Timeout = null;
    private scale = 1;
    private viewportOffset: Point = { x: 0, y: 0 };
    private selectedRect: Rect = null;
    private selectedRectOffset: Point = null;
    private panStart: Point = null;
    private hoverRect: Rect = null;
    private touches: TouchData[] = [];

    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>) {}

    public init(): void {
        this.drawInterval = setInterval(() => this.draw(), 10);

        this.canvasRef.current.onmousedown = e => {
            e.preventDefault();
            const pageCoords = { x: e.pageX, y: e.pageY };
            this.handleSelectStart(pageCoords) || this.handlePanStart(pageCoords);
        };

        this.canvasRef.current.onmousemove = e => {
            e.preventDefault();
            const pageCoords = { x: e.pageX, y: e.pageY };
            this.handleSelectMove(pageCoords) || this.handlePanMove(pageCoords) || this.handleHover(pageCoords);
        };

        this.canvasRef.current.onmouseup = e => {
            e.preventDefault();
            const pageCoords = { x: e.pageX, y: e.pageY };
            this.handleSelectEnd(pageCoords);
            this.handlePanEnd();
        };

        this.canvasRef.current.onmouseleave = e => {
            e.preventDefault();
            const pageCoords = { x: e.pageX, y: e.pageY };
            this.handleSelectEnd(pageCoords);
            this.handlePanEnd();
        };

        this.canvasRef.current.onwheel = e => {
            e.preventDefault();
            this.handleZoom({ x: e.pageX, y: e.pageY }, e.deltaY);
        };

        this.canvasRef.current.ontouchstart = (e) => {
            e.preventDefault();
            const evtTouches = e.changedTouches;
            for (let i = 0; i < evtTouches.length; i++) {
                this.touches.push(copyTouch(evtTouches[i]));
            }

            if (this.touches.length === 1) {
                const touch = this.touches[0];
                const pageCoords = { x: touch.pageX, y: touch.pageY };
                this.handleSelectStart(pageCoords) || this.handlePanStart(pageCoords);
            } else if (this.touches.length > 1) {
                // handlePanStart?
            }
        };

        this.canvasRef.current.ontouchmove = (e) => {
            e.preventDefault();
            const evtTouches = e.changedTouches;

            if (this.touches.length === 1) {
                const touch = evtTouches[0];
                const pageCoords = { x: touch.pageX, y: touch.pageY };
                this.handleSelectMove(pageCoords) || this.handlePanMove(pageCoords)
            } else if (this.touches.length > 1) {
                const touch1 = evtTouches[0];
                const touch2 = evtTouches[1] || touch1.identifier === this.touches[0].identifier ? this.touches[1] : this.touches[0];
                const pageCoords = this.getMidpoint(touch1, touch2);
                const deltaY = this.getZoomFactor([this.touches[0], this.touches[1]], [touch1, touch2]);
                this.handleZoom(pageCoords, deltaY);
            }

            for (let i = 0; i < evtTouches.length; i++) {
                var idx = this.ongoingTouchIndexById(evtTouches[i].identifier);
                if (idx >= 0) {
                    this.touches.splice(idx, 1, copyTouch(evtTouches[i]));
                } else {
                    console.log(`touch ${evtTouches[i].identifier} not found`);
                }
            }
        };

        this.canvasRef.current.ontouchend = (e) => {
            e.preventDefault();
            const evtTouches = e.changedTouches;
            
            if (evtTouches.length === this.touches.length) {
                const touch = evtTouches[0];
                this.handleSelectEnd({ x: touch.pageX, y: touch.pageY });
                this.handlePanEnd();
            }

            for (let i = 0; i < evtTouches.length; i++) {
                var idx = this.ongoingTouchIndexById(evtTouches[i].identifier);
                if (idx >= 0) {
                    this.touches.splice(idx, 1);
                } else {
                    console.log(`touch ${evtTouches[i].identifier} not found`);
                }
            }
        }
    }

    public addRect(rect: Rect): void {
        this.rects.push(rect);
        this.sortRects();
    }
    
    public removeRect(rect: Rect): void {
        const rectIndex = this.rects.indexOf(rect);
        if (rectIndex === -1) return;
        this.rects.splice(rectIndex, 1);
    }

        
    public dispose(): void {
        clearInterval(this.drawInterval);
    }

    private getContext(): CanvasRenderingContext2D {
        return this.canvasRef.current.getContext('2d');
    }

    private sortRects(): void {
        this.rects.sort((a, b) => {
            if (a.renderPriority && !b.renderPriority) return 1;
            if (!a.renderPriority && b.renderPriority) return -1;
            if (!a.renderPriority && !b.renderPriority) return 0;
            return a.renderPriority - b.renderPriority;
        });
    }

    private applyScale(value: number): number {
        return value * this.scale;
    }

    private unscale(value: number): number {
        return value / this.scale;
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

    private drawGhost(ghost: Rect): void {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.globalAlpha = 0.5;
        if (ghost.image) ctx.drawImage(ghost.image, this.applyScale(ghost.x) + this.viewportOffset.x, this.applyScale(ghost.y) + this.viewportOffset.y, this.applyScale(ghost.image.width), this.applyScale(ghost.image.height));
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        const beginCoords = this.getCenter(this.selectedRect);
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
        case 'stroke':
            ctx.strokeStyle = rect.color;
            ctx.strokeRect(this.applyScale(rect.x) + this.viewportOffset.x, this.applyScale(rect.y) + this.viewportOffset.y, this.applyScale(rect.w), this.applyScale(rect.h));
            break;
        case 'image':
            if (rect.image) ctx.drawImage(rect.image, this.applyScale(rect.x) + this.viewportOffset.x, this.applyScale(rect.y) + this.viewportOffset.y, this.applyScale(rect.image.width), this.applyScale(rect.image.height));
            break;
        case 'ghost':
            this.drawGhost(rect);
            break;
        case 'grid':
            this.drawGrid(rect as Grid);
            break;
        }
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
            this.viewportOffset.x -= this.panStart.x - rawMouseCoords.x;
            this.viewportOffset.y -= this.panStart.y - rawMouseCoords.y;
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
        const newScale = this.scale + deltaY * -0.05;
        if (newScale <= 0.25 || newScale >= 4) return;
        const preScaleMouseCoords = this.getUnscaledMouseCoords(pageCoords);
        this.scale = newScale;
        const postScaleMouseCoords = this.getUnscaledMouseCoords(pageCoords);
        const scaleOffsetX = (preScaleMouseCoords.x - postScaleMouseCoords.x) * newScale;
        const scaleOffsetY = (preScaleMouseCoords.y - postScaleMouseCoords.y) * newScale;
        this.viewportOffset.x -= scaleOffsetX;
        this.viewportOffset.y -= scaleOffsetY;
    }

    private getUnscaledMouseCoords(pageCoords: Point): Point {
        const canvasX = pageCoords.x - this.canvasRef.current.offsetLeft;
        const canvasY = pageCoords.y - this.canvasRef.current.offsetTop;
        const x = this.unscale(canvasX - this.viewportOffset.x);
        const y = this.unscale(canvasY - this.viewportOffset.y);
        return {x, y};
    }

    private getRawMouseCoords(pageCoords: Point): Point {
        const x = pageCoords.x - this.canvasRef.current.offsetLeft;
        const y = pageCoords.y - this.canvasRef.current.offsetTop;
        return {x, y};
    }

    private findRectAt(point: Point): Rect | null {
        let rect = null;
        for (let i = 0; i < this.rects.length; i++) {
            rect = this.rects[i];
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

    private getCenter(rect: Rect): Point {
        return {
            x: rect.x + rect.w / 2,
            y: rect.y + rect.h / 2
        };
    }

    private ongoingTouchIndexById(idToFind: number) {
        for (var i = 0; i < this.touches.length; i++) {
          var id = this.touches[i].identifier;
          
          if (id == idToFind) {
            return i;
          }
        }
        return -1;    // not found
    }

    private getMidpoint(touch1: TouchData, touch2: TouchData): Point {
        return {
            x: (touch1.pageX + touch2.pageX) / 2,
            y: (touch1.pageY + touch2.pageY) / 2,
        };
    }

    private getZoomFactor(originalTouches: TouchData[], newTouches: TouchData[]): number {
        const [ogTouch1, ogTouch2] = originalTouches;
        const ogPoint1: Point = { x: ogTouch1.pageX, y: ogTouch1.pageY };
        const ogPoint2: Point = { x: ogTouch2.pageX, y: ogTouch2.pageY };
        const ogDist = this.getDistance(ogPoint1, ogPoint2);

        const [newTouch1, newTouch2] = newTouches;
        const newPoint1: Point = { x: newTouch1.pageX, y: newTouch1.pageY };
        const newPoint2: Point = { x: newTouch2.pageX, y: newTouch2.pageY };
        const newDist = this.getDistance(newPoint1, newPoint2);

        return (ogDist - newDist) * 0.25;
    }

    private getDistance(point1: Point, point2: Point): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
}