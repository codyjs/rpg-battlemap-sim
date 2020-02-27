import { MutableRefObject } from "react";
import { Rect, DrawType, RectEventData } from '../../canvas-framework/types';

const SCALING_RECT_SIZE = 7;

export class BackdropScalingRect implements Rect {
    x: number;   
    y: number;
    h = SCALING_RECT_SIZE;
    w = SCALING_RECT_SIZE;
    drawType = DrawType.Stroke;
    renderPriority = 3;
    color: '#000';
    ratioXToY: number;

    constructor(
        private canvasRef: MutableRefObject<HTMLCanvasElement>,
        private backdropRect: Rect,
        private onImageSizeChange: (imageSize: { w: number, h: number }) => void
    ) {
        this.ratioXToY = backdropRect.image.width / backdropRect.image.height;
        this.x = backdropRect.image.naturalWidth - SCALING_RECT_SIZE / 2;
        this.y = backdropRect.image.naturalHeight - SCALING_RECT_SIZE / 2;
    }

    handleDrag({ mouseX, mouseY }: RectEventData): void {
        const xDistance = this.backdropRect.image.width - mouseX;
        const yDistance = this.backdropRect.image.height - mouseY;
        if (xDistance < yDistance) {
            this.backdropRect.image.width = mouseX;
            this.backdropRect.image.height = mouseX * 1 / this.ratioXToY;
        } else {
            this.backdropRect.image.height = mouseY;
            this.backdropRect.image.width = mouseY * this.ratioXToY;
        }
        this.x = this.backdropRect.image.width - SCALING_RECT_SIZE / 2;
        this.y = this.backdropRect.image.height - SCALING_RECT_SIZE / 2;
        if (this.onImageSizeChange) this.onImageSizeChange({ w: this.backdropRect.image.width, h: this.backdropRect.image.height });
    }

    handleHover(): void {
        this.canvasRef.current.style.cursor = 'pointer';
    }

    handleHoverEnd(): void {
        this.canvasRef.current.style.cursor = 'auto';
    }
}