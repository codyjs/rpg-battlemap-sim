import { Rect, DrawType } from "../canvas-framework/types";

export class CanvasBackdrop implements Rect {
    x: number;
    y: number;
    h: number;
    w: number;
    drawType = DrawType.Image;
    renderPriority = 0;
    image = new Image();
    
    constructor(imageUrl: string, imageHeight: number, imageWidth: number) {
        this.x = 0;
        this.y = 0;
        this.h = 0;
        this.w = 0;
        this.image.src = '/images/backdrops/' + imageUrl;
        this.image.onload = () => {
            this.image.height = imageHeight;
            this.image.width = imageWidth;
        };
    }
}