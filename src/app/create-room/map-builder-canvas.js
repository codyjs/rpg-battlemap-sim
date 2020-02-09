import { CanvasFramework } from "../canvas-framework";

export class MapBuilderCanvas {
    constructor(canvasRef) {
        this.canvasRef = canvasRef;
        this.grid = {
            x: 0,
            y: 0,
            h: 0,
            w: 0,
            drawType: 'grid',
            renderPriority: 1
        };
        this.gridOriginMarker = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            drawType: 'fill',
            color: '#f00',
            alpha: 0.25,
            handleDrag: ({ mouseX, mouseY, xOffset, yOffset }) => {
                const newOrigin = { x: mouseX - xOffset, y: mouseY - yOffset };
                this.setGridOrigin(newOrigin);
            },
            handleHover: () => {
                this.canvasRef.current.style.cursor = 'pointer';
            },
            handleHoverEnd: () => {
                this.canvasRef.current.style.cursor = 'auto';
            },
            renderPriority: 2
        };
    }

    init() {
        this.canvasFramework = new CanvasFramework(this.canvasRef);
        this.canvasFramework.init();
        this.canvasHeight = this.canvasRef.current.scrollHeight;
        this.canvasWidth = this.canvasRef.current.scrollWidth;
        this.canvasRef.current.height = this.canvasHeight;
        this.canvasRef.current.width = this.canvasWidth;
        this.scalingRectSize = 7;
        this.canvasFramework.addRect(this.grid);
        this.canvasFramework.addRect(this.gridOriginMarker);
    }

    setGridSize(gridSize) {
        this.grid.w = gridSize.w;
        this.grid.h = gridSize.h;
    }

    setTileSize(tileSize) {
        this.grid.tileSize = parseInt(tileSize);
        this.gridOriginMarker.w = parseInt(tileSize);
        this.gridOriginMarker.h = parseInt(tileSize);
    }

    setGridOrigin(gridOrigin) {
        this.grid.x = gridOrigin.x;
        this.grid.y = gridOrigin.y;
        this.gridOriginMarker.x = gridOrigin.x;
        this.gridOriginMarker.y = gridOrigin.y;
        if (this.onGridOriginChange) this.onGridOriginChange(gridOrigin);
    }

    setBackdropImage(image) {
        if (this.imageRect) {
            this.canvasFramework.removeRect(this.imageRect);
        }
        if (this.scalingRect) {
            this.canvasFramework.removeRect(this.scalingRect);
        }
        this.image = image;
        const ratioXToY = this.image.width / this.image.height;
        this.imageRect = {
            drawType: 'image',
            x: 0,
            y: 0,
            image: this.image,
            renderPriority: 0
        };
        this.scalingRect = {
            drawType: 'stroke',
            x: this.image.naturalWidth - this.scalingRectSize / 2,
            y: this.image.naturalHeight - this.scalingRectSize / 2,
            w: this.scalingRectSize,
            h: this.scalingRectSize,
            handleDrag: ({ mouseX, mouseY }) => {
                const xDistance = this.image.width - mouseX;
                const yDistance = this.image.height - mouseY;
                if (xDistance < yDistance) {
                    this.image.width = mouseX;
                    this.image.height = mouseX * 1 / ratioXToY;
                } else {
                    this.image.height = mouseY;
                    this.image.width = mouseY * ratioXToY;
                }
                this.scalingRect.x = this.image.width - this.scalingRectSize / 2;
                this.scalingRect.y = this.image.height - this.scalingRectSize / 2;
                if (this.onImageSizeChange) this.onImageSizeChange({ w: this.image.width, h: this.image.height });
            },
            handleHover: () => {
                this.canvasRef.current.style.cursor = 'pointer';
            },
            handleHoverEnd: () => {
                this.canvasRef.current.style.cursor = 'auto';
            }
        };
        this.canvasFramework.addRect(this.imageRect);
        this.canvasFramework.addRect(this.scalingRect);
        if (this.onImageSizeChange) this.onImageSizeChange({ w: this.image.width, h: this.image.height });
    }

    dispose() {
        this.canvasFramework.dispose();
    }
}
