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
        this.canvasRef.current.onmouseleave = e => this.handleMouseUp(e);
        this.canvasRef.current.onwheel = e => this.handleZoom(e);
        this.scale = 1;
        this.viewportOffset = { x: 0, y: 0 };
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

    applyScale(value) {
        return value * this.scale;
    }

    unscale(value) {
        return value / this.scale;
    }

    draw() {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.rects.forEach(rect => this.drawRect(rect));
    }

    drawGrid(grid) {
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

    drawGhost(ghost) {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.globalAlpha = 0.5;
        if (ghost.image) ctx.drawImage(ghost.image, this.applyScale(ghost.x) + this.viewportOffset.x, this.applyScale(ghost.y) + this.viewportOffset.y, this.applyScale(ghost.image.width), this.applyScale(ghost.image.height));
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        const [beginX, beginY] = this.getCenter(this.selectedRect)
        const [endX, endY] = this.getCenter({ x: ghost.x, y: ghost.y, w: ghost.image.width, h: ghost.image.height })
        ctx.moveTo(this.applyScale(beginX) + this.viewportOffset.x, this.applyScale(beginY) + this.viewportOffset.y);
        ctx.lineTo(this.applyScale(endX) + this.viewportOffset.x, this.applyScale(endY) + this.viewportOffset.y);
        ctx.stroke();
    }

    drawRect(rect) {
        const ctx = this.getContext();
        switch (rect.drawType) {
        case 'fill':
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
            this.drawGrid(rect);
            break;
        }
    }

    handleMouseDown(e) {
        const [mouseX, mouseY] = this.getUnscaledMouseCoords(e);
        this.selectedRect = this.findRectAt(mouseX, mouseY);
        if (this.selectedRect) {
            this.canvasRef.current.style.cursor = 'grabbing';
            this.selectedRectOffset = {
                x: mouseX - this.selectedRect.x,
                y: mouseY - this.selectedRect.y
            };
            if (this.selectedRect.handleMouseDown) {
                this.selectedRect.handleMouseDown({
                    mouseX,
                    mouseY,
                    rectX: mouseX - this.applyScale(this.selectedRect.x),
                    rectY: mouseY - this.applyScale(this.selectedRect.y),
                    scale: this.scale
                });
            }
        } else {
            const [rawMouseX, rawMouseY] = this.getRawMouseCoords(e);
            this.panStart = { x: rawMouseX, y: rawMouseY };
        }
    }

    handleMouseMove(e) {
        const [mouseX, mouseY] = this.getUnscaledMouseCoords(e);
        if (this.selectedRect && this.selectedRect.handleDrag) {
            this.selectedRect.handleDrag({
                mouseX,
                mouseY,
                xOffset: this.selectedRectOffset.x,
                yOffset: this.selectedRectOffset.y
            });
        } else if (this.panStart) {
            const [rawMouseX, rawMouseY] = this.getRawMouseCoords(e);
            this.viewportOffset.x -= this.panStart.x - rawMouseX;
            this.viewportOffset.y -= this.panStart.y - rawMouseY;
            this.panStart.x = rawMouseX;
            this.panStart.y = rawMouseY;
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

            if (!this.hoverRect) {
                this.canvasRef.current.style.cursor = 'move';
            }
        }
    }

    handleMouseUp(e) {
        const [mouseX, mouseY] = this.getUnscaledMouseCoords(e);
        if (this.selectedRect && this.selectedRect.handleDragEnd) {
            this.canvasRef.current.style.cursor = 'grab';
            this.selectedRect.handleDragEnd({
                mouseX,
                mouseY,
                xOffset: this.selectedRectOffset.x,
                yOffset: this.selectedRectOffset.y
            });
        }
        this.panStart = null;
        this.selectedRect = null;
        this.selectedRectOffset = null;
    }

    handleZoom(e) {
        e.preventDefault();
        const newScale = this.scale + e.deltaY * -0.05;
        if (newScale <= 0.25 || newScale >= 4) return;
        const [preScaleMouseX, preScaleMouseY] = this.getUnscaledMouseCoords(e);
        this.scale = newScale;
        const [postScaleMouseX, postScaleMouseY] = this.getUnscaledMouseCoords(e);
        const scaleOffsetX = (preScaleMouseX - postScaleMouseX) * newScale;
        const scaleOffsetY = (preScaleMouseY - postScaleMouseY) * newScale;
        this.viewportOffset.x -= scaleOffsetX;
        this.viewportOffset.y -= scaleOffsetY;
    }

    getUnscaledMouseCoords(e) {
        const canvasX = e.pageX - this.canvasRef.current.offsetLeft;
        const canvasY = e.pageY - this.canvasRef.current.offsetTop;
        const x = this.unscale(canvasX - this.viewportOffset.x);
        const y = this.unscale(canvasY - this.viewportOffset.y);
        return [x, y];
    }

    getRawMouseCoords(e) {
        return [e.pageX - this.canvasRef.current.offsetLeft,
                e.pageY - this.canvasRef.current.offsetTop];
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