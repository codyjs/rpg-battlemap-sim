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

    init (initRects) {
        setInterval(() => this.draw(), 10);
        this.canvas.onmousedown = (e) => this.handleMousedown(e);
        this.canvas.onmouseup = (e) => this.handleMouseup(e);
        initRects.forEach(initRect => this.rects.push(initRect));
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
        this.ctx.fillStyle = rect.color;
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }

    drawGhost() {
        this.drawRect(this.selection.ghost);
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCenter(this.selection.rect));
        this.ctx.lineTo(...this.getCenter(this.selection.ghost));
        this.ctx.stroke();
    }

    getCenter(rect) {
        return [rect.x + rect.w / 2, rect.y + rect.h / 2];
    }

    findRect(x, y) {
        let rect = null;
        for (let i = 0; i < this.rects.length; i++) {
            rect = this.rects[i];
            if (x >= rect.x && x <= rect.x + rect.w &&
                y >= rect.y && y <= rect.y + rect.h) {
                return rect;
            }
        }
        return null;
    }

    getGridCoordsFromCanvasCoords(canvasX, canvasY) {
        return [Math.floor(canvasX / constants.GRID_SQ), Math.floor(canvasY / constants.GRID_SQ)];
    }

    beginDrag(rect, clickX, clickY) {
        this.selection.rect = rect;
        this.selection.ghost = {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
            color: rect.color + 'a'
        };
        const [gridOffsetX, gridOffsetY] = this.getGridCoordsFromCanvasCoords(clickX - rect.x, clickY - rect.y);
        this.selection.gridOffset = { x: gridOffsetX, y: gridOffsetY };
        this.canvas.onmousemove = (e) => this.handleMousemove(e);
    }

    endDrag () {
        this.selection.rect = null;
        this.selection.ghost = null;
        this.canvas.onmousemove = null;
    }

    handleMousedown(e) {
        const clickX = e.pageX - this.canvas.offsetLeft;
        const clickY = e.pageY - this.canvas.offsetTop;
        const rect = this.findRect(clickX, clickY);
        if (rect)
            this.beginDrag(rect, clickX, clickY);
    }

    handleMousemove(e) {
        if (this.selection.rect) {
            const clickX = e.pageX - this.canvas.offsetLeft;
            const clickY = e.pageY - this.canvas.offsetTop;
            const [gridX, gridY] = this.getGridCoordsFromCanvasCoords(clickX, clickY);
            this.selection.ghost.x = (gridX - this.selection.gridOffset.x) * constants.GRID_SQ;
            this.selection.ghost.y = (gridY - this.selection.gridOffset.y) * constants.GRID_SQ;
        }
    }

    handleMouseup(e) {
        if (this.selection.rect) {
            this.selection.rect.x = this.selection.ghost.x;
            this.selection.rect.y = this.selection.ghost.y;
        }
        this.endDrag();
    }
}
