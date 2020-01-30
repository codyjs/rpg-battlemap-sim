import * as constants from './constants';

export class MapCanvas {
    constructor(canvasRef) {
        this.canvasRef = canvasRef;
        this.selection = {
            rect: null,
            offset: null
        };
        this.rects = [];
    }

    init() {
        this.canvasRef.current.width = constants.CANVAS_WIDTH;
        this.canvasRef.current.height = constants.CANVAS_HEIGHT;
        this.drawInterval = setInterval(() => this.draw(), 10);
        this.canvasRef.current.onmousedown = (e) => this.beginDrag(e);
        this.canvasRef.current.onmouseup = (e) => this.endDrag(e);
    }

    addPieces(pieces) {
        pieces.forEach(piece => this.rects.push(piece));
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
            this.canvasRef.current.onmousemove = (e) => this.handleMousemove(e);
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

    endDrag() {
        if (this.selection.rect) {
            this.selection.rect.x = this.selection.ghost.x;
            this.selection.rect.y = this.selection.ghost.y;
        }
        this.selection.rect = null;
        this.selection.ghost = null;
        this.canvasRef.current.onmousemove = null;
    }

    dispose() {
        clearInterval(this.drawInterval);
    }

    draw() {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
        this.drawGrid();
        this.rects.forEach(rect => this.drawRect(rect));
        if (this.selection.ghost) {
            this.drawGhost();
        }
    }

    drawGrid() {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.strokeStyle = constants.GRID_COLOR;
        for (let x = 0; x < constants.CANVAS_WIDTH; x += constants.GRID_SQ) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, constants.CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < constants.CANVAS_HEIGHT; y += constants.GRID_SQ) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(constants.CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }

    drawRect(rect) {
        const ctx = this.canvasRef.current.getContext('2d');
        if (rect.image && rect.loaded) {
            ctx.drawImage(rect.image, rect.x * constants.GRID_SQ, rect.y * constants.GRID_SQ,
                rect.w * constants.GRID_SQ, rect.h * constants.GRID_SQ)
        } else {
            ctx.fillStyle = rect.color;
            ctx.fillRect(rect.x * constants.GRID_SQ, rect.y * constants.GRID_SQ,
                rect.w * constants.GRID_SQ, rect.h * constants.GRID_SQ);
        }
    }

    drawGhost() {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.globalAlpha = 0.5;
        this.drawRect(this.selection.ghost);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(...this.getCenter(this.selection.rect));
        ctx.lineTo(...this.getCenter(this.selection.ghost));
        ctx.stroke();
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
        return [e.pageX - this.canvasRef.current.offsetLeft, e.pageY - this.canvasRef.current.offsetTop];
    }

    getCenter(rect) {
        return [rect.x * constants.GRID_SQ + rect.w * constants.GRID_SQ / 2,
                rect.y * constants.GRID_SQ + rect.h * constants.GRID_SQ / 2];
    }
}
