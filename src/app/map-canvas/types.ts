import { Rect } from '../canvas-framework/types';
export interface MapPiece {
    x: number;
    y: number;
    h: number;
    w: number;
    image: string;
}

export interface BackdropData {
    h: number;
    w: number;
    image: string;
}

export interface RoomData {
    pieces: MapPiece[];
    grid: GridData;
    backdrop: BackdropData;
    roomName: string;
    id: number;
    connections?: any[];
}

export interface GridData extends Rect {
    tileSize: number;
}