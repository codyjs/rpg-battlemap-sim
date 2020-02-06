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
        this.rects.splice(0, 0, rect);
    }

    draw() {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.rects.forEach(rect => this.drawRect(rect));
    }

    drawGrid(grid) {
        const ctx = this.getContext();
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
            ctx.drawImage(rect.image, rect.x, rect.y, rect.image.width, rect.image.height);
            break;
        case 'grid':
            this.drawGrid(rect);
            break;
        }
    }

    handleMouseDown(e) {
        const [mouseX, mouseY] = this.getMouseCoords(e);
        this.selectedRect = this.findRectAt(mouseX, mouseY);
        this.selectedRectOffset = {
            x: mouseX - this.selectedRect.x,
            y: mouseY - this.selectedRect.y
        };
        if (this.selectedRect && this.selectedRect.handleMouseDown) {
            this.selectedRect.handleMouseDown({
                mouseX,
                mouseY,
                rectX: mouseX - selectedRect.x,
                rectY: mouseY - selectedRect.y,
                event: e
            });
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
                    this.hoverRect.handleHoverEnd();
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
        if (this.selectedRect && this.selectedRect.handleMouseUp) {
            this.selectedRect.handleMouseUp({
                mouseX,
                mouseY,
                rectX: mouseX - selectedRect.x,
                rectY: mouseY - selectedRect.y,
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

    dispose() {
        clearInterval(this.drawInterval);
    }
}