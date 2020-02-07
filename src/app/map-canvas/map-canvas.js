import { CanvasFramework } from '../canvas-framework/canvas-framework';

export class MapCanvas {
    constructor(canvasRef) {
        this.canvasRef = canvasRef;
        this.canvasFramework = new CanvasFramework(canvasRef);
    }

    init() {
        this.canvasHeight = this.canvasRef.current.scrollHeight;
        this.canvasWidth = this.canvasRef.current.scrollWidth;
        this.canvasRef.current.height = this.canvasHeight;
        this.canvasRef.current.width = this.canvasWidth;
        this.canvasFramework.init();
    }

    addPieces(pieces) {
        pieces.forEach(piece => {
            const canvasPiece = {
                drawType: 'image',
                x: piece.x * this.grid.tileSize + this.grid.x,
                y: piece.y * this.grid.tileSize + this.grid.y,
                h: piece.h * this.grid.tileSize,
                w: piece.w * this.grid.tileSize,
                renderPriority: 3
            };

            canvasPiece.handleDrag = ({ mouseX, mouseY, xOffset, yOffset }) => {
                const [gridX, gridY] = this.getGridCoordsFromCanvasCoords(mouseX - this.grid.x, mouseY - this.grid.x);
                const [gridOffsetX, gridOffsetY] = this.getGridCoordsFromCanvasCoords(xOffset, yOffset);
                if (!this.ghost) {
                    this.ghost = {
                        w: canvasPiece.w * this.grid.tileSize,
                        h: canvasPiece.h * this.grid.tileSize,
                        image: canvasPiece.image,
                        loaded: canvasPiece.loaded,
                        drawType: 'ghost',
                        renderPriority: 3
                    };
                    this.canvasFramework.addRect(this.ghost);
                }
                this.ghost.x = gridX * this.grid.tileSize + this.grid.x - gridOffsetX * this.grid.tileSize;
                this.ghost.y = gridY * this.grid.tileSize + this.grid.y - gridOffsetY * this.grid.tileSize;
            };

            canvasPiece.handleDragEnd = () => {
                if (this.ghost) {
                    canvasPiece.x = this.ghost.x;
                    canvasPiece.y = this.ghost.y;
                    this.canvasFramework.removeRect(this.ghost);
                    this.ghost = null;
                }
            };

            const pieceImg = new Image();
            pieceImg.src = '/images/pieces/' + piece.image;
            pieceImg.onload = () => {
                pieceImg.height = canvasPiece.h;
                pieceImg.width = canvasPiece.w;
                canvasPiece.image = pieceImg;
            }
            this.canvasFramework.addRect(canvasPiece);
        });
    }

    setBackdrop(backdropData) {
        if (this.backdrop) {
            this.canvasFramework.removeRect(this.backdrop);
        }
        this.backdrop = {
            x: 0, y: 0,
            image: new Image(),
            drawType: 'image',
            renderPriority: 0
        };
        this.backdrop.image.src = '/images/backdrops/' + backdropData.image;
        this.backdrop.image.onload = () => {
            this.backdrop.image.height = backdropData.h;
            this.backdrop.image.width = backdropData.w;
            this.canvasFramework.addRect(this.backdrop);
        }
    }

    setGrid(grid) {
        if (this.grid) {
            this.canvasFramework.removeRect(this.grid);
        }
        this.grid = grid;
        this.grid.drawType = 'grid';
        this.grid.renderPriority = 1;
        this.canvasFramework.addRect(this.grid);
    }

    dispose() {
        this.canvasFramework.dispose();
    }

    // Utility functions

    getGridCoordsFromCanvasCoords(canvasX, canvasY) {
        return [Math.floor(canvasX / this.grid.tileSize),
                Math.floor(canvasY / this.grid.tileSize)];
    }

    getClickCoords(e) {
        return [e.pageX - this.canvasRef.current.offsetLeft, e.pageY - this.canvasRef.current.offsetTop];
    }
}
