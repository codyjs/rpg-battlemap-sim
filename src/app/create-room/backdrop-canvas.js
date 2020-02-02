export class BackdropCanvas {
    constructor(canvasRef) {
        this.canvasRef = canvasRef;
        this.gridOriginMarker = {
            w: 20,
            h: 20
        };
    }

    init() {
        this.drawInterval = setInterval(() => this.draw(), 10);
        this.canvasRef.current.onmousedown = (e) => this.beginDrag(e);
        this.canvasRef.current.onmouseup = (e) => this.endDrag(e);
        this.canvasRef.current.onmousemove = (e) => this.handleMousemove(e);
        this.canvasRef.current.onmouseleave = (e) => this.endDrag(e);
        this.canvasHeight = this.canvasRef.current.scrollHeight;
        this.canvasWidth = this.canvasRef.current.scrollWidth;
        this.canvasRef.current.height = this.canvasHeight;
        this.canvasRef.current.width = this.canvasWidth;
    }

    setTileSize(tileSize) {
        this.tileSize = parseInt(tileSize);
    }

    setGridOrigin(gridOrigin) {
        this.gridOrigin = gridOrigin;
        this.gridOriginMarker.x = this.gridOrigin.x - this.gridOriginMarker.w / 2;
        this.gridOriginMarker.y = this.gridOrigin.y - this.gridOriginMarker.h / 2;
    }

    setImage(image) {
        const fr = new FileReader();
        fr.onload = () => {
            this.image = new Image();
            this.image.src = fr.result;
        }
        fr.readAsDataURL(image);
    }

    beginDrag(e) {
        const [clickX, clickY] = this.getClickCoords(e);
        if (this.clickCollidesWithOriginMarker(clickX, clickY)) {
            this.setGridOrigin({ x: clickX, y: clickY });
            this.isDragging = true;
        }
    }

    handleMousemove(e) {
        const [clickX, clickY] = this.getClickCoords(e);
        if (this.clickCollidesWithOriginMarker(clickX, clickY)) {
            this.canvasRef.current.style.cursor = 'pointer';
        } else {
            this.canvasRef.current.style.cursor = 'auto';
        }
        if (this.isDragging) {
            this.setGridOrigin({ x: clickX, y: clickY });
        }
    }

    endDrag() {
        this.isDragging = false;
    }

    dispose() {
        clearInterval(this.drawInterval);
    }

    draw() {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        if (this.image) ctx.drawImage(this.image, 0, 0);
        this.drawGrid();
    }

    drawGrid() {
        const ctx = this.canvasRef.current.getContext('2d');
        this.drawOriginMarker();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        for (let x = this.gridOrigin.x - 1; x < this.canvasWidth; x += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, this.gridOrigin.y);
            ctx.lineTo(x, this.canvasHeight);
            ctx.stroke();
        }
        for (let y = this.gridOrigin.y - 1; y < this.canvasHeight; y += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(this.gridOrigin.x, y);
            ctx.lineTo(this.canvasWidth, y);
            ctx.stroke();
        }
    }

    drawOriginMarker() {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.gridOriginMarker.x, this.gridOriginMarker.y, this.gridOriginMarker.w, this.gridOriginMarker.h);
    }

    // Utility functions

    getClickCoords(e) {
        return [e.pageX - this.canvasRef.current.offsetLeft, e.pageY - this.canvasRef.current.offsetTop];
    }

    clickCollidesWithOriginMarker(x, y) {
        const r = this.gridOriginMarker;
        return (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    }
}
