import { MutableRefObject } from 'react';
import { Point } from './types';

interface TouchData {
    identifier: number;
    pageX: number;
    pageY: number;
}

export class CanvasInputController {
    private touches: TouchData[] = [];

    public onSelectStart: (pageCoords: Point) => boolean = null;
    public onPanStart: (pageCoords: Point) => void = null;
    public onSelectMove: (pageCoords: Point) => boolean = null;
    public onPanMove: (pageCoords: Point) => boolean = null;
    public onHover: (pageCoords: Point) => void = null;
    public onSelectEnd: (pageCoords: Point) => void = null;
    public onPanEnd: () => void = null;
    public onZoom: (pageCoords: Point, deltaY: number) => void = null;
    
    constructor(private canvasRef: MutableRefObject<HTMLCanvasElement>) {
        this.canvasRef.current.onmousedown = e => this.onMouseDown(e);
        this.canvasRef.current.onmousemove = e => this.onMouseMove(e);
        this.canvasRef.current.onmouseup = e => this.onMouseUp(e);
        this.canvasRef.current.onmouseleave = e => this.onMouseLeave(e);
        this.canvasRef.current.onwheel = e => this.onWheel(e);
        this.canvasRef.current.ontouchstart = (e) => this.onTouchStart(e);
        this.canvasRef.current.ontouchmove = (e) => this.onTouchMove(e);
        this.canvasRef.current.ontouchend = (e) => this.onTouchEnd(e);
    }

    private onMouseDown(e: MouseEvent) {
        e.preventDefault();
        const pageCoords = { x: e.pageX, y: e.pageY };
        this.onSelectStart(pageCoords) || this.onPanStart(pageCoords);
    }

    private onMouseMove(e: MouseEvent) {
        e.preventDefault();
        const pageCoords = { x: e.pageX, y: e.pageY };
        this.onSelectMove(pageCoords) || this.onPanMove(pageCoords) || this.onHover(pageCoords);
    }

    private onMouseUp(e: MouseEvent) {
        e.preventDefault();
        const pageCoords = { x: e.pageX, y: e.pageY };
        this.onSelectEnd(pageCoords);
        this.onPanEnd();
    }

    private onMouseLeave(e: MouseEvent) {
        e.preventDefault();
        const pageCoords = { x: e.pageX, y: e.pageY };
        this.onSelectEnd(pageCoords);
        this.onPanEnd();
    
    }

    private onWheel(e: WheelEvent) {
        e.preventDefault();
        this.onZoom({ x: e.pageX, y: e.pageY }, e.deltaY);
    }

    private onTouchStart(e: TouchEvent) {
        e.preventDefault();
        const evtTouches = e.changedTouches;
        for (let i = 0; i < evtTouches.length; i++) {
            this.touches.push(this.copyTouch(evtTouches[i]));
        }

        if (this.touches.length === 1) {
            const touch = this.touches[0];
            const pageCoords = { x: touch.pageX, y: touch.pageY };
            this.onSelectStart(pageCoords) || this.onPanStart(pageCoords);
        } else if (this.touches.length > 1) {
            // handlePanStart?
        }
    }

    private onTouchMove(e: TouchEvent) {
        e.preventDefault();
        const evtTouches = e.changedTouches;

        if (this.touches.length === 1) {
            const touch = evtTouches[0];
            const pageCoords = { x: touch.pageX, y: touch.pageY };
            this.onSelectMove(pageCoords) || this.onPanMove(pageCoords)
        } else if (this.touches.length > 1) {
            const touch1 = evtTouches[0];
            const touch2 = evtTouches[1] || touch1.identifier === this.touches[0].identifier ? this.touches[1] : this.touches[0];
            const pageCoords = this.getMidpoint(touch1, touch2);
            const deltaY = this.getZoomFactor([this.touches[0], this.touches[1]], [touch1, touch2]);
            this.onZoom(pageCoords, deltaY);
        }

        for (let i = 0; i < evtTouches.length; i++) {
            var idx = this.ongoingTouchIndexById(evtTouches[i].identifier);
            if (idx >= 0) {
                this.touches.splice(idx, 1, this.copyTouch(evtTouches[i]));
            } else {
                console.log(`touch ${evtTouches[i].identifier} not found`);
            }
        }
    }

    private onTouchEnd(e: TouchEvent) {
        e.preventDefault();
        const evtTouches = e.changedTouches;
        
        if (evtTouches.length === this.touches.length) {
            const touch = evtTouches[0];
            this.onSelectEnd({ x: touch.pageX, y: touch.pageY });
            this.onPanEnd();
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

    private copyTouch({ identifier, pageX, pageY }: Touch): TouchData {
        return { identifier, pageX, pageY };
    }
}