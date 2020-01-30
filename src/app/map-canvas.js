import * as constants from './constants';

export class MapCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.selection = {
            rect: null,
            offset: null
        };
        this.rects = [];
    }

    init(initRects) {
        setInterval(() => this.draw(), 10);
        this.canvas.onmousedown = (e) => this.beginDrag(e);
        this.canvas.onmouseup = (e) => this.endDrag(e);
        initRects.forEach(initRect => this.rects.push(initRect));
    }

    beginDrag(e) {
        const [clickX, clickY] = this.getClickCoords(e);
        const rect = this.findRect(clickX, clickY);
        if (rect) {
            this.selection.rect = rect;
            this.selection.ghost = {
                x: rect.x,
                y: rect.y,
                w: rect.w,
                h: rect.h,
                color: rect.color + 'a',
                image: rect.image,
                loaded: rect.loaded
            };
            const [gridX, gridY] = this.getGridCoordsFromCanvasCoords(clickX, clickY);
            this.selection.gridOffset = { x: gridX - rect.x, y: gridY - rect.y };
            this.canvas.onmousemove = (e) => this.handleMousemove(e);
        }
    }

    handleMousemove(e) {
        if (this.selection.rect) {
            const [clickX, clickY] = this.getClickCoords(e);
            const [gridX, gridY] = this.getGridCoordsFromCanvasCoords(clickX, clickY);
            this.selection.ghost.x = gridX - this.selection.gridOffset.x;
            this.selection.ghost.y = gridY - this.selection.gridOffset.y;
        }
    }

    endDrag () {
        if (this.selection.rect) {
            this.selection.rect.x = this.selection.ghost.x;
            this.selection.rect.y = this.selection.ghost.y;
        }
        this.selection.rect = null;
        this.selection.ghost = null;
        this.canvas.onmousemove = null;
    }

    draw() {
        this.ctx.clearRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
        this.drawGrid();
        this.rects.forEach(rect => this.drawRect(rect));
        if (this.selection.ghost) {
            this.drawGhost();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = constants.GRID_COLOR;
        for (let x = 0; x < constants.CANVAS_WIDTH; x += constants.GRID_SQ) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, constants.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = 0; y < constants.CANVAS_HEIGHT; y += constants.GRID_SQ) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(constants.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }

    drawRect(rect) {
        if (rect.image && rect.loaded) {
            this.ctx.drawImage(rect.image, rect.x * constants.GRID_SQ, rect.y * constants.GRID_SQ,
                rect.w * constants.GRID_SQ, rect.h * constants.GRID_SQ)
        } else {
            this.ctx.fillStyle = rect.color;
            this.ctx.fillRect(rect.x * constants.GRID_SQ, rect.y * constants.GRID_SQ,
                rect.w * constants.GRID_SQ, rect.h * constants.GRID_SQ);
        }
    }

    drawGhost() {
        this.ctx.globalAlpha = 0.5;
        this.drawRect(this.selection.ghost);
        this.ctx.globalAlpha = 1;
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCenter(this.selection.rect));
        this.ctx.lineTo(...this.getCenter(this.selection.ghost));
        this.ctx.stroke();
    }

    // Utility functions

    findRect(x, y) {
        let rect = null;
        for (let i = 0; i < this.rects.length; i++) {
            rect = this.rects[i];
            if (x >= rect.x * constants.GRID_SQ &&
                x <= rect.x * constants.GRID_SQ + rect.w * constants.GRID_SQ &&
                y >= rect.y * constants.GRID_SQ &&
                y <= rect.y * constants.GRID_SQ + rect.h * constants.GRID_SQ) {
                return rect;
            }
        }
        return null;
    }

    getGridCoordsFromCanvasCoords(canvasX, canvasY) {
        return [Math.floor(canvasX / constants.GRID_SQ),
                Math.floor(canvasY / constants.GRID_SQ)];
    }

    getClickCoords(e) {
        return [e.pageX - this.canvas.offsetLeft, e.pageY - this.canvas.offsetTop];
    }

    getCenter(rect) {
        return [rect.x * constants.GRID_SQ + rect.w * constants.GRID_SQ / 2,
                rect.y * constants.GRID_SQ + rect.h * constants.GRID_SQ / 2];
    }
}
