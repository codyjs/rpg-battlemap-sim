export class CanvasFramework {
    constructor(canvasRef) {
        this.canvasRef = canvasRef;
        this.rects = [];
    }

    init() {
        this.canvasHeight = this.canvasRef.current.scrollHeight;
        this.canvasWidth = this.canvasRef.current.scrollWidth;
        this.drawInterval = setInterval(() => this.draw(), 10);
        this.canvasRef.current.onmousedown = e => this.handleMouseDown(e);
        this.canvasRef.current.onmousemove = e => this.handleMouseMove(e);
        this.canvasRef.current.onmouseup = e => this.handleMouseUp(e);
    }

    getContext() {
        return this.canvasRef.current.getContext('2d');
    }

    addRect(rect) {
        this.rects.push(rect);
        this.sortRects();
    }

    sortRects() {
        this.rects.sort((a, b) => {
            if (a.renderPriority && !b.renderPriority) return 1;
            if (!a.renderPriority && b.renderPriority) return -1;
            if (!a.renderPriority && !b.renderPriority) return 0;
            return a.renderPriority - b.renderPriority;
        });
    }

    removeRect(rect) {
        const rectIndex = this.rects.indexOf(rect);
        if (rectIndex === -1) return;
        this.rects.splice(rectIndex, 1);
    }

    draw() {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.rects.forEach(rect => this.drawRect(rect));
    }

    drawGrid(grid) {
        const ctx = this.getContext();
        ctx.strokeStyle = '#000000';
        for (let x = grid.x; x <= grid.x + grid.w * grid.tileSize; x += grid.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, grid.y);
            ctx.lineTo(x, grid.y + grid.h * grid.tileSize);
            ctx.stroke();
        }
        for (let y = grid.y; y <= grid.y + grid.h * grid.tileSize; y += grid.tileSize) {
            ctx.beginPath();
            ctx.moveTo(grid.x, y);
            ctx.lineTo(grid.x + grid.w * grid.tileSize, y);
            ctx.stroke();
        }
    }

    drawGhost(ghost) {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.globalAlpha = 0.5;
        if (ghost.image) ctx.drawImage(ghost.image, ghost.x, ghost.y, ghost.image.width, ghost.image.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(...this.getCenter(this.selectedRect));
        ctx.lineTo(...this.getCenter({ x: ghost.x, y: ghost.y, w: ghost.image.width, h: ghost.image.height }));
        ctx.stroke();
    }

    drawRect(rect) {
        const ctx = this.getContext();
        switch (rect.drawType) {
        case 'fill':
            ctx.fillStyle = rect.color;
            if (rect.alpha) ctx.globalAlpha = rect.alpha;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            if (rect.alpha) ctx.globalAlpha = 1;
            break;
        case 'stroke':
            ctx.strokeStyle = rect.color;
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            break;
        case 'image':
            if (rect.image) ctx.drawImage(rect.image, rect.x, rect.y, rect.image.width, rect.image.height);
            break;
        case 'ghost':
            this.drawGhost(rect);
            break;
        case 'grid':
            this.drawGrid(rect);
            break;
        }
    }

    handleMouseDown(e) {
        const [mouseX, mouseY] = this.getMouseCoords(e);
        this.selectedRect = this.findRectAt(mouseX, mouseY);
        if (this.selectedRect) {
            this.selectedRectOffset = {
                x: mouseX - this.selectedRect.x,
                y: mouseY - this.selectedRect.y
            };
            if (this.selectedRect.handleMouseDown) {
                this.selectedRect.handleMouseDown({
                    mouseX,
                    mouseY,
                    rectX: mouseX - selectedRect.x,
                    rectY: mouseY - selectedRect.y,
                    event: e
                });
            }
        }
    }

    handleMouseMove(e) {
        const [mouseX, mouseY] = this.getMouseCoords(e);
        if (this.selectedRect && this.selectedRect.handleDrag) {
            this.selectedRect.handleDrag({
                mouseX,
                mouseY,
                xOffset: this.selectedRectOffset.x,
                yOffset: this.selectedRectOffset.y,
                event: e
            });
        } else {
            const rect = this.findRectAt(mouseX, mouseY);
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

        }
    }

    handleMouseUp(e) {
        const [mouseX, mouseY] = this.getMouseCoords(e);
        if (this.selectedRect && this.selectedRect.handleDragEnd) {
            this.selectedRect.handleDragEnd({
                mouseX,
                mouseY,
                xOffset: this.selectedRectOffset.x,
                yOffset: this.selectedRectOffset.y,
                event: e
            });
        }
        this.selectedRect = null;
        this.selectedRectOffset = null;
    }

    getMouseCoords(e) {
        return [e.pageX - this.canvasRef.current.offsetLeft, e.pageY - this.canvasRef.current.offsetTop];
    }

    findRectAt(x, y) {
        let rect = null;
        for (let i = 0; i < this.rects.length; i++) {
            rect = this.rects[i];
            if (rect.drawType !== 'grid' &&
                x >= rect.x &&
                x <= rect.x + rect.w &&
                y >= rect.y &&
                y <= rect.y + rect.h) {
                return rect;
            }
        }
        return null;
    }

    getCenter(rect) {
        return [rect.x + rect.w / 2, rect.y + rect.h / 2];
    }

    dispose() {
        clearInterval(this.drawInterval);
    }
}